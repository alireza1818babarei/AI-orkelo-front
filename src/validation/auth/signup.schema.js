import * as yup from "yup";

export const signupSchema = yup.object({
  name: yup.string().required("Please enter your name"),
  email: yup
    .string()
    .trim()
    .email("Invalid email address")
    .required("Email is required"),
  password: yup.string().min(8, "Password must be at least 8 characters long"),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords do not match")
    .required(),
  terms: yup
    .boolean()
    .oneOf([true], "You must agree to the terms and conditions")
    .required("Please accept the terms and conditions"),
});
