import { Job, Worker } from "bullmq";
import dotenv from "dotenv";
import { db } from "@/db";
import { fetchWithRateLimit } from "@/lib/riot";
import { redisConnection } from "@/lib/redis";
import { matchesQueue } from "@/queues/matchesQueue";
import fetchAllMatchIds from "@/actions/bullMQ/fetchAllMatchIds";
import insertMatchData from "@/actions/insertMatchData";
import { accounts, matches } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import getRegionalEndpoint from "@/actions/match-history/getRegionalEndpoint";

dotenv.config();

// Its fine, it works well
// But it hits the rate limit
// Make it fetch slower, e.g. 18 requests, then wait 2 seconds then go again, or something like that

console.log("Initializing matches queue...");

const ACCOUNT_WORKER_CONCURRENCY = Number(
  process.env.ACCOUNT_WORKER_CONCURRENCY ?? 5,
);

interface SyncAccountJobData {
  puuid: string;
}

export const matchesWorker = new Worker(
  "matches",
  async (job: Job) => {
    if (job.name === "sync-all") {
      await handleSyncAll();
      return;
    }

    if (job.name === "sync-account") {
      const { puuid } = job.data as SyncAccountJobData;
      await handleSyncAccount(puuid);
      return;
    }

    console.warn(`Unknown job name: ${job.name}`);
  },
  {
    connection: redisConnection,
    concurrency: ACCOUNT_WORKER_CONCURRENCY,
  },
);

/**
 * Fan-out job: looks up every account and enqueues one "sync-account" job
 * per account, then returns immediately. Does no Riot fetching itself, so
 * one slow or failing account can no longer take down the whole sync run —
 * each account now lives in its own job with its own retry/failure state.
 */
async function handleSyncAll() {
  console.log("🚀 sync-all: fanning out per-account jobs...");

  console.log("Fetching accounts from DB...");
  const accounts = await db.query.accounts.findMany();
  console.log(`Fetched ${accounts.length} accounts.`);

  await matchesQueue.addBulk(
    accounts.map((account) => ({
      name: "sync-account",
      data: { puuid: account.puuid },
      opts: {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
        jobId: `sync-account-${account.puuid}`,
        removeOnComplete: 100,
        removeOnFail: 100,
      },
    })),
  );

  console.log(`✅ sync-all: enqueued ${accounts.length} sync-account jobs.`);
}

/**
 * Per-account job: fetches new match IDs for one account and processes
 * them. Failures here (Riot API errors, a single bad match payload, etc.)
 * only affect this account's job — BullMQ retries it independently with
 * backoff, and every other account's job is unaffected.
 */
async function handleSyncAccount(puuid: string) {
  console.log(`Fetching matchIds for account: ${puuid}`);
  const matchIds = await fetchAllMatchIds(puuid);
  console.log(`Fetched ${matchIds.length} matchIds for ${puuid}`);
  await processMatchIds(matchIds, puuid);
}

export const processMatchIds = async (matchIds: string[], puuid: string) => {
  const BATCH_SIZE = 25;

  const RIOT_API_KEY = process.env.RIOT_API_KEY;

  if (!RIOT_API_KEY) {
    console.error("Riot Api Key not defined");
    return;
  }

  const accountData = await db.query.accounts.findFirst({
    where: eq(accounts.puuid, puuid),
  });

  if (!accountData) return;

  const REGION = getRegionalEndpoint(accountData.region);

  console.log(`🔄 Processing ${matchIds.length} ids for puuid: ${puuid}...`);

  for (let i = 0; i < matchIds.length; i += BATCH_SIZE) {
    const batch = matchIds.slice(i, i + BATCH_SIZE);
    console.log(
      `🔄 Processing batch ${i / BATCH_SIZE + 1}: ${batch.length} matchIds`,
    );

    const existingMatches = await db
      .select({ matchId: matches.matchId })
      .from(matches)
      .where(inArray(matches.matchId, batch));

    const existingIds = new Set(existingMatches.map((m) => m.matchId));

    const jobs = batch.map((matchId) =>
      (async () => {
        console.log(`Checking matchId: ${matchId}`);

        if (existingIds.has(matchId)) {
          console.log(`Skipping ${matchId} (already exists)`);
          return { skipped: true };
        }

        try {
          console.log(`Fetching match info for matchId: ${matchId}`);
          const matchInfoRes = await fetchWithRateLimit(
            `https://${REGION}.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${RIOT_API_KEY}`,
          );

          if (!matchInfoRes.ok) {
            console.warn(
              `❌ Failed to fetch match info for ${matchId}: Response not OK`,
            );
            return;
          }

          const matchInfo: RiotMatchDto = await matchInfoRes.json();

          console.log(`✅ Inserting match data for matchId: ${matchId}`);
          await insertMatchData(matchInfo, puuid);

          console.log(`✅ Synced ${matchId} for ${puuid}`);
        } catch (error) {
          console.warn(`⚠️ Failed ${matchId} for ${puuid}`, error);
        }
      })(),
    );

    await Promise.all(jobs);
  }

  console.log(`✅ Finished processing matchIds for ${puuid}`);
};

// Worker lifecycle events
matchesWorker.on("ready", () => console.log("🟢 Worker is ready"));
matchesWorker.on("active", (job) =>
  console.log(`🔄 Job started: ${job.id} (${job.name})`),
);
matchesWorker.on("completed", (job) =>
  console.log(`✅ Job completed: ${job.id} (${job.name})`),
);
matchesWorker.on("failed", (job, err) =>
  console.error(`❌ Job failed: ${job?.id} (${job?.name})`, err),
);

// Add a manual trigger function for testing
export async function triggerMatchesSync() {
  console.log("🚀 Manually triggering matches sync...");
  const job = await matchesQueue.add(
    "sync-all",
    {},
    {
      removeOnComplete: 100,
      removeOnFail: 100,
    },
  );
  console.log(`📋 Job added with ID: ${job.id}`);
  return job;
}

// If this file is run directly, trigger a manual sync
if (require.main === module) {
  console.log("🏃 Running matches sync manually...");
  triggerMatchesSync()
    .then(() => {
      console.log("✅ Manual trigger completed");
    })
    .catch((err) => {
      console.error("❌ Manual trigger failed:", err);
    });
}
