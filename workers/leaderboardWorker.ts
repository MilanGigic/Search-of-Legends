import { refreshLeaderboards } from "@/actions/bullMQ/refreshLeaderboard";
import { redisConnection } from "@/lib/redis";
import { REGIONS } from "@/lib/riot";
import { accountSyncQueue } from "@/queues/accountSyncQueue";
import { Worker } from "bullmq";

const worker = new Worker(
  "leaderboardQueue",
  async (job) => {
    console.log(`[worker][leaderboard] Job ${job.id} started: ${job.name}`);

    await refreshLeaderboards();

    // Kick off account sync for all regions after leaderboard data is fresh
    for (const region of REGIONS) {
      await accountSyncQueue.add(
        "sync-accounts",
        { region, offset: 0 },
        { delay: 1000 }, // small stagger so jobs don't all start at once
      );
    }

    console.log(`[worker][leaderboard] Job ${job.id} complete`);
  },
  {
    connection: redisConnection,
  },
);

worker.on("completed", (job) => {
  console.log(`[worker][leaderboard] ✓ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[worker][leaderboard] ✗ Job ${job?.id} failed:`, err.message);
});

async function shutdown(signal: string) {
  console.log(`[worker][leaderboard] ${signal} received, shutting down...`);
  await worker.close();
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

console.log(
  "[worker][leaderboard] Leaderboard worker started, waiting for jobs...",
);
