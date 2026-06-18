import { upsertAccount } from "@/actions/upsertAccount";
import { db } from "@/db";
import { rankedStats } from "@/db/schema";
import { redisConnection } from "@/lib/redis";
import { accountSyncQueue } from "@/queues/accountSyncQueue";
import { Job, Worker } from "bullmq";
import { desc, eq } from "drizzle-orm";

const BATCH_SIZE = 10;
const MAX_OFFSET = 500;
const DELAY_BETWEEN_ACCOUNTS_MS = 150;

interface AccountSyncJobData {
  region: string;
  offset: number;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function processAccountSyncJob(job: Job<AccountSyncJobData>) {
  const { region, offset } = job.data;

  const rows = await db
    .select({ puuid: rankedStats.puuid })
    .from(rankedStats)
    .where(eq(rankedStats.region, region))
    .orderBy(desc(rankedStats.leaguePoints))
    .limit(BATCH_SIZE)
    .offset(offset);

  if (rows.length === 0) {
    console.log(`[accountSync] ${region} offset ${offset}: no more rows, done`);
    return;
  }

  let upserted = 0;
  let failed = 0;

  for (const { puuid } of rows) {
    try {
      await upsertAccount(puuid, region);
      upserted++;
    } catch (error) {
      // One account failing should not abort the batch
      failed++;
      console.error(
        `[accountSync] ${region} offset ${offset}: failed to upsert ${puuid}:`,
        error instanceof Error ? error.message : error,
      );
    }

    await sleep(DELAY_BETWEEN_ACCOUNTS_MS);
  }

  console.log(
    `[accountSync] ${region} offset ${offset}: ${upserted} upserted, ${failed} failed`,
  );

  // Enqueue the next batch if we haven't hit the limit
  const nextOffset = offset + BATCH_SIZE;
  if (nextOffset < MAX_OFFSET && rows.length === BATCH_SIZE) {
    await accountSyncQueue.add(
      "sync-accounts",
      { region, offset: nextOffset },
      { delay: 2000 },
    );
  }
}

const worker = new Worker<AccountSyncJobData>(
  "accountSync",
  processAccountSyncJob,
  { connection: redisConnection, concurrency: 1 }, // Process one job at a time — critical for dev key rate limiting
);

worker.on("completed", (job) => {
  console.log(
    `[accountSync] ✓ Job ${job.id} (${job.data.region} offset ${job.data.offset}) completed`,
  );
});

worker.on("failed", (job, err) => {
  console.error(
    `[accountSync] ✗ Job ${job?.id} (${job?.data.region} offset ${job?.data.offset}) failed:`,
    err.message,
  );
});

async function shutdown(signal: string) {
  console.log(`[accountSync] ${signal} received, shutting down...`);
  await worker.close();
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

console.log("[accountSync] Account sync worker started, waiting for jobs...");
