import { leaderboardQueue } from "@/queues/leaderboardQueue";

async function main() {
  const repeatableJobs = await leaderboardQueue.getRepeatableJobs();

  for (const job of repeatableJobs) {
    await leaderboardQueue.removeRepeatableByKey(job.key);
    console.log(`[schedule] [leaderboard] Removed old job: ${job.key}`);
  }

  await leaderboardQueue.add(
    "refresh-leaderboard",
    {},
    {
      repeat: {
        every: 30 * 60 * 1000,
      },
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 500,
      },
    },
  );

  console.log("Leaderboard refresh job scheduled (every 30 minutes)");
  process.exit(0);
}

main().catch((err) => {
  console.error("[schedule] [leaderboard] Failed:", err);
  process.exit(1);
});
