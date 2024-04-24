import Redis from "ioredis";

const redisClient = new Redis();

redisClient.on("connect", () => {
  console.log("Redis Client connected...");
});

redisClient.on("error", (err) => {
  console.error("Error while connecting to redis server: ", err);
});

const redisPublisher = new Redis();
const redisSubscriber = new Redis();

export { redisPublisher, redisSubscriber };
