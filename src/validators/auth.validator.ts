import { body } from "express-validator";

const getOTPValidator = () => {
  return [
    body("phoneNumber")
      .notEmpty()
      .withMessage("Phone number must be provided")
      .isMobilePhone("en-IN")
      .withMessage("Please enter a valid phone number"),
  ];
};

const userLoginValidator = () => {
  return [
    body("otp")
      .notEmpty()
      .withMessage("OTP must be provided")
      .isNumeric({
        no_symbols: true,
      })
      .withMessage("Please enter a valid OTP")
      .isLength({
        max: 4,
        min: 4,
      })
      .withMessage("OTP must be a 4 digit number"),
    body("phoneNumber")
      .notEmpty()
      .withMessage("Phone number must be provided")
      .isMobilePhone("en-IN")
      .withMessage("Please enter a valid phone number"),
  ];
};

const generateNewTokenValidator = () => {
  return [
    body("refreshToken")
      .notEmpty()
      .withMessage("Refresh token must be provied")
      .isString()
      .withMessage("Please provide a valid refreshToken"),
  ];
};

// const resendOtpValidation = () => {
//   return [
//     body("phoneNumber")
//       .notEmpty()
//       .withMessage("Phone number must be provided")
//       .isMobilePhone("en-IN")
//       .withMessage("Please enter a valid phone number"),
//   ];
// };

export { getOTPValidator, userLoginValidator, generateNewTokenValidator };
