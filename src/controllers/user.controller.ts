import { AsyncHandler } from "../utils/AsyncHandler.util";
import { ApiResponse } from "../utils/ApiResponse.util";
import { ApiError } from "../utils/ApiError.util";
import { User } from "../models/user.model";
import { zodUserSchema } from "../zod/schema.zod";
import { UserInterface } from "../interfaces";

const changeUsername = AsyncHandler(async (req, res) => {
  const { id } = req.user as UserInterface;
  const { username } = req.body;

  const parsedUsername = zodUserSchema.safeParse(username);

  if (!parsedUsername.success) {
    const errorMessage = parsedUsername.error.errors[0].message;
    throw new ApiError(400, errorMessage);
  }

  const user = await User.findByIdAndUpdate(
    id,
    { username },
    {
      new: true,
      projection: {
        username: 1,
        isCurrentlyLogin: 1,
      },
    }
  );

  res
    .status(200)
    .json(new ApiResponse(200, "Username changed successfully", user));
});

export { changeUsername };
