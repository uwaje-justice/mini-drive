import { matchedData, validationResult } from "express-validator";

const validate = (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const fields = result.array().reduce(
      (messages, error) => ({ ...messages, [error.path]: error.msg }),
      {},
    );

    return res.status(422).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Check the highlighted fields.",
        fields,
      },
    });
  }

  req.matchedData = matchedData(req, { locations: ["body"] });
  return next();
};

export default validate;
