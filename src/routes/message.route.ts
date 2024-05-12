import express from "express";
import { JWTVerify } from "../middlewares/auth.middleware";
import {
  deleteMessage,
  fetchAllMessages,
} from "../controllers/message.controller";
import {
  deleteMessageValidation,
  fetchAllMessagesValidation,
} from "../validators/message.validator";
import { validate } from "../validate";

const router = express.Router();

router.use(JWTVerify);

router
  .route("/:chatId")
  .get(fetchAllMessagesValidation(), validate, fetchAllMessages);
router
  .route("/:chatId/:messageId")
  .delete(deleteMessageValidation(), validate, deleteMessage);

export default router;
