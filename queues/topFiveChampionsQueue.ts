import { Queue } from "bullmq";
import { redisConnection } from "@/lib/redis";

export const topFiveChampionsQueue = new Queue("topFiveChampions", {
  connection: redisConnection,

  defaultJobOptions: {
    // Keep absolutely 0 completed jobs in Redis.
    // Since the data is safely in Neon, we don't need the history here.
    removeOnComplete: true,

    // Keep only the last 20 failed jobs for debugging, or set to true to delete instantly
    removeOnFail: { age: 24 * 3600, count: 20 },
  },
});
