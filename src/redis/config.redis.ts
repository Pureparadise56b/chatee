import Redis from "ioredis";

const redisConfig = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  username: process.env.REDIS_USER,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
};

export function createRedisClient() {
  return new Redis(redisConfig);
}

export const redisGlobalClient = new Redis(redisConfig);
