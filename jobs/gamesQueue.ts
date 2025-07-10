import { Job, Queue, Worker } from "bullmq";
import { redisConnection } from "./redis";
import { db } from "@/db";
import fetchAllMatchIds from "@/lib/actions/match-history/fetchMatchIds";
import { fetchMatchDetailsInSmallBatch } from "@/lib/actions/match-history/fetchMatchDetails";
import getRegionalEndpoint from "@/lib/actions/match-history/getRegionalEndpoint";
import dotenv from "dotenv";
import pLimit from "p-limit";

dotenv.config();

console.log("Initializing leaderboard games queue...");

export const gamesQueue = new Queue("leaderboard-games", {
  connection: redisConnection,
});

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
const limit = pLimit(18);

export const gamesWorker = new Worker(
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
      console.log(
        `🎮 Syncing matches for ${job.data.gameName}#${job.data.tagLine}`
      );
      console.log(`🔁 Region: ${job.data.region}`);
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

// Schedule individual jobs for each player
export async function enqueueMatchJobs() {
  console.log("📅 Enqueuing match jobs...");

  const players = await db.query.accounts.findMany();

  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    if (!player.puuid) continue;

    await gamesQueue.add(
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

  console.log("🚀 All player jobs enqueued.");
}

gamesWorker.on("completed", (job) => {
  console.log(`✅ Completed match sync job: ${job.name}`);
});

gamesWorker.on("failed", (job, err) => {
  console.error(`❌ Failed match sync job: ${job?.name}`, err);
});

gamesWorker.on("active", (job) => {
  console.log(`🚀 Job started: ${job.name}`);
});

if (require.main === module) {
  enqueueMatchJobs();
}
