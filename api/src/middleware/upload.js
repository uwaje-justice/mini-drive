import multer from "multer";

import BadRequestError from "../errors/bad-request-error.js";
import PayloadTooLargeError from "../errors/payload-too-large-error.js";
import detectMimeType from "../lib/file-signature.js";

const maxFileSize = 5 * 1024 * 1024;
const maxFiles = 10;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxFileSize },
  defParamCharset: "utf8",
});

const uploadFiles = (req, res, next) => {
  upload.array("files", maxFiles)(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return next(
          new PayloadTooLargeError("Each file must be 5 MB or smaller."),
        );
      }

      if (error.code === "LIMIT_UNEXPECTED_FILE") {
        return next(new BadRequestError("Upload at most 10 files."));
      }

      return next(new BadRequestError("Upload failed."));
    }

    if (error) return next(error);

    const files = req.files ?? [];

    if (files.length === 0) {
      return next(new BadRequestError("No files were uploaded."));
    }

    const accepted = [];
    const skipped = [];

    for (const file of files) {
      if (file.size === 0) {
        skipped.push({ message: `${file.originalname}: File is empty.` });
        continue;
      }

      const mimeType = detectMimeType(file.buffer);

      if (!mimeType) {
        skipped.push({
          message: `${file.originalname}: Use a PNG, JPEG, WebP, GIF, PDF, or plain text file.`,
        });
        continue;
      }

      file.mimetype = mimeType;
      accepted.push(file);
    }

    req.upload = { accepted, skipped };
    return next();
  });
};

export default uploadFiles;
