import JWT from "jsonwebtoken";
import { Session } from "../models/session.model";
import { decodedDataInterface } from "../interfaces";
import { ApiError } from "./ApiError.util";

export const generateTokens = async (_id: string) => {
  try {
    const accessToken = JWT.sign(
      {
        _id,
      },
      process.env.ACCESS_TOKEN_SECRET!,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      }
    );
    const refreshToken = JWT.sign({ _id }, process.env.REFRESH_TOKEN_SECRET!);

    await Session.create({
      refreshToken,
      userId: _id,
    });
    return Promise.resolve({ accessToken, refreshToken });
  } catch (error) {
    return Promise.reject(error);
  }
};

export const generateNewAccessToken = async (refreshToken: string) => {
  try {
    const decodedData = JWT.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as decodedDataInterface;

    const session = await Session.findOne({
      refreshToken,
    });

    if (!session) throw new ApiError(401, "Session has expired, please login");

    const creationTimeOfAccessToken =
      (Date.now() - session.accessTokenCreationDate.getTime()) / 1000;

    if (creationTimeOfAccessToken < 300)
      throw new ApiError(429, "Current access token is not expired");

    const newAccessToken = JWT.sign(
      {
        _id: decodedData._id,
      },
      process.env.ACCESS_TOKEN_SECRET!,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      }
    );

    session.accessTokenCreationDate = new Date(Date.now());
    await session.save();

    return Promise.resolve(newAccessToken);
  } catch (error) {
    return Promise.reject(error);
  }
};
