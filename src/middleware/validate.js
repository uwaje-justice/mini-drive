import { matchedData, validationResult } from "express-validator";

const validate = (view, buildLocals) => async (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const errors = result.array().reduce(
      (messages, error) => ({ ...messages, [error.path]: error.msg }),
      {},
    );

    try {
      const locals = buildLocals ? await buildLocals(req) : {};

      return res.status(422).render(view, {
        ...locals,
        errors,
        values: req.body,
      });
    } catch (error) {
      return next(error);
    }
  }

  req.matchedData = matchedData(req, { locations: ["body"] });
  return next();
};

export default validate;
