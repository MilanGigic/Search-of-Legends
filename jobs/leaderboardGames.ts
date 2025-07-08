// File: jobs/leaderboardGames.ts
import { Job, Queue, Worker } from "bullmq";
import { redisConnection } from "./redis";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import fetchAllMatchIds from "@/lib/actions/match-history/fetchMatchIds";
import { fetchMatchDetailsInSmallBatch } from "@/lib/actions/match-history/fetchMatchDetails";
import getRegionalEndpoint from "@/lib/actions/match-history/getRegionalEndpoint";
import dotenv from "dotenv";
import pLimit from "p-limit";

dotenv.config();

console.log("Initializing leaderboard games queue...");

export const leaderboardGamesQueue = new Queue("leaderboard-games", {
  connection: redisConnection,
});

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
const limit = pLimit(18);

export const leaderboardGamesWorker = new Worker(
  "leaderboard-games",
  async (
    job: Job<{
      puuid: string;
      region: string;
      gameName: string;
      tagLine: string;
    }>
  ) => {
    const routing = getRegionalEndpoint(job.data.region);
    try {
      const matchIds = await fetchAllMatchIds(job.data.puuid, job.data.region);

      if (matchIds.length === 0) {
        console.log(
          `No matches found for ${job.data.gameName}#${job.data.tagLine}`
        );
        return;
      }

      console.log(
        `Found ${matchIds.length} matches for ${job.data.gameName}#${job.data.tagLine})`
      );

      await fetchMatchDetailsInSmallBatch(matchIds, routing, job.data.puuid);
      console.log(
        `✅ Finished syncing for ${job.data.gameName}#${job.data.tagLine}`
      );
    } catch (err) {
      console.error(
        `❌ Failed syncing ${job.data.gameName}#${job.data.tagLine}:`,
        err
      );
    }
  },
  {
    connection: redisConnection,
  }
);

// Schedule individual jobs for each leaderboard player
export async function enqueueLeaderboardMatchJobs() {
  console.log("📅 Enqueuing leaderboard match jobs...");

  const players = await db.query.accounts.findMany();

  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    if (!player.puuid) continue;

    await leaderboardGamesQueue.add(
      `sync-${player.summonerId}`,
      {
        jobId: `sync-${player.summonerId}`,
        puuid: player.puuid,
        region: player.region || "euw1", // Assuming all players are from EUW for simplicity
        gameName: player.gameName,
        tagLine: player.tagLine,
      },
      {
        removeOnComplete: true,
        removeOnFail: true,
        delay: i * 2000, // Delay each job slightly to reduce initial burst
      }
    );
  }

  console.log("🚀 All leaderboard player jobs enqueued.");
}

if (require.main === module) {
  enqueueLeaderboardMatchJobs();
}
