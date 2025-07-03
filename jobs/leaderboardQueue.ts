// File: jobs/leaderboardQueue.ts
import { Queue, Worker, Job } from "bullmq";
import { redisConnection } from "./redis";
import { db } from "@/db";
import { leaderboardPlayers } from "@/db/schema";
import dotenv from "dotenv";
import pLimit from "p-limit";

dotenv.config();

console.log("Initializing leaderboard queue...");

export const leaderboardQueue = new Queue("leaderboard", {
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

export const leaderboardWorker = new Worker(
  "leaderboard",
  async (job: Job) => {
    console.log("Worker started: Fetching leaderboard...");

    // 1. Fetch Challenger and Grandmaster
    const tiers = [
      { tier: "CHALLENGER", url: "challengerleagues" },
      { tier: "GRANDMASTER", url: "grandmasterleagues" },
    ];

    let allEntries: LeagueEntry[] = [];

    for (const tier of tiers) {
      console.log(`Fetching ${tier.tier} data from Riot API...`);
      const res = await fetch(
        `https://euw1.api.riotgames.com/lol/league/v4/${tier.url}/by-queue/RANKED_SOLO_5x5?api_key=${process.env.RIOT_API_KEY}`
      );

      if (!res.ok) {
        console.error(`Failed to fetch ${tier.tier} data: ${res.statusText}`);
        throw new Error(`Failed to fetch ${tier.tier} data: ${res.statusText}`);
      }

      const data = await res.json();

      const entries: LeagueEntry[] = data.entries.map((e: any) => ({
        ...e,
        tier: tier.tier,
      }));

      console.log(`Fetched ${entries.length} ${tier.tier} entries.`);
      allEntries = [...allEntries, ...entries];
      console.log(`Waiting 2 minutes before next tier fetch...`);
      await delay(1000 * 60 * 2); // Wait between API calls to avoid burst
    }

    // 2. Sort by LP
    console.log("Sorting all entries by league points...");
    const sortedEntries = allEntries.sort(
      (a, b) => b.leaguePoints - a.leaguePoints
    );

    // 3. Fetch account info with rate limiting
    console.log("Preparing to fetch account info for each entry...");
    const jobs = sortedEntries.map((entry, i) =>
      limit(async () => {
        await delay(50 * i);
        console.log(
          `Fetching account info for PUUID: ${entry.puuid} (Rank ${i + 1})`
        );
        const accountRes = await fetch(
          `https://europe.api.riotgames.com/riot/account/v1/accounts/by-puuid/${entry.puuid}?api_key=${process.env.RIOT_API_KEY}`
        );

        if (!accountRes.ok) {
          console.warn(
            `Failed to fetch account for ${entry.puuid}: ${accountRes.statusText}`
          );
          return;
        }

        const accountData: AccountData = await accountRes.json();

        console.log(
          `Upserting player: ${accountData.gameName}#${
            accountData.tagLine
          } (Rank ${i + 1})`
        );
        await db
          .insert(leaderboardPlayers)
          .values({
            summonerId: entry.summonerId,
            puuid: entry.puuid!,
            gameName: accountData.gameName,
            tagLine: accountData.tagLine,
            tier: entry.tier!,
            leaguePoints: entry.leaguePoints,
            wins: entry.wins,
            losses: entry.losses,
            rank: i + 1,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [leaderboardPlayers.summonerId],
            set: {
              puuid: entry.puuid!,
              gameName: accountData.gameName,
              tagLine: accountData.tagLine,
              tier: entry.tier!,
              leaguePoints: entry.leaguePoints,
              wins: entry.wins,
              losses: entry.losses,
              rank: i + 1,
              updatedAt: new Date(),
            },
          });
        console.log(
          `Player upserted: ${accountData.gameName}#${
            accountData.tagLine
          } (Rank ${i + 1})`
        );
      })
    );

    const BATCH_SIZE = 90;
    const BATCH_DELAY = 130000; // 2 minutes 10 seconds (Riot gives 100 req / 2 mins)

    for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
      const batch = jobs.slice(i, i + BATCH_SIZE);
      console.log(
        `🔄 Processing batch ${i / BATCH_SIZE + 1} (${batch.length} jobs)...`
      );

      await Promise.all(batch); // Wait for this batch to finish

      if (i + BATCH_SIZE < jobs.length) {
        console.log(`⏳ Waiting ${BATCH_DELAY / 1000}s before next batch...`);
        await delay(BATCH_DELAY);
      }
    }

    console.log("✅ Leaderboard sync complete.");
  },
  {
    connection: redisConnection,
  }
);

// Optional: schedule the job
export async function scheduleLeaderboardSync() {
  console.log("Scheduling leaderboard sync job...");
  await leaderboardQueue.add(
    "sync-leaderboard",
    {},
    {
      repeat: { every: 1000 * 60 * 10 }, // every 10 minutes
      removeOnComplete: true,
      removeOnFail: true,
    }
  );
  console.log("Leaderboard sync job scheduled.");
}
