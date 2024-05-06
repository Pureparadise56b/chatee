import { Document, Types } from "mongoose";
import { JwtPayload } from "jsonwebtoken";
import { RemoteSocket } from "socket.io";

interface ProfileInterface {
  publicId: string;
  url: string;
}

export interface UserInterface extends Document {
  username: string;
  isUsernameSet: boolean;
  phoneNumber: string;
  isCurrentlyLogin: boolean;
  profile: ProfileInterface;
  registerType: string;
  role: string;
  accountVerified: boolean;
  otp?: string;
  otpExpiry?: Date;
  generateAccessToken: Function;
}

export interface ChatInterface extends Document {
  chatName: string;
  isGroupChat: boolean;
  members: Types.ObjectId[];
  lastMessage: Types.ObjectId;
  admin: Types.ObjectId;
}

export interface MessageInterface extends Document {
  sender: Types.ObjectId;
  content: string;
  chatId: Types.ObjectId;
}

export interface CustomeSocket extends RemoteSocket<any, any> {
  user: UserInterface;
}

interface decodedDataInterface extends JwtPayload {
  id: string;
  username: string;
  isUsernameSet: boolean;
  phoneNumber: string;
  isCurrentlyLogin: boolean;
  accountVerified: boolean;
  role: string;
}

interface requestUserInterface {
  _id: string;
  username: string;
  phoneNumber: string;
  isCurrentlyLogin: boolean;
  role: string;
  accountVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface availabeNumbersResponseInteface {
  number: string;
  registred: boolean;
}
