// File: jobs/leaderboardQueue.ts
import { Queue, Worker, Job } from "bullmq";
import { redisConnection } from "./redis";
import { db } from "@/db";
import { accounts } from "@/db/schema";
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
    console.log("🔥 Job STARTED at", new Date().toISOString());

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
    const BATCH_SIZE = 90;
    const BATCH_DELAY = 130000; // 2 minutes 10 seconds

    console.log(`🔍 DEBUG: Starting batch loop`);
    console.log(`🔍 Total entries: ${sortedEntries.length}`);
    console.log(`🔍 Batch size: ${BATCH_SIZE}`);
    console.log(
      `🔍 Expected batches: ${Math.ceil(sortedEntries.length / BATCH_SIZE)}`
    );
    for (let i = 0; i < sortedEntries.length; i += BATCH_SIZE) {
      console.log(
        `🔍 DEBUG: Loop iteration, i=${i}, condition=${
          i < sortedEntries.length
        }`
      );
      const batchEntries = sortedEntries.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(sortedEntries.length / BATCH_SIZE);

      console.log(
        `🔄 Processing batch ${i / BATCH_SIZE + 1} (${
          batchEntries.length
        } entries)...`
      );

      const batchJobs = batchEntries.map((entry, j) =>
        limit(async () => {
          const globalRank = i + j + 1; // This gives the correct global rank
          const entryInBatch = j + 1;
          console.log(
            `⏳ [Batch ${i / BATCH_SIZE + 1}] Starting entry ${j + 1}/${
              batchEntries.length
            } (Puuid: ${entry.puuid})`
          );
          // Add a short delay to space requests a bit more
          await delay(100 * j);

          try {
            console.log(
              `🌐 Fetching account info for puuid: ${entry.puuid}...`
            );
            const accountRes = await fetch(
              `https://europe.api.riotgames.com/riot/account/v1/accounts/by-puuid/${entry.puuid}?api_key=${process.env.RIOT_API_KEY}`
            );

            if (!accountRes.ok) {
              console.warn(
                `⚠️ Failed to fetch account for ${entry.puuid}: ${accountRes.statusText}`
              );
              return;
            }

            const accountData: AccountData = await accountRes.json();

            console.log(
              `🌐 Fetching summoner info for puuid: ${accountData.puuid}...`
            );
            const summonerRes = await fetch(
              `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${accountData.puuid}?api_key=${process.env.RIOT_API_KEY}`
            );

            if (!summonerRes.ok) {
              console.warn(
                `⚠️ Failed to fetch summoner for ${accountData.puuid}: ${summonerRes.statusText}`
              );
              return;
            }

            const summonerInfo: SummonerInfo = await summonerRes.json();

            console.log(
              `💾 Upserting account ${accountData.gameName}#${
                accountData.tagLine
              } (Rank ${i + j + 1}) into database...`
            );
            await db
              .insert(accounts)
              .values({
                puuid: entry.puuid!,
                gameName: accountData.gameName,
                tagLine: accountData.tagLine,
                region: "euw1", // Assuming all players are from EUW for simplicity
                summonerId: entry.summonerId,
                summonerLevel: summonerInfo.summonerLevel,
                profileIconId: summonerInfo.profileIconId,
                tier: entry.tier!,
                rank: String(i + j + 1), // i = offset, j = index in this batch
                leaguePoints: entry.leaguePoints,
                wins: entry.wins,
                losses: entry.losses,
                lastUpdated: Number(new Date()),
                revisionDate: Number(new Date()),
              })
              .onConflictDoUpdate({
                target: [accounts.puuid],
                set: {
                  puuid: entry.puuid!,
                  gameName: accountData.gameName,
                  tagLine: accountData.tagLine,
                  profileIconId: summonerInfo.profileIconId,
                  summonerLevel: summonerInfo.summonerLevel,
                  tier: entry.tier!,
                  leaguePoints: entry.leaguePoints,
                  wins: entry.wins,
                  losses: entry.losses,
                  rank: String(i + j + 1),
                  lastUpdated: Number(new Date()),
                },
              });

            console.log(
              `✅ Upserted ${accountData.gameName}#${
                accountData.tagLine
              } (Rank ${i + j + 1})`
            );
            return {
              success: true,
              rank: globalRank,
              player: `${accountData.gameName}#${accountData.tagLine}`,
            };
          } catch (error) {
            console.error(
              `❌ Error processing entry at rank ${globalRank}:`,
              error
            );
            return { success: false, rank: globalRank, error: error };
          }
        })
      );

      console.log(
        `⏳ Waiting for all jobs in batch ${i / BATCH_SIZE + 1} to complete...`
      );
      try {
        const results = await Promise.all(batchJobs);

        // Log batch completion stats
        const successful = results.filter((r) => r?.success).length;
        const failed = results.filter((r) => r && !r.success).length;
        const total = results.length;

        console.log(
          `📊 Batch ${batchNumber} completed: ${successful}/${total} successful, ${failed} failed`
        );

        if (failed > 0) {
          console.log(
            `⚠️ Failed entries in batch ${batchNumber}:`,
            results
              .filter((r) => r && !r.success)
              .map((r) => `Rank ${r?.rank}: ${r?.error}`)
          );
        }
      } catch (error) {
        console.error(`❌ Batch ${batchNumber} failed:`, error);
      }

      const hasMoreBatches = i + BATCH_SIZE < sortedEntries.length;

      if (hasMoreBatches) {
        console.log(
          `⏳ Waiting ${BATCH_DELAY / 1000}s before next batch (batch ${
            batchNumber + 1
          })...`
        );
        await delay(BATCH_DELAY);
      } else {
        console.log(
          `🎉 All batches completed! Processed ${sortedEntries.length} entries total.`
        );
      }
    }

    console.log("✅ Leaderboard sync complete.");
    console.log("✅ Job COMPLETED at", new Date().toISOString());
  },
  {
    connection: redisConnection,
  }
);

// Add event handlers to debug worker activity
leaderboardWorker.on("ready", () => {
  console.log("🟢 Worker is ready and waiting for jobs");
});

leaderboardWorker.on("active", (job) => {
  console.log(`🔄 Worker picked up job: ${job.id}`);
});

leaderboardWorker.on("completed", (job) => {
  console.log(`✅ Job completed: ${job.id}`);
});

leaderboardWorker.on("failed", (job, err) => {
  console.error(`❌ Job failed: ${job?.id}`, err);
});

leaderboardWorker.on("error", (err) => {
  console.error("❌ Worker error:", err);
});

// Add a manual trigger function for testing
export async function triggerLeaderboardSync() {
  console.log("🚀 Manually triggering leaderboard sync...");
  const job = await leaderboardQueue.add("sync-leaderboard", {});
  console.log(`📋 Job added with ID: ${job.id}`);
  return job;
}

// If this file is run directly, trigger a manual sync
if (require.main === module) {
  console.log("🏃 Running leaderboard sync manually...");
  triggerLeaderboardSync()
    .then(() => {
      console.log("✅ Manual trigger completed");
    })
    .catch((err) => {
      console.error("❌ Manual trigger failed:", err);
    });
}
