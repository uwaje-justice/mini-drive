import { pipeline } from "node:stream/promises";
import storage from "./storage.js";
import contentDisposition from "./content-disposition.js";
import NotFoundError from "../errors/not-found-error.js";

const sendFile = async (res, file) => {
  let target;

  try {
    target = await storage.open(file);
  } catch (error) {
    if (error.code === "ENOENT") throw new NotFoundError("File is missing.");

    throw error;
  }

  if (target.redirectUrl) {
    res.set({
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
    });

    return res.redirect(302, target.redirectUrl);
  }

  res.set({
    "Content-Type": file.mimeType,
    "Content-Length": target.size,
    "Content-Disposition": contentDisposition(file.name),
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
  });

  await pipeline(target.stream, res);
};

export default sendFile;
