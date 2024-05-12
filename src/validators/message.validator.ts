import { param } from "express-validator";
import mongoose from "mongoose";

const fetchAllMessagesValidation = () => {
  return [
    param("chatId")
      .notEmpty()
      .withMessage("ChatId must be provided")
      .customSanitizer((value) => mongoose.isValidObjectId(value))
      .withMessage("Please give a valid chatId"),
  ];
};

const deleteMessageValidation = () => {
  return [
    param("chatId")
      .notEmpty()
      .withMessage("ChatId must be provided")
      .customSanitizer((value) => mongoose.isValidObjectId(value))
      .withMessage("Please give a valid chatId"),
    param("messageId")
      .notEmpty()
      .withMessage("MessageId must be provided")
      .customSanitizer((value) => mongoose.isValidObjectId(value))
      .withMessage("Please give a valid messageId"),
  ];
};

export { fetchAllMessagesValidation, deleteMessageValidation };
