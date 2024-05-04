import Redis from "ioredis";

export function createRedisClient() {
  const redisUrl = process.env.REDIS_URL!;
  return new Redis(redisUrl);
}
