import multer from "multer";

import detectMimeType from "../lib/file-signature.js";

const maxFileSize = 5 * 1024 * 1024;
const maxFiles = 10;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxFileSize },
  defParamCharset: "utf8",
});

const uploadError = (statusCode, message) => ({ statusCode, message });

const uploadFiles = (req, res, next) => {
  upload.array("files", maxFiles)(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        req.uploadError = uploadError(
          413,
          "Each file must be 5 MB or smaller.",
        );
      } else if (error.code === "LIMIT_UNEXPECTED_FILE") {
        req.uploadError = uploadError(400, "Choose up to 10 files.");
      } else {
        req.uploadError = uploadError(
          400,
          "Upload failed. Check the files field.",
        );
      }

      return next();
    }

    if (error) return next(error);

    const files = req.files ?? [];

    if (files.length === 0) {
      req.uploadError = uploadError(400, "Choose a file to upload.");
      return next();
    }

    const accepted = [];
    const skipped = [];

    for (const file of files) {
      if (file.size === 0) {
        skipped.push({
          statusCode: 400,
          message: `${file.originalname}: File is empty.`,
        });
        continue;
      }

      const mimeType = detectMimeType(file.buffer);

      if (!mimeType) {
        skipped.push({
          statusCode: 415,
          message: `${file.originalname}: Use a PNG, JPEG, WebP, GIF, PDF, or plain text file.`,
        });
        continue;
      }

      file.mimetype = mimeType;
      accepted.push(file);
    }

    req.files = accepted;
    req.uploadErrors = skipped;
    return next();
  });
};

export default uploadFiles;
