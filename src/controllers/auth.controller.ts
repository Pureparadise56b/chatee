import { AsyncHandler } from "../utils/AsyncHandler.util";
import { ApiResponse } from "../utils/ApiResponse.util";
import { ApiError } from "../utils/ApiError.util";
import { User } from "../models/user.model";
import { USER_REGISTER_TYPE } from "../constants";
import { sendOTP } from "../utils/sendOTP.util";

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

  const existingUser = await User.findOne({
    phoneNumber: phoneNumber,
  });

  if (existingUser) {
    if (!existingUser.accountVerified)
      throw new ApiError(400, "It's seems like your account is not verified");
    const otp = generateOtp();

    existingUser.otp = otp;
    existingUser.otpExpiry = new Date(Date.now() + 1000 * 60 * 60);
    await existingUser.save();
    sendOTP(otp, phoneNumber);
    return res
      .status(200)
      .json(new ApiResponse(201, "User logged in successfully"));
  } else {
    const otp = generateOtp();
    const createdUser = await User.create({
      phoneNumber: phoneNumber,
      registerType: USER_REGISTER_TYPE.LOCAL,
      otp,
      otpExpiry: new Date(Date.now() + 1000 * 60 * 60),
    });
    sendOTP(otp, phoneNumber);

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

  const user = await User.findOne({ phoneNumber });

  if (!user) throw new ApiError(404, "User not found");

  if (otp !== user.otp) throw new ApiError(400, "OTP didn't match");

  if (user.otpExpiry && user.otpExpiry < new Date(Date.now()))
    throw new ApiError(400, "OTP expired");

  if (!user.accountVerified) {
    user.accountVerified = true;
  }

  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();
  const token = user.generateAccessToken();

  res.status(200).json(
    new ApiResponse(200, "User verified successfully", {
      token,
      isUserNameSet: user.isUsernameSet,
    })
  );
});

const resendOtp = AsyncHandler(async (req, res) => {
  const { phoneNumber } = req.body;

  const user = await User.findOne({ phoneNumber });

  if (!user) throw new ApiError(404, "User not found");

  const newOtp = generateOtp();

  user.otp = newOtp;
  user.otpExpiry = new Date(Date.now() + 1000 * 60 * 60);

  await user.save();

  sendOTP(newOtp, phoneNumber);

  res.status(200).json(new ApiResponse(200, "New OTP generated successfully"));
});

export { loginUser, verifyUser, resendOtp };
