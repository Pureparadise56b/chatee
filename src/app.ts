import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import authRouter from "./routes/auth.route";
import userRouter from "./routes/user.route";
import chatRouter from "./routes/chat.route";
import messageRouter from "./routes/message.route";
import { initializeSocketIO } from "./socket";
import { redisSubscriber } from "./redis/config.redis";
import { kafkaConsumer } from "./kafka/config.kafka";
import path from "path";
import { Message } from "./models/message.model";

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.ORIGIN,
    credentials: true,
  },
});

app.set("io", io);

app.use(
  cors({
    origin: process.env.ORIGIN === "*" ? "*" : process.env.ORIGIN?.split(","),
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// normal routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

// chat routes
app.use("/api/chats", chatRouter);

// message routes
app.use("/api/messages", messageRouter);

// error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  res.status(err.statusCode ? err.statusCode : 500).send(err.message);
});

app.get("/", (req, res) => {
  res.sendFile(path.resolve("test.html"));
});

initializeSocketIO(io);
redisSubscriber.subscribe("MESSAGES", "TYPING");

kafkaConsumer.subscribe({
  topic: "MESSAGES",
  fromBeginning: true,
});

(async () => {
  await kafkaConsumer.run({
    eachMessage: async ({ topic, partition, message, pause }) => {
      try {
        const data = JSON.parse(message.value?.toString() || "");

        await Message.create({
          content: data.message,
        });
      } catch (error) {
        console.error("Error while inserting message into database: ", error);
        pause();
        setTimeout(() => {
          kafkaConsumer.resume([
            {
              topic: "MESSAGES",
            },
          ]);
        }, 5000);
      }
    },
  });
})().catch((err) => {
  console.error("Error while consuming messages: ", err);
});

export { httpServer };
