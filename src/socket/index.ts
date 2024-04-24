import { Server, Socket } from "socket.io";
import { ApiError } from "../utils/ApiError.util";
import jwt from "jsonwebtoken";
import { UserInterface, decodedDataInterface } from "../interfaces";
import { User } from "../models/user.model";
import { ChatEventEnum } from "../constants";
import { Request } from "express";
import { redisPublisher, redisSubscriber } from "../redis/config.redis";

declare module "socket.io" {
  export interface Socket {
    user: UserInterface;
  }
}

const mountJoinChatEvent = (socket: Socket): void => {
  socket.on(ChatEventEnum.JOIN_CHAT_EVENT, (chatId) => {
    console.log("User joined a chat: ", chatId);
    socket.join(chatId);
    console.log("ChatRoom: ", socket.rooms);
  });
};

const mountLeaveChatEvent = (socket: Socket): void => {
  socket.on(ChatEventEnum.LEAVE_CHAT_EVENT, (chatId) => {
    console.log("User leaved a chat: ", chatId);
    socket.leave(chatId);
    console.log("ChatRoom: ", socket.rooms);
  });
};

const mountUserTypingEvent = (socket: Socket): void => {
  socket.on(ChatEventEnum.TYPING_EVENT, (payload) => {
    // TODO: scale typing event for different servers

    socket.in(payload.chatId).emit(ChatEventEnum.TYPING_EVENT, payload);
  });
};

const mountUserTypingStopEvent = (socket: Socket): void => {
  socket.on(ChatEventEnum.STOP_TYPING_EVENT, (chatId) => {
    // TODO: scale stop typing event for different servers

    socket.in(chatId).emit(ChatEventEnum.STOP_TYPING_EVENT, chatId);
  });
};

const initializeSocketIO = (io: Server) => {
  redisSubscriber.on("message", (channel, payloadString) => {
    if (channel === "MESSAGES") {
      const payload = JSON.parse(payloadString);
      io.to(payload.chatId).emit(ChatEventEnum.MESSAGE_RECEIVED_EVENT, payload);
    }
  });

  return io.on("connection", async (socket) => {
    try {
      let token = socket.handshake.auth.token;

      if (!token) {
        token = socket.handshake.headers.token;
      }

      if (!token)
        throw new ApiError(400, "Token is required to initialize socket");

      const decodedData: decodedDataInterface = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      ) as decodedDataInterface;

      const user = await User.findById(decodedData.id);

      if (!user) throw new ApiError(401, "Invalid access token");

      socket.user = user;

      socket.join(user._id.toString());
      socket.emit(ChatEventEnum.CONNECTED_EVENT);

      console.log("\nUser connected...", user._id.toString());
      console.log("ChatRoom: ", socket.rooms);

      mountJoinChatEvent(socket);
      mountUserTypingEvent(socket);
      mountUserTypingStopEvent(socket);
      mountLeaveChatEvent(socket);

      socket.on(ChatEventEnum.MESSAAGE_SEND_EVENT, (payload) => {
        redisPublisher.publish("MESSAGES", JSON.stringify(payload));
      });

      socket.on(ChatEventEnum.DISCONNECT_EVENT, () => {
        console.log("User disconnected userId: ", socket.user._id.toString());
        if (socket.user._id) {
          socket.leave(socket.user._id);
        }
      });
    } catch (error: any) {
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
