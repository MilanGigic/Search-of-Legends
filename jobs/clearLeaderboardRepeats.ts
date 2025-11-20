// jobs/clearLeaderboardRepeats.ts
import { Queue } from "bullmq";
import { redisConnection } from "./redis";

const leaderboardQueue = new Queue("leaderboard", {
  connection: redisConnection,
});

async function clearRepeats() {
  const repeatable = await leaderboardQueue.getRepeatableJobs();

  for (const job of repeatable) {
    await leaderboardQueue.removeRepeatableByKey(job.key);

  }
}

clearRepeats();
