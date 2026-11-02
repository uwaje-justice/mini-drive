const mutationMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

let csrfToken = null;

export class ApiError extends Error {
  constructor({ code, message, fields, status }) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.fields = fields;
    this.status = status;
  }
}

export const setCsrfToken = (token) => {
  csrfToken = token;
};

const isMutation = (method) => mutationMethods.has(method);

const parsePayload = async (response) => {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) return null;

  return response.json();
};

const toApiError = (payload, status) =>
  new ApiError({
    code: payload?.error?.code ?? "REQUEST_FAILED",
    message: payload?.error?.message ?? "The request failed.",
    fields: payload?.error?.fields,
    status,
  });

const send = (path, { method = "GET", body, headers = {} } = {}) => {
  const requestHeaders = { ...headers };
  const isForm = body instanceof FormData;

  if (body !== undefined && !isForm) {
    requestHeaders["content-type"] = "application/json";
  }

  if (isMutation(method) && csrfToken) {
    requestHeaders["x-csrf-token"] = csrfToken;
  }

  return fetch(path, {
    method,
    body: body === undefined || isForm ? body : JSON.stringify(body),
    headers: requestHeaders,
    credentials: "include",
  });
};

const request = async (path, options = {}) => {
  const method = options.method ?? "GET";
  let response = await send(path, { ...options, method });
  let payload = await parsePayload(response);

  if (
    response.status === 403 &&
    payload?.error?.code === "CSRF_INVALID" &&
    isMutation(method)
  ) {
    await getSession();
    response = await send(path, { ...options, method });
    payload = await parsePayload(response);
  }

  if (!response.ok) throw toApiError(payload, response.status);

  return payload?.data ?? null;
};

const parseUploadPayload = (xhr) => {
  const contentType = xhr.getResponseHeader("content-type") ?? "";

  if (!contentType.includes("application/json")) return null;

  return JSON.parse(xhr.responseText);
};

const sendUpload = (path, { body, onProgress }) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("POST", path);
    xhr.withCredentials = true;

    if (csrfToken) xhr.setRequestHeader("x-csrf-token", csrfToken);

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total);
    });

    xhr.addEventListener("load", () => {
      try {
        resolve({
          status: xhr.status,
          payload: parseUploadPayload(xhr),
        });
      } catch {
        reject(
          new ApiError({
            code: "INVALID_RESPONSE",
            message: "The upload response could not be read.",
            status: xhr.status,
          }),
        );
      }
    });

    xhr.addEventListener("error", () => {
      reject(
        new ApiError({
          code: "REQUEST_FAILED",
          message: "Could not upload files. Check your connection.",
          status: 0,
        }),
      );
    });

    xhr.send(body);
  });

export const requestUpload = async (path, { body, onProgress } = {}) => {
  let response = await sendUpload(path, { body, onProgress });

  if (
    response.status === 403 &&
    response.payload?.error?.code === "CSRF_INVALID"
  ) {
    await getSession();
    response = await sendUpload(path, { body, onProgress });
  }

  if (response.status < 200 || response.status >= 300) {
    throw toApiError(response.payload, response.status);
  }

  return response.payload?.data ?? null;
};

export const getSession = async () => {
  const data = await request("/api/auth/session");
  setCsrfToken(data?.csrfToken ?? null);
  return data;
};

export default request;
