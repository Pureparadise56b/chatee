import { Server, Socket } from "socket.io";
import { ApiError } from "../utils/ApiError.util";
import jwt from "jsonwebtoken";
import { UserInterface, decodedDataInterface } from "../interfaces";
import { ChatEventEnum } from "../constants";
import { Request } from "express";
import { createRedisClient, redisGlobalClient } from "../redis/config.redis";
import { User } from "../models/user.model";

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

const mountSendMessageEvent = (socket: Socket): void => {
  socket.on(ChatEventEnum.MESSAAGE_SEND_EVENT, (payload) => {
    redisPublisher.publish("MESSAGES", JSON.stringify(payload));
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

const mountSocketDisconnectEvent = (socket: Socket): void => {
  socket.on(ChatEventEnum.DISCONNECT_EVENT, async () => {
    if (socket.user._id) {
      await redisGlobalClient.set(`users:online:${socket.user._id}`, 0);
      socket.broadcast.emit(ChatEventEnum.NEW_USER_LEFT_EVENT, socket.user._id);
      socket.leave(socket.user._id);
      console.log("User disconnected userId: ", socket.user._id);
      delete (socket as any).user;
    }
  });
};

const initializeSocketIO = (io: Server) => {
  return io.on("connection", async (socket) => {
    try {
      let user = null;
      let token = null;
      if (
        !(
          (token = socket.handshake.auth.token) ||
          (token = socket.handshake.headers.token)
        )
      )
        throw new ApiError(400, "Token is required to initialize socket");

      const decodeData = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      ) as decodedDataInterface;

      if (!decodeData) throw new ApiError(401, "Invalid access token");

      const userHasCache = await redisGlobalClient.get(
        `users:details:${decodeData._id}`
      );

      if (userHasCache) {
        socket.user = JSON.parse(userHasCache);
      } else {
        user = await User.findById(decodeData._id);
        if (!user) throw new ApiError(400, "Invalid access token");
        socket.user = user;
      }

      socket.join(socket.user._id);
      await redisGlobalClient.set(`users:online:${socket.user._id}`, 1);
      socket.broadcast.emit(ChatEventEnum.NEW_USER_JOIN_EVENT, socket.user._id);

      mountJoinChatEvent(socket);
      mountLeaveChatEvent(socket);
      mountSendMessageEvent(socket);
      mountUserTypingEvent(socket);
      mountUserTypingStopEvent(socket);
      mountIsReceiverOnlineEvent(socket);
      mountSocketDisconnectEvent(socket);

      console.log("\nUser connected...", socket.user._id);
    } catch (error: any) {
      if (socket.user?._id) {
        await redisGlobalClient.set(`users:onlines:${socket.user._id}`, 0);
        socket.leave(socket.user._id);
        delete (socket as any).user;
      }
      socket.emit(
        ChatEventEnum.SOCKET_ERROR_EVENT,
        error?.message || "Something went wrong while connecting to the socket"
      );
      console.log("Socket Error: ", error);
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
