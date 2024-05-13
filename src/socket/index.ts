import { Server, Socket } from "socket.io";
import { ApiError } from "../utils/ApiError.util";
import jwt from "jsonwebtoken";
import { UserInterface } from "../interfaces";
import { ChatEventEnum } from "../constants";
import { Request } from "express";
import { createRedisClient, redisGlobalClient } from "../redis/config.redis";

declare module "socket.io" {
  export interface Socket {
    user: UserInterface;
  }
}

const redisPublisher = createRedisClient();

const mountJoinChatEvent = (socket: Socket): void => {
  socket.on(ChatEventEnum.JOIN_CHAT_EVENT, (chatId) => {
    console.log("User joined a chat: ", chatId);
    socket.join(chatId);
    console.log("ChatRoom: ", socket.rooms);
  });
};

const mountLeaveChatEvent = (socket: Socket): void => {
  socket.on(ChatEventEnum.LEAVE_CHAT_EVENT, (chatId) => {
    console.log("User left a chat: ", chatId);
    socket.leave(chatId);
    console.log("ChatRoom: ", socket.rooms);
  });
};

const mountUserTypingEvent = (socket: Socket): void => {
  socket.on(ChatEventEnum.TYPING_EVENT, (chatId) => {
    socket.in(chatId).emit(ChatEventEnum.TYPING_EVENT, chatId);
  });
};

const mountUserTypingStopEvent = (socket: Socket): void => {
  socket.on(ChatEventEnum.STOP_TYPING_EVENT, (chatId) => {
    socket.in(chatId).emit(ChatEventEnum.STOP_TYPING_EVENT, chatId);
  });
};

const mountIsReceiverOnlineEvent = (socket: Socket): void => {
  socket.on(ChatEventEnum.GET_RECEIVER_STATUS, async (payload) => {
    const receiverStatus = await redisGlobalClient.get(
      `users:online:${payload.receiverId}`
    );
    socket.emit(ChatEventEnum.IS_RECEIVER_ONLINE_EVENT, {
      ...payload,
      receiverStatus,
    });
  });
};

const initializeSocketIO = (io: Server) => {
  return io.on("connection", async (socket) => {
    try {
      let token = socket.handshake.auth.token;

      if (!token) {
        token = socket.handshake.headers.token;
      }

      if (!token)
        throw new ApiError(400, "Token is required to initialize socket");

      const user = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      ) as UserInterface;

      if (!user) throw new ApiError(401, "Invalid access token");

      socket.user = user;

      socket.join(user._id.toString());
      socket.emit(ChatEventEnum.CONNECTED_EVENT);

      await redisGlobalClient.set(`users:online:${socket.user._id}`, 1);

      console.log("\nUser connected...", user._id.toString());
      console.log("ChatRoom: ", socket.rooms);

      mountJoinChatEvent(socket);
      mountUserTypingEvent(socket);
      mountUserTypingStopEvent(socket);
      mountLeaveChatEvent(socket);
      mountIsReceiverOnlineEvent(socket);

      socket.on(ChatEventEnum.MESSAAGE_SEND_EVENT, (payload) => {
        redisPublisher.publish("MESSAGES", JSON.stringify(payload));
      });

      socket.on(ChatEventEnum.DISCONNECT_EVENT, async () => {
        console.log("User disconnected userId: ", socket.user._id.toString());
        if (socket.user._id) {
          socket.leave(socket.user._id);
          await redisGlobalClient.set(`users:online:${socket.user._id}`, 0);
        }
      });
    } catch (error: any) {
      await redisGlobalClient.set(`users:online:${socket.user._id}`, 0);
      socket.emit(
        ChatEventEnum.SOCKET_ERROR_EVENT,
        error?.message || "Something went wrong while connecting to the socket"
      );
    }
  });
};

const emitSocketEvent = (
  req: Request,
  roomId: string,
  event: string,
  payload: any
) => {
  console.log("emit event room: ", roomId);
  req.app.get("io").in(roomId).emit(event, payload);
};

export { initializeSocketIO, emitSocketEvent };
