import mongoose, { Schema } from "mongoose";
import { SessionInterface } from "../interfaces";

const sessionSchema = new Schema<SessionInterface>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  refreshToken: {
    type: String,
    required: [true, "refresh token is required."],
    unique: true,
  },
  accessTokenCreationDate: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: { expires: "90d" },
  },
});

export const Session = mongoose.model("Session", sessionSchema);
