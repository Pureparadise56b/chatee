import mongoose, { Schema } from "mongoose";
import { OtpInterface } from "../interfaces";

const otpSchema = new Schema<OtpInterface>({
  phoneNumber: {
    type: String,
    required: [true, "Phone number is required"],
    unique: true,
    trim: true,
    match: /^\+?[0-9]+$/,
    maxlength: [14, "Maximum length should be 14"],
    minlength: [13, "Minimum length should be 13"],
  },
  otp: {
    type: String,
    required: [true, "OTP is required"],
    trim: true,
    minlength: 4,
    maxlength: 4,
    match: /^[0-9]+$/,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: { expires: "5m" },
  },
});

export const Otp = mongoose.model("Otp", otpSchema);
