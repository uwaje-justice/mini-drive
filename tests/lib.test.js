import { test } from "vitest";
import assert from "node:assert/strict";
import detectMimeType from "../src/lib/file-signature.js";
import contentDisposition from "../src/lib/content-disposition.js";
import formatBytes from "../src/lib/format-bytes.js";
import env from "../src/lib/env.js";
import { bytes } from "./helpers.js";

test("file signatures detect every supported type", () => {
  assert.equal(detectMimeType(bytes.png), "image/png");
  assert.equal(detectMimeType(bytes.jpeg), "image/jpeg");
  assert.equal(detectMimeType(bytes.gif), "image/gif");
  assert.equal(detectMimeType(bytes.webp), "image/webp");
  assert.equal(detectMimeType(bytes.pdf), "application/pdf");
  assert.equal(detectMimeType(bytes.text), "text/plain");
  assert.equal(detectMimeType(Buffer.from("GIF87a")), "image/gif");
  assert.equal(detectMimeType(Buffer.from("hello 🌍")), "text/plain");
});

test("file signatures reject binary, null bytes, and invalid UTF-8", () => {
  assert.equal(detectMimeType(bytes.binary), null);
  assert.equal(detectMimeType(Buffer.from("hello\0world")), null);
  assert.equal(detectMimeType(Buffer.from([0xc3, 0x28])), null);
  assert.equal(detectMimeType(Buffer.from("not really a png")), "text/plain");
});

test("content disposition safely encodes ASCII names", () => {
  assert.equal(
    contentDisposition("report.txt"),
    `attachment; filename="report.txt"; filename*=UTF-8''report.txt`,
  );
  assert.equal(
    contentDisposition(`it's (1).txt`),
    `attachment; filename="it's (1).txt"; filename*=UTF-8''it%27s%20%281%29.txt`,
  );
});

test("content disposition encodes Unicode and unsafe fallback characters", () => {
  assert.equal(
    contentDisposition('Café "notes".txt'),
    `attachment; filename="Caf_ _notes_.txt"; filename*=UTF-8''Caf%C3%A9%20%22notes%22.txt`,
  );
  assert.equal(
    contentDisposition("back\\slash.txt"),
    `attachment; filename="back_slash.txt"; filename*=UTF-8''back%5Cslash.txt`,
  );
});

test("format bytes changes units at the right thresholds", () => {
  assert.equal(formatBytes(0), "0 B");
  assert.equal(formatBytes(1023), "1023 B");
  assert.equal(formatBytes(1024), "1.0 KB");
  assert.equal(formatBytes(1536), "1.5 KB");
  assert.equal(formatBytes(1024 * 1024 - 1), "1024.0 KB");
  assert.equal(formatBytes(1024 * 1024), "1.0 MB");
  assert.equal(formatBytes(5 * 1024 * 1024), "5.0 MB");
});

test("env reads values, honors fallbacks, and throws when missing", () => {
  process.env.TEST_ENV_VALUE = "value";

  assert.equal(env("TEST_ENV_VALUE"), "value");
  assert.equal(env("TEST_ENV_MISSING", "fallback"), "fallback");
  assert.throws(() => env("TEST_ENV_MISSING"), /TEST_ENV_MISSING/);

  delete process.env.TEST_ENV_VALUE;
});
