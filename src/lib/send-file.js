import { pipeline } from "node:stream/promises";
import storage from "./storage.js";
import contentDisposition from "./content-disposition.js";
import NotFoundError from "../errors/not-found-error.js";

const sendFile = async (res, file) => {
  let info;

  try {
    info = await storage.stat(file.storageKey);
  } catch (error) {
    if (error.code === "ENOENT") throw new NotFoundError("File is missing.");

    throw error;
  }

  res.set({
    "Content-Type": file.mimeType,
    "Content-Length": info.size,
    "Content-Disposition": contentDisposition(file.name),
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });

  await pipeline(storage.createReadStream(file.storageKey), res);
};

export default sendFile;
