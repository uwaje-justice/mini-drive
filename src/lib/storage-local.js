import { createReadStream as createFileStream } from "node:fs";
import { mkdir, stat as readStat, unlink, writeFile } from "node:fs/promises";
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

  const storageKey = `${randomUUID()}${safeExtension(file.originalname)}`;
  await writeFile(pathForKey(storageKey), file.buffer);

  return {
    storageProvider: "local",
    storageKey,
    storageUrl: null,
    storageFormat: null,
    storageResourceType: null,
  };
};

const remove = async ({ storageKey }) => {
  try {
    await unlink(pathForKey(storageKey));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
};

const open = async ({ storageKey }) => {
  const info = await readStat(pathForKey(storageKey));

  return {
    size: info.size,
    stream: createFileStream(pathForKey(storageKey)),
  };
};

export default { save, remove, open };
