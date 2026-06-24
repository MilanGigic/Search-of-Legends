import { Worker } from "bullmq";
import { redisConnection } from "@/lib/redis";
import { refreshAllRegions } from "@/actions/bullMQ/refreshTopFive";

const worker = new Worker(
  "topFive",
  async (job) => {
    console.log(`[worker][topFivePlayers] Job ${job.id} started: ${job.name}`);
    await refreshAllRegions();
    console.log(`[worker][topFivePlayers] Job ${job.id} complete`);
  },
  {
    connection: redisConnection,
  },
);

worker.on("completed", (job) => {
  console.log(`[worker][topFivePlayers] ✓ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(
    `[worker][topFivePlayers] ✗ Job ${job?.id} failed:`,
    err.message,
  );
});

async function shutdown(signal: string) {
  console.log(`[worker][topFivePlayers] ${signal} received, shutting down...`);
  await worker.close();
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

console.log(
  "[worker][topFivePlayers] TopFivePlayers worker started, waiting for jobs...",
);
