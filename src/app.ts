import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import authRouter from "./routes/auth.route";
import userRouter from "./routes/user.route";
import chatRouter from "./routes/chat.route";
import { initializeSocketIO } from "./socket";
import path from "path";

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

// error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  res.status(err.statusCode ? err.statusCode : 500).send(err.message);
});

app.get("/", (req, res) => {
  res.sendFile(path.resolve("test.html"));
});

initializeSocketIO(io);
export { httpServer };
