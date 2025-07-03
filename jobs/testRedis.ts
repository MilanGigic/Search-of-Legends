// testRedis.ts
import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config(); // load .env if you're using it

const redis = new IORedis(process.env.REDIS_URL!);

redis
  .ping()
  .then((response) => {
    console.log("Redis connected:", response); // should log 'PONG'
    redis.quit();
  })
  .catch((err) => {
    console.error("Redis connection failed:", err);
  });
