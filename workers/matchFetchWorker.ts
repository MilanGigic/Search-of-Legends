import { Worker } from "bullmq";
import { redisConnection } from "@/lib/redis";
import {
  workerRateLimit,
  RiotApiKeyError,
} from "@/actions/bullMQ/matchesJobRateLimiter";
import { matchPersistQueue } from "@/queues/matchPersistQueue";

export const matchFetchWorker = new Worker(
  "match-fetch",
  async (job) => {
    const { matchId, REGION, puuid } = job.data;

    try {
      console.log(`Fetching match + timeline: ${matchId}`);

      const RIOT_API_KEY = process.env.RIOT_API_KEY!;
      if (!RIOT_API_KEY) throw new Error("Missing API key");

      const matchRes = await workerRateLimit(
        `https://${REGION}.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${RIOT_API_KEY}`,
      );

      if (!matchRes.ok) {
        console.warn(`Match failed ${matchId}: ${matchRes.status}`);
        return;
      }

      const match = await matchRes.json();

      const timelineRes = await workerRateLimit(
        `https://${REGION}.api.riotgames.com/lol/match/v5/matches/${matchId}/timeline?api_key=${RIOT_API_KEY}`,
      );

      if (!timelineRes.ok) {
        console.warn(`Timeline failed ${matchId}: ${timelineRes.status}`);
        return;
      }

      const timeline = await timelineRes.json();

      // PUSH TO PERSIST QUEUE (NO DB HERE)
      await matchPersistQueue.add(
        "match-persist",
        { match, timeline, puuid },
        {
          jobId: `persist-${matchId}`,
          removeOnComplete: 1000,
          removeOnFail: 1000,
        },
      );

      console.log(`📦 Queued persist job for ${matchId}`);
    } catch (err) {
      if (err instanceof RiotApiKeyError) throw err;
      console.warn(`❌ Fetch failed ${matchId}`, err);
    }
  },
  {
    connection: redisConnection,
    concurrency: 3, // IMPORTANT: keep low for Riot safety
  },
);
