// File: jobs/leaderboardGames.ts
import { Job, Queue, Worker } from "bullmq";
import { redisConnection } from "./redis";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import fetchAllMatchIds from "@/lib/actions/match-history/fetchMatchIds";
import { fetchMatchDetailsInSmallBatch } from "@/lib/actions/match-history/fetchMatchDetails";
import getRegionalEndpoint from "@/lib/actions/match-history/getRegionalEndpoint";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const leaderboardGamesQueue = new Queue("leaderboard-games", {
  connection: redisConnection,
});

export const leaderboardGamesWorker = new Worker(
  "leaderboard-games",
  async (job: Job<{ puuid: string; region: string; summonerName: string }>) => {
    const { puuid, region, summonerName } = job.data;

    try {
      const routing = getRegionalEndpoint(region.toLowerCase());

      console.log(`🎮 Syncing matches for ${summonerName}`);

      // Introduce a small delay before fetching
      await delay(600);

      const matchIds = await fetchAllMatchIds(puuid, region);

      // Delay to avoid burst limit
      await delay(600);

      console.log(
        `📥 Fetching ${matchIds.length} match details for ${summonerName}`
      );
      await fetchMatchDetailsInSmallBatch(matchIds, routing, puuid);

      console.log(`✅ Synced ${matchIds.length} matches for ${summonerName}`);
    } catch (err) {
      console.error(`❌ Failed to sync matches for ${summonerName}:`, err);
    }
  },
  {
    connection: redisConnection,
  }
);

// Schedule individual jobs for each leaderboard player
export async function enqueueLeaderboardMatchJobs() {
  console.log("📅 Enqueuing leaderboard match jobs...");

  const players = await db.query.accounts.findMany();

  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    if (!player.puuid) continue;

    await leaderboardGamesQueue.add(
      `sync-${player.summonerId}`,
      {
        jobId: `sync-${player.summonerId}`,
        puuid: player.puuid,
        region: "euw1", // Assuming all players are from EUW for simplicity
        summonerName: player.gameName,
      },
      {
        removeOnComplete: true,
        removeOnFail: true,
        delay: i * 2000, // Delay each job slightly to reduce initial burst
      }
    );
  }

  console.log("🚀 All leaderboard player jobs enqueued.");
}

if (require.main === module) {
  enqueueLeaderboardMatchJobs();
}
