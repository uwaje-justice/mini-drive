import multer from "multer";
import detectMimeType from "../lib/file-signature.js";

const maxFileSize = 5 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxFileSize },
  defParamCharset: "utf8",
});

const uploadError = (statusCode, message) => ({ statusCode, message });

const uploadFile = (req, res, next) => {
  upload.single("file")(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        req.uploadError = uploadError(
          413,
          "File must be 5 MB or smaller.",
        );
      } else {
        req.uploadError = uploadError(
          400,
          "Upload failed. Check the file field.",
        );
      }

      return next();
    }

    if (error) return next(error);

    if (!req.file) {
      req.uploadError = uploadError(400, "Choose a file to upload.");
      return next();
    }

    if (req.file.size === 0) {
      req.uploadError = uploadError(400, "File is empty.");
      return next();
    }

    const mimeType = detectMimeType(req.file.buffer);

    if (!mimeType) {
      req.uploadError = uploadError(
        415,
        "Use a PNG, JPEG, WebP, GIF, PDF, or plain text file.",
      );
      return next();
    }

    req.file.mimetype = mimeType;
    return next();
  });
};

export default uploadFile;
