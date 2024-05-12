import { param } from "express-validator";
import mongoose from "mongoose";

const createOrGetChatValidation = () => {
  return [
    param("receiverId")
      .notEmpty()
      .withMessage("ReceiverId must be provided")
      .custom((value) => mongoose.isValidObjectId(value))
      .withMessage("Please give a valid receiverId"),
  ];
};

export { createOrGetChatValidation };
