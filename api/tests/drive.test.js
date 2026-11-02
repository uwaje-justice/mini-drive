import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

import { onTestFinished, test } from "vitest";

import prisma from "../src/lib/prisma.js";
import {
  bytes,
  cleanupUser,
  createAgent,
  createApiFolder,
  createApiShareLink,
  findFile,
  registerApiUser,
  sendApi,
  uploadApiFile,
} from "./helpers.js";

const createDriveFile = async (
  ownerId,
  {
    name,
    mimeType,
    folderId = null,
    createdAt = "2026-01-01T00:00:00.000Z",
  },
) => {
  const folder = folderId
    ? await prisma.folder.findUnique({
        where: { id: folderId },
        select: { name: true },
      })
    : null;
  const date = new Date(createdAt);
  const file = await prisma.file.create({
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
      createdAt: date,
    },
  });

  await prisma.activity.create({
    data: {
      ownerId,
      action: "uploaded",
      targetType: "file",
      targetId: file.id,
      targetName: file.name,
      locationName: folder?.name ?? null,
      createdAt: date,
    },
  });

  return file;
};

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
  await prisma.$transaction([
    prisma.folder.update({
      where: { id: folder.id },
      data: { createdAt: new Date("2026-01-09T00:00:00.000Z") },
    }),
    prisma.activity.updateMany({
      where: { targetType: "folder", targetId: folder.id },
      data: { createdAt: new Date("2026-01-09T00:00:00.000Z") },
    }),
    prisma.folder.update({
      where: { id: child.id },
      data: { createdAt: new Date("2026-01-10T00:00:00.000Z") },
    }),
    prisma.activity.updateMany({
      where: { targetType: "folder", targetId: child.id },
      data: { createdAt: new Date("2026-01-10T00:00:00.000Z") },
    }),
  ]);

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
    { id: "documents", name: "Documents", count: 4 },
    { id: "other", name: "Other", count: 2 },
  ]);
  assert.deepEqual(
    response.body.data.activity.map((item) => item.targetName),
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
  assert.deepEqual(
    {
      action: response.body.data.activity[0].action,
      targetType: response.body.data.activity[0].targetType,
      targetId: response.body.data.activity[0].targetId,
      targetName: response.body.data.activity[0].targetName,
      locationName: response.body.data.activity[0].locationName,
      available: response.body.data.activity[0].available,
      createdAt: response.body.data.activity[0].createdAt,
    },
    {
      action: "created",
      targetType: "folder",
      targetId: child.id,
      targetName: "Archive",
      locationName: "Projects",
      available: true,
      createdAt: "2026-01-10T00:00:00.000Z",
    },
  );
  assert.equal(response.body.data.activity[1].locationName, null);
  assert.equal(
    response.body.data.activity.find(
      (item) => item.targetName === "report.pdf",
    ).locationName,
    "Archive",
  );
  assert.equal(
    response.body.data.activity.some(
      (item) => item.targetName === "private.png",
    ),
    false,
  );
  assert.equal(
    response.body.data.activity.some(
      (item) => item.targetName === "Private folder",
    ),
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
    ["photos", "documents"],
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
    name: "notes.txt",
    mimeType: "text/plain",
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
  const removedText = await client.get("/api/drive/categories/text");
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
  assert.equal(documents.body.data.category.count, 2);
  assert.deepEqual(
    documents.body.data.files.map((file) => file.name).sort(),
    ["notes.txt", "report.pdf"],
  );
  assert.deepEqual(
    documents.body.data.files.find((file) => file.name === "report.pdf").folder,
    {
      id: folder.id,
      name: "Photos",
    },
  );
  assert.equal(otherFiles.status, 200);
  assert.deepEqual(
    otherFiles.body.data.files.map((file) => file.name),
    ["archive.zip"],
  );
  assert.equal(removedText.status, 404);
  assert.equal(removedText.body.error.code, "NOT_FOUND");
  assert.equal(unknown.status, 404);
  assert.equal(unknown.body.error.code, "NOT_FOUND");
}, 30000);


