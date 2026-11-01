import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

import { onTestFinished,test } from "vitest";

import prisma from "../src/lib/prisma.js";
import {
  cleanupUser,
  createAgent,
  createApiFolder,
  registerApiUser,
} from "./helpers.js";

const createDriveFile = (
  ownerId,
  {
    name,
    mimeType,
    folderId = null,
    createdAt = "2026-01-01T00:00:00.000Z",
  },
) =>
  prisma.file.create({
    data: {
      name,
      nameKey: name.toLowerCase(),
      storageProvider: "local",
      storageKey: randomUUID(),
      mimeType,
      size: 10,
      ownerId,
      folderId,
      folderKey: folderId ?? "root",
      createdAt: new Date(createdAt),
    },
  });

test("the drive overview counts files, folders, categories, and activity", async () => {
  const client = createAgent();
  const user = await registerApiUser(client, "api-drive-overview");
  const otherClient = createAgent();
  const other = await registerApiUser(otherClient, "api-drive-overview-other");
  onTestFinished(async () => {
    await cleanupUser(other);
    await cleanupUser(user);
  });

  const folder = await createApiFolder(client, "Projects");
  const child = await createApiFolder(client, "Archive", folder.id);
  await createApiFolder(otherClient, "Private folder");
  await prisma.folder.update({
    where: { id: folder.id },
    data: { createdAt: new Date("2026-01-09T00:00:00.000Z") },
  });
  await prisma.folder.update({
    where: { id: child.id },
    data: { createdAt: new Date("2026-01-10T00:00:00.000Z") },
  });

  await createDriveFile(user.id, {
    name: "newest.png",
    mimeType: "image/png",
    createdAt: "2026-01-08T00:00:00.000Z",
  });
  await createDriveFile(user.id, {
    name: "report.pdf",
    mimeType: "application/pdf",
    folderId: child.id,
    createdAt: "2026-01-07T00:00:00.000Z",
  });
  await createDriveFile(user.id, {
    name: "notes.txt",
    mimeType: "text/plain",
    createdAt: "2026-01-06T00:00:00.000Z",
  });
  await createDriveFile(user.id, {
    name: "archive.zip",
    mimeType: "application/zip",
    createdAt: "2026-01-05T00:00:00.000Z",
  });
  await createDriveFile(user.id, {
    name: "older.png",
    mimeType: "image/png",
    createdAt: "2026-01-04T00:00:00.000Z",
  });
  await createDriveFile(user.id, {
    name: "older.pdf",
    mimeType: "application/pdf",
    createdAt: "2026-01-03T00:00:00.000Z",
  });
  await createDriveFile(user.id, {
    name: "older.txt",
    mimeType: "text/plain",
    createdAt: "2026-01-02T00:00:00.000Z",
  });
  await createDriveFile(user.id, {
    name: "oldest.zip",
    mimeType: "application/zip",
    createdAt: "2026-01-01T00:00:00.000Z",
  });
  await createDriveFile(other.id, {
    name: "private.png",
    mimeType: "image/png",
    createdAt: "2030-01-01T00:00:00.000Z",
  });

  const response = await client.get("/api/drive/overview");
  const unauthenticated = await createAgent().get("/api/drive/overview");

  assert.equal(response.status, 200);
  assert.equal(response.headers["cache-control"], "no-store");
  assert.deepEqual(response.body.data.summary, {
    fileCount: 8,
    folderCount: 2,
  });
  assert.deepEqual(response.body.data.categories, [
    { id: "photos", name: "Photos", count: 2 },
    { id: "documents", name: "Documents", count: 2 },
    { id: "text", name: "Text", count: 2 },
    { id: "other", name: "Other", count: 2 },
  ]);
  assert.deepEqual(
    response.body.data.activity.map((item) => item.name),
    [
      "Archive",
      "Projects",
      "newest.png",
      "report.pdf",
      "notes.txt",
      "archive.zip",
      "older.png",
      "older.pdf",
    ],
  );
  assert.equal(response.body.data.activity.length, 8);
  assert.deepEqual(response.body.data.activity[0], {
    type: "folder",
    action: "created",
    id: child.id,
    name: "Archive",
    folder: null,
    parent: { id: folder.id, name: "Projects" },
    createdAt: "2026-01-10T00:00:00.000Z",
  });
  assert.deepEqual(response.body.data.activity[1].parent, null);
  assert.deepEqual(
    response.body.data.activity.find((item) => item.name === "report.pdf")
      .folder,
    { id: child.id, name: "Archive" },
  );
  assert.equal(
    response.body.data.activity.some((item) => item.name === "private.png"),
    false,
  );
  assert.equal(
    response.body.data.activity.some((item) => item.name === "Private folder"),
    false,
  );
  assert.equal(unauthenticated.status, 401);
});

