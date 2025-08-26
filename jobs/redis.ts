import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config(); // load .env if you're using it

export const redisConnection = new IORedis(process.env.SOLDB_REDIS_URL!, {
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: false,
  lazyConnect: true,
});

redisConnection.ping().then(console.log);
