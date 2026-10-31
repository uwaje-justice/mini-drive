import { test, onTestFinished } from "vitest";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readdir, unlink } from "node:fs/promises";
import { join } from "node:path";
import prisma from "../src/lib/prisma.js";
import {
  bytes,
  cleanupUser,
  createAgent,
  createFolder,
  downloadFile,
  findFile,
  postForm,
  registerUser,
  uploadFile,
  uploadFiles,
} from "./helpers.js";

const uploadsDir = join(process.cwd(), "uploads");

const countUploads = async () => (await readdir(uploadsDir)).length;

test("all supported file types are detected, stored, and downloaded", async () => {
  const client = createAgent();
  const user = await registerUser(client, "files-types");
  onTestFinished(() => cleanupUser(user));

  const cases = [
    { name: "image.png", buffer: bytes.png, mimeType: "image/png" },
    { name: "photo.jpg", buffer: bytes.jpeg, mimeType: "image/jpeg" },
    { name: "animation.gif", buffer: bytes.gif, mimeType: "image/gif" },
    { name: "picture.webp", buffer: bytes.webp, mimeType: "image/webp" },
    { name: "document.pdf", buffer: bytes.pdf, mimeType: "application/pdf" },
    {
      name: "notes.txt",
      buffer: bytes.text,
      mimeType: "text/plain",
      sentType: "image/png",
    },
  ];

  for (const item of cases) {
    const upload = await uploadFile(client, {
      name: item.name,
      buffer: item.buffer,
      contentType: item.sentType ?? item.mimeType,
    });
    const file = await findFile(user.id, item.name);

    assert.equal(upload.status, 302, item.name);
    assert.equal(upload.headers.location, "/folders");
    assert.ok(file, item.name);
    assert.equal(file.mimeType, item.mimeType, item.name);
    assert.equal(file.size, item.buffer.length, item.name);
    assert.equal(file.storageProvider, "local", item.name);
    assert.equal(existsSync(join(uploadsDir, file.storageKey)), true, item.name);

    const download = await downloadFile(client, file.id);

    assert.equal(download.status, 200, item.name);
    assert.equal(
      download.headers["content-type"].split(";")[0],
      item.mimeType,
      item.name,
    );
    assert.equal(download.headers["cache-control"], "no-store", item.name);
    assert.equal(
      download.headers["x-content-type-options"],
      "nosniff",
      item.name,
    );
    assert.match(
      download.headers["content-disposition"],
      /^attachment;/,
      item.name,
    );
    assert.ok(Buffer.isBuffer(download.body), item.name);
    assert.ok(download.body.equals(item.buffer), item.name);
  }
});

test("file details show metadata, folder, and actions", async () => {
  const client = createAgent();
  const user = await registerUser(client, "files-details");
  onTestFinished(() => cleanupUser(user));

  const folder = await createFolder(client, user, "Reports");
  await uploadFile(client, {
    folderId: folder.id,
    name: "report.pdf",
    buffer: bytes.pdf,
    contentType: "application/pdf",
  });
  const file = await findFile(user.id, "report.pdf");
  const page = await client.get(`/files/${file.id}`);

  assert.equal(page.status, 200);
  assert.match(page.text, /report\.pdf/);
  assert.match(page.text, new RegExp(file.createdAt.toUTCString()));
  assert.match(page.text, /application\/pdf/);
  assert.match(page.text, /Reports/);
  assert.match(page.text, new RegExp(`/files/${file.id}/download`));
  assert.match(page.text, new RegExp(`/files/${file.id}/delete`));
});

test("previewable files render inline with a safe preview header", async () => {
  const client = createAgent();
  const user = await registerUser(client, "files-preview");
  onTestFinished(() => cleanupUser(user));

  const cases = [
    { name: "preview.png", buffer: bytes.png, mimeType: "image/png" },
    { name: "preview.pdf", buffer: bytes.pdf, mimeType: "application/pdf" },
    { name: "preview.txt", buffer: bytes.text, mimeType: "text/plain" },
  ];

  for (const item of cases) {
    await uploadFile(client, {
      name: item.name,
      buffer: item.buffer,
      contentType: item.mimeType,
    });
    const file = await findFile(user.id, item.name);
    const preview = await client.get(`/files/${file.id}/preview`);

    assert.equal(preview.status, 200, item.name);
    assert.equal(
      preview.headers["content-type"].split(";")[0],
      item.mimeType,
      item.name,
    );
    assert.match(
      preview.headers["content-disposition"],
      /^inline;/,
      item.name,
    );
    assert.equal(
      preview.headers["content-security-policy"],
      "default-src 'none'; sandbox",
      item.name,
    );
    assert.equal(preview.headers["cache-control"], "no-store", item.name);
    const previewBody = Buffer.isBuffer(preview.body)
      ? preview.body
      : Buffer.from(preview.text, "utf8");
    assert.ok(previewBody.equals(item.buffer), item.name);
  }

  const image = await findFile(user.id, "preview.png");
  const pdf = await findFile(user.id, "preview.pdf");
  const page = await client.get(`/files/${image.id}`);
  const pdfPage = await client.get(`/files/${pdf.id}`);

  assert.match(page.text, new RegExp(`<img src="/files/${image.id}/preview"`));
  assert.match(pdfPage.text, new RegExp(`<iframe src="/files/${pdf.id}/preview"`));
});

