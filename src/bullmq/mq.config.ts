import { Queue, Worker } from "bullmq";
import { createRedisClient } from "../redis/config.redis";
import { Message } from "../models/message.model";
import { Chat } from "../models/chat.model";
import crypto from "crypto";

const connection = createRedisClient();

export const messageQueue = new Queue("MESSAGES", {
  connection,
});

const queueWorker = new Worker(
  "MESSAGES",
  async (job) => {
    try {
      const content = Buffer.from(job.data.content, "utf-8").toString(
        "base64url"
      );
      const createdMessage = await Message.create({
        content,
        chatId: job.data.chatId,
        sender: job.data.sender,
      });
      await Chat.updateOne(
        { _id: job.data.chatId },
        {
          $set: {
            lastMessage: createdMessage._id,
          },
        }
      );
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
