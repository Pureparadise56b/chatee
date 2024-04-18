import { Request, Response, NextFunction } from "express";

type handlerFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

export const AsyncHandler =
  (fn: handlerFunction) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch((error) => {
      console.error(error);
      return next(error);
    });
