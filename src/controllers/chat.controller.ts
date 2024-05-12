import { AsyncHandler } from "../utils/AsyncHandler.util";
import { ApiError } from "../utils/ApiError.util";
import { ApiResponse } from "../utils/ApiResponse.util";
import { Chat } from "../models/chat.model";
import { UserInterface } from "../interfaces";
import mongoose from "mongoose";
import { User } from "../models/user.model";
import { emitSocketEvent } from "../socket";
import { ChatEventEnum } from "../constants";

const commonAggregation = () => {
  return [
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "members",
        as: "members",
        pipeline: [
          {
            $project: {
              username: 1,
              phoneNumber: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "messages",
        localField: "lastMessage",
        foreignField: "_id",
        as: "lastMessage",
        pipeline: [
          {
            $project: {
              _id: 0,
              content: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        lastMessage: { $first: "$lastMessage" },
      },
    },
  ];
};

const getAllChats = AsyncHandler(async (req, res) => {
  const { _id } = req.user as UserInterface;

  const mongooseId = new mongoose.Types.ObjectId(_id);

  const chats = await Chat.aggregate([
    {
      $match: {
        $and: [
          { isGroupChat: false },
          {
            members: { $elemMatch: { $eq: mongooseId } },
          },
        ],
      },
    },
    {
      $sort: {
        updatedAt: -1,
      },
    },
    ...commonAggregation(),
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, "All chats fetched successfully", chats));
});

const getOrCreateOneonOneChat = AsyncHandler(async (req, res) => {
  const { receiverId } = req.params;

  const receiver = await User.findById(receiverId);

  if (!receiver) throw new ApiError(400, "Receiver doesn't exist");

  const mongooseUserId = new mongoose.Types.ObjectId(req.user?._id);
  const mongooseReceiverId = new mongoose.Types.ObjectId(receiverId);

  const chat = await Chat.aggregate([
    {
      $match: {
        isGroupChat: false,
        $and: [
          {
            members: { $elemMatch: { $eq: mongooseReceiverId } },
          },
          {
            members: { $elemMatch: { $eq: mongooseUserId } },
          },
        ],
      },
    },
    ...commonAggregation(),
  ]);

  if (chat.length) {
    return res
      .status(200)
      .json(new ApiResponse(200, "Sigle chat fetched successfully", chat[0]));
  }

  const createdChatInstance = await Chat.create({
    chatName: "One on One",
    members: [receiverId, req.user?._id],
    admin: req.user?._id,
  });

  if (!createdChatInstance)
    throw new ApiError(500, "Error while creating chat");

  const createdChat = await Chat.aggregate([
    {
      $match: {
        _id: createdChatInstance._id,
      },
    },
    ...commonAggregation(),
  ]);

  const payload = createdChat[0];

  payload.members.forEach((member: { _id: string }) => {
    if (member._id == req.user?._id) return;

    emitSocketEvent(
      req,
      member._id.toString(),
      ChatEventEnum.NEW_CHAT_EVENT,
      payload
    );
  });

  res
    .status(201)
    .json(new ApiResponse(201, "Chat created successfully", payload));
});

export { getAllChats, getOrCreateOneonOneChat };
