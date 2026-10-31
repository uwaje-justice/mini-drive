import "dotenv/config";

import EnvError from "../errors/env-error.js";

const env = (key, fallback) => {
  const value = process.env[key];

  if (!value && !fallback) throw new EnvError(key);

  if (!value && fallback) return fallback;

  return value;
};

export default env;
