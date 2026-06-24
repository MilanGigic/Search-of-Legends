import { redisConnection } from "@/lib/redis";
import { Queue } from "bullmq";

export const matchesQueue = new Queue("matches", {
  connection: redisConnection,
});
