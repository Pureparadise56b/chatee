import mongoose, { Schema } from "mongoose";
import { UserInterface } from "../interfaces";

const userSchema = new Schema<UserInterface>(
  {
    username: {
      type: String,
      default: "default_user",
      trim: true,
      maxlength: 50,
      minlength: 3,
    },
    isUsernameSet: {
      type: Boolean,
      default: false,
    },
    phoneNumber: {
      type: String,
      required: [true, "phone number is required"],
      unique: true,
      trim: true,
      match: new RegExp("^\\+?[0-9]+$"),
      maxlength: [14, "maximum length should be 14"],
      minlength: [13, "minimum length should be 13"],
    },
    profile: {
      type: String,
      default: "",
    },
    registerType: {
      type: String,
      required: [true, "register type is required"],
    },
    role: {
      type: String,
      default: "USER",
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
