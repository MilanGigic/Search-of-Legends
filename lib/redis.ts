import type { ConnectionOptions } from "bullmq";

export const redisConnection: ConnectionOptions = {
  // BullMQ doesn't accept a url string directly, so parse it:
  host: new URL(process.env.REDIS_URL!).hostname,
  port: Number(new URL(process.env.REDIS_URL!).port) || 6379,
  password: new URL(process.env.REDIS_URL!).password || undefined,
  tls: process.env.REDIS_URL!.startsWith("rediss://") ? {} : undefined,
  maxRetriesPerRequest: null,
};
