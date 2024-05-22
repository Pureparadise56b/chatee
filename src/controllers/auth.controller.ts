import { AsyncHandler } from "../utils/AsyncHandler.util";
import { ApiResponse } from "../utils/ApiResponse.util";
import { ApiError } from "../utils/ApiError.util";
import { User } from "../models/user.model";
import { Otp } from "../models/otp.model";
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

  if (!user) {
    user = await User.create({
      phoneNumber,
      registerType: USER_REGISTER_TYPE.LOCAL,
    });
  }

  await Otp.deleteMany({ phoneNumber });

  const accessToken = await user.generateAccessToken();

  res.status(200).json(
    new ApiResponse(200, "User login successfull", {
      token: accessToken,
      isUserNameSet: user.isUsernameSet,
    })
  );
});

export { getOTP, loginUser };
