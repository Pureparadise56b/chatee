import { body } from "express-validator";

const userRegistrationValidator = () => {
  return [
    body("phoneNumber")
      .notEmpty()
      .withMessage("Phone number must be provided")
      .isMobilePhone("en-IN")
      .withMessage("Please enter a valid phone number"),
  ];
};

const verifyUserValidation = () => {
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

const resendOtpValidation = () => {
  return [
    body("phoneNumber")
      .notEmpty()
      .withMessage("Phone number must be provided")
      .isMobilePhone("en-IN")
      .withMessage("Please enter a valid phone number"),
  ];
};

export { userRegistrationValidator, verifyUserValidation, resendOtpValidation };
