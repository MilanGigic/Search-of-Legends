import { Job, Worker } from "bullmq";
import Redis, { type RedisOptions } from "ioredis";
import dotenv from "dotenv";
import { db } from "@/db";
import { redisConnection } from "@/lib/redis";
import { matchesQueue } from "@/queues/matchesQueue";
import fetchAllMatchIds from "@/actions/bullMQ/fetchAllMatchIds";
import { accounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import getRegionalEndpoint from "@/actions/match-history/getRegionalEndpoint";
import { matchFetchQueue } from "@/queues/matchFetchQueue";

dotenv.config();

console.log("Initializing matches queue...");

const ACCOUNT_WORKER_CONCURRENCY = Number(
  process.env.ACCOUNT_WORKER_CONCURRENCY ?? 3,
);

const ENQUEUE_CHUNK_SIZE = Number(process.env.MATCH_FETCH_CHUNK_SIZE ?? 200);

const MAX_PENDING_FETCH_JOBS = Number(
  process.env.MAX_PENDING_FETCH_JOBS ?? 2000,
);

// NOT the actual rate-limit enforcement (workerRateLimit does that).
const FETCH_JOB_STAGGER_MS = Number(process.env.FETCH_JOB_STAGGER_MS ?? 50);

// How long to wait between depth checks when match-fetch is too full.
const BACKPRESSURE_POLL_MS = Number(process.env.BACKPRESSURE_POLL_MS ?? 5_000);

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

async function handleSyncAll() {
  console.log("🚀 sync-all: fanning out per-account jobs...");
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
  console.log(`✅ Enqueued ${accounts.length} account jobs.`);
}

async function getMatchFetchPendingCount(): Promise<number> {
  const counts = await matchFetchQueue.getJobCounts(
    "wait",
    "delayed",
    "active",
  );
  return (counts.wait ?? 0) + (counts.delayed ?? 0) + (counts.active ?? 0);
}
async function waitForFetchQueueRoom(): Promise<void> {
  while (true) {
    const pending = await getMatchFetchPendingCount();
    if (pending < MAX_PENDING_FETCH_JOBS) return;
    console.log(
      `⏸️ match-fetch queue has ${pending} pending jobs (limit ${MAX_PENDING_FETCH_JOBS}), waiting...`,
    );
    await new Promise((res) => setTimeout(res, BACKPRESSURE_POLL_MS));
  }
}
let delayCounterClient: Redis | null = null;

function getDelayCounterClient(): Redis {
  if (!delayCounterClient) {
    delayCounterClient = new Redis(redisConnection as RedisOptions);
    delayCounterClient.on("error", (err) => {
      console.error("❌ delay-offset Redis client error:", err);
    });
  }
  return delayCounterClient;
}
async function reserveDelaySlots(count: number): Promise<number> {
  const client = getDelayCounterClient();
  const key = "match-fetch:delay-offset";
  const start = await client.incrby(key, count);
  // Refresh TTL so this resets if syncing goes quiet for a while.
  await client.expire(key, 60 * 30); // 30 minutes
  return start - count; // first slot index for this batch
}

async function handleSyncAccount(puuid: string) {
  console.log(`Fetching matchIds for account: ${puuid}`);
  const matchIds = await fetchAllMatchIds(puuid);
  console.log(`Fetched ${matchIds.length} matchIds for ${puuid}`);

  const accountData = await db.query.accounts.findFirst({
    where: eq(accounts.puuid, puuid),
  });
  if (!accountData) return;

  const REGION = getRegionalEndpoint(accountData.region);

  const shuffled = [...matchIds].sort(() => Math.random() - 0.5);

  // Reserve our slice of the global stagger counter up front so every job
  // in this batch gets a delay continuing from other accounts' batches,
  // not restarting at 0.
  const delayOffset = await reserveDelaySlots(shuffled.length);

  let enqueued = 0;
  for (let i = 0; i < shuffled.length; i += ENQUEUE_CHUNK_SIZE) {
    await waitForFetchQueueRoom();

    const chunk = shuffled.slice(i, i + ENQUEUE_CHUNK_SIZE);
    await matchFetchQueue.addBulk(
      chunk.map((matchId, j) => {
        const globalIndex = delayOffset + i + j;
        return {
          name: "match-fetch",
          data: { matchId, REGION, puuid },
          opts: {
            jobId: `fetch-${matchId}`,
            delay: globalIndex * FETCH_JOB_STAGGER_MS,
            attempts: 3,
          },
        };
      }),
    );
    enqueued += chunk.length;
  }

  console.log(`✅ Enqueued ${enqueued} match-fetch jobs for ${puuid}`);
}
