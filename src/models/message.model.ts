import mongoose, { Schema } from "mongoose";
import { MessageInterface } from "../interfaces";

const messageSchema = new Schema<MessageInterface>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    content: {
      type: String,
      required: [true, "content is required"],
    },
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
    },
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
