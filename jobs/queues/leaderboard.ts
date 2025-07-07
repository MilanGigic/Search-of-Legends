import { Queue } from "bullmq";
import { redisConnection } from "../redis";

export const leaderboardQueue = new Queue("leaderboard", {
  connection: redisConnection,
});
