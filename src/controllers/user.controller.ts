import { AsyncHandler } from "../utils/AsyncHandler.util";
import { ApiResponse } from "../utils/ApiResponse.util";
import { ApiError } from "../utils/ApiError.util";
import { User } from "../models/user.model";
import { UserInterface } from "../interfaces";
import { redisGlobalClient } from "../redis/config.redis";

const setUsername = AsyncHandler(async (req, res) => {
  const { _id } = req.user as UserInterface;
  const { username } = req.body;

  const user = await User.findById(_id);

  if (user?.isUsernameSet) throw new ApiError(400, "User name already set");

  if (user) {
    user.username = username;
    user.isUsernameSet = true;
    await user.save();
  }

  await redisGlobalClient.del(`users:details:${user?._id}`);

  res
    .status(200)
    .json(new ApiResponse(200, "Username changed successfully", user));
});

const getAvailableNumbers = AsyncHandler(async (req, res) => {
  let allNumbers: string[] = req.body.allNumbers;

  allNumbers = allNumbers.filter((item) => item !== req.user?.phoneNumber);

  const numbersHasCache = await redisGlobalClient.get(
    `users:available_numbers:${req.user?._id}`
  );

  if (numbersHasCache) {
    const cachedNumbers = JSON.parse(numbersHasCache);
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Available numbers fetched successfully.",
          cachedNumbers
        )
      );
  } else {
    const availableNumbers = await User.aggregate([
      {
        $match: {
          phoneNumber: { $in: allNumbers },
        },
      },
      {
        $project: {
          phoneNumber: 1,
          isRegistered: { $literal: true },
        },
      },
    ]);

    await redisGlobalClient.setex(
      `users:available_numbers:${req.user?._id}`,
      120,
      JSON.stringify(availableNumbers)
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Available numbers fetched successfully.",
          availableNumbers
        )
      );
  }
});

const getUserDetails = AsyncHandler(async (req, res) => {
  const { _id } = req.user as UserInterface;

  const userHasCache = await redisGlobalClient.get(`users:details:${_id}`);

  if (userHasCache) {
    const cachedUser = JSON.parse(userHasCache);
    res
      .status(200)
      .json(new ApiResponse(200, "User fetched successfully", cachedUser));
  } else {
    const user = await User.findById(_id);
    res
      .status(200)
      .json(new ApiResponse(200, "User fetched successfully", user));
  }
});

export { setUsername, getAvailableNumbers, getUserDetails };
