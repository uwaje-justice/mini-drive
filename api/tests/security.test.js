import assert from "node:assert/strict";

import { onTestFinished, test } from "vitest";

import prisma from "../src/lib/prisma.js";
import {
  bytes,
  cleanupUser,
  createAgent,
  findFile,
  registerApiUser,
  sendApi,
} from "./helpers.js";

test("non-API routes return JSON 404 responses", async () => {
  const response = await createAgent().get("/");

  assert.equal(response.status, 404);
  assert.match(response.headers["content-type"], /application\/json/);
  assert.equal(response.headers["cache-control"], "no-store");
  assert.equal(response.headers["x-content-type-options"], "nosniff");
  assert.equal(response.body.error.code, "NOT_FOUND");
  assert.equal(response.body.error.message, "Route not found.");
});

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
  assert.equal(missing.headers["cache-control"], "no-store");
  assert.equal(missing.headers["x-content-type-options"], "nosniff");
  assert.equal(missing.body.error.code, "CSRF_INVALID");
  assert.equal(invalid.status, 403);
  assert.equal(invalid.headers["cache-control"], "no-store");
  assert.equal(invalid.body.error.code, "CSRF_INVALID");
  assert.equal(session.body.data.user.id, user.id);
  assert.equal(
    await prisma.session.count({ where: { data: { contains: user.id } } }),
    1,
  );
});

test("CORS allows only configured client origins", async () => {
  const client = createAgent();
  const allowed = await client
    .options("/api/auth/session")
    .set("Origin", "http://localhost:5173")
    .set("Access-Control-Request-Method", "GET");
  const blocked = await client
    .get("/api/auth/session")
    .set("Origin", "https://evil.example");

  assert.equal(allowed.status, 204);
  assert.equal(
    allowed.headers["access-control-allow-origin"],
    "http://localhost:5173",
  );
  assert.equal(allowed.headers["access-control-allow-credentials"], "true");
  assert.match(
    allowed.headers["access-control-allow-headers"],
    /x-csrf-token/i,
  );
  assert.match(allowed.headers.vary, /Origin/);
  assert.equal(blocked.headers["access-control-allow-origin"], undefined);
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
