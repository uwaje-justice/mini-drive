import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";

import { onTestFinished,test } from "vitest";

import prisma from "../src/lib/prisma.js";
import {
  bytes,
  cleanupUser,
  createAgent,
  createApiFolder,
  downloadApiFile,
  findFile,
  getApiCsrfToken,
  registerApiUser,
  sendApi,
  uploadApiFile,
  uploadApiFiles,
} from "./helpers.js";

const uploadsDir = join(process.cwd(), "uploads");

const parseBinary = (response, callback) => {
  const chunks = [];

  response.on("data", (chunk) => chunks.push(chunk));
  response.on("end", () => callback(null, Buffer.concat(chunks)));
};

test("the file API stores, downloads, and previews every supported type", async () => {
  const client = createAgent();
  const user = await registerApiUser(client, "api-files-types");
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
    const upload = await uploadApiFile(client, {
      name: item.name,
      buffer: item.buffer,
      contentType: item.sentType ?? item.mimeType,
    });
    const uploaded = upload.body.data.uploaded[0];
    const file = await findFile(user.id, item.name);

    assert.equal(upload.status, 201, item.name);
    assert.equal(uploaded.mimeType, item.mimeType, item.name);
    assert.equal(uploaded.previewKind !== null, true, item.name);
    assert.equal(uploaded.storageKey, undefined, item.name);
    assert.equal(uploaded.ownerId, undefined, item.name);
    assert.equal(file.mimeType, item.mimeType, item.name);
    assert.equal(existsSync(join(uploadsDir, file.storageKey)), true, item.name);

    const download = await downloadApiFile(client, file.id);
    const preview = await client
      .get(`/api/files/${file.id}/preview`)
      .buffer(true)
      .parse(parseBinary);

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
    assert.ok(download.body.equals(item.buffer), item.name);

    assert.equal(preview.status, 200, item.name);
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
    assert.ok(preview.body.equals(item.buffer), item.name);
  }
});

test("file upload reports mixed and skipped results", async () => {
  const client = createAgent();
  const user = await registerApiUser(client, "api-files-mixed");
  onTestFinished(() => cleanupUser(user));

  await uploadApiFile(client, {
    name: "taken.txt",
    buffer: bytes.text,
    contentType: "text/plain",
  });

  const response = await uploadApiFiles(client, {
    files: [
      { name: "first.txt", buffer: bytes.text, contentType: "text/plain" },
      { name: "second.png", buffer: bytes.png, contentType: "image/png" },
      { name: "taken.txt", buffer: bytes.text, contentType: "text/plain" },
      { name: "empty.txt", buffer: bytes.empty, contentType: "text/plain" },
      {
        name: "bad.bin",
        buffer: bytes.binary,
        contentType: "application/octet-stream",
      },
    ],
  });

  assert.equal(response.status, 207);
  assert.equal(response.body.data.uploaded.length, 2);
  assert.match(
    response.body.data.skipped.map((item) => item.message).join("\n"),
    /taken\.txt: A file with this name already exists/,
  );
  assert.match(
    response.body.data.skipped.map((item) => item.message).join("\n"),
    /empty\.txt: File is empty/,
  );
  assert.match(
    response.body.data.skipped.map((item) => item.message).join("\n"),
    /bad\.bin: Use a PNG/,
  );
  assert.equal(await prisma.file.count({ where: { ownerId: user.id } }), 3);
});

test("file upload rejects missing, oversized, and over-limit batches", async () => {
  const client = createAgent();
  const user = await registerApiUser(client, "api-files-limits");
  onTestFinished(() => cleanupUser(user));

  const token = await getApiCsrfToken(client);
  const missing = await client
    .post("/api/files")
    .set("x-csrf-token", token);
  const oversized = await uploadApiFile(client, {
    name: "large.png",
    buffer: bytes.oversize,
    contentType: "image/png",
  });
  const tooMany = await uploadApiFiles(client, {
    files: Array.from({ length: 11 }, (_, index) => ({
      name: `file-${index}.txt`,
      buffer: bytes.text,
      contentType: "text/plain",
    })),
  });

  assert.equal(missing.status, 400);
  assert.equal(missing.headers["cache-control"], "no-store");
  assert.match(missing.body.error.message, /No files were uploaded/);
  assert.equal(oversized.status, 413);
  assert.equal(oversized.headers["x-content-type-options"], "nosniff");
  assert.match(oversized.body.error.message, /5 MB or smaller/);
  assert.equal(tooMany.status, 400);
  assert.match(tooMany.body.error.message, /at most 10 files/);
  assert.equal(await prisma.file.count({ where: { ownerId: user.id } }), 0);
});

