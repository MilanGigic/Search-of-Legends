// File: jobs/leaderboardService.ts
import { leaderboardQueue, leaderboardWorker } from "./leaderboardQueue";

export async function startLeaderboardService() {
  console.log("🚀 Starting leaderboard service...");

  // First, clear any existing repeatable jobs to avoid duplicates
  const repeatableJobs = await leaderboardQueue.getRepeatableJobs();
  for (const job of repeatableJobs) {
    await leaderboardQueue.removeRepeatableByKey(job.key);
    console.log(`🧹 Removed existing repeatable job: ${job.key}`);
  }

  // Schedule the recurring job
  console.log("📅 Scheduling leaderboard sync job...");
  await leaderboardQueue.add(
    "sync-leaderboard",
    {},
    {
      repeat: { every: 1000 * 60 * 60 }, // every hour
      removeOnComplete: 5, // Keep last 5 completed jobs
      removeOnFail: 5, // Keep last 5 failed jobs
    }
  );
  console.log("✅ Leaderboard sync job scheduled to run every hour");

  // Add an immediate job to test
  console.log("🏃 Adding immediate job to test the worker...");
  await leaderboardQueue.add("sync-leaderboard", {});
  console.log("✅ Immediate job added");

  // Keep the process running
  console.log("🔄 Service is running. Press Ctrl+C to stop.");

  // Handle graceful shutdown
  process.on("SIGINT", async () => {
    console.log("\n🛑 Shutting down gracefully...");
    await leaderboardWorker.close();
    await leaderboardQueue.close();
    process.exit(0);
  });
}

// Start the service if this file is run directly
if (require.main === module) {
  startLeaderboardService().catch(console.error);
}
