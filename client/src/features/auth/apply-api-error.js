import { ApiError } from "@/api/api-client.js";

const applyApiError = (error, setError, fieldNames) => {
  if (!(error instanceof ApiError)) {
    setError("root.server", {
      type: "server",
      message: "Could not complete that request. Try again.",
    });
    return;
  }

  const fieldErrors = Object.entries(error.fields ?? {}).filter(([name]) =>
    fieldNames.includes(name),
  );

  if (fieldErrors.length === 0) {
    setError("root.server", {
      type: "server",
      message: error.message,
    });
    return;
  }

  for (const [name, message] of fieldErrors) {
    setError(name, { type: "server", message });
  }
};

export default applyApiError;
