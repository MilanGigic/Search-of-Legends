import { topFiveQueue } from "@/queues/topFiveQueue";

async function main() {
  await topFiveQueue.add("refresh-topFive-manual", {});
  console.log("Manual job queued");
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
