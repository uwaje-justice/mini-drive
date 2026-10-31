import { body } from "express-validator";

const shareRules = [
  body("days")
    .trim()
    .notEmpty()
    .withMessage("Choose how many days the link should last.")
    .bail()
    .isInt({ min: 1, max: 365 })
    .withMessage("Choose a number of days from 1 to 365.")
    .bail()
    .toInt(),
];

export default { shareRules };
