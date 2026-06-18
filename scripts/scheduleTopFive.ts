import { topFiveQueue } from "@/queues/topFiveQueue";

async function main() {
  // Remove any old repeating jobs first to avoid duplicates
  const repeatableJobs = await topFiveQueue.getRepeatableJobs();
  for (const job of repeatableJobs) {
    await topFiveQueue.removeRepeatableByKey(job.key);
    console.log(`[schedule] [topFive] Removed old job: ${job.key}`);
  }

  await topFiveQueue.add(
    "refresh-topFive",
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

  console.log("TopFive refresh job scheduled (every 30 minutes)");
  process.exit(0);
}

main().catch((err) => {
  console.error("[schedule] [topFive] Failed:", err);
  process.exit(1);
});
