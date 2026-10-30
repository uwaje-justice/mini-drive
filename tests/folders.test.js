import { test, onTestFinished } from "vitest";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import prisma from "../src/lib/prisma.js";
import {
  bytes,
  cleanupUser,
  createAgent,
  createFolder,
  createShareLink,
  findFolder,
  postForm,
  registerUser,
  uploadFile,
} from "./helpers.js";

const uploadsDir = join(process.cwd(), "uploads");

test("folder creation trims names and lists folders alphabetically", async () => {
  const client = createAgent();
  const user = await registerUser(client, "folder-create");
  onTestFinished(() => cleanupUser(user));

  const beta = await createFolder(client, user, "  Beta  ");
  await createFolder(client, user, "Alpha");

  const page = await client.get("/folders");

  assert.equal(beta.name, "Beta");
  assert.equal(page.status, 200);
  assert.ok(page.text.indexOf("Alpha") < page.text.indexOf("Beta"));
});

test("folder validation rejects empty and long names", async () => {
  const client = createAgent();
  const user = await registerUser(client, "folder-validation");
  onTestFinished(() => cleanupUser(user));

  const empty = await postForm(client, "/folders", { name: "   " });
  const long = await postForm(client, "/folders", { name: "x".repeat(101) });

  assert.equal(empty.status, 422);
  assert.match(empty.text, /Folder name is required/);
  assert.equal(long.status, 422);
  assert.match(long.text, /100 characters or fewer/);
});

test("duplicate folder names are rejected case-insensitively", async () => {
  const client = createAgent();
  const user = await registerUser(client, "folder-duplicate");
  onTestFinished(() => cleanupUser(user));

  await createFolder(client, user, "Documents");

  const response = await postForm(client, "/folders", {
    name: "documents",
  });

  assert.equal(response.status, 409);
  assert.match(response.text, /already exists/);
});

test("nested folders are created and displayed", async () => {
  const client = createAgent();
  const user = await registerUser(client, "folder-nested");
  onTestFinished(() => cleanupUser(user));

  const parent = await createFolder(client, user, "Projects");
  const child = await createFolder(client, user, "Website", parent.id);

  const parentPage = await client.get(`/folders/${parent.id}`);
  const childPage = await client.get(`/folders/${child.id}`);

  assert.equal(child.parentId, parent.id);
  assert.equal(parentPage.status, 200);
  assert.match(parentPage.text, /Website/);
  assert.equal(childPage.status, 200);
  assert.match(childPage.text, /Back/);
});

test("the same folder name can exist at different levels", async () => {
  const client = createAgent();
  const user = await registerUser(client, "folder-levels");
  onTestFinished(() => cleanupUser(user));

  const parent = await createFolder(client, user, "Shared");
  const rootFolder = await createFolder(client, user, "Archive");
  const childFolder = await createFolder(client, user, "Archive", parent.id);

  assert.notEqual(rootFolder.id, childFolder.id);
});

test("a folder cannot use a parent from another user", async () => {
  const ownerClient = createAgent();
  const owner = await registerUser(ownerClient, "folder-parent-owner");
  const otherClient = createAgent();
  const other = await registerUser(otherClient, "folder-parent-other");
  onTestFinished(() => cleanupUser(owner));
  onTestFinished(() => cleanupUser(other));

  const ownerFolder = await createFolder(ownerClient, owner, "Private");

  const response = await postForm(otherClient, "/folders", {
    name: "Intruder",
    parentId: ownerFolder.id,
  });

  assert.equal(response.status, 404);
  assert.equal(await findFolder(other.id, "Intruder"), null);
});

test("folders can be renamed and duplicate names are rejected", async () => {
  const client = createAgent();
  const user = await registerUser(client, "folder-rename");
  onTestFinished(() => cleanupUser(user));

  const folder = await createFolder(client, user, "Docs");
  await createFolder(client, user, "Other");

  const editPage = await client.get(`/folders/${folder.id}/edit`);
  const renamed = await postForm(client, `/folders/${folder.id}/edit`, {
    name: "Manuals",
  });
  const duplicate = await postForm(client, `/folders/${folder.id}/edit`, {
    name: "other",
  });
  const updated = await prisma.folder.findUnique({ where: { id: folder.id } });

  assert.equal(editPage.status, 200);
  assert.match(editPage.text, /Docs/);
  assert.equal(renamed.status, 302);
  assert.equal(updated.name, "Manuals");
  assert.equal(duplicate.status, 409);
  assert.match(duplicate.text, /already exists/);
});

