import { randomUUID } from "node:crypto";
import { test, onTestFinished } from "vitest";
import assert from "node:assert/strict";
import prisma from "../src/lib/prisma.js";
import folderService from "../src/services/folder-service.js";
import {
  cleanupUser,
  createAgent,
  registerUser,
} from "./helpers.js";

test("root listings paginate folders and files separately", async () => {
  const client = createAgent();
  const user = await registerUser(client, "pagination-root");
  onTestFinished(() => cleanupUser(user));

  await prisma.folder.createMany({
    data: Array.from({ length: 25 }, (_, index) => ({
      name: `Folder ${String(index + 1).padStart(2, "0")}`,
      nameKey: `folder ${String(index + 1).padStart(2, "0")}`,
      ownerId: user.id,
      parentKey: "root",
    })),
  });
  await prisma.file.createMany({
    data: Array.from({ length: 25 }, (_, index) => ({
      name: `File ${String(index + 1).padStart(2, "0")}.txt`,
      nameKey: `file ${String(index + 1).padStart(2, "0")}.txt`,
      storageProvider: "local",
      storageKey: randomUUID(),
      mimeType: "text/plain",
      size: 10,
      ownerId: user.id,
      folderKey: "root",
    })),
  });

  const page = await folderService.listRoot(user.id, {
    page: 2,
    folderPage: 2,
  });

  assert.equal(page.folders.length, 5);
  assert.equal(page.files.length, 5);
  assert.equal(page.folderPagination.page, 2);
  assert.equal(page.folderPagination.total, 25);
  assert.equal(page.folderPagination.totalPages, 2);
  assert.equal(page.filePagination.page, 2);
  assert.equal(page.filePagination.total, 25);
  assert.equal(page.filePagination.totalPages, 2);
  assert.equal(page.filePagination.hasPrevious, true);
  assert.equal(page.filePagination.hasNext, false);
  assert.equal(page.breadcrumbs[0].name, "My drive");
});

test("page numbers fall back safely and clamp to the last page", async () => {
  const client = createAgent();
  const user = await registerUser(client, "pagination-clamp");
  onTestFinished(() => cleanupUser(user));

  await prisma.folder.createMany({
    data: Array.from({ length: 3 }, (_, index) => ({
      name: `Folder ${index}`,
      nameKey: `folder ${index}`,
      ownerId: user.id,
      parentKey: "root",
    })),
  });

  const invalid = await folderService.listRoot(user.id, {
    page: "not-a-number",
    folderPage: "-2",
  });
  const high = await folderService.listRoot(user.id, {
    page: 99,
    folderPage: 99,
  });

  assert.equal(invalid.folderPagination.page, 1);
  assert.equal(invalid.filePagination.page, 1);
  assert.equal(high.folderPagination.page, 1);
  assert.equal(high.filePagination.page, 1);
});

test("breadcrumbs include the root and current folder path", async () => {
  const client = createAgent();
  const user = await registerUser(client, "pagination-breadcrumbs");
  onTestFinished(() => cleanupUser(user));

  const parent = await prisma.folder.create({
    data: {
      name: "Parent",
      nameKey: "parent",
      ownerId: user.id,
      parentKey: "root",
    },
  });
  const child = await prisma.folder.create({
    data: {
      name: "Child",
      nameKey: "child",
      ownerId: user.id,
      parentId: parent.id,
      parentKey: parent.id,
    },
  });

  const breadcrumbs = await folderService.getBreadcrumbs(user.id, child);

  assert.deepEqual(
    breadcrumbs.map((crumb) => crumb.name),
    ["My drive", "Parent", "Child"],
  );
  assert.equal(breadcrumbs[0].id, null);
  assert.equal(breadcrumbs[2].id, child.id);
});
