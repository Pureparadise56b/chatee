import express from "express";
import {
  loginUser,
  logoutUser,
  resendOtp,
  verifyUser,
} from "../controllers/auth.controller";
import { JWTVerify } from "../middlewares/auth.middleware";

const router = express.Router();

router.route("/login").post(loginUser);
router.route("/login/verify").post(verifyUser);
router.route("/otp/resend").post(resendOtp);
router.route("/logout").get(JWTVerify, logoutUser);

export default router;
