import Redis from "ioredis";
let redisConfig = {};

if (process.env.ENVIRONMENT === "DEVELOPMENT") {
  redisConfig = {
    host: "localhost",
    port: 6379,
    maxRetriesPerRequest: null,
  };
} else {
  redisConfig = {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    username: process.env.REDIS_USER,
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
  };
}

export function createRedisClient() {
  return new Redis(redisConfig);
}

export const redisGlobalClient = new Redis(redisConfig);