test("other users cannot preview a file", async () => {
  const ownerClient = createAgent();
  const owner = await registerUser(ownerClient, "preview-owner");
  const otherClient = createAgent();
  const other = await registerUser(otherClient, "preview-other");
  onTestFinished(() => cleanupUser(owner));
  onTestFinished(() => cleanupUser(other));

  await uploadFile(ownerClient, {
    name: "private.png",
    buffer: bytes.png,
    contentType: "image/png",
  });
  const file = await findFile(owner.id, "private.png");
  const preview = await otherClient.get(`/files/${file.id}/preview`);

  assert.equal(preview.status, 404);
});

test("upload validation handles missing, empty, oversized, and unsupported files", async () => {
  const client = createAgent();
  const user = await registerUser(client, "files-validation");
  onTestFinished(() => cleanupUser(user));

  const before = await countUploads();

  const missing = await postForm(client, "/files/upload");
  const empty = await uploadFile(client, {
    name: "empty.txt",
    buffer: bytes.empty,
    contentType: "text/plain",
  });
  const oversized = await uploadFile(client, {
    name: "large.png",
    buffer: bytes.oversize,
    contentType: "image/png",
  });
  const unsupported = await uploadFile(client, {
    name: "unknown.bin",
    buffer: bytes.binary,
    contentType: "application/octet-stream",
  });

  assert.equal(missing.status, 400);
  assert.match(missing.text, /Choose a file/);
  assert.equal(empty.status, 400);
  assert.match(empty.text, /File is empty/);
  assert.equal(oversized.status, 413);
  assert.match(oversized.text, /5 MB or smaller/);
  assert.equal(unsupported.status, 415);
  assert.match(unsupported.text, /PNG, JPEG, WebP, GIF, PDF, or plain text/);
  assert.equal(await prisma.file.count({ where: { ownerId: user.id } }), 0);
  assert.equal(await countUploads(), before);
});

test("multi-upload stores valid files and reports skipped ones", async () => {
  const client = createAgent();
  const user = await registerUser(client, "files-multi");
  onTestFinished(() => cleanupUser(user));

  await uploadFile(client, {
    name: "taken.txt",
    buffer: bytes.text,
    contentType: "text/plain",
  });

  const response = await uploadFiles(client, {
    files: [
      { name: "first.txt", buffer: bytes.text, contentType: "text/plain" },
      { name: "second.png", buffer: bytes.png, contentType: "image/png" },
      { name: "taken.txt", buffer: bytes.text, contentType: "text/plain" },
      { name: "empty.txt", buffer: bytes.empty, contentType: "text/plain" },
      { name: "bad.bin", buffer: bytes.binary, contentType: "application/octet-stream" },
    ],
  });

  assert.equal(response.status, 400);
  assert.match(response.text, /taken\.txt: A file with this name already exists/);
  assert.match(response.text, /empty\.txt: File is empty/);
  assert.match(response.text, /bad\.bin: Use a PNG/);
  assert.equal(await prisma.file.count({ where: { ownerId: user.id } }), 3);
  assert.ok(await findFile(user.id, "first.txt"));
  assert.ok(await findFile(user.id, "second.png"));
});

test("multi-upload rejects oversized batches and more than ten files", async () => {
  const client = createAgent();
  const user = await registerUser(client, "files-multi-limits");
  onTestFinished(() => cleanupUser(user));

  const before = await countUploads();
  const oversized = await uploadFiles(client, {
    files: [
      { name: "small.txt", buffer: bytes.text, contentType: "text/plain" },
      { name: "large.png", buffer: bytes.oversize, contentType: "image/png" },
    ],
  });
  const tooMany = await uploadFiles(client, {
    files: Array.from({ length: 11 }, (_, index) => ({
      name: `file-${index}.txt`,
      buffer: bytes.text,
      contentType: "text/plain",
    })),
  });

  assert.equal(oversized.status, 413);
  assert.match(oversized.text, /5 MB or smaller/);
  assert.equal(tooMany.status, 400);
  assert.match(tooMany.text, /up to 10 files/);
  assert.equal(await prisma.file.count({ where: { ownerId: user.id } }), 0);
  assert.equal(await countUploads(), before);
});

