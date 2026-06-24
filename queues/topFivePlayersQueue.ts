import { Queue } from "bullmq";
import { redisConnection } from "@/lib/redis";

export const topFivePlayersQueue = new Queue("topFivePlayers", {
  connection: redisConnection,
});
