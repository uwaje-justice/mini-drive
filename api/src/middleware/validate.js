import { matchedData, validationResult } from "express-validator";

import ValidationError from "../errors/validation-error.js";

const validate = (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const fields = result.array().reduce(
      (messages, error) => ({ ...messages, [error.path]: error.msg }),
      {},
    );

    return next(new ValidationError(fields));
  }

  req.validated = matchedData(req, { locations: ["body"] });
  return next();
};

export default validate;
