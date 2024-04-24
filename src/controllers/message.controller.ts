import { AsyncHandler } from "../utils/AsyncHandler.util";
import { ApiResponse } from "../utils/ApiResponse.util";
import { ApiError } from "../utils/ApiError.util";
import mongoose from "mongoose";
import { Message } from "../models/message.model";
import { Chat } from "../models/chat.model";

const fetchAllMessages = AsyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const isValidChatId = mongoose.isValidObjectId(chatId);

  if (!isValidChatId) throw new ApiError(400, "Invalid ChatId");

  const chat = await Chat.findById(chatId);

  if (!chat) throw new ApiError(400, "Chat does not exist");

  if (!chat.members.includes(req.user?.id))
    throw new ApiError(400, "User is not the member of this chat");

  const messages = await Message.aggregate([
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
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, "Messages fetched successfully", messages));
});

const deleteMessage = AsyncHandler(async (req, res) => {
  const { chatId, messageId } = req.params;

  const isValidChatId = mongoose.isValidObjectId(chatId);
  const isValidMessageId = mongoose.isValidObjectId(messageId);

  if (!isValidChatId || !isValidMessageId)
    throw new ApiError(400, "ChatId or MessageId is invalid");

  const message = await Message.findOne({ _id: messageId, chatId });

  if (!message) throw new ApiError(400, "Message does not exist");

  if (message.sender.toString() !== req.user?.id)
    throw new ApiError(401, "User can't delete this message");

  await Message.findOneAndDelete({ _id: messageId, chatId });

  res.status(200).json(new ApiResponse(200, "Message deleted successfully"));
});

export { fetchAllMessages, deleteMessage };
