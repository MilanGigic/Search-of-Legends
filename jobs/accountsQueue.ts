// File: jobs/leaderboardQueue.ts
import { Queue, Worker, Job } from "bullmq";
import { redisConnection } from "./redis";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import dotenv from "dotenv";
import pLimit from "p-limit";
import { fetchWithRateLimit } from "@/lib/riot";

dotenv.config();



export const accountQueue = new Queue("account", {
  connection: redisConnection,
});

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
const limit = pLimit(18); // Riot rate limit is 20 requests/sec

interface LeagueEntry {
  summonerId: string;
  summonerName: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  puuid?: string;
  tier?: "CHALLENGER" | "GRANDMASTER";
}

interface AccountData {
  puuid: string;
  gameName: string;
  tagLine: string;
}

const MAX_ACCOUNT_AGE = 1000 * 60 * 60; // 1 hour

export const accountsWorker = new Worker(
  "account",
  async (job: Job) => {

    console.log("🔥 Job STARTED at", new Date().toISOString());

    const tiers = [
      "DIAMOND",
      "EMERALD",
      "PLATINUM",
      "GOLD",
      "SILVER",
      "BRONZE",
      "IRON",
    ];

    const divisions = ["IV", "III", "II", "I"];

    for (const tier of tiers) {
      for (const division of divisions) {
        let page = 1;
        let hasMorePages = true;

        while (hasMorePages) {
          const url = `https://euw1.api.riotgames.com/lol/league/v4/entries/RANKED_SOLO_5x5/${tier}/${division}?page=${page}&api_key=${process.env.RIOT_API_KEY}`;

          const res = await fetchWithRateLimit(url);

          if (!res.ok) {
            console.error(
              `❌ Failed to fetch ${tier} ${division} page ${page}: ${res.statusText}`
            );
            break;
          }

          const data: LeagueEntry[] = await res.json();
          if (!Array.isArray(data) || data.length === 0) {
            break;
          }

          await processLeagueEntries(data, tier, division, page);

          page++;
          hasMorePages = true;

          await delay(1000 * 60 * 2);
        }
      }
    }


  },
  {
    connection: redisConnection,
  }
);

async function processLeagueEntries(
  entries: LeagueEntry[],
  tier: string,
  division: string,
  page: number
) {
  const BATCH_SIZE = 90;
  const BATCH_DELAY = 130000;

  const sorted = entries.sort((a, b) => b.leaguePoints - a.leaguePoints);
  for (let i = 0; i < sorted.length; i += BATCH_SIZE) {
    const batch = sorted.slice(i, i + BATCH_SIZE);

    const jobs = batch.map((entry, j) =>
      limit(async () => {
        // 1. Check if the account already exists and was recently updated
        const existing = await db.query.accounts.findFirst({
          where: (acc, { eq }) => eq(acc.puuid, entry.puuid!),
        });

        if (existing && Date.now() - existing.lastUpdated < MAX_ACCOUNT_AGE) {
          console.log(
            `⏩ Skipping ${existing.gameName}#${existing.tagLine} (updated recently)`
          );
          return { skipped: true };
        }

        try {
          await delay(100 * j); // Space out slightly
          const accountRes = await fetchWithRateLimit(
            `https://europe.api.riotgames.com/riot/account/v1/accounts/by-puuid/${entry.puuid}?api_key=${process.env.RIOT_API_KEY}`
          );
          if (!accountRes.ok) return;

          const accountData: AccountData = await accountRes.json();

          const summonerRes = await fetchWithRateLimit(
            `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${accountData.puuid}?api_key=${process.env.RIOT_API_KEY}`
          );
          if (!summonerRes.ok) return;

          const summonerInfo: SummonerInfo = await summonerRes.json();

          await db
            .insert(accounts)
            .values({
              puuid: accountData.puuid,
              gameName: accountData.gameName,
              tagLine: accountData.tagLine,
              region: "euw1",
              summonerLevel: summonerInfo.summonerLevel,
              profileIconId: summonerInfo.profileIconId,
              tier,
              rank: `${division}`,
              leaguePoints: entry.leaguePoints,
              wins: entry.wins,
              losses: entry.losses,
              revisionDate: Date.now(),
              lastUpdated: Date.now(),
            })
            .onConflictDoUpdate({
              target: [accounts.puuid],
              set: {
                gameName: accountData.gameName,
                tagLine: accountData.tagLine,
                summonerLevel: summonerInfo.summonerLevel,
                profileIconId: summonerInfo.profileIconId,
                tier,
                rank: `${division}`,
                leaguePoints: entry.leaguePoints,
                wins: entry.wins,
                losses: entry.losses,
                lastUpdated: Date.now(),
              },
            });
        } catch (err) {
          console.warn(
            `⚠️ Failed entry in ${tier} ${division} page ${page}:`,
            err
          );
        }
      })
    );

    await Promise.all(jobs);

    if (i + BATCH_SIZE < sorted.length) {

      await delay(BATCH_DELAY);
    }
  }


}

// Worker lifecycle events
accountsWorker.on("ready", () => console.log("🟢 Worker is ready"));
accountsWorker.on("active", (job) => console.log(`🔄 Job started: ${job.id}`));
accountsWorker.on("completed", (job) =>

);
accountsWorker.on("failed", (job, err) =>
  console.error(`❌ Job failed: ${job?.id}`, err)
);

// Add a manual trigger function for testing
export async function triggerAccountsSync() {

  const job = await accountQueue.add("sync-accounts", {});

  return job;
}

// If this file is run directly, trigger a manual sync
if (require.main === module) {

  triggerAccountsSync()
    .then(() => {

    })
    .catch((err) => {
      console.error("❌ Manual trigger failed:", err);
    });
}
