const units = ["B", "KB", "MB", "GB"];

const number = (value, options) =>
  new Intl.NumberFormat(undefined, options).format(value);

export const formatFileSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes < 0) return "Unknown size";
  if (bytes < 1024) return `${number(bytes)} B`;

  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** exponent;

  return `${number(value, { maximumFractionDigits: 1 })} ${units[exponent]}`;
};

export const formatDate = (value) =>
  new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

export const formatDateTime = (value) =>
  new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(value));

export const formatCount = (count, singular, plural = `${singular}s`) =>
  `${number(count)} ${count === 1 ? singular : plural}`;
