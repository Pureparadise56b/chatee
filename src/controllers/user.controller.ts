import { AsyncHandler } from "../utils/AsyncHandler.util";
import { ApiResponse } from "../utils/ApiResponse.util";
import { ApiError } from "../utils/ApiError.util";
import { User } from "../models/user.model";
import { zodUserSchema } from "../zod/schema.zod";
import { UserInterface, availabeNumbersResponseInteface } from "../interfaces";

const changeUsername = AsyncHandler(async (req, res) => {
  const { id } = req.user as UserInterface;
  const { username } = req.body;

  const user = await User.findById(id);

  if (user?.isUsernameChanged) throw new ApiError(400, "User name already set");

  const parsedUsername = zodUserSchema.safeParse(username);

  if (!parsedUsername.success) {
    const errorMessage = parsedUsername.error.errors[0].message;
    throw new ApiError(400, errorMessage);
  }

  if (user) {
    user.username = parsedUsername.data || "";
    user.isUsernameChanged = true;
    await user.save();
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Username changed successfully", user));
});

const getAvailableNumbers = AsyncHandler(async (req, res) => {
  const { allNumbers } = req.body;

  if (!allNumbers || allNumbers.length === 0)
    throw new ApiError(400, "Numbers are required");

  const availableNumbers = await User.aggregate([
    {
      $match: {
        phoneNumber: { $in: allNumbers },
      },
    },
    {
      $project: {
        _id: 0,
        phoneNumber: 1,
      },
    },
  ]);

  const numbers: string[] = [];

  availableNumbers.map((item) => numbers.push(item.phoneNumber));

  const availableNumbersSet = new Set(numbers);

  const responseArray: availabeNumbersResponseInteface[] = [];

  allNumbers.map((number: string) => {
    if (availableNumbersSet.has(number)) {
      const availableItem: availabeNumbersResponseInteface = {
        number,
        registred: true,
      };
      responseArray.push(availableItem);
    } else {
      const notAvailableItem: availabeNumbersResponseInteface = {
        number,
        registred: false,
      };
      responseArray.push(notAvailableItem);
    }
  });

  res.status(200).json(responseArray);
});

export { changeUsername, getAvailableNumbers };
