import { test, onTestFinished } from "vitest";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
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

const uploadsDir = join(process.cwd(), "uploads");

test("the drive API lists root folders alphabetically", async () => {
  const client = createAgent();
  const user = await registerApiUser(client, "api-folder-list");
  onTestFinished(() => cleanupUser(user));

  const beta = await createApiFolder(client, "  Beta  ");
  const alpha = await createApiFolder(client, "Alpha");
  const response = await client.get("/api/drive");

  assert.equal(beta.name, "Beta");
  assert.equal(response.status, 200);
  assert.deepEqual(
    response.body.data.folders.map((folder) => folder.name),
    ["Alpha", "Beta"],
  );
  assert.equal(response.body.data.folderPagination.total, 2);
  assert.equal(response.body.data.filePagination.total, 0);
  assert.deepEqual(response.body.data.breadcrumbs, [
    { id: null, name: "My drive" },
  ]);
  assert.equal(alpha.parentId, null);
});

test("the folder API returns nested contents and breadcrumbs", async () => {
  const client = createAgent();
  const user = await registerApiUser(client, "api-folder-nested");
  onTestFinished(() => cleanupUser(user));

  const parent = await createApiFolder(client, "Projects");
  const child = await createApiFolder(client, "Website", parent.id);
  await uploadApiFile(client, {
    folderId: child.id,
    name: "notes.txt",
    buffer: bytes.text,
    contentType: "text/plain",
  });

  const response = await client.get(`/api/folders/${child.id}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.data.folder.id, child.id);
  assert.deepEqual(
    response.body.data.breadcrumbs.map((crumb) => crumb.name),
    ["My drive", "Projects", "Website"],
  );
  assert.equal(response.body.data.files.length, 1);
  assert.equal(response.body.data.files[0].name, "notes.txt");
  assert.equal(response.body.data.files[0].previewKind, "text");
  assert.equal(response.body.data.files[0].storageKey, undefined);
  assert.equal(response.body.data.files[0].ownerId, undefined);
});

test("folder API validation and duplicate names return field errors", async () => {
  const client = createAgent();
  const user = await registerApiUser(client, "api-folder-validation");
  onTestFinished(() => cleanupUser(user));

  await createApiFolder(client, "Documents");

  const empty = await sendApi(client, "post", "/api/folders", { name: "  " });
  const long = await sendApi(client, "post", "/api/folders", {
    name: "x".repeat(101),
  });
  const duplicate = await sendApi(client, "post", "/api/folders", {
    name: "documents",
  });

  assert.equal(empty.status, 422);
  assert.match(empty.body.error.fields.name, /required/);
  assert.equal(long.status, 422);
  assert.match(long.body.error.fields.name, /100 characters/);
  assert.equal(duplicate.status, 409);
  assert.equal(duplicate.body.error.code, "CONFLICT");
});

test("folders can be renamed and moved without leaving their subtree", async () => {
  const client = createAgent();
  const user = await registerApiUser(client, "api-folder-move");
  onTestFinished(() => cleanupUser(user));

  const target = await createApiFolder(client, "Target");
  const folder = await createApiFolder(client, "Project");
  const child = await createApiFolder(client, "Child", folder.id);
  const grandchild = await createApiFolder(client, "Grandchild", child.id);

  const rename = await sendApi(
    client,
    "patch",
    `/api/folders/${folder.id}`,
    { name: "Renamed" },
  );
  const targets = await client.get(
    `/api/folders/${folder.id}/move-targets`,
  );
  const targetIds = targets.body.data.targets.map((item) => item.id);
  const move = await sendApi(client, "post", `/api/folders/${folder.id}/move`, {
    parentId: target.id,
  });
  const cycle = await sendApi(client, "post", `/api/folders/${folder.id}/move`, {
    parentId: grandchild.id,
  });

  assert.equal(rename.status, 200);
  assert.equal(rename.body.data.folder.name, "Renamed");
  assert.equal(targets.status, 200);
  assert.equal(targetIds.includes(folder.id), false);
  assert.equal(targetIds.includes(child.id), false);
  assert.equal(targetIds.includes(grandchild.id), false);
  assert.equal(move.status, 200);
  assert.equal(move.body.data.folder.parentId, target.id);
  assert.equal(cycle.status, 400);
  assert.match(cycle.body.error.message, /cannot move into itself/);
});

test("folder API rejects another user's folders", async () => {
  const ownerClient = createAgent();
  const owner = await registerApiUser(ownerClient, "api-folder-owner");
  const otherClient = createAgent();
  const other = await registerApiUser(otherClient, "api-folder-other");
  onTestFinished(() => cleanupUser(owner));
  onTestFinished(() => cleanupUser(other));

  const folder = await createApiFolder(ownerClient, "Private");

  const paths = [
    ["get", `/api/folders/${folder.id}`],
    ["get", `/api/folders/${folder.id}/move-targets`],
    ["get", `/api/folders/${folder.id}/shares`],
    ["delete", `/api/folders/${folder.id}`],
  ];

  for (const [method, path] of paths) {
    const response = await sendApi(otherClient, method, path);

    assert.equal(response.status, 404, `${method} ${path}`);
  }

  const rename = await sendApi(
    otherClient,
    "patch",
    `/api/folders/${folder.id}`,
    { name: "Stolen" },
  );
  const move = await sendApi(
    otherClient,
    "post",
    `/api/folders/${folder.id}/move`,
    { parentId: "" },
  );

  assert.equal(rename.status, 404);
  assert.equal(move.status, 404);
  assert.equal(
    (await prisma.folder.findUnique({ where: { id: folder.id } })).name,
    "Private",
  );
});

test("folder API deletes descendants, files, shares, and disk data", async () => {
  const client = createAgent();
  const user = await registerApiUser(client, "api-folder-delete");
  onTestFinished(() => cleanupUser(user));

  const parent = await createApiFolder(client, "Parent");
  const child = await createApiFolder(client, "Child", parent.id);
  await uploadApiFile(client, {
    folderId: child.id,
    name: "inside.txt",
    buffer: bytes.text,
    contentType: "text/plain",
  });
  const file = await findFile(user.id, "inside.txt");
  const link = await createApiShareLink(client, parent);
  const diskPath = join(uploadsDir, file.storageKey);

  assert.equal(existsSync(diskPath), true);

  const response = await sendApi(
    client,
    "delete",
    `/api/folders/${parent.id}`,
  );

  assert.equal(response.status, 204);
  assert.equal(
    await prisma.folder.count({
      where: { id: { in: [parent.id, child.id] } },
    }),
    0,
  );
  assert.equal(await prisma.file.count({ where: { id: file.id } }), 0);
  assert.equal(await prisma.shareLink.count({ where: { id: link.id } }), 0);
  assert.equal(existsSync(diskPath), false);
});

test("share links can be created, listed, and revoked through the API", async () => {
  const client = createAgent();
  const user = await registerApiUser(client, "api-folder-share");
  onTestFinished(() => cleanupUser(user));

  const folder = await createApiFolder(client, "Public");
  const empty = await client.get(`/api/folders/${folder.id}/shares`);
  const created = await sendApi(
    client,
    "post",
    `/api/folders/${folder.id}/shares`,
    { days: 7 },
  );
  const link = created.body.data.link;
  const listed = await client.get(`/api/folders/${folder.id}/shares`);
  const revoke = await sendApi(
    client,
    "delete",
    `/api/folders/${folder.id}/shares/${link.id}`,
  );

  assert.equal(empty.status, 200);
  assert.deepEqual(empty.body.data.links, []);
  assert.equal(created.status, 201);
  assert.match(link.token, /^[0-9a-f-]+$/);
  assert.equal(link.expired, false);
  assert.equal(listed.body.data.links[0].id, link.id);
  assert.equal(revoke.status, 204);
  assert.equal(await prisma.shareLink.count({ where: { id: link.id } }), 0);
});
