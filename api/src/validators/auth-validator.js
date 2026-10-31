import { body } from "express-validator";

const registerRules = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .bail()
    .isEmail()
    .withMessage("Enter a valid email.")
    .bail()
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be 8 to 128 characters.")
    .bail(),
  body("confirmPassword")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match."),
];

const loginRules = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .bail()
    .isEmail()
    .withMessage("Enter a valid email.")
    .bail()
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required.")
    .bail(),
];

export default { registerRules, loginRules };
