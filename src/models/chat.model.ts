import mongoose, { Schema } from "mongoose";
import { ChatInterface } from "../interfaces";

const chatSchema = new Schema<ChatInterface>(
  {
    chatName: {
      type: String,
      required: [true, "chat name is required"],
    },
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Chat = mongoose.model("Chat", chatSchema);
