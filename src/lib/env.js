import "dotenv/config";

const env = (key, fallback) => {
  const value = process.env[key];

  if (!value && !fallback) throw new Error(`Environment variable: ${key}.`);

  if (!value && fallback) return fallback;

  return value;
};

export default env;
