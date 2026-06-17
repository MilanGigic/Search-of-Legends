import { Queue } from "bullmq";
import { redisConnection } from "@/lib/redis";

export const leaderboardQueue = new Queue("leaderboard", {
  connection: redisConnection,
});
