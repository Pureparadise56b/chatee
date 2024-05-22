import express from "express";
import { JWTVerify } from "../middlewares/auth.middleware";
import {
  getAllChats,
  getOrCreateOneonOneChat,
} from "../controllers/chat.controller";
import { createOrGetChatValidation } from "../validators/chat.validator";
import { validate } from "../validators/validate";

const router = express.Router();

router.use(JWTVerify);

router.route("/").get(getAllChats);
router
  .route("/:receiverId")
  .post(createOrGetChatValidation(), validate, getOrCreateOneonOneChat);

export default router;
