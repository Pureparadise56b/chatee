import express from "express";
import {
  generateNewToken,
  getOTP,
  loginUser,
  logoutUser,
} from "../controllers/auth.controller";
import {
  generateNewTokenValidator,
  getOTPValidator,
  userLoginValidator,
} from "../validators/auth.validator";
import { validate } from "../validators/validate";
import { JWTVerify } from "../middlewares/auth.middleware";

const router = express.Router();

router.route("/otp").post(getOTPValidator(), validate, getOTP);
router.route("/login").post(userLoginValidator(), validate, loginUser);
router
  .route("/generate-token")
  .post(generateNewTokenValidator(), validate, generateNewToken);
router.route("/logout").get(JWTVerify, logoutUser);
export default router;
