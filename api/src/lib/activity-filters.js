const activityActions = [
  "uploaded",
  "created",
  "renamed",
  "moved",
  "deleted",
  "shared",
  "unshared",
  "email_changed",
  "password_changed",
];

const activityTargetTypes = ["file", "folder", "account"];

const text = (value) =>
  typeof value === "string" ? value.trim().slice(0, 100) : "";

const allowed = (value, options) =>
  options.includes(value) ? value : null;

export const parseActivityFilters = (query = {}) => {
  const search = text(query.q);

  return {
    text: search,
    action: allowed(text(query.action), activityActions),
    targetType: allowed(text(query.targetType), activityTargetTypes),
  };
};

export default { parseActivityFilters };