test("activity API records changes and keeps deleted targets", async () => {
  const client = createAgent();
  const user = await registerApiUser(client, "api-activity");
  onTestFinished(() => cleanupUser(user));

  const folder = await createApiFolder(client, "Reports");
  await uploadApiFile(client, {
    folderId: folder.id,
    name: "draft.txt",
    buffer: bytes.text,
    contentType: "text/plain",
  });
  const file = await findFile(user.id, "draft.txt");
  const renamed = await sendApi(client, "patch", `/api/files/${file.id}`, {
    name: "final.txt",
  });
  const moved = await sendApi(client, "post", `/api/files/${file.id}/move`, {
    folderId: null,
  });
  const link = await createApiShareLink(client, folder);
  const revoked = await sendApi(
    client,
    "delete",
    `/api/folders/${folder.id}/shares/${link.id}`,
  );
  const deletedFile = await sendApi(client, "delete", `/api/files/${file.id}`);
  const deletedFolder = await sendApi(
    client,
    "delete",
    `/api/folders/${folder.id}`,
  );
  const response = await client.get("/api/drive/activity");
  const unauthenticated = await createAgent().get("/api/drive/activity");

  assert.equal(renamed.status, 200);
  assert.equal(moved.status, 200);
  assert.equal(revoked.status, 204);
  assert.equal(deletedFile.status, 204);
  assert.equal(deletedFolder.status, 204);
  assert.equal(response.status, 200);
  assert.equal(response.headers["cache-control"], "no-store");
  assert.equal(response.body.data.pagination.total, 8);

  const activity = response.body.data.activity;
  const created = activity.find((item) => item.action === "created");
  const uploaded = activity.find((item) => item.action === "uploaded");
  const rename = activity.find((item) => item.action === "renamed");
  const move = activity.find((item) => item.action === "moved");
  const shared = activity.find((item) => item.action === "shared");
  const unshared = activity.find((item) => item.action === "unshared");
  const fileDelete = activity.find(
    (item) => item.action === "deleted" && item.targetType === "file",
  );
  const folderDelete = activity.find(
    (item) => item.action === "deleted" && item.targetType === "folder",
  );

  assert.equal(created.targetName, "Reports");
  assert.equal(created.available, false);
  assert.equal(uploaded.targetName, "draft.txt");
  assert.equal(uploaded.locationName, "Reports");
  assert.equal(rename.targetName, "final.txt");
  assert.equal(rename.previousName, "draft.txt");
  assert.equal(move.fromLocationName, "Reports");
  assert.equal(move.toLocationName, null);
  assert.equal(shared.targetName, "Reports");
  assert.equal(unshared.targetName, "Reports");
  assert.equal(fileDelete.targetName, "final.txt");
  assert.equal(fileDelete.targetId, file.id);
  assert.equal(fileDelete.available, false);
  assert.equal(folderDelete.targetName, "Reports");
  assert.equal(folderDelete.targetId, folder.id);
  assert.equal(folderDelete.available, false);
  assert.equal(unauthenticated.status, 401);
});

test("activity API filters by text, action, and target type", async () => {
  const client = createAgent();
  const user = await registerApiUser(client, "api-activity-filters");
  onTestFinished(() => cleanupUser(user));

  const uploads = Array.from({ length: 22 }, (_, index) => ({
    ownerId: user.id,
    action: "uploaded",
    targetType: "file",
    targetId: null,
    targetName: `Report ${String(index + 1).padStart(2, "0")}.pdf`,
    previousName: index === 0 ? "Old Draft" : null,
    locationName: "Projects",
    createdAt: new Date(
      `2026-03-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`,
    ),
  }));
  const folders = [
    {
      ownerId: user.id,
      action: "created",
      targetType: "folder",
      targetId: null,
      targetName: "Archive",
      locationName: "Projects",
      createdAt: new Date("2026-03-23T00:00:00.000Z"),
    },
    {
      ownerId: user.id,
      action: "created",
      targetType: "folder",
      targetId: null,
      targetName: "Invoices",
      locationName: null,
      createdAt: new Date("2026-03-24T00:00:00.000Z"),
    },
  ];
  const account = {
    ownerId: user.id,
    action: "email_changed",
    targetType: "account",
    targetId: user.id,
    targetName: "Account",
    previousEmail: "old@example.com",
    nextEmail: "new@example.com",
    createdAt: new Date("2026-03-25T00:00:00.000Z"),
  };
  await prisma.activity.createMany({
    data: [...uploads, ...folders, account],
  });

  const byText = await client.get("/api/drive/activity?q=REPORT");
  const byPreviousName = await client.get("/api/drive/activity?q=draft");
  const byLocation = await client.get("/api/drive/activity?q=projects");
  const byAction = await client.get("/api/drive/activity?action=created");
  const byType = await client.get("/api/drive/activity?targetType=account");
  const combined = await client.get(
    "/api/drive/activity?q=projects&action=uploaded",
  );
  const secondPage = await client.get("/api/drive/activity?q=report&page=2");
  const unknownAction = await client.get(
    "/api/drive/activity?action=something-else",
  );

  assert.equal(byText.status, 200);
  assert.equal(byText.body.data.pagination.total, 22);
  assert.equal(byText.body.data.activity.length, 20);
  assert.equal(byText.body.data.pagination.totalPages, 2);
  assert.equal(byPreviousName.body.data.pagination.total, 1);
  assert.equal(
    byPreviousName.body.data.activity[0].previousName,
    "Old Draft",
  );
  assert.equal(byLocation.body.data.pagination.total, 23);
  assert.equal(byAction.body.data.pagination.total, 2);
  assert.deepEqual(
    byAction.body.data.activity.map((item) => item.targetName).sort(),
    ["Archive", "Invoices"],
  );
  assert.equal(byType.body.data.pagination.total, 1);
  assert.equal(byType.body.data.activity[0].action, "email_changed");
  assert.equal(byType.body.data.activity[0].targetId, null);
  assert.equal(combined.body.data.pagination.total, 22);
  assert.equal(secondPage.body.data.activity.length, 2);
  assert.equal(secondPage.body.data.pagination.page, 2);
  assert.equal(unknownAction.body.data.pagination.total, 25);
});

