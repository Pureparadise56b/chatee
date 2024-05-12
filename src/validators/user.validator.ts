import { body } from "express-validator";

const setUsernameValidator = () => {
  return [
    body("username")
      .notEmpty()
      .withMessage("Username must be provided")
      .isLength({
        min: 4,
        max: 50,
      })
      .withMessage("Username must be in range of 4 to 50 characters")
      .trim()
      .matches("/^[a-zA-Z_-]+$/")
      .withMessage("Please enter a valid username"),
  ];
};

const availableNumbersValidator = () => {
  return [
    body("allNumbers")
      .isArray({
        min: 1,
      })
      .withMessage("Numbers must be provided")
      .custom((numbers: []) =>
        numbers.every((number) => typeof number === "string")
      )
      .withMessage("Please provide valid numbers"),
  ];
};

export { setUsernameValidator, availableNumbersValidator };
