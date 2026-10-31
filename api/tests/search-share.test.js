import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

import { onTestFinished,test } from "vitest";

import prisma from "../src/lib/prisma.js";
import {
  bytes,
  cleanupUser,
  createAgent,
  createApiFolder,
  createApiShareLink,
  downloadApiSharedFile,
  findFile,
  registerApiUser,
  sendApi,
  uploadApiFile,
} from "./helpers.js";

const parseBinary = (response, callback) => {
  const chunks = [];

  response.on("data", (chunk) => chunks.push(chunk));
  response.on("end", () => callback(null, Buffer.concat(chunks)));
};

const createPrismaFile = (ownerId, { name, folderId = null }) =>
  prisma.file.create({
    data: {
      name,
      nameKey: name.toLowerCase(),
      storageProvider: "local",
      storageKey: randomUUID(),
      mimeType: "text/plain",
      size: 10,
      ownerId,
      folderId,
      folderKey: folderId ?? "root",
    },
  });

test("search API finds folders and files across the drive", async () => {
  const client = createAgent();
  const user = await registerApiUser(client, "api-search-owner");
  const other = await registerApiUser(createAgent(), "api-search-other");
  onTestFinished(async () => {
    await cleanupUser(other);
    await cleanupUser(user);
  });

  const parent = await createApiFolder(client, "Parent");
  const child = await createApiFolder(client, "Child", parent.id);
  await createApiFolder(client, "Report archive", child.id);
  await uploadApiFile(client, {
    folderId: child.id,
    name: "Quarterly Report.txt",
    buffer: bytes.text,
    contentType: "text/plain",
  });
  await createPrismaFile(user.id, { name: "report.pdf" });
  await createPrismaFile(other.id, { name: "report-private.txt" });

  const response = await client.get("/api/search?q=REPORT");

  assert.equal(response.status, 200);
  assert.equal(response.body.data.query, "REPORT");
  assert.equal(response.body.data.pagination.total, 3);
  assert.deepEqual(
    response.body.data.results.map((result) => result.name).sort(),
    ["Quarterly Report.txt", "Report archive", "report.pdf"].sort(),
  );
  assert.equal(
    response.body.data.results.some((result) => result.name === "report-private.txt"),
    false,
  );
  assert.ok(
    response.body.data.results.some((result) => result.path === "Parent / Child"),
  );
}, 30000);

test("search API paginates results and handles blank queries", async () => {
  const client = createAgent();
  const user = await registerApiUser(client, "api-search-pages");
  onTestFinished(() => cleanupUser(user));

  for (let index = 1; index <= 25; index += 1) {
    const name = `match ${String(index).padStart(2, "0")}.txt`;

    await createPrismaFile(user.id, { name });
  }

  const response = await client.get("/api/search?q=match&page=2");
  const blank = await client.get("/api/search?q=%20%20");

  assert.equal(response.status, 200);
  assert.equal(response.body.data.results.length, 5);
  assert.equal(response.body.data.pagination.page, 2);
  assert.equal(response.body.data.pagination.total, 25);
  assert.equal(response.body.data.pagination.totalPages, 2);
  assert.equal(response.body.data.pagination.hasPrevious, true);
  assert.equal(response.body.data.pagination.hasNext, false);
  assert.equal(response.body.data.results[0].name, "match 21.txt");
  assert.equal(blank.status, 200);
  assert.equal(blank.body.data.query, "");
  assert.deepEqual(blank.body.data.results, []);
});

