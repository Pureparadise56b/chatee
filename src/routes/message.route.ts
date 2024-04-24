import express from "express";
import { JWTVerify } from "../middlewares/auth.middleware";
import {
  deleteMessage,
  fetchAllMessages,
} from "../controllers/message.controller";

const router = express.Router();

router.use(JWTVerify);

router.route("/:chatId").get(fetchAllMessages);
router.route("/:chatId/:messageId").delete(deleteMessage);

export default router;
