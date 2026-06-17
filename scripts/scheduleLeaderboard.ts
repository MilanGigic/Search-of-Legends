import { leaderboardQueue } from "@/queues/leaderboardQueue";

async function main() {
  // Remove any old repeating jobs first to avoid duplicates
  const repeatableJobs = await leaderboardQueue.getRepeatableJobs();
  for (const job of repeatableJobs) {
    await leaderboardQueue.removeRepeatableByKey(job.key);
    console.log(`[schedule] Removed old job: ${job.key}`);
  }

  await leaderboardQueue.add(
    "refresh-leaderboard",
    {}, // no payload needed
    {
      repeat: {
        every: 30 * 60 * 1000, // 30 minutes in ms
      },
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
    },
  );

  console.log("Leaderboard refresh job scheduled (every 30 minutes)");
  process.exit(0);
}

main().catch((err) => {
  console.error("[schedule] Failed:", err);
  process.exit(1);
});
