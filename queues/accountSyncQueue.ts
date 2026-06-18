import { redisConnection } from "@/lib/redis";
import { Queue } from "bullmq";

export const accountSyncQueue = new Queue("accountSync", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});
