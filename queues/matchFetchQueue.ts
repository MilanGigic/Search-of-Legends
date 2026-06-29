import { redisConnection } from "@/lib/redis";
import { Queue } from "bullmq";

export const matchFetchQueue = new Queue("match-fetch", {
  connection: redisConnection,
});
