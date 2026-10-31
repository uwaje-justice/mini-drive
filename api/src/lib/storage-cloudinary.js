import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";

import { v2 as cloudinary } from "cloudinary";

import env from "./env.js";

const signedUrlLifetimeSeconds = 5 * 60;

const fileTypes = new Map([
  ["image/png", { format: "png", resourceType: "image" }],
  ["image/jpeg", { format: "jpg", resourceType: "image" }],
  ["image/webp", { format: "webp", resourceType: "image" }],
  ["image/gif", { format: "gif", resourceType: "image" }],
  ["application/pdf", { format: "pdf", resourceType: "raw" }],
  ["text/plain", { format: "txt", resourceType: "raw" }],
]);

let configured = false;

const configure = () => {
  if (configured) return;

  cloudinary.config({
    cloud_name: env("CLOUDINARY_CLOUD_NAME"),
    api_key: env("CLOUDINARY_API_KEY"),
    api_secret: env("CLOUDINARY_API_SECRET"),
    secure: true,
  });

  configured = true;
};

const assertConfigured = () => configure();

const uploadBuffer = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);

        return resolve(result);
      },
    );

    stream.on("error", reject);
    stream.end(buffer);
  });

const resourceTypeFor = (file) =>
  file.storageResourceType ??
  (file.mimeType?.startsWith("image/") ? "image" : "raw");

const save = async (file, { ownerId }) => {
  configure();

  const fileType = fileTypes.get(file.mimetype);

  if (!fileType) {
    throw new Error("Cloudinary storage does not support this file type.");
  }

  const isRaw = fileType.resourceType === "raw";
  const extension = isRaw ? `.${fileType.format}` : "";
  const publicId = `file-uploader/${ownerId}/${randomUUID()}${extension}`;

  const result = await uploadBuffer(file.buffer, {
    public_id: publicId,
    filename: file.originalname,
    ...(isRaw ? {} : { format: fileType.format }),
    resource_type: fileType.resourceType,
    type: "authenticated",
    overwrite: false,
  });

  return {
    storageProvider: "cloudinary",
    storageKey: result.public_id,
    storageUrl: result.secure_url ?? result.url ?? null,
    storageFormat: isRaw ? null : (result.format ?? fileType.format),
    storageResourceType: result.resource_type,
  };
};

const remove = async (file) => {
  configure();

  const result = await cloudinary.uploader.destroy(file.storageKey, {
    resource_type: resourceTypeFor(file),
    type: "authenticated",
    invalidate: true,
  });

  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error("Cloudinary delete failed.");
  }
};

const open = async (file) => {
  configure();

  const downloadUrl = cloudinary.utils.private_download_url(
    file.storageKey,
    file.storageFormat ?? "",
    {
      resource_type: resourceTypeFor(file),
      type: "authenticated",
      expires_at: Math.floor(Date.now() / 1000) + signedUrlLifetimeSeconds,
      attachment: false,
    },
  );

  const response = await fetch(downloadUrl);

  if (response.status === 404) {
    const error = new Error("File is missing.");
    error.code = "ENOENT";
    throw error;
  }

  if (!response.ok || !response.body) {
    throw new Error(`Cloudinary download failed (${response.status}).`);
  }

  const contentLength = response.headers.get("content-length");

  return {
    size: contentLength === null ? null : Number(contentLength),
    stream: Readable.fromWeb(response.body),
  };
};

export default { assertConfigured, save, remove, open };
