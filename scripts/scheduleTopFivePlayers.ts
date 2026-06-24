import { topFivePlayersQueue } from "@/queues/topFivePlayersQueue";

async function main() {
  // Remove any old repeating jobs first to avoid duplicates
  const repeatableJobs = await topFivePlayersQueue.getRepeatableJobs();
  for (const job of repeatableJobs) {
    await topFivePlayersQueue.removeRepeatableByKey(job.key);
    console.log(`[schedule] [topFivePlayers] Removed old job: ${job.key}`);
  }

  await topFivePlayersQueue.add(
    "refresh-topFivePlayers",
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

  console.log("TopFivePlayers refresh job scheduled (every 30 minutes)");
  process.exit(0);
}

main().catch((err) => {
  console.error("[schedule] [topFivePlayers] Failed:", err);
  process.exit(1);
});
