import { Queue } from "bullmq";
import { redisConnection } from "@/lib/redis";

export const topFiveQueue = new Queue("topFive", {
  connection: redisConnection,
});
