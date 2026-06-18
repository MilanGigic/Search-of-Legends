import { redisConnection } from "@/lib/redis";
import { Queue } from "bullmq";

export const leaderboardQueue = new Queue("leaderboardQueue", {
  connection: redisConnection,
});