test("the drive overview hides the Other category when it is empty", async () => {
  const client = createAgent();
  const user = await registerApiUser(client, "api-drive-overview-empty");
  onTestFinished(() => cleanupUser(user));

  await createDriveFile(user.id, {
    name: "photo.png",
    mimeType: "image/png",
  });
  await createDriveFile(user.id, {
    name: "report.pdf",
    mimeType: "application/pdf",
  });
  await createDriveFile(user.id, {
    name: "notes.txt",
    mimeType: "text/plain",
  });

  const response = await client.get("/api/drive/overview");

  assert.equal(response.status, 200);
  assert.deepEqual(
    response.body.data.categories.map((category) => category.id),
    ["photos", "documents", "text"],
  );
});

test("drive category listings filter by file type and paginate", async () => {
  const client = createAgent();
  const user = await registerApiUser(client, "api-drive-categories");
  const otherClient = createAgent();
  const other = await registerApiUser(otherClient, "api-drive-categories-other");
  onTestFinished(async () => {
    await cleanupUser(other);
    await cleanupUser(user);
  });

  const folder = await createApiFolder(client, "Photos");

  for (let index = 1; index <= 25; index += 1) {
    await createDriveFile(user.id, {
      name: `photo ${String(index).padStart(2, "0")}.png`,
      mimeType: "image/png",
      createdAt: `2026-01-${String(index).padStart(2, "0")}T00:00:00.000Z`,
    });
  }

  await createDriveFile(user.id, {
    name: "report.pdf",
    mimeType: "application/pdf",
    folderId: folder.id,
  });
  await createDriveFile(user.id, {
    name: "archive.zip",
    mimeType: "application/zip",
  });
  await createDriveFile(other.id, {
    name: "private.png",
    mimeType: "image/png",
  });

  const photos = await client.get("/api/drive/categories/photos?page=2");
  const documents = await client.get("/api/drive/categories/documents");
  const otherFiles = await client.get("/api/drive/categories/other");
  const text = await client.get("/api/drive/categories/text");
  const unknown = await client.get("/api/drive/categories/videos");

  assert.equal(photos.status, 200);
  assert.deepEqual(photos.body.data.category, {
    id: "photos",
    name: "Photos",
    count: 25,
  });
  assert.equal(photos.body.data.files.length, 5);
  assert.equal(photos.body.data.files[0].name, "photo 05.png");
  assert.equal(photos.body.data.pagination.page, 2);
  assert.equal(photos.body.data.pagination.total, 25);
  assert.equal(photos.body.data.pagination.totalPages, 2);
  assert.equal(photos.body.data.pagination.hasPrevious, true);
  assert.equal(photos.body.data.pagination.hasNext, false);
  assert.equal(photos.body.data.files[0].storageKey, undefined);
  assert.equal(
    photos.body.data.files.some((file) => file.name === "private.png"),
    false,
  );
  assert.equal(documents.status, 200);
  assert.equal(documents.body.data.files.length, 1);
  assert.deepEqual(documents.body.data.files[0].folder, {
    id: folder.id,
    name: "Photos",
  });
  assert.equal(otherFiles.status, 200);
  assert.deepEqual(
    otherFiles.body.data.files.map((file) => file.name),
    ["archive.zip"],
  );
  assert.equal(text.status, 200);
  assert.deepEqual(text.body.data.files, []);
  assert.equal(text.body.data.pagination.total, 0);
  assert.equal(text.body.data.pagination.totalPages, 0);
  assert.equal(unknown.status, 404);
  assert.equal(unknown.body.error.code, "NOT_FOUND");
}, 30000);
