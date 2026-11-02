import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { v2 as cloudinary } from "cloudinary";
import { onTestFinished, test, vi } from "vitest";

import storage from "../src/lib/storage.js";
import localStorage from "../src/lib/storage-local.js";

process.env.CLOUDINARY_CLOUD_NAME ??= "test-cloud";
process.env.CLOUDINARY_API_KEY ??= "test-key";
process.env.CLOUDINARY_API_SECRET ??= "test-secret";

const { default: cloudinaryStorage } = await import(
  "../src/lib/storage-cloudinary.js"
);

const uploadsDir = join(process.cwd(), "uploads");

const fakeFile = (buffer, originalname = "test.txt") => ({
  buffer,
  originalname,
  mimetype: "text/plain",
});

const readStream = async (stream) => {
  const chunks = [];

  for await (const chunk of stream) chunks.push(chunk);

  return Buffer.concat(chunks);
};

test("the storage facade saves and opens local files by default", async () => {
  const saved = await storage.save(fakeFile(Buffer.from("facade")));
  onTestFinished(() => storage.remove(saved));

  const target = await storage.open(saved);

  assert.equal(saved.storageProvider, "local");
  assert.equal(target.size, 6);
  assert.ok((await readStream(target.stream)).equals(Buffer.from("facade")));
});

test("local storage saves, opens, and removes a file", async () => {
  const buffer = Buffer.from("local storage body");
  const saved = await localStorage.save(fakeFile(buffer, "Note.TXT"));
  onTestFinished(() => localStorage.remove(saved));

  const path = join(uploadsDir, saved.storageKey);
  const target = await localStorage.open(saved);

  assert.match(saved.storageKey, /^[0-9a-f-]{36}\.txt$/);
  assert.equal(saved.storageUrl, null);
  assert.equal(existsSync(path), true);
  assert.ok((await readFile(path)).equals(buffer));
  assert.equal(target.size, buffer.length);
  assert.ok((await readStream(target.stream)).equals(buffer));

  await localStorage.remove(saved);

  assert.equal(existsSync(path), false);
});

test("local storage ignores missing files when removing", async () => {
  await assert.doesNotReject(() =>
    localStorage.remove({ storageKey: "missing-file.txt" }),
  );
});

test("local storage reports missing files when opening", async () => {
  await assert.rejects(
    () => localStorage.open({ storageKey: "missing-file.txt" }),
    { code: "ENOENT" },
  );
});

test("local storage only keeps safe short extensions", async () => {
  const noExtension = await localStorage.save(
    fakeFile(Buffer.from("a"), "file."),
  );
  const unsafeExtension = await localStorage.save(
    fakeFile(Buffer.from("b"), "file.tar.gz!"),
  );
  onTestFinished(() => localStorage.remove(noExtension));
  onTestFinished(() => localStorage.remove(unsafeExtension));

  assert.match(noExtension.storageKey, /^[0-9a-f-]{36}$/);
  assert.match(unsafeExtension.storageKey, /^[0-9a-f-]{36}$/);
});

test("the storage facade rejects an unknown provider", () => {
  assert.throws(
    () => storage.open({ storageProvider: "unknown", storageKey: "key" }),
    /Unknown storage provider/,
  );
});

test("cloudinary storage uploads images and raw files with the right options", async () => {
  const calls = [];

  vi.spyOn(cloudinary.uploader, "upload_stream").mockImplementation(
    (options, callback) => {
      calls.push(options);

      return {
        on() {
          return this;
        },
        end() {
          callback(null, {
            public_id: options.public_id,
            secure_url: `https://cdn.test/${options.public_id}`,
            format: options.format ?? "txt",
            resource_type: options.resource_type,
          });
        },
      };
    },
  );

  const image = await cloudinaryStorage.save(
    {
      buffer: Buffer.from("png"),
      originalname: "Photo.PNG",
      mimetype: "image/png",
    },
    { ownerId: "user-1" },
  );
  const pdf = await cloudinaryStorage.save(
    {
      buffer: Buffer.from("%PDF"),
      originalname: "Report.PDF",
      mimetype: "application/pdf",
    },
    { ownerId: "user-1" },
  );

  assert.equal(calls[0].resource_type, "image");
  assert.equal(calls[0].type, "authenticated");
  assert.equal(calls[0].format, "png");
  assert.equal(calls[0].filename, "Photo.PNG");
  assert.equal(calls[0].overwrite, false);
  assert.match(calls[0].public_id, /^file-uploader\/user-1\/[0-9a-f-]{36}$/);
  assert.equal(image.storageProvider, "cloudinary");
  assert.equal(image.storageKey, calls[0].public_id);
  assert.equal(image.storageFormat, "png");
  assert.equal(image.storageResourceType, "image");
  assert.equal(image.storageUrl, `https://cdn.test/${calls[0].public_id}`);

  assert.equal(calls[1].resource_type, "raw");
  assert.equal(calls[1].format, undefined);
  assert.match(calls[1].public_id, /\.pdf$/);
  assert.equal(pdf.storageFormat, null);
  assert.equal(pdf.storageResourceType, "raw");
});

