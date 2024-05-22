import { Document, Types } from "mongoose";
import { JwtPayload } from "jsonwebtoken";
import { RemoteSocket } from "socket.io";
import { Request } from "express";

interface ProfileInterface {
  publicId: string;
  url: string;
}

export interface UserInterface extends Document {
  username: string;
  isUsernameSet: boolean;
  phoneNumber: string;
  profile: ProfileInterface;
  registerType: string;
  role: String;
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

export interface OtpInterface extends Document {
  phoneNumber: string;
  otp: string;
  createdAt: Date;
  expireAt: Date;
}

export interface SessionInterface extends Document {
  userId: Types.ObjectId;
  refreshToken: string;
  accessTokenCreationDate: Date;
  createdAt: Date;
}

export interface CustomReqInterface extends Request {
  user?: UserInterface | null;
}

export interface decodedDataInterface extends JwtPayload {
  _id: string;
}

interface CustomeSocketInterface extends RemoteSocket<any, any> {
  user: UserInterface | null;
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
