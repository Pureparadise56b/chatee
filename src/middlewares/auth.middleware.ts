import { AsyncHandler } from "../utils/AsyncHandler.util";
import { ApiError } from "../utils/ApiError.util";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import { UserInterface, decodedDataInterface } from "../interfaces";

// modify the request object and inclue user object into it
declare global {
  namespace Express {
    interface Request {
      user?: UserInterface | null;
    }
  }
}

export const JWTVerify = AsyncHandler(async (req, res, next) => {
  const header = req.headers["authorization"] || "";

  const token = header.split(" ")[1];

  if (!token) throw new ApiError(400, "Access token is required");

  const decodedData: decodedDataInterface = jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET!
  ) as decodedDataInterface;

  const user = await User.findById(decodedData.id);

  if (!user) throw new ApiError(401, "Invalid access token");

  req.user = user;
  next();
});
