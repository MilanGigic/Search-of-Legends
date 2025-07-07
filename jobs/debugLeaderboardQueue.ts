// jobs/debugLeaderboardQueue.ts
import { Queue } from "bullmq";
import { redisConnection } from "./redis";

const leaderboardQueue = new Queue("leaderboard", {
  connection: redisConnection,
});

async function debug() {
  const repeatableJobs = await leaderboardQueue.getRepeatableJobs();
  console.log("📋 Existing repeatable jobs:");
  console.log(repeatableJobs);
}

debug();
