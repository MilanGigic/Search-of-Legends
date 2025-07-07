import { leaderboardQueue } from "./queues/leaderboard";

export async function scheduleLeaderboardSync() {
  console.log("Scheduling leaderboard sync job...");
  await leaderboardQueue.add(
    "sync-leaderboard",
    {},
    {
      repeat: { every: 1000 * 60 * 60 }, // every hour
      removeOnComplete: true,
      removeOnFail: true,
    }
  );
  console.log("Leaderboard sync job scheduled.");
}

scheduleLeaderboardSync();
