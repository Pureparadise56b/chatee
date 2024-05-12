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
      .matches("^[a-zA-Z_-]+$")
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
      .custom((numbers: any[]) =>
        numbers.every((number) => {
          const regex = /^[0-9+]+$/;

          if (
            typeof number === "string" &&
            regex.test(number) &&
            number.startsWith("+91")
          ) {
            return true;
          } else {
            return false;
          }
        })
      )
      .withMessage("Please provide valid numbers"),
  ];
};

export { setUsernameValidator, availableNumbersValidator };
