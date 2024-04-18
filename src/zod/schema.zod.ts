import { z } from "zod";

export const zodUserSchema = z
  .string()
  .min(3, "username must be atleast 3 charecters")
  .max(50, "username must be lower than 50 charecters")
  .trim();

export const zodPhoneNumberSchema = z
  .string()
  .regex(/^[0-9]+$/, { message: "Invalid phone number" })
  .length(10, { message: "Phone number must be in 10 charecters" });
