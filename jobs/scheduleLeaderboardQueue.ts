import { leaderboardQueue } from "./queues/leaderboard";

export async function scheduleLeaderboardSync() {

  await leaderboardQueue.add(
    "sync-leaderboard",
    {},
    {
      repeat: { every: 1000 * 60 * 60 }, // every hour
      removeOnComplete: true,
      removeOnFail: true,
    }
  );

}

scheduleLeaderboardSync();
