import express from "express";
import {
  loginUser,
  resendOtp,
  verifyUser,
} from "../controllers/auth.controller";
import {
  resendOtpValidation,
  userRegistrationValidator,
  verifyUserValidation,
} from "../validators/auth.validator";
import { validate } from "../validate";

const router = express.Router();

router.route("/login").post(userRegistrationValidator(), validate, loginUser);
router
  .route("/login/verify")
  .post(verifyUserValidation(), validate, verifyUser);
router.route("/otp/resend").post(resendOtpValidation(), validate, resendOtp);

export default router;
