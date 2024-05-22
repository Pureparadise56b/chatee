import express from "express";
import { JWTVerify } from "../middlewares/auth.middleware";
import {
  setUsername,
  getAvailableNumbers,
  getUserDetails,
} from "../controllers/user.controller";
import {
  availableNumbersValidator,
  setUsernameValidator,
} from "../validators/user.validator";
import { validate } from "../validators/validate";

const router = express.Router();

router.use(JWTVerify);

router.route("/username").post(setUsernameValidator(), validate, setUsername);
router.route("/").get(getUserDetails);
router
  .route("/check/numbers")
  .post(availableNumbersValidator(), validate, getAvailableNumbers);
router.route("/temp").get((req, res) => {
  res.send("by bye");
});

export default router;
