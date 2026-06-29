import { redisConnection } from "@/lib/redis";
import { Queue } from "bullmq";

export const matchPersistQueue = new Queue("match-persist", {
  connection: redisConnection,
});
