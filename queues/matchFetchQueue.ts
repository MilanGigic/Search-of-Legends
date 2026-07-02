import { redisConnection } from "@/lib/redis";
import { Queue } from "bullmq";

export const matchFetchQueue = new Queue("match-fetch", {
  connection: redisConnection,

  defaultJobOptions: {
    // Keep absolutely 0 completed jobs in Redis.
    // Since the data is safely in Neon, we don't need the history here.
    removeOnComplete: true,

    // Keep only the last 20 failed jobs for debugging, or set to true to delete instantly
    removeOnFail: { age: 24 * 3600, count: 20 },
  },
});
