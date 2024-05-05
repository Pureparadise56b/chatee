import { Queue, Worker } from "bullmq";
import { createRedisClient } from "../redis/config.redis";
import { Message } from "../models/message.model";

const connection = createRedisClient();

export const messageQueue = new Queue("MESSAGES", {
  connection,
  defaultJobOptions: {
    delay: 2000,
  },
});

export const queueWorker = new Worker(
  "MESSAGES",
  async (job) => {
    try {
      await Message.create({
        content: job.data.content,
        chatId: job.data.chatId,
        sender: job.data.sender,
      });
    } catch (error) {
      console.log("Save message db err: ", error);
      await messageQueue.pause();
      setTimeout(async () => {
        await messageQueue.resume();
      }, 3000);
    }
  },
  {
    connection,
    removeOnComplete: {
      count: 0,
    },
    removeOnFail: {
      count: 0,
    },
  }
);
