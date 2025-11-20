// File: jobs/leaderboardService.ts
import { leaderboardQueue, leaderboardWorker } from "./leaderboardQueue";

export async function startLeaderboardService() {


  // First, clear any existing repeatable jobs to avoid duplicates
  const repeatableJobs = await leaderboardQueue.getRepeatableJobs();
  for (const job of repeatableJobs) {
    await leaderboardQueue.removeRepeatableByKey(job.key);

  }

  // Schedule the recurring job

  await leaderboardQueue.add(
    "sync-leaderboard",
    {},
    {
      repeat: { every: 1000 * 60 * 60 }, // every hour
      removeOnComplete: 5, // Keep last 5 completed jobs
      removeOnFail: 5, // Keep last 5 failed jobs
    }
  );


  // Add an immediate job to test

  await leaderboardQueue.add("sync-leaderboard", {});


  // Keep the process running


  // Handle graceful shutdown
  process.on("SIGINT", async () => {

    await leaderboardWorker.close();
    await leaderboardQueue.close();
    process.exit(0);
  });
}

// Start the service if this file is run directly
if (require.main === module) {
  startLeaderboardService().catch(console.error);
}
