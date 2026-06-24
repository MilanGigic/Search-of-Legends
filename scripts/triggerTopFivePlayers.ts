import { topFivePlayersQueue } from "@/queues/topFivePlayersQueue";

async function main() {
  await topFivePlayersQueue.add("refresh-topFivePlayers-manual", {});
  console.log("Manual job queued");
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
