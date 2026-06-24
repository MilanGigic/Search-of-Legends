import { Worker } from "bullmq";
import { redisConnection } from "@/lib/redis";
import { refreshAllRegions } from "@/actions/bullMQ/refreshTopFive";

const worker = new Worker(
  "topFive",
  async (job) => {
    console.log(
      `[worker][topFiveChampions] Job ${job.id} started: ${job.name}`,
    );
    await refreshAllRegions();
    console.log(`[worker][topFiveChampions] Job ${job.id} complete`);
  },
  {
    connection: redisConnection,
  },
);

worker.on("completed", (job) => {
  console.log(`[worker][topFiveChampions] ✓ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(
    `[worker][topFiveChampions] ✗ Job ${job?.id} failed:`,
    err.message,
  );
});

async function shutdown(signal: string) {
  console.log(
    `[worker][topFiveChampions] ${signal} received, shutting down...`,
  );
  await worker.close();
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

console.log(
  "[worker][topFiveChampions] TopFiveChampions worker started, waiting for jobs...",
);
