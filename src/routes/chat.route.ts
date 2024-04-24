import express from "express";
import { JWTVerify } from "../middlewares/auth.middleware";
import {
  getAllChats,
  getOrCreateOneonOneChat,
} from "../controllers/chat.controller";

const router = express.Router();

router.use(JWTVerify);

router.route("/").get(getAllChats);
router.route("/:receiverId").post(getOrCreateOneonOneChat);

export default router;