test("folder rename validation rejects empty names", async () => {
  const client = createAgent();
  const user = await registerUser(client, "folder-rename-validation");
  onTestFinished(() => cleanupUser(user));

  const folder = await createFolder(client, user, "Docs");
  const response = await postForm(client, `/folders/${folder.id}/edit`, {
    name: "  ",
  });

  assert.equal(response.status, 422);
  assert.match(response.text, /Folder name is required/);
});

test("users cannot view, edit, or rename another user's folder", async () => {
  const ownerClient = createAgent();
  const owner = await registerUser(ownerClient, "folder-owner");
  const otherClient = createAgent();
  const other = await registerUser(otherClient, "folder-other");
  onTestFinished(() => cleanupUser(owner));
  onTestFinished(() => cleanupUser(other));

  const folder = await createFolder(ownerClient, owner, "Private");

  for (const [method, path] of [
    ["get", `/folders/${folder.id}`],
    ["get", `/folders/${folder.id}/edit`],
    ["get", `/folders/${folder.id}/share`],
  ]) {
    const response = await otherClient[method](path);

    assert.equal(response.status, 404, `${method} ${path}`);
  }

  const rename = await postForm(otherClient, `/folders/${folder.id}/edit`, {
    name: "Stolen",
  });
  const remove = await otherClient.post(`/folders/${folder.id}/delete`);

  assert.equal(rename.status, 404);
  assert.equal(remove.status, 404);
  assert.equal(
    (await prisma.folder.findUnique({ where: { id: folder.id } })).name,
    "Private",
  );
});

test("folder pages show their files and subfolders", async () => {
  const client = createAgent();
  const user = await registerUser(client, "folder-contents");
  onTestFinished(() => cleanupUser(user));

  const folder = await createFolder(client, user, "Project");
  await createFolder(client, user, "Images", folder.id);

  const upload = await uploadFile(client, {
    folderId: folder.id,
    name: "notes.txt",
    buffer: bytes.text,
    contentType: "text/plain",
  });
  const page = await client.get(`/folders/${folder.id}`);

  assert.equal(upload.status, 302);
  assert.equal(upload.headers.location, `/folders/${folder.id}`);
  assert.match(page.text, /Images/);
  assert.match(page.text, /notes\.txt/);
});

test("deleting a folder removes descendants, files, shares, and disk data", async () => {
  const client = createAgent();
  const user = await registerUser(client, "folder-delete");
  onTestFinished(() => cleanupUser(user));

  const parent = await createFolder(client, user, "Parent");
  const child = await createFolder(client, user, "Child", parent.id);
  const upload = await uploadFile(client, {
    folderId: child.id,
    name: "inside.txt",
    buffer: bytes.text,
    contentType: "text/plain",
  });
  const file = await prisma.file.findFirst({
    where: { ownerId: user.id, nameKey: "inside.txt" },
  });
  const link = await createShareLink(client, parent);
  const diskPath = join(uploadsDir, file.storageKey);

  assert.equal(upload.status, 302);
  assert.equal(existsSync(diskPath), true);

  const response = await client.post(`/folders/${parent.id}/delete`);

  assert.equal(response.status, 302);
  assert.equal(response.headers.location, "/folders");
  assert.equal(await prisma.folder.count({ where: { id: { in: [parent.id, child.id] } } }), 0);
  assert.equal(await prisma.file.count({ where: { id: file.id } }), 0);
  assert.equal(await prisma.shareLink.count({ where: { id: link.id } }), 0);
  assert.equal(existsSync(diskPath), false);
});

test("deleting a nested folder redirects to its parent", async () => {
  const client = createAgent();
  const user = await registerUser(client, "folder-delete-nested");
  onTestFinished(() => cleanupUser(user));

  const parent = await createFolder(client, user, "Parent");
  const child = await createFolder(client, user, "Child", parent.id);

  const response = await client.post(`/folders/${child.id}/delete`);

  assert.equal(response.status, 302);
  assert.equal(response.headers.location, `/folders/${parent.id}`);
});
