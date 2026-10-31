import { test, onTestFinished } from "vitest";
import assert from "node:assert/strict";
import prisma from "../src/lib/prisma.js";
import {
  bytes,
  cleanupUser,
  createAgent,
  findFile,
  getCsrfToken,
  postForm,
  registerUser,
  uploadFile,
} from "./helpers.js";

test("pages expose a CSRF token", async () => {
  const token = await getCsrfToken(createAgent());

  assert.match(token, /^[A-Za-z0-9_-]+$/);
});

test("unsafe requests without a valid token are rejected", async () => {
  const client = createAgent();
  const user = await registerUser(client, "csrf-reject");
  onTestFinished(() => cleanupUser(user));

  const missing = await client.post("/auth/logout").type("form").send({});
  const invalid = await postForm(client, "/auth/logout", {
    _csrf: "not-the-token",
  });
  const stillLoggedIn = await client.get("/folders");

  assert.equal(missing.status, 403);
  assert.match(missing.text, /Invalid CSRF token/);
  assert.equal(invalid.status, 403);
  assert.equal(stillLoggedIn.status, 200);
  assert.ok(
    await prisma.session.count({ where: { data: { contains: user.id } } }),
  );
});

test("uploads reject a missing token after parsing the form", async () => {
  const client = createAgent();
  const user = await registerUser(client, "csrf-upload");
  onTestFinished(() => cleanupUser(user));

  const response = await client
    .post("/files/upload")
    .attach("file", bytes.text, {
      filename: "blocked.txt",
      contentType: "text/plain",
    });

  assert.equal(response.status, 403);
  assert.equal(await findFile(user.id, "blocked.txt"), null);
});

test("a valid token allows form and multipart submissions", async () => {
  const client = createAgent();
  const user = await registerUser(client, "csrf-valid");
  onTestFinished(() => cleanupUser(user));

  const upload = await uploadFile(client, {
    name: "allowed.txt",
    buffer: bytes.text,
    contentType: "text/plain",
  });
  const logout = await postForm(client, "/auth/logout");

  assert.equal(upload.status, 302);
  assert.equal(logout.status, 302);
});