test("upload rejects missing folders, foreign folders, and long names", async () => {
  const ownerClient = createAgent();
  const owner = await registerUser(ownerClient, "files-folder-owner");
  const client = createAgent();
  const user = await registerUser(client, "files-folder-other");
  onTestFinished(() => cleanupUser(owner));
  onTestFinished(() => cleanupUser(user));
  const ownerFolder = await createFolder(ownerClient, owner, "Private");
  const before = await countUploads();

  const missingFolder = await uploadFile(client, {
    folderId: "missing-folder",
    name: "file.txt",
    buffer: bytes.text,
    contentType: "text/plain",
  });
  const foreignFolder = await uploadFile(client, {
    folderId: ownerFolder.id,
    name: "file.txt",
    buffer: bytes.text,
    contentType: "text/plain",
  });
  const longName = await uploadFile(client, {
    name: `${"x".repeat(256)}.txt`,
    buffer: bytes.text,
    contentType: "text/plain",
  });

  assert.equal(missingFolder.status, 404);
  assert.equal(foreignFolder.status, 404);
  assert.equal(longName.status, 400);
  assert.match(longName.text, /255 characters or fewer/);
  assert.equal(await prisma.file.count({ where: { ownerId: user.id } }), 0);
  assert.equal(await countUploads(), before);
});

test("duplicate file names are rejected without leaving disk files", async () => {
  const client = createAgent();
  const user = await registerUser(client, "files-duplicate");
  onTestFinished(() => cleanupUser(user));

  await uploadFile(client, {
    name: "Photo.PNG",
    buffer: bytes.png,
    contentType: "image/png",
  });
  const before = await countUploads();
  const duplicate = await uploadFile(client, {
    name: "photo.png",
    buffer: bytes.png,
    contentType: "image/png",
  });

  assert.equal(duplicate.status, 409);
  assert.match(duplicate.text, /already exists/);
  assert.equal(await prisma.file.count({ where: { ownerId: user.id } }), 1);
  assert.equal(await countUploads(), before);
});

test("the same file name can exist in different folders", async () => {
  const client = createAgent();
  const user = await registerUser(client, "files-folders");
  onTestFinished(() => cleanupUser(user));

  const firstFolder = await createFolder(client, user, "One");
  const secondFolder = await createFolder(client, user, "Two");

  await uploadFile(client, {
    folderId: firstFolder.id,
    name: "same.txt",
    buffer: bytes.text,
    contentType: "text/plain",
  });
  await uploadFile(client, {
    folderId: secondFolder.id,
    name: "same.txt",
    buffer: bytes.text,
    contentType: "text/plain",
  });

  assert.equal(await prisma.file.count({ where: { ownerId: user.id } }), 2);
});

test("files can be renamed and moved without touching disk data", async () => {
  const client = createAgent();
  const user = await registerUser(client, "files-edit");
  onTestFinished(() => cleanupUser(user));

  await uploadFile(client, {
    name: "draft.txt",
    buffer: bytes.text,
    contentType: "text/plain",
  });
  const file = await findFile(user.id, "draft.txt");
  const storageKey = file.storageKey;
  const folder = await createFolder(client, user, "Archive");

  const editPage = await client.get(`/files/${file.id}/edit`);
  const renamed = await postForm(client, `/files/${file.id}/edit`, {
    name: "final.txt",
    folderId: "",
  });
  const moved = await postForm(client, `/files/${file.id}/move`, {
    folderId: folder.id,
  });
  const saved = await prisma.file.findUnique({ where: { id: file.id } });

  assert.equal(editPage.status, 200);
  assert.match(editPage.text, /Archive/);
  assert.equal(renamed.status, 302);
  assert.equal(renamed.headers.location, `/files/${file.id}`);
  assert.equal(moved.status, 302);
  assert.equal(moved.headers.location, `/folders/${folder.id}`);
  assert.equal(saved.name, "final.txt");
  assert.equal(saved.nameKey, "final.txt");
  assert.equal(saved.folderId, folder.id);
  assert.equal(saved.folderKey, folder.id);
  assert.equal(saved.storageKey, storageKey);
  assert.equal(existsSync(join(uploadsDir, storageKey)), true);

  const rootMove = await postForm(client, `/files/${file.id}/move`, {
    folderId: "",
  });

  assert.equal(rootMove.status, 302);
  assert.equal(rootMove.headers.location, "/folders");
});

