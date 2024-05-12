import { AsyncHandler } from "../utils/AsyncHandler.util";
import { ApiError } from "../utils/ApiError.util";
import jwt from "jsonwebtoken";
import { UserInterface, decodedDataInterface } from "../interfaces";
import { User } from "../models/user.model";
import { redisGlobalClient } from "../redis/config.redis";

// modify the request object and include user object into it
declare global {
  namespace Express {
    interface Request {
      user?: UserInterface | null;
    }
  }
}

export const JWTVerify = AsyncHandler(async (req, res, next) => {
  const header = req.headers["authorization"] || "";

  if (!header || !header.startsWith("Bearer"))
    throw new ApiError(400, "Authorization header is required");

  const token = header.split(" ")[1];

  if (!token) throw new ApiError(400, "Access token is required");

  const decodedToken = jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET!
  ) as decodedDataInterface;

  if (!decodedToken) throw new ApiError(400, "Invalid token");

  const userHasCache = await redisGlobalClient.get(
    `users:auth:${decodedToken._id}`
  );

  if (userHasCache) {
    req.user = JSON.parse(userHasCache);
    next();
  } else {
    const actualUser = await User.findById(decodedToken._id);

    if (!actualUser) throw new ApiError(400, "Invalid token");

    await redisGlobalClient.setex(
      `users:auth:${decodedToken._id}`,
      7200,
      JSON.stringify(actualUser)
    );

    req.user = actualUser;
    next();
  }
});
