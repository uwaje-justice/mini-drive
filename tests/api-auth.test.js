import { test, onTestFinished } from "vitest";
import assert from "node:assert/strict";
import prisma from "../src/lib/prisma.js";
import {
  cleanupUser,
  createAgent,
  getApiSession,
  registerApiUser,
  sendApi,
  testPassword,
  uniqueEmail,
} from "./helpers.js";

test("API session exposes the guest state and a CSRF token", async () => {
  const response = await createAgent().get("/api/auth/session");

  assert.equal(response.status, 200);
  assert.equal(response.body.data.user, null);
  assert.match(response.body.data.csrfToken, /^[A-Za-z0-9_-]+$/);
  assert.equal(response.headers["cache-control"], "no-store");
});

test("protected API routes return JSON 401 responses", async () => {
  const client = createAgent();

  for (const path of [
    "/api/drive",
    "/api/folders/unknown",
    "/api/files/unknown",
    "/api/search?q=test",
  ]) {
    const response = await client.get(path);

    assert.equal(response.status, 401, path);
    assert.match(response.headers["content-type"], /application\/json/, path);
    assert.equal(response.body.error.code, "UNAUTHORIZED", path);
    assert.equal(response.body.error.message, "Sign in to continue.", path);
  }
});

test("API registration starts a session and session returns the user", async () => {
  const client = createAgent();
  const user = await registerApiUser(client, "api-register");
  onTestFinished(() => cleanupUser(user));

  const session = await getApiSession(client);
  const sessions = await prisma.session.count({
    where: { data: { contains: user.id } },
  });

  assert.match(user.passwordHash, /^\$argon2/);
  assert.equal(session.user.id, user.id);
  assert.equal(session.user.email, user.email);
  assert.ok(sessions > 0);
});

test("API logout clears the session and login starts a new one", async () => {
  const client = createAgent();
  const user = await registerApiUser(client, "api-logout");
  onTestFinished(() => cleanupUser(user));

  const logout = await sendApi(client, "post", "/api/auth/logout");
  const guest = await getApiSession(client);

  assert.equal(logout.status, 204);
  assert.equal(guest.user, null);
  assert.equal(
    await prisma.session.count({ where: { data: { contains: user.id } } }),
    0,
  );

  const login = await sendApi(client, "post", "/api/auth/login", {
    email: user.email,
    password: testPassword,
  });
  const signedIn = await getApiSession(client);

  assert.equal(login.status, 200);
  assert.equal(login.body.data.user.id, user.id);
  assert.equal(signedIn.user.id, user.id);
});

test("API auth validation returns 422 field messages", async () => {
  const client = createAgent();
  const response = await sendApi(client, "post", "/api/auth/register", {
    email: "not-an-email",
    password: "short",
    confirmPassword: "different",
  });

  assert.equal(response.status, 422);
  assert.equal(response.body.error.code, "VALIDATION_ERROR");
  assert.match(response.body.error.fields.email, /valid email/);
  assert.match(response.body.error.fields.password, /8 to 128/);
  assert.match(response.body.error.fields.confirmPassword, /do not match/);
});

test("API registration rejects duplicate emails with a field error", async () => {
  const user = await registerApiUser(createAgent(), "api-duplicate");
  onTestFinished(() => cleanupUser(user));

  const response = await sendApi(createAgent(), "post", "/api/auth/register", {
    email: user.email,
    password: testPassword,
    confirmPassword: testPassword,
  });

  assert.equal(response.status, 409);
  assert.equal(response.body.error.code, "CONFLICT");
  assert.match(response.body.error.fields.email, /already registered/);
  assert.equal(await prisma.user.count({ where: { email: user.email } }), 1);
});

test("API login rejects a wrong password", async () => {
  const user = await registerApiUser(createAgent(), "api-wrong-password");
  onTestFinished(() => cleanupUser(user));

  const response = await sendApi(createAgent(), "post", "/api/auth/login", {
    email: user.email,
    password: "wrong-password",
  });

  assert.equal(response.status, 401);
  assert.equal(response.body.error.code, "UNAUTHORIZED");
  assert.match(response.body.error.message, /Invalid email or password/);
});

test("unknown API routes and health checks return JSON", async () => {
  const client = createAgent();
  const missing = await client.get("/api/missing");
  const health = await client.get("/api/health");

  assert.equal(missing.status, 404);
  assert.equal(missing.body.error.code, "NOT_FOUND");
  assert.equal(missing.body.error.message, "API route not found.");
  assert.equal(health.status, 200);
  assert.deepEqual(health.body.data, { status: "ok" });
});

test("API registration normalizes email addresses", async () => {
  const client = createAgent();
  const email = uniqueEmail("api-normalize");
  const response = await sendApi(client, "post", "/api/auth/register", {
    email: `  ${email.toUpperCase()}  `,
    password: testPassword,
    confirmPassword: testPassword,
  });
  const user = await prisma.user.findUnique({ where: { email } });
  onTestFinished(() => cleanupUser(user));

  assert.equal(response.status, 201);
  assert.equal(response.body.data.user.email, email);
});
