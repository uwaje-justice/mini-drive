import { matchedData, validationResult } from "express-validator";

const validate = (view) => (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const errors = result.array().reduce(
      (messages, error) => ({ ...messages, [error.path]: error.msg }),
      {},
    );

    return res.status(422).render(view, { errors, values: req.body });
  }

  req.matchedData = matchedData(req, { locations: ["body"] });
  return next();
};

export default validate;
