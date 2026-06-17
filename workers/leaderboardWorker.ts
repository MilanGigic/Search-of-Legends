import { Worker } from "bullmq";
import { redisConnection } from "@/lib/redis";
import { refreshAllRegions } from "@/actions/refreshLeaderboard";

const worker = new Worker(
  "leaderboard",
  async (job) => {
    console.log(`[worker] Job ${job.id} started: ${job.name}`);
    await refreshAllRegions();
    console.log(`[worker] Job ${job.id} complete`);
  },
  {
    connection: redisConnection,
  },
);

worker.on("completed", (job) => {
  console.log(`[worker] ✓ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[worker] ✗ Job ${job?.id} failed:`, err.message);
});

async function shutdown(signal: string) {
  console.log(`[worker] ${signal} received, shutting down...`);
  await worker.close();
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

console.log("[worker] Leaderboard worker started, waiting for jobs...");
