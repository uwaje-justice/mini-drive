import multer from "multer";
import BadRequestError from "../errors/bad-request-error.js";
import PayloadTooLargeError from "../errors/payload-too-large-error.js";
import UnsupportedMediaTypeError from "../errors/unsupported-media-type-error.js";

const maxFileSize = 5 * 1024 * 1024;

const allowedMimeTypes = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxFileSize },
  fileFilter: (req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(
        new UnsupportedMediaTypeError("This file type is not allowed."),
      );
    }

    return callback(null, true);
  },
});

const uploadFile = (req, res, next) => {
  upload.single("file")(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return next(new PayloadTooLargeError("File must be 5 MB or smaller."));
      }

      return next(new BadRequestError("Upload failed. Check the file field."));
    }

    if (error) return next(error);

    if (!req.file) return next(new BadRequestError("Choose a file to upload."));

    return next();
  });
};

export default uploadFile;
