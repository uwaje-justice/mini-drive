import { test, onTestFinished } from "vitest";
import assert from "node:assert/strict";
import prisma from "../src/lib/prisma.js";
import {
  bytes,
  cleanupUser,
  createAgent,
  createFolder,
  createShareLink,
  downloadSharedFile,
  findFile,
  postForm,
  registerUser,
  uploadFile,
} from "./helpers.js";

const dayInMs = 24 * 60 * 60 * 1000;

test("share pages create links with an expiry", async () => {
  const client = createAgent();
  const user = await registerUser(client, "share-create");
  onTestFinished(() => cleanupUser(user));

  const folder = await createFolder(client, user, "Public");
  const emptyPage = await client.get(`/folders/${folder.id}/share`);

  assert.equal(emptyPage.status, 200);
  assert.match(emptyPage.text, /No links yet/);

  const response = await postForm(client, `/folders/${folder.id}/share`, {
    days: 7,
  });
  const link = await prisma.shareLink.findFirst({
    where: { folderId: folder.id },
  });
  const page = await client.get(`/folders/${folder.id}/share`);
  const remaining = link.expiresAt.getTime() - Date.now();

  assert.equal(response.status, 302);
  assert.equal(response.headers.location, `/folders/${folder.id}/share`);
  assert.ok(remaining > 6.9 * dayInMs);
  assert.ok(remaining <= 7 * dayInMs + 5000);
  assert.match(page.text, new RegExp(`/share/${link.token}`));
  assert.match(page.text, /Expires/);
});

test("share duration must be from 1 to 365 days", async () => {
  const client = createAgent();
  const user = await registerUser(client, "share-validation");
  onTestFinished(() => cleanupUser(user));

  const folder = await createFolder(client, user, "Public");
  const empty = await postForm(client, `/folders/${folder.id}/share`, {});
  const zero = await postForm(client, `/folders/${folder.id}/share`, {
    days: 0,
  });
  const tooLong = await postForm(client, `/folders/${folder.id}/share`, {
    days: 366,
  });

  assert.equal(empty.status, 422);
  assert.match(empty.text, /Choose how many days/);
  assert.equal(zero.status, 422);
  assert.match(zero.text, /1 to 365/);
  assert.equal(tooLong.status, 422);
  assert.match(tooLong.text, /1 to 365/);
  assert.equal(
    await prisma.shareLink.count({ where: { folderId: folder.id } }),
    0,
  );
});

test("share links can be revoked", async () => {
  const client = createAgent();
  const user = await registerUser(client, "share-revoke");
  onTestFinished(() => cleanupUser(user));

  const folder = await createFolder(client, user, "Public");
  const link = await createShareLink(client, folder);

  const response = await client.post(
    `/folders/${folder.id}/share/${link.id}/revoke`,
  );
  const publicPage = await createAgent().get(`/share/${link.token}`);

  assert.equal(response.status, 302);
  assert.equal(response.headers.location, `/folders/${folder.id}/share`);
  assert.equal(await prisma.shareLink.count({ where: { id: link.id } }), 0);
  assert.equal(publicPage.status, 404);
  assert.match(publicPage.text, /Share link not found or expired/);
});

