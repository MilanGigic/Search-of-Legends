import { Queue } from "bullmq";
import { redisConnection } from "@/lib/redis";

export const topFiveChampionsQueue = new Queue("topFiveChampions", {
  connection: redisConnection,
});
