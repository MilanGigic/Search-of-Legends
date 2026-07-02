import { Worker } from "bullmq";
import { redisConnection } from "@/lib/redis";
import insertMatchData from "@/actions/insertMatchData";
import { insertMatchTimeline } from "@/actions/insertMatchTimeline";

interface Props {
  match: RiotMatchDto;
  timeline: MatchTimelineDto;
  puuid: string;
}

export const matchPersistWorker = new Worker(
  "match-persist",
  async (job) => {
    const data: Props = job.data;

    const { match, timeline, puuid } = data;

    await insertMatchData(match, puuid);
    await insertMatchTimeline(timeline);

    console.log(`💾 Persisted match ${match.metadata.matchId}`);
  },
  {
    connection: redisConnection,
    concurrency: 6, // DB-safe level
  },
);

matchPersistWorker.on("error", (err) => {
  console.error("❌ matchPersistWorker error:", err);
});

matchPersistWorker.on("ready", () => {
  console.log("✅ matchPersistWorker connected and ready");
});
