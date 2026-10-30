import { createReadStream as createFileStream } from "node:fs";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { basename, dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const storageRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "uploads",
);

const pathForKey = (key) => join(storageRoot, basename(key));

const safeExtension = (fileName) => {
  const extension = extname(fileName).toLowerCase();
  return /^\.[a-z0-9]{1,10}$/.test(extension) ? extension : "";
};

const save = async (file) => {
  await mkdir(storageRoot, { recursive: true });

  const key = `${randomUUID()}${safeExtension(file.originalname)}`;
  await writeFile(pathForKey(key), file.buffer);

  return { key };
};

const remove = async (key) => {
  try {
    await unlink(pathForKey(key));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
};

const getPath = (key) => pathForKey(key);

const createReadStream = (key) => createFileStream(getPath(key));

export default { save, remove, getPath, createReadStream };
