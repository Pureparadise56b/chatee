import { Response, NextFunction } from "express";
import { CustomReqInterface } from "../interfaces";

type handlerFunction = (
  req: CustomReqInterface,
  res: Response,
  next: NextFunction
) => Promise<any>;

export const AsyncHandler =
  (fn: handlerFunction) =>
  (req: CustomReqInterface, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch((error) => {
      process.env.ENVIRONMENT === "DEVELOPMENT"
        ? console.error(error)
        : console.error(`Error :: ${error.message}`);
      return next(error);
    });
