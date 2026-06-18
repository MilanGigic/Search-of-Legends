import { leaderboardQueue } from "@/queues/leaderboardQueue";

async function main() {
  await leaderboardQueue.add("refresh-leaderboard-manual", {});
  console.log("Manual job queued");
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