test("shared folders show nested content and allow downloads", async () => {
  const client = createAgent();
  const user = await registerUser(client, "share-public");
  onTestFinished(() => cleanupUser(user));

  const folder = await createFolder(client, user, "Public");
  const child = await createFolder(client, user, "Nested", folder.id);
  await uploadFile(client, {
    folderId: folder.id,
    name: "root.txt",
    buffer: bytes.text,
    contentType: "text/plain",
  });
  await uploadFile(client, {
    folderId: child.id,
    name: "child.txt",
    buffer: bytes.text,
    contentType: "text/plain",
  });
  const childFile = await findFile(user.id, "child.txt");
  const link = await createShareLink(client, folder);
  const visitor = createAgent();

  const rootPage = await visitor.get(`/share/${link.token}`);
  const childPage = await visitor.get(
    `/share/${link.token}/folders/${child.id}`,
  );
  const download = await downloadSharedFile(
    visitor,
    link.token,
    childFile.id,
  );

  assert.equal(rootPage.status, 200);
  assert.match(rootPage.text, /Public/);
  assert.match(rootPage.text, /root\.txt/);
  assert.match(rootPage.text, /Nested/);
  assert.equal(childPage.status, 200);
  assert.match(childPage.text, /child\.txt/);
  assert.match(childPage.text, /Back/);
  assert.equal(download.status, 200);
  assert.ok(download.body.equals(bytes.text));
  assert.equal(download.headers["cache-control"], "no-store");
  assert.equal(download.headers["referrer-policy"], "no-referrer");
  assert.equal(download.headers["x-robots-tag"], "noindex, nofollow");
  assert.equal(download.headers["x-content-type-options"], "nosniff");
});

test("expired and unknown share tokens return 404", async () => {
  const client = createAgent();
  const user = await registerUser(client, "share-expired");
  onTestFinished(() => cleanupUser(user));

  const folder = await createFolder(client, user, "Public");
  const link = await createShareLink(client, folder);

  await prisma.shareLink.update({
    where: { id: link.id },
    data: { expiresAt: new Date(Date.now() - 1000) },
  });

  const unknown = await createAgent().get("/share/not-a-real-token");
  const expired = await createAgent().get(`/share/${link.token}`);

  assert.equal(unknown.status, 404);
  assert.equal(expired.status, 404);
  assert.match(unknown.text, /Share link not found or expired/);
  assert.match(expired.text, /Share link not found or expired/);
});

test("share links cannot reach sibling folders or root files", async () => {
  const client = createAgent();
  const user = await registerUser(client, "share-scope");
  onTestFinished(() => cleanupUser(user));

  const shared = await createFolder(client, user, "Shared");
  const sibling = await createFolder(client, user, "Sibling");
  await uploadFile(client, {
    folderId: sibling.id,
    name: "sibling.txt",
    buffer: bytes.text,
    contentType: "text/plain",
  });
  await uploadFile(client, {
    name: "root.txt",
    buffer: bytes.text,
    contentType: "text/plain",
  });
  const siblingFile = await findFile(user.id, "sibling.txt");
  const rootFile = await findFile(user.id, "root.txt");
  const link = await createShareLink(client, shared);
  const visitor = createAgent();

  const siblingFolder = await visitor.get(
    `/share/${link.token}/folders/${sibling.id}`,
  );
  const siblingDownload = await downloadSharedFile(
    visitor,
    link.token,
    siblingFile.id,
  );
  const rootDownload = await downloadSharedFile(
    visitor,
    link.token,
    rootFile.id,
  );
  const rootPage = await visitor.get(`/share/${link.token}`);

  assert.equal(siblingFolder.status, 404);
  assert.equal(siblingDownload.status, 404);
  assert.equal(rootDownload.status, 404);
  assert.doesNotMatch(rootPage.text, /sibling\.txt/);
  assert.doesNotMatch(rootPage.text, /root\.txt/);
});

test("only the owner can create or revoke a folder share", async () => {
  const ownerClient = createAgent();
  const owner = await registerUser(ownerClient, "share-owner");
  const otherClient = createAgent();
  const other = await registerUser(otherClient, "share-other");
  onTestFinished(() => cleanupUser(owner));
  onTestFinished(() => cleanupUser(other));

  const folder = await createFolder(ownerClient, owner, "Private");
  const link = await createShareLink(ownerClient, folder);

  const create = await postForm(
    otherClient,
    `/folders/${folder.id}/share`,
    { days: 7 },
  );
  const revoke = await otherClient.post(
    `/folders/${folder.id}/share/${link.id}/revoke`,
  );

  assert.equal(create.status, 404);
  assert.equal(revoke.status, 404);
  assert.equal(await prisma.shareLink.count({ where: { id: link.id } }), 1);
});