test("file rename and move conflicts leave the file unchanged", async () => {
  const client = createAgent();
  const user = await registerUser(client, "files-edit-conflict");
  onTestFinished(() => cleanupUser(user));

  await uploadFile(client, {
    name: "one.txt",
    buffer: bytes.text,
    contentType: "text/plain",
  });
  await uploadFile(client, {
    name: "two.txt",
    buffer: bytes.text,
    contentType: "text/plain",
  });
  const file = await findFile(user.id, "one.txt");
  const folder = await createFolder(client, user, "Target");
  await uploadFile(client, {
    folderId: folder.id,
    name: "one.txt",
    buffer: bytes.text,
    contentType: "text/plain",
  });

  const rename = await postForm(client, `/files/${file.id}/edit`, {
    name: "two.txt",
  });
  const move = await postForm(client, `/files/${file.id}/move`, {
    folderId: folder.id,
  });
  const saved = await prisma.file.findUnique({ where: { id: file.id } });

  assert.equal(rename.status, 409);
  assert.match(rename.text, /already exists in this folder/);
  assert.equal(move.status, 409);
  assert.match(move.text, /already exists in this folder/);
  assert.equal(saved.name, "one.txt");
  assert.equal(saved.folderId, null);
  assert.equal(saved.folderKey, "root");
});

test("downloads use an encoded attachment filename", async () => {
  const client = createAgent();
  const user = await registerUser(client, "files-unicode");
  onTestFinished(() => cleanupUser(user));

  await uploadFile(client, {
    name: "Café notes.txt",
    buffer: bytes.text,
    contentType: "text/plain",
  });
  const file = await findFile(user.id, "Café notes.txt");
  const download = await downloadFile(client, file.id);

  assert.equal(download.status, 200);
  assert.equal(
    download.headers["content-disposition"],
    `attachment; filename="Caf_ notes.txt"; filename*=UTF-8''Caf%C3%A9%20notes.txt`,
  );
});

test("deleting a file removes the row and local file", async () => {
  const client = createAgent();
  const user = await registerUser(client, "files-delete");
  onTestFinished(() => cleanupUser(user));

  const folder = await createFolder(client, user, "Trash");
  await uploadFile(client, {
    folderId: folder.id,
    name: "old.txt",
    buffer: bytes.text,
    contentType: "text/plain",
  });
  const file = await findFile(user.id, "old.txt");
  const diskPath = join(uploadsDir, file.storageKey);

  const response = await postForm(client, `/files/${file.id}/delete`);

  assert.equal(response.status, 302);
  assert.equal(response.headers.location, `/folders/${folder.id}`);
  assert.equal(await prisma.file.count({ where: { id: file.id } }), 0);
  assert.equal(existsSync(diskPath), false);
});

test("other users cannot view, download, or delete a file", async () => {
  const ownerClient = createAgent();
  const owner = await registerUser(ownerClient, "files-owner");
  const otherClient = createAgent();
  const other = await registerUser(otherClient, "files-other");
  onTestFinished(() => cleanupUser(owner));
  onTestFinished(() => cleanupUser(other));

  await uploadFile(ownerClient, {
    name: "private.txt",
    buffer: bytes.text,
    contentType: "text/plain",
  });
  const file = await findFile(owner.id, "private.txt");

  const show = await otherClient.get(`/files/${file.id}`);
  const download = await downloadFile(otherClient, file.id);
  const edit = await otherClient.get(`/files/${file.id}/edit`);
  const rename = await postForm(otherClient, `/files/${file.id}/edit`, {
    name: "stolen.txt",
  });
  const move = await postForm(otherClient, `/files/${file.id}/move`, {
    folderId: "",
  });
  const remove = await postForm(otherClient, `/files/${file.id}/delete`);

  assert.equal(show.status, 404);
  assert.equal(download.status, 404);
  assert.equal(edit.status, 404);
  assert.equal(rename.status, 404);
  assert.equal(move.status, 404);
  assert.equal(remove.status, 404);
  assert.equal(await prisma.file.count({ where: { id: file.id } }), 1);
  assert.equal(existsSync(join(uploadsDir, file.storageKey)), true);
});

test("downloading a missing disk file returns 404", async () => {
  const client = createAgent();
  const user = await registerUser(client, "files-missing-disk");
  onTestFinished(() => cleanupUser(user));

  await uploadFile(client, {
    name: "gone.txt",
    buffer: bytes.text,
    contentType: "text/plain",
  });
  const file = await findFile(user.id, "gone.txt");

  await unlink(join(uploadsDir, file.storageKey));

  const response = await client.get(`/files/${file.id}/download`);

  assert.equal(response.status, 404);
  assert.match(response.text, /File is missing/);
});

test("file validation errors render inside the target folder", async () => {
  const client = createAgent();
  const user = await registerUser(client, "files-folder-error");
  onTestFinished(() => cleanupUser(user));

  const folder = await createFolder(client, user, "Target");
  const response = await uploadFile(client, {
    folderId: folder.id,
    name: "bad.bin",
    buffer: bytes.binary,
    contentType: "application/octet-stream",
  });

  assert.equal(response.status, 415);
  assert.match(response.text, /Target/);
  assert.match(response.text, /Use a PNG/);
});
