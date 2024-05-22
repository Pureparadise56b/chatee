import { AsyncHandler } from "../utils/AsyncHandler.util";
import { ApiError } from "../utils/ApiError.util";
import jwt from "jsonwebtoken";
import { decodedDataInterface } from "../interfaces";
import { User } from "../models/user.model";
import { redisGlobalClient } from "../redis/config.redis";
import { Session } from "../models/session.model";

export const JWTVerify = AsyncHandler(async (req, res, next) => {
  const header = req.headers["authorization"] || "";

  if (!header || !header.startsWith("Bearer"))
    throw new ApiError(400, "Authorization header is required");

  const accessToken = header.split(" ")[1];

  if (!accessToken) throw new ApiError(400, "Access token is required");

  const decodedData = jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET!
  ) as decodedDataInterface;

  if (!decodedData) throw new ApiError(400, "Invalid token");

  const sessionHasCache = await redisGlobalClient.get(
    `users:sessions:${decodedData._id}`
  );

  if (!sessionHasCache) {
    const session = await Session.findOne({ userId: decodedData._id });
    if (!session) {
      throw new ApiError(401, "User has no session");
    } else {
      await redisGlobalClient.setex(
        `users:sessions:${decodedData._id}`,
        18000,
        JSON.stringify({
          activeSession: true,
          createdAt: session.createdAt,
        })
      );
    }
  }

  const userHasCache = await redisGlobalClient.get(
    `users:details:${decodedData._id}`
  );

  if (userHasCache) {
    req.user = JSON.parse(userHasCache);
    next();
  } else {
    const actualUser = await User.findById(decodedData._id);

    if (!actualUser) throw new ApiError(400, "Invalid token");

    await redisGlobalClient.setex(
      `users:details:${decodedData._id}`,
      7200,
      JSON.stringify(actualUser)
    );

    req.user = actualUser;
    next();
  }
});
