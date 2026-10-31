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

export const getApiSession = async (client) => {
  const response = await client.get("/api/auth/session");

  if (response.status !== 200) {
    throw new Error(`API session failed with ${response.status}.`);
  }

  return response.body.data;
};

export const getApiCsrfToken = async (client) =>
  (await getApiSession(client)).csrfToken;

export const sendApi = async (client, method, path, body = {}) => {
  const token = await getApiCsrfToken(client);

  return client[method](path).set("x-csrf-token", token).send(body);
};

export const registerApiUser = async (client, label = "api-user") => {
  const email = uniqueEmail(label);
  const response = await sendApi(client, "post", "/api/auth/register", {
    email,
    password: testPassword,
    confirmPassword: testPassword,
  });

  if (response.status !== 201) {
    throw new Error(`API registration failed with ${response.status}.`);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) throw new Error("API-registered user was not saved.");

  return user;
};

export const createApiFolder = async (client, name, parentId = null) => {
  const response = await sendApi(client, "post", "/api/folders", {
    name,
    ...(parentId ? { parentId } : {}),
  });

  if (response.status !== 201) {
    throw new Error(`API folder creation failed with ${response.status}.`);
  }

  return response.body.data.folder;
};

export const findFile = (ownerId, name) =>
  prisma.file.findFirst({
    where: { ownerId, nameKey: name.trim().toLowerCase() },
  });

export const uploadApiFiles = async (client, { folderId = null, files }) => {
  const token = await getApiCsrfToken(client);
  const agent = client.post("/api/files").set("x-csrf-token", token);

  if (folderId) agent.field("folderId", folderId);

  for (const file of files) {
    agent.attach("files", file.buffer, {
      filename: file.name,
      contentType: file.contentType ?? "application/octet-stream",
    });
  }

  return agent;
};

export const uploadApiFile = async (client, { folderId = null, ...file }) =>
  uploadApiFiles(client, { folderId, files: [file] });

export const createApiShareLink = async (client, folder, days = 7) => {
  const response = await sendApi(
    client,
    "post",
    `/api/folders/${folder.id}/shares`,
    { days },
  );

  if (response.status !== 201) {
    throw new Error(`API share creation failed with ${response.status}.`);
  }

  return response.body.data.link;
};

const parseBinary = (response, callback) => {
  const chunks = [];

  response.on("data", (chunk) => chunks.push(chunk));
  response.on("end", () => callback(null, Buffer.concat(chunks)));
};

export const downloadApiFile = (client, fileId) =>
  client
    .get(`/api/files/${fileId}/download`)
    .buffer(true)
    .parse(parseBinary);

export const downloadApiSharedFile = (client, token, fileId) =>
  client
    .get(`/api/public/shares/${token}/files/${fileId}/download`)
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
