import { test, onTestFinished } from "vitest";
import assert from "node:assert/strict";
import prisma from "../src/lib/prisma.js";
import {
  bytes,
  cleanupUser,
  createAgent,
  findFile,
  registerApiUser,
  sendApi,
} from "./helpers.js";

test("API mutations reject missing and invalid CSRF tokens", async () => {
  const client = createAgent();
  const user = await registerApiUser(client, "api-csrf");
  onTestFinished(() => cleanupUser(user));

  const missing = await client.post("/api/auth/logout").send({});
  const invalid = await client
    .post("/api/auth/logout")
    .set("x-csrf-token", "not-the-token")
    .send({});
  const session = await client.get("/api/auth/session");

  assert.equal(missing.status, 403);
  assert.equal(missing.body.error.code, "CSRF_INVALID");
  assert.equal(invalid.status, 403);
  assert.equal(invalid.body.error.code, "CSRF_INVALID");
  assert.equal(session.body.data.user.id, user.id);
  assert.equal(
    await prisma.session.count({ where: { data: { contains: user.id } } }),
    1,
  );
});

test("API multipart uploads require the CSRF header", async () => {
  const client = createAgent();
  const user = await registerApiUser(client, "api-csrf-upload");
  onTestFinished(() => cleanupUser(user));

  const response = await client.post("/api/files").attach("files", bytes.text, {
    filename: "blocked.txt",
    contentType: "text/plain",
  });
  const logout = await sendApi(client, "post", "/api/auth/logout");

  assert.equal(response.status, 403);
  assert.equal(response.body.error.code, "CSRF_INVALID");
  assert.equal(await findFile(user.id, "blocked.txt"), null);
  assert.equal(logout.status, 204);
});
