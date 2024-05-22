import express from "express";
import { getOTP, loginUser } from "../controllers/auth.controller";
import {
  getOTPValidator,
  userLoginValidator,
} from "../validators/auth.validator";
import { validate } from "../validators/validate";

const router = express.Router();

router.route("/otp").post(getOTPValidator(), validate, getOTP);
router.route("/login").post(userLoginValidator(), validate, loginUser);

export default router;
