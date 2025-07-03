import { delay, Job, Queue, Worker } from "bullmq";
import dotenv from "dotenv";
import { redisConnection } from "./redis";
import { db } from "@/db";
import fetchAllMatchIds from "@/lib/actions/match-history/fetchMatchIds";
import { fetchMatchDetailsInSmallBatch } from "@/lib/actions/match-history/fetchMatchDetails";

dotenv.config();

console.log("Initializing leaderboard games queue...");

export const leaderboardGamesQueue = new Queue("leaderboard-games", {
  connection: redisConnection,
});

console.log("Leaderboard games queue created.");

export const leaderboardGamesWorker = new Worker(
  "leaderboard-games",
  async (job: Job) => {
    console.log("Worker started: Fetching leaderboard games...");

    const players = await db.query.leaderboardPlayers.findMany();

    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      if (!player || !player.puuid) {
        console.warn(`Player ${i + 1} has no PUUID, skipping...`);
        continue;
      }

      try {
        console.log(
          `(${i + 1}/${players.length}) Fetching match IDs for ${
            player.puuid
          }...`
        );

        const matchIds: string[] = await fetchAllMatchIds(player.puuid, "euw1");

        await fetchMatchDetailsInSmallBatch(matchIds, "euw1", player.puuid);
      } catch (error) {
        console.error(`❌ Failed to sync ${player.puuid}:`, error);
      }

      await delay(1200); // Delay to avoid rate limiting
    }
    console.log("✅ Completed syncing leaderboard games.");
  },
  {
    connection: redisConnection,
  }
);

export async function scheduleLeaderboardSyncJob() {
  await leaderboardGamesQueue.add(
    "sync-leaderboard",
    {},
    {
      repeat: { every: 1000 * 60 * 10 }, // every 10 minutes
      removeOnComplete: true,
      removeOnFail: true,
    }
  );
}
