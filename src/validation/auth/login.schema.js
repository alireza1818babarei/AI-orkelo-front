import * as yup from "yup";

export const loginSchema = yup.object({
  email: yup
    .string().trim()
    .required("Email is required")
    .email("Invalid email"),
  password: yup
   .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters long"),

  rememberMe: yup.boolean().default(false),
});