test("public share API exposes nested content and safe binary responses", async () => {
  const client = createAgent();
  const user = await registerApiUser(client, "api-public-share");
  onTestFinished(() => cleanupUser(user));

  const ancestor = await createApiFolder(client, "Private ancestor");
  const folder = await createApiFolder(client, "Public", ancestor.id);
  const child = await createApiFolder(client, "Nested", folder.id);
  await uploadApiFile(client, {
    folderId: folder.id,
    name: "root.txt",
    buffer: bytes.text,
    contentType: "text/plain",
  });
  await uploadApiFile(client, {
    folderId: child.id,
    name: "child.txt",
    buffer: bytes.text,
    contentType: "text/plain",
  });
  const childFile = await findFile(user.id, "child.txt");
  const link = await createApiShareLink(client, folder);
  const visitor = createAgent();

  const rootPage = await visitor.get(`/api/public/shares/${link.token}`);
  const childPage = await visitor.get(
    `/api/public/shares/${link.token}/folders/${child.id}`,
  );
  const download = await downloadApiSharedFile(
    visitor,
    link.token,
    childFile.id,
  );
  const preview = await visitor
    .get(`/api/public/shares/${link.token}/files/${childFile.id}/preview`)
    .buffer(true)
    .parse(parseBinary);

  assert.equal(rootPage.status, 200);
  assert.equal(rootPage.headers["cache-control"], "no-store");
  assert.equal(rootPage.headers["referrer-policy"], "no-referrer");
  assert.equal(rootPage.headers["x-robots-tag"], "noindex, nofollow");
  assert.equal(rootPage.body.data.share.token, link.token);
  assert.equal(rootPage.body.data.folder.name, "Public");
  assert.equal(rootPage.body.data.folder.parentId, null);
  assert.deepEqual(
    rootPage.body.data.breadcrumbs.map((crumb) => crumb.name),
    ["Public"],
  );
  assert.equal(rootPage.body.data.files[0].name, "root.txt");
  assert.equal(rootPage.body.data.files[0].storageKey, undefined);
  assert.equal(rootPage.body.data.files[0].ownerId, undefined);
  assert.equal(childPage.body.data.folder.name, "Nested");
  assert.equal(childPage.body.data.folder.parentId, folder.id);
  assert.deepEqual(
    childPage.body.data.breadcrumbs.map((crumb) => crumb.name),
    ["Public", "Nested"],
  );
  assert.equal(childPage.body.data.files[0].name, "child.txt");
  assert.equal(JSON.stringify(rootPage.body).includes(ancestor.id), false);
  assert.equal(JSON.stringify(rootPage.body).includes(ancestor.name), false);
  assert.equal(JSON.stringify(childPage.body).includes(ancestor.id), false);
  assert.equal(JSON.stringify(childPage.body).includes(ancestor.name), false);
  assert.equal(preview.status, 200);
  assert.match(preview.headers["content-disposition"], /^inline;/);
  assert.equal(preview.headers["referrer-policy"], "no-referrer");
  assert.equal(preview.headers["x-robots-tag"], "noindex, nofollow");
  assert.ok(preview.body.equals(bytes.text));
  assert.equal(download.status, 200);
  assert.ok(download.body.equals(bytes.text));
  assert.equal(download.headers["referrer-policy"], "no-referrer");
  assert.equal(download.headers["x-robots-tag"], "noindex, nofollow");
});

test("expired, revoked, and out-of-scope public shares return 404", async () => {
  const client = createAgent();
  const user = await registerApiUser(client, "api-share-scope");
  onTestFinished(() => cleanupUser(user));

  const shared = await createApiFolder(client, "Shared");
  const sibling = await createApiFolder(client, "Sibling");
  await uploadApiFile(client, {
    folderId: sibling.id,
    name: "sibling.txt",
    buffer: bytes.text,
    contentType: "text/plain",
  });
  await uploadApiFile(client, {
    name: "root.txt",
    buffer: bytes.text,
    contentType: "text/plain",
  });
  const siblingFile = await findFile(user.id, "sibling.txt");
  const rootFile = await findFile(user.id, "root.txt");
  const link = await createApiShareLink(client, shared);
  const revokedLink = await createApiShareLink(client, shared);
  const visitor = createAgent();

  const siblingFolder = await visitor.get(
    `/api/public/shares/${link.token}/folders/${sibling.id}`,
  );
  const siblingDownload = await downloadApiSharedFile(
    visitor,
    link.token,
    siblingFile.id,
  );
  const rootDownload = await downloadApiSharedFile(
    visitor,
    link.token,
    rootFile.id,
  );
  const unknown = await visitor.get("/api/public/shares/not-a-token");
  const revoke = await sendApi(
    client,
    "delete",
    `/api/folders/${shared.id}/shares/${revokedLink.id}`,
  );
  const revoked = await visitor.get(`/api/public/shares/${revokedLink.token}`);

  await prisma.shareLink.update({
    where: { id: link.id },
    data: { expiresAt: new Date(Date.now() - 1000) },
  });
  const expired = await visitor.get(`/api/public/shares/${link.token}`);

  assert.equal(siblingFolder.status, 404);
  assert.equal(siblingDownload.status, 404);
  assert.equal(rootDownload.status, 404);
  assert.equal(unknown.status, 404);
  assert.equal(revoke.status, 204);
  assert.equal(revoked.status, 404);
  assert.equal(revoked.headers["cache-control"], "no-store");
  assert.equal(expired.status, 404);
  assert.match(expired.body.error.message, /Share link not found or expired/);
});

test("only the owner can list, create, or revoke share links", async () => {
  const ownerClient = createAgent();
  const owner = await registerApiUser(ownerClient, "api-share-owner");
  const otherClient = createAgent();
  const other = await registerApiUser(otherClient, "api-share-other");
  onTestFinished(() => cleanupUser(owner));
  onTestFinished(() => cleanupUser(other));

  const folder = await createApiFolder(ownerClient, "Private");
  const link = await createApiShareLink(ownerClient, folder);

  const list = await otherClient.get(`/api/folders/${folder.id}/shares`);
  const create = await sendApi(
    otherClient,
    "post",
    `/api/folders/${folder.id}/shares`,
    { days: 7 },
  );
  const revoke = await sendApi(
    otherClient,
    "delete",
    `/api/folders/${folder.id}/shares/${link.id}`,
  );

  assert.equal(list.status, 404);
  assert.equal(create.status, 404);
  assert.equal(revoke.status, 404);
  assert.equal(await prisma.shareLink.count({ where: { id: link.id } }), 1);
});
