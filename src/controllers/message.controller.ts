import { AsyncHandler } from "../utils/AsyncHandler.util";
import { ApiResponse } from "../utils/ApiResponse.util";
import { ApiError } from "../utils/ApiError.util";
import mongoose from "mongoose";
import { Message } from "../models/message.model";
import { Chat } from "../models/chat.model";
import { emitSocketEvent } from "../socket";
import { ChatEventEnum } from "../constants";
import {
  DecodeMessageStream,
  JsonArrayStream,
} from "../utils/messageStream.util";

const fetchAllMessages = AsyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const chat = await Chat.findById(chatId);

  if (!chat) throw new ApiError(404, "Chat does not exist");

  if (!chat.members.includes(req.user?._id))
    throw new ApiError(400, "User is not the member of this chat");

  const messageCursor = await Message.aggregate([
    {
      $match: {
        chatId: { $eq: new mongoose.Types.ObjectId(chatId) },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "sender",
        foreignField: "_id",
        as: "sender",
        pipeline: [
          {
            $project: {
              username: 1,
              phoneNumber: 1,
              profile: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        sender: { $first: "$sender" },
      },
    },
  ]).cursor();

  const jsonArrayStream = new JsonArrayStream();

  // const decodedStream = new DecodeMessageStream();
  // const messages: any[] = [];

  // messageCursor.pipe(decodedStream);

  // decodedStream.pipe(jsonArrayStream).pipe(res);

  // decodedStream.on("data", (data) => {
  //   messages.push(JSON.parse(data));
  // });

  // decodedStream.on("end", () => {
  //   res
  //     .status(200)
  //     .json(new ApiResponse(200, "Messages fetched successfully", messages));
  // });

  // decodedStream.on("error", (err) => {
  //   console.error("Stream Error: ", err);
  //   throw new ApiError(500, "Error while streaming messages");
  // });

  messageCursor.pipe(jsonArrayStream).pipe(res);

  jsonArrayStream.on("error", (err) => {
    console.error("Response Error: ", err);
    throw new ApiError(500, "Error while streaming messages");
  });
});

const deleteMessage = AsyncHandler(async (req, res) => {
  const { chatId, messageId } = req.params;

  const message = await Message.findOne({ _id: messageId, chatId });

  if (!message) throw new ApiError(400, "Message does not exist");

  if (message.sender.toString() !== req.user?._id)
    throw new ApiError(401, "User can't delete this message");

  const deletedMessage = await Message.findOneAndDelete({
    _id: messageId,
    chatId,
  });

  emitSocketEvent(req, chatId, ChatEventEnum.MESSAGE_DELETE_EVENT, {
    messageId: deletedMessage?._id,
    chatId,
  });

  res.status(200).json(new ApiResponse(200, "Message deleted successfully"));
});

export { fetchAllMessages, deleteMessage };
