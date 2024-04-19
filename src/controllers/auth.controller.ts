import { AsyncHandler } from "../utils/AsyncHandler.util";
import { ApiResponse } from "../utils/ApiResponse.util";
import { ApiError } from "../utils/ApiError.util";
import { User } from "../models/user.model";
import { zodPhoneNumberSchema, zodUserSchema } from "../zod/schema.zod";
import { USER_REGISTER_TYPE } from "../constants";
import { sendOTP } from "../utils/sendOTP.util";
import { UserInterface } from "../interfaces";

const generateOtp = () => {
  const charecters = "01234567890";
  let otp = "";
  for (let index = 0; index < 4; index++) {
    otp += charecters[Math.floor(Math.random() * charecters.length)];
  }

  return otp;
};

const loginUser = AsyncHandler(async (req, res) => {
  const { phoneNumber } = req.body;

  const parsedPhoneNumber = zodPhoneNumberSchema.safeParse(phoneNumber);

  if (!parsedPhoneNumber.success) {
    const errorMessage = parsedPhoneNumber.error.errors[0].message;
    throw new ApiError(400, errorMessage);
  }

  const existingUser = await User.findOne({
    phoneNumber: parsedPhoneNumber.data,
  });

  if (existingUser) {
    if (!existingUser.accountVerified)
      throw new ApiError(400, "It's seems like your account is not verified");
    const otp = generateOtp();

    existingUser.otp = otp;
    existingUser.otpExpiry = new Date(Date.now() + 1000 * 60 * 60);
    await existingUser.save();
    sendOTP(otp, parsedPhoneNumber.data);
    return res
      .status(200)
      .json(new ApiResponse(201, "User logged in successfully"));
  } else {
    const otp = generateOtp();
    const createdUser = await User.create({
      phoneNumber: parsedPhoneNumber.data,
      registerType: USER_REGISTER_TYPE.LOCAL,
      otp,
      otpExpiry: new Date(Date.now() + 1000 * 60 * 60),
    });
    sendOTP(otp, parsedPhoneNumber.data);

    if (!createdUser) throw new ApiError(500, "Error while creating user");
  }

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        "Account created successfully, please verify your account"
      )
    );
});

const verifyUser = AsyncHandler(async (req, res) => {
  const { otp, phoneNumber } = req.body;

  if (!otp || !phoneNumber)
    throw new ApiError(400, "OTP and phone number is required");

  const user = await User.findOne({ phoneNumber });

  if (!user) throw new ApiError(404, "User not found");

  if (otp !== user.otp) throw new ApiError(400, "OTP didn't match");

  if (user.otpExpiry && user.otpExpiry < new Date(Date.now()))
    throw new ApiError(400, "OTP expired");

  if (!user.accountVerified) {
    user.accountVerified = true;
  }

  user.isCurrentlyLogin = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();
  const token = user.generateAccessToken();

  res.status(200).json(
    new ApiResponse(200, "User verified successfully", {
      token,
    })
  );
});

const resendOtp = AsyncHandler(async (req, res) => {
  const { phoneNumber } = req.body;
  const parsedPhoneNumber = zodPhoneNumberSchema.safeParse(phoneNumber);

  if (!parsedPhoneNumber.success) {
    const errorMessage = parsedPhoneNumber.error.errors[0].message;
    throw new ApiError(400, errorMessage);
  }

  const user = await User.findOne({ phoneNumber });

  if (!user) throw new ApiError(404, "User not found");

  const newOtp = generateOtp();

  user.otp = newOtp;
  user.otpExpiry = new Date(Date.now() + 1000 * 60 * 60);

  await user.save();

  sendOTP(newOtp, phoneNumber);

  res.status(200).json(new ApiResponse(200, "New OTP generated successfully"));
});

const logoutUser = AsyncHandler(async (req, res) => {
  const { id } = req.user as UserInterface;

  const user = await User.findById(id);

  if (!user?.isCurrentlyLogin) throw new ApiError(400, "User already logout");

  user.isCurrentlyLogin = false;

  await user.save();

  res.status(200).json(new ApiResponse(200, "User logout successfully"));
});

export { loginUser, verifyUser, resendOtp, logoutUser };
