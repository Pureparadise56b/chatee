import { Server, Socket } from "socket.io";
import { ApiError } from "../utils/ApiError.util";
import jwt from "jsonwebtoken";
import { decodedDataInterface } from "../interfaces";
import { User } from "../models/user.model";
import { ChatEventEnum } from "../constants";

declare global {
  namespace SocketIO {
    interface Socket {
      user: string;
    }
  }
}

export const initializeSocketIO = (io: Server) => {
  try {
    return io.on("connection", async (socket) => {
      const token = socket.handshake.auth.token;

      if (!token)
        throw new ApiError(400, "Token is required to initialize socket");

      const decodedData: decodedDataInterface = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      ) as decodedDataInterface;

      const user = await User.findById(decodedData.id);

      if (!user) throw new ApiError(401, "Invalid access token");

      socket;

      socket.join(user._id.toString());
      socket.emit(ChatEventEnum.CONNECTED_EVENT);

      console.log("User connected...", user._id.toString());
      console.log("ChatRoom: ", socket.rooms);

      socket.on(ChatEventEnum.DISCONNECT_EVENT, () => {
        console.log("User disconnected userId");
      });
    });
  } catch (error) {}
};