test("file upload rejects a malformed folder field", async () => {
  const client = createAgent();
  const user = await registerApiUser(client, "api-files-folder-field");
  onTestFinished(() => cleanupUser(user));

  const token = await getApiCsrfToken(client);
  const response = await client
    .post("/api/files")
    .set("x-csrf-token", token)
    .field("folderId", "one")
    .field("folderId", "two")
    .attach("files", bytes.text, {
      filename: "notes.txt",
      contentType: "text/plain",
    });

  assert.equal(response.status, 422);
  assert.equal(response.headers["cache-control"], "no-store");
  assert.equal(response.body.error.code, "VALIDATION_ERROR");
  assert.match(response.body.error.fields.folderId, /invalid/i);
  assert.equal(await prisma.file.count({ where: { ownerId: user.id } }), 0);
});

test("unsupported and empty files are skipped without saving", async () => {
  const client = createAgent();
  const user = await registerApiUser(client, "api-files-skipped");
  onTestFinished(() => cleanupUser(user));

  const empty = await uploadApiFile(client, {
    name: "empty.txt",
    buffer: bytes.empty,
    contentType: "text/plain",
  });
  const unsupported = await uploadApiFile(client, {
    name: "unknown.bin",
    buffer: bytes.binary,
    contentType: "application/octet-stream",
  });

  assert.equal(empty.status, 207);
  assert.match(empty.body.data.skipped[0].message, /File is empty/);
  assert.equal(unsupported.status, 207);
  assert.match(
    unsupported.body.data.skipped[0].message,
    /PNG, JPEG, WebP, GIF, PDF, or plain text/,
  );
  assert.equal(await prisma.file.count({ where: { ownerId: user.id } }), 0);
});

test("files can be renamed, moved, and deleted through the API", async () => {
  const client = createAgent();
  const user = await registerApiUser(client, "api-files-edit");
  onTestFinished(() => cleanupUser(user));

  const folder = await createApiFolder(client, "Target");
  await uploadApiFile(client, {
    name: "original.txt",
    buffer: bytes.text,
    contentType: "text/plain",
  });
  const file = await findFile(user.id, "original.txt");
  const diskPath = join(uploadsDir, file.storageKey);

  const rename = await sendApi(
    client,
    "patch",
    `/api/files/${file.id}`,
    { name: "renamed.txt" },
  );
  const targets = await client.get(`/api/files/${file.id}/move-targets`);
  const move = await sendApi(client, "post", `/api/files/${file.id}/move`, {
    folderId: folder.id,
  });
  const details = await client.get(`/api/files/${file.id}`);
  const remove = await sendApi(client, "delete", `/api/files/${file.id}`);

  assert.equal(rename.status, 200);
  assert.equal(rename.body.data.file.name, "renamed.txt");
  assert.equal(targets.status, 200);
  assert.ok(
    targets.body.data.targets.some((target) => target.id === folder.id),
  );
  assert.equal(move.status, 200);
  assert.equal(move.body.data.file.folderId, folder.id);
  assert.equal(details.body.data.file.folder.name, "Target");
  assert.equal(remove.status, 204);
  assert.equal(await prisma.file.count({ where: { id: file.id } }), 0);
  assert.equal(existsSync(diskPath), false);
});

test("file API rejects invalid folders, long names, and foreign files", async () => {
  const ownerClient = createAgent();
  const owner = await registerApiUser(ownerClient, "api-files-owner");
  const otherClient = createAgent();
  const other = await registerApiUser(otherClient, "api-files-other");
  onTestFinished(() => cleanupUser(owner));
  onTestFinished(() => cleanupUser(other));

  const ownerFolder = await createApiFolder(ownerClient, "Private");
  await uploadApiFile(ownerClient, {
    name: "private.txt",
    buffer: bytes.text,
    contentType: "text/plain",
  });
  const file = await findFile(owner.id, "private.txt");

  const missingFolder = await uploadApiFile(otherClient, {
    folderId: "missing-folder",
    name: "file.txt",
    buffer: bytes.text,
    contentType: "text/plain",
  });
  const foreignFolder = await uploadApiFile(otherClient, {
    folderId: ownerFolder.id,
    name: "file.txt",
    buffer: bytes.text,
    contentType: "text/plain",
  });
  const longName = await uploadApiFile(otherClient, {
    name: `${"x".repeat(256)}.txt`,
    buffer: bytes.text,
    contentType: "text/plain",
  });
  const foreignPreview = await otherClient.get(
    `/api/files/${file.id}/preview`,
  );
  const foreignRename = await sendApi(
    otherClient,
    "patch",
    `/api/files/${file.id}`,
    { name: "stolen.txt" },
  );

  assert.equal(missingFolder.status, 404);
  assert.equal(foreignFolder.status, 404);
  assert.equal(longName.status, 207);
  assert.match(longName.body.data.skipped[0].message, /255 characters or fewer/);
  assert.equal(foreignPreview.status, 404);
  assert.equal(foreignRename.status, 404);
  assert.equal(await prisma.file.count({ where: { ownerId: other.id } }), 0);
});
