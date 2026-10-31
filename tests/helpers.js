import { randomUUID } from "node:crypto";
import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/lib/prisma.js";
import storage from "../src/lib/storage.js";

export const testPassword = "password123";

if (!process.env.DATABASE_URL?.includes("test.db")) {
  throw new Error("Tests must run with DATABASE_URL=file:./test.db.");
}

export const uniqueEmail = (label) =>
  `${label}-${randomUUID()}@example.com`;

export const createAgent = () => request.agent(app);

export const getCsrfToken = async (client) => {
  const response = await client.get("/");
  const match = response.text.match(
    /<meta name="csrf-token" content="([^"]+)">/,
  );

  if (!match) throw new Error("CSRF token was not rendered.");

  return match[1];
};

export const postForm = async (client, path, fields = {}) => {
  const token = fields._csrf ?? (await getCsrfToken(client));

  return client
    .post(path)
    .type("form")
    .send({ ...fields, _csrf: token });
};

export const registerUser = async (client, label = "user") => {
  const email = uniqueEmail(label);
  const response = await postForm(client, "/auth/register", {
    email,
    password: testPassword,
    confirmPassword: testPassword,
  });

  if (response.status !== 302) {
    throw new Error(`Registration failed with ${response.status}.`);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) throw new Error("Registered user was not saved.");

  return user;
};

export const loginUser = async (client, email, password = testPassword) => {
  const response = await postForm(client, "/auth/login", { email, password });

  if (response.status !== 302) {
    throw new Error(`Login failed with ${response.status}.`);
  }

  return response;
};

export const createFolder = async (
  client,
  user,
  name,
  parentId = null,
) => {
  const response = await postForm(client, "/folders", {
    name,
    ...(parentId ? { parentId } : {}),
  });

  if (response.status !== 302) {
    throw new Error(`Folder creation failed with ${response.status}.`);
  }

  const folder = await prisma.folder.findFirst({
    where: {
      ownerId: user.id,
      parentId,
      nameKey: name.trim().toLowerCase(),
    },
  });

  if (!folder) throw new Error("Created folder was not saved.");

  return folder;
};

export const uploadFiles = async (
  client,
  { folderId = null, files },
) => {
  const token = await getCsrfToken(client);
  const agent = client.post("/files/upload").field("_csrf", token);

  if (folderId) agent.field("folderId", folderId);

  for (const file of files) {
    agent.attach("files", file.buffer, {
      filename: file.name,
      contentType: file.contentType ?? "application/octet-stream",
    });
  }

  return agent;
};

export const uploadFile = async (client, { folderId = null, ...file }) =>
  uploadFiles(client, { folderId, files: [file] });

export const findFile = (ownerId, name) =>
  prisma.file.findFirst({
    where: { ownerId, nameKey: name.trim().toLowerCase() },
  });

export const findFolder = (ownerId, name, parentId = null) =>
  prisma.folder.findFirst({
    where: {
      ownerId,
      parentId,
      nameKey: name.trim().toLowerCase(),
    },
  });

export const createShareLink = async (client, folder, days = 7) => {
  const response = await postForm(client, `/folders/${folder.id}/share`, {
    days,
  });

  if (response.status !== 302) {
    throw new Error(`Share creation failed with ${response.status}.`);
  }

  const link = await prisma.shareLink.findFirst({
    where: { folderId: folder.id },
    orderBy: { createdAt: "desc" },
  });

  if (!link) throw new Error("Created share link was not saved.");

  return link;
};

const parseBinary = (response, callback) => {
  const chunks = [];

  response.on("data", (chunk) => chunks.push(chunk));
  response.on("end", () => callback(null, Buffer.concat(chunks)));
};

export const downloadFile = (client, fileId) =>
  client
    .get(`/files/${fileId}/download`)
    .buffer(true)
    .parse(parseBinary);

export const downloadSharedFile = (client, token, fileId) =>
  client
    .get(`/share/${token}/files/${fileId}/download`)
    .buffer(true)
    .parse(parseBinary);

export const cleanupUser = async (user) => {
  if (!user) return;

  const files = await prisma.file.findMany({
    where: { ownerId: user.id },
    select: {
      storageProvider: true,
      storageKey: true,
      storageFormat: true,
      storageResourceType: true,
      mimeType: true,
    },
  });

  await Promise.allSettled(files.map((file) => storage.remove(file)));
  await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
  await prisma.session
    .deleteMany({ where: { data: { contains: user.id } } })
    .catch(() => {});
};

export const cleanupUsers = async (users) => {
  for (const user of users) {
    await cleanupUser(user);
  }
};

export const bytes = {
  png: Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    Buffer.from("test png body"),
  ]),
  jpeg: Buffer.concat([
    Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
    Buffer.from("test jpeg body"),
  ]),
  gif: Buffer.concat([Buffer.from("GIF89a"), Buffer.from("test gif body")]),
  webp: Buffer.concat([
    Buffer.from("RIFF"),
    Buffer.from([0x10, 0x00, 0x00, 0x00]),
    Buffer.from("WEBPVP8 "),
    Buffer.from("test webp body"),
  ]),
  pdf: Buffer.from("%PDF-1.4\ntest pdf body"),
  text: Buffer.from("plain text body\n", "utf8"),
  binary: Buffer.from([0xff, 0x00, 0xfe, 0xfd]),
  empty: Buffer.alloc(0),
  oversize: Buffer.alloc(5 * 1024 * 1024 + 1, 0x89),
};