test("activity API clears one event or all events for the owner", async () => {
  const client = createAgent();
  const user = await registerApiUser(client, "api-activity-clear");
  const otherClient = createAgent();
  const other = await registerApiUser(otherClient, "api-activity-clear-other");
  onTestFinished(async () => {
    await cleanupUser(other);
    await cleanupUser(user);
  });

  const userEvent = await prisma.activity.create({
    data: {
      ownerId: user.id,
      action: "uploaded",
      targetType: "file",
      targetId: null,
      targetName: "mine.txt",
    },
  });
  const otherEvent = await prisma.activity.create({
    data: {
      ownerId: other.id,
      action: "uploaded",
      targetType: "file",
      targetId: null,
      targetName: "theirs.txt",
    },
  });

  const unauthenticated = await sendApi(
    createAgent(),
    "delete",
    "/api/drive/activity",
  );
  const notOwned = await sendApi(
    client,
    "delete",
    `/api/drive/activity/${otherEvent.id}`,
  );
  const removed = await sendApi(
    client,
    "delete",
    `/api/drive/activity/${userEvent.id}`,
  );
  const afterRemove = await client.get("/api/drive/activity");
  const otherActivity = await otherClient.get("/api/drive/activity");

  assert.equal(unauthenticated.status, 401);
  assert.equal(notOwned.status, 404);
  assert.equal(notOwned.body.error.code, "NOT_FOUND");
  assert.equal(removed.status, 204);
  assert.equal(afterRemove.body.data.pagination.total, 0);
  assert.equal(otherActivity.body.data.pagination.total, 1);

  await prisma.activity.createMany({
    data: Array.from({ length: 3 }, (_, index) => ({
      ownerId: user.id,
      action: "password_changed",
      targetType: "account",
      targetId: user.id,
      targetName: "Account",
      createdAt: new Date(`2026-04-0${index + 1}T00:00:00.000Z`),
    })),
  });

  const cleared = await sendApi(client, "delete", "/api/drive/activity");
  const empty = await client.get("/api/drive/activity");
  const overview = await client.get("/api/drive/overview");
  const remaining = await prisma.activity.count({
    where: { ownerId: user.id },
  });

  assert.equal(cleared.status, 204);
  assert.equal(empty.body.data.pagination.total, 0);
  assert.equal(empty.body.data.activity.length, 0);
  assert.equal(overview.body.data.activity.length, 0);
  assert.equal(remaining, 0);
});

test("activity API paginates twenty events at a time", async () => {
  const client = createAgent();
  const user = await registerApiUser(client, "api-activity-pages");
  onTestFinished(() => cleanupUser(user));

  const events = Array.from({ length: 25 }, (_, index) => ({
    ownerId: user.id,
    action: "password_changed",
    targetType: "account",
    targetId: user.id,
    targetName: "Account",
    createdAt: new Date(`2026-02-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`),
  }));
  await prisma.activity.createMany({ data: events });

  const first = await client.get("/api/drive/activity");
  const second = await client.get("/api/drive/activity?page=2");

  assert.equal(first.status, 200);
  assert.equal(first.body.data.activity.length, 20);
  assert.equal(first.body.data.pagination.total, 25);
  assert.equal(first.body.data.pagination.totalPages, 2);
  assert.equal(first.body.data.pagination.hasNext, true);
  assert.equal(second.body.data.activity.length, 5);
  assert.equal(second.body.data.pagination.page, 2);
  assert.equal(second.body.data.pagination.hasPrevious, true);
  assert.equal(
    second.body.data.activity.every((item) => item.available === false),
    true,
  );
});
