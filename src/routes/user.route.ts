import express from "express";
import { JWTVerify } from "../middlewares/auth.middleware";
import { changeUsername } from "../controllers/user.controller";

const router = express.Router();

router.use(JWTVerify);

router.route("/username").post(changeUsername);

export default router;
