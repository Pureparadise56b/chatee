import Redis from "ioredis";

export function createRedisClient() {
  return new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    username: process.env.REDIS_USER,
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
  });
}

export const redisGlobalClient = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  username: process.env.REDIS_USER,
  password: process.env.REDIS_PASSWORD,
});
