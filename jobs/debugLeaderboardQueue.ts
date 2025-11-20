// jobs/debugaccountQueue.ts
import { Queue } from "bullmq";
import { redisConnection } from "./redis";

const accountQueue = new Queue("account", {
  connection: redisConnection,
});

async function debug() {
  const repeatableJobs = await accountQueue.getRepeatableJobs();


}

debug();
