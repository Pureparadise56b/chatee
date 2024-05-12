import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "./utils/ApiError.util";

const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) return next();

  const validationErrors: any[] = [];
  let messageCounter = 1;

  errors
    .array()
    .map((error) =>
      validationErrors.push({ [`msg${messageCounter++}`]: error.msg })
    );

  res.status(400).json(new ApiError(400, "Validation Error", validationErrors));
};

export { validate };
