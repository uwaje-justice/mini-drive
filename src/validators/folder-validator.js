import { body } from "express-validator";

const folderRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Folder name is required.")
    .bail()
    .isLength({ max: 100 })
    .withMessage("Folder name must be 100 characters or fewer."),
  body("parentId")
    .optional({ values: "falsy" })
    .isString()
    .withMessage("Parent folder is invalid."),
];

export default { folderRules };
