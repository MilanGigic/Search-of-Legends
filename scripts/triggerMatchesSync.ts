import dotenv from "dotenv";
dotenv.config();

import { matchesQueue } from "@/queues/matchesQueue";

async function main() {
  console.log("🚀 Enqueuing sync-all job into matches queue...");

  const job = await matchesQueue.add(
    "sync-all",
    {},
    {
      // Avoid piling up duplicate sync-all runs if this is triggered twice
      // in a row before the first one finishes fanning out.
      jobId: "sync-all",
      removeOnComplete: true,
      removeOnFail: 20,
    },
  );

  console.log(`✅ Enqueued sync-all job (id: ${job.id})`);

  // matchesQueue is a long-lived BullMQ Queue connection; close it
  // explicitly so this one-off script actually exits instead of hanging
  // on an open Redis connection.
  await matchesQueue.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Failed to enqueue sync-all job:", err);
  process.exit(1);
});
