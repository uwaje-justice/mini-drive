import { body } from "express-validator";

const fileRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("File name is required.")
    .bail()
    .isLength({ max: 255 })
    .withMessage("File name must be 255 characters or fewer."),
];

const moveRules = [
  body("folderId")
    .optional({ values: "falsy" })
    .isString()
    .withMessage("Folder is invalid."),
];

const uploadRules = [
  body("folderId")
    .optional({ values: "falsy" })
    .isString()
    .withMessage("Folder is invalid."),
];

export default { fileRules, moveRules, uploadRules };
