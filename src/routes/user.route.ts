import express from "express";
import { JWTVerify } from "../middlewares/auth.middleware";
import {
  changeUsername,
  getAvailableNumbers,
} from "../controllers/user.controller";

const router = express.Router();

router.use(JWTVerify);

router.route("/username").post(changeUsername);
router.route("/check/numbers").post(getAvailableNumbers);

export default router;