import { AsyncHandler } from "../utils/AsyncHandler.util";
import { ApiResponse } from "../utils/ApiResponse.util";
import { ApiError } from "../utils/ApiError.util";
import { User } from "../models/user.model";
import { Otp } from "../models/otp.model";
import { USER_REGISTER_TYPE } from "../constants";
import { sendOTP } from "../utils/sendOTP.util";
import {
  generateNewAccessToken,
  generateTokens,
} from "../utils/generateTokens.util";
import { Session } from "../models/session.model";
import { redisGlobalClient } from "../redis/config.redis";
import { UserInterface } from "../interfaces";

const generateOtp = () => {
  const charecters = "01234567890";
  let otp = "";
  for (let index = 0; index < 4; index++) {
    otp += charecters[Math.floor(Math.random() * charecters.length)];
  }

  return otp;
};

const getOTP = AsyncHandler(async (req, res) => {
  const { phoneNumber } = req.body;

  const existingOtp = await Otp.findOne({ phoneNumber });

  if (existingOtp) {
    let timeSliceCreation =
      (Date.now() - existingOtp.createdAt.getTime()) / 1000;

    if (timeSliceCreation < 60)
      throw new ApiError(
        429,
        "Please wait a minute before requesting a new OTP"
      );

    sendOTP(existingOtp.otp, phoneNumber);

    res.status(200).json(new ApiResponse(200, "Old OTP sent successfully"));
  } else {
    const otp = generateOtp();
    const createdOTP = await Otp.create({
      phoneNumber,
      otp,
    });

    if (!createdOTP) throw new ApiError(500, "Error while creating otp");

    sendOTP(otp, phoneNumber);

    res.status(200).json(new ApiResponse(200, "New OTP sent successfully"));
  }
});

const loginUser = AsyncHandler(async (req, res) => {
  const { otp, phoneNumber } = req.body;

  const existingOTP = await Otp.findOne({ otp, phoneNumber });

  if (!existingOTP) throw new ApiError(400, "Invalid OTP");

  let user = await User.findOne({ phoneNumber });

  if (user) {
    const session = await Session.findOne({ userId: user._id });
    if (session)
      throw new ApiError(
        400,
        "User has already an active session, please logout first."
      );
  } else {
    user = await User.create({
      phoneNumber,
      registerType: USER_REGISTER_TYPE.LOCAL,
    });
  }

  await Otp.deleteMany({ phoneNumber });

  const { accessToken, refreshToken } = await generateTokens(user._id);

  res.status(200).json(
    new ApiResponse(200, "User login successfull", {
      accessToken,
      refreshToken,
      isUserNameSet: user.isUsernameSet,
    })
  );
});

const generateNewToken = AsyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  const newToken = await generateNewAccessToken(refreshToken);

  res.status(201).json(
    new ApiResponse(201, "New access token created successfully", {
      accessToken: newToken,
    })
  );
});

const logoutUser = AsyncHandler(async (req, res) => {
  const { _id } = req.user as UserInterface;

  await redisGlobalClient.del(`users:details:${_id}`);
  await redisGlobalClient.del(`users:sessions:${_id}`);
  await Session.deleteMany({ userId: _id });

  res.status(200).json(new ApiResponse(200, "Usesr logout successfully"));
});

export { getOTP, loginUser, generateNewToken, logoutUser };