test("cloudinary storage rejects unsupported file types", async () => {
  await assert.rejects(
    () =>
      cloudinaryStorage.save(
        {
          buffer: Buffer.from("bmp"),
          originalname: "image.bmp",
          mimetype: "image/bmp",
        },
        { ownerId: "user-1" },
      ),
    /does not support/,
  );
});

test("cloudinary storage removes assets and accepts missing ones", async () => {
  const calls = [];

  vi.spyOn(cloudinary.uploader, "destroy").mockImplementation(
    async (key, options) => {
      calls.push({ key, options });

      return { result: calls.length === 1 ? "ok" : "not found" };
    },
  );

  await cloudinaryStorage.remove({
    storageKey: "file-uploader/user/image",
    storageResourceType: "image",
  });
  await cloudinaryStorage.remove({
    storageKey: "file-uploader/user/raw.txt",
    mimeType: "text/plain",
  });

  assert.equal(calls[0].key, "file-uploader/user/image");
  assert.equal(calls[0].options.resource_type, "image");
  assert.equal(calls[0].options.type, "authenticated");
  assert.equal(calls[0].options.invalidate, true);
  assert.equal(calls[1].options.resource_type, "raw");
});

test("cloudinary storage reports failed deletes", async () => {
  vi.spyOn(cloudinary.uploader, "destroy").mockResolvedValue({
    result: "error",
  });

  await assert.rejects(
    () =>
      cloudinaryStorage.remove({
        storageKey: "file-uploader/user/image",
        storageResourceType: "image",
      }),
    /Cloudinary delete failed/,
  );
});

test("cloudinary storage proxies a short-lived signed download", async () => {
  const calls = [];
  const fetchMock = vi.fn().mockResolvedValue(
    new Response("proxied", {
      headers: { "content-length": "7" },
    }),
  );

  vi.stubGlobal("fetch", fetchMock);
  onTestFinished(() => vi.unstubAllGlobals());
  vi.spyOn(cloudinary.utils, "private_download_url").mockImplementation(
    (key, format, options) => {
      calls.push({ key, format, options });

      return "https://cloudinary.test/download";
    },
  );

  const before = Math.floor(Date.now() / 1000);
  const target = await cloudinaryStorage.open({
    storageKey: "file-uploader/user/image",
    storageFormat: "png",
    storageResourceType: "image",
  });
  const options = calls[0].options;
  const body = await readStream(target.stream);

  assert.equal(target.size, 7);
  assert.equal(body.toString(), "proxied");
  assert.equal(fetchMock.mock.calls[0][0], "https://cloudinary.test/download");
  assert.equal(calls[0].key, "file-uploader/user/image");
  assert.equal(calls[0].format, "png");
  assert.equal(options.resource_type, "image");
  assert.equal(options.type, "authenticated");
  assert.equal(options.attachment, false);
  assert.ok(options.expires_at >= before + 290);
  assert.ok(options.expires_at <= before + 310);
});

test("cloudinary storage reports missing assets while opening", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 404 })));
  onTestFinished(() => vi.unstubAllGlobals());
  vi.spyOn(cloudinary.utils, "private_download_url").mockReturnValue(
    "https://cloudinary.test/missing",
  );

  await assert.rejects(
    () =>
      cloudinaryStorage.open({
        storageKey: "file-uploader/user/missing",
        storageFormat: "png",
        storageResourceType: "image",
      }),
    { code: "ENOENT" },
  );
});

test("cloudinary storage requires configuration", () => {
  assert.doesNotThrow(() => cloudinaryStorage.assertConfigured());
});
