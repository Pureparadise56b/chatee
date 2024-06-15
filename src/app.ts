import express from "express";
import http from "http";
import cors from "cors";
import path from "path";
import authRouter from "./routes/auth.route";
import userRouter from "./routes/user.route";
import chatRouter from "./routes/chat.route";
import messageRouter from "./routes/message.route";
import { Server } from "socket.io";
import { initializeSocketIO } from "./socket";
import { createRedisClient } from "./redis/config.redis";
import { messageQueue } from "./bullmq/mq.config";
import { ChatEventEnum } from "./constants";
import mongoose from "mongoose";

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.ORIGIN,
    credentials: true,
  },
});

app.use(
  cors({
    origin: process.env.ORIGIN === "*" ? "*" : process.env.ORIGIN?.split(","),
    credentials: true,
  })
);
app.set("io", io);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// normal routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

// chat routes
app.use("/api/chats", chatRouter);

// message routes
app.use("/api/messages", messageRouter);

app.get("/", (req, res) => {
  res.sendFile(path.resolve("test.html"));
});

initializeSocketIO(io);

const redisSubscriber = createRedisClient();
redisSubscriber.subscribe("MESSAGES");

(async () => {
  redisSubscriber.on("message", async (channel, payloadString) => {
    if (channel === "MESSAGES") {
      const payload = JSON.parse(payloadString);
      if (!payload.chatId || !mongoose.isValidObjectId(payload.chatId)) return;
      io.in(payload.chatId).emit(ChatEventEnum.MESSAGE_RECEIVED_EVENT, payload);
      await messageQueue.add("MESSAGES", payload);
    }
  });
})();

// 404 not found error handler middleware
app.use((req, res, next) => {
  res.status(404).json({
    error: {
      message: "page not found",
      method: req.method,
      route: req.path,
    },
  });
});

// error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  res.status(err.statusCode || 500).send(err || "Internal server error");
});

export { httpServer };
