import { test, onTestFinished } from "vitest";
import assert from "node:assert/strict";
import prisma from "../src/lib/prisma.js";
import {
  cleanupUser,
  createAgent,
  loginUser,
  postForm,
  registerUser,
  testPassword,
  uniqueEmail,
} from "./helpers.js";

test("home page welcomes guests", async () => {
  const response = await createAgent().get("/");

  assert.equal(response.status, 200);
  assert.match(response.text, /Your files, in one calm place/i);
  assert.match(response.text, /\/auth\/register/);
  assert.match(response.text, /\/auth\/login/);
});

test("protected pages redirect guests to login", async () => {
  const client = createAgent();

  for (const path of ["/folders", "/folders/new", "/files/unknown"]) {
    const response = await client.get(path);

    assert.equal(response.status, 302, path);
    assert.equal(response.headers.location, "/auth/login", path);
  }
});

test("auth pages use the split layout without a site header", async () => {
  const client = createAgent();

  for (const [path, formType] of [
    ["/auth/login", "login"],
    ["/auth/register", "register"],
  ]) {
    const response = await client.get(path);

    assert.equal(response.status, 200, path);
    assert.match(response.text, /class="auth-page"/);
    assert.match(response.text, /class="auth-shell"/);
    assert.match(response.text, /class="auth-visual"/);
    assert.match(response.text, /class="auth-back" href="\/"/);
    assert.match(response.text, /Back to home/);
    assert.match(response.text, new RegExp(`data-auth-form="${formType}"`));
    assert.match(response.text, /\/css\/auth\.css/);
    assert.match(response.text, /\/js\/auth-validation\.js/);
    assert.match(response.text, /aria-describedby="email-error"/);
    assert.match(response.text, /data-error-for="email"/);
    assert.doesNotMatch(response.text, /class="site-header"/);
    assert.doesNotMatch(response.text, /\/css\/landing\.css/);
  }
});

test("auth styles and validation script are served", async () => {
  const client = createAgent();

  const styles = await client.get("/css/auth.css");
  const script = await client.get("/js/auth-validation.js");

  assert.equal(styles.status, 200);
  assert.match(styles.headers["content-type"], /text\/css/);
  assert.match(styles.text, /\.auth-shell/);

  assert.equal(script.status, 200);
  assert.match(script.headers["content-type"], /javascript/);
  assert.match(script.text, /Passwords do not match\./);
});

test("server auth errors render below fields and mark them invalid", async () => {
  const response = await postForm(createAgent(), "/auth/register", {
    email: "not-an-email",
    password: "short",
    confirmPassword: "different",
  });

  assert.equal(response.status, 422);
  assert.match(response.text, /name="email"[\s\S]*?aria-invalid="true"/);
  assert.match(response.text, /data-error-for="email"[^>]*>Enter a valid email\./);
  assert.match(response.text, /name="password"[\s\S]*?aria-invalid="true"/);
  assert.match(response.text, /data-error-for="password"[^>]*>Password must be 8 to 128 characters\./);
  assert.match(response.text, /name="confirmPassword"[\s\S]*?aria-invalid="true"/);
  assert.match(response.text, /data-error-for="confirmPassword"[^>]*>Passwords do not match\./);
});

test("registration validates email, password, and confirmation", async () => {
  const response = await postForm(createAgent(), "/auth/register", {
    email: "not-an-email",
    password: "short",
    confirmPassword: "different",
  });

  assert.equal(response.status, 422);
  assert.match(response.text, /Enter a valid email/);
  assert.match(response.text, /Password must be 8 to 128 characters/);
  assert.match(response.text, /Passwords do not match/);
});

test("registration creates a user, hashes the password, and starts a session", async () => {
  const client = createAgent();
  const user = await registerUser(client, "register");
  onTestFinished(() => cleanupUser(user));

  const sessions = await prisma.session.count({
    where: { data: { contains: user.id } },
  });
  const page = await client.get("/");

  assert.match(user.passwordHash, /^\$argon2/);
  assert.notEqual(user.passwordHash, testPassword);
  assert.ok(sessions > 0);
  assert.equal(page.status, 200);
  assert.match(page.text, new RegExp(user.email));
  assert.match(page.text, /Open my drive/);
  assert.match(page.text, /\/folders/);

  for (const path of ["/auth/login", "/auth/register"]) {
    const authPage = await client.get(path);

    assert.equal(authPage.status, 302);
    assert.equal(authPage.headers.location, "/folders");
  }
});

test("successful login and registration send users to the drive", async () => {
  const user = await registerUser(createAgent(), "redirect-login");
  onTestFinished(() => cleanupUser(user));

  const loginResponse = await postForm(createAgent(), "/auth/login", {
    email: user.email,
    password: testPassword,
  });

  assert.equal(loginResponse.status, 302);
  assert.equal(loginResponse.headers.location, "/folders");

  const email = uniqueEmail("redirect-register");
  const registerResponse = await postForm(createAgent(), "/auth/register", {
    email,
    password: testPassword,
    confirmPassword: testPassword,
  });
  const registeredUser = await prisma.user.findUnique({ where: { email } });
  onTestFinished(() => cleanupUser(registeredUser));

  assert.equal(registerResponse.status, 302);
  assert.equal(registerResponse.headers.location, "/folders");
});

test("registration rejects a duplicate email", async () => {
  const firstUser = await registerUser(createAgent(), "duplicate-first");
  onTestFinished(() => cleanupUser(firstUser));

  const response = await postForm(createAgent(), "/auth/register", {
    email: firstUser.email,
    password: testPassword,
    confirmPassword: testPassword,
  });

  assert.equal(response.status, 409);
  assert.match(response.text, /Email already registered/);
  assert.equal(
    await prisma.user.count({ where: { email: firstUser.email } }),
    1,
  );
});

test("login rejects a wrong password", async () => {
  const user = await registerUser(createAgent(), "wrong-password");
  onTestFinished(() => cleanupUser(user));

  const client = createAgent();
  const response = await postForm(client, "/auth/login", {
    email: user.email,
    password: "wrong-password",
  });
  const drive = await client.get("/folders");

  assert.equal(response.status, 401);
  assert.match(response.text, /Invalid email or password/);
  assert.equal(drive.status, 302);
});

test("users can log out and log back in", async () => {
  const firstClient = createAgent();
  const user = await registerUser(firstClient, "login");
  onTestFinished(() => cleanupUser(user));

  const logout = await postForm(firstClient, "/auth/logout");

  assert.equal(logout.status, 302);
  assert.equal(logout.headers.location, "/auth/login");
  assert.equal(
    await prisma.session.count({ where: { data: { contains: user.id } } }),
    0,
  );

  const secondClient = createAgent();
  await loginUser(secondClient, user.email);

  const drive = await secondClient.get("/folders");

  assert.equal(drive.status, 200);
  assert.match(drive.text, /My drive/);
});

test("unknown routes render the 404 page", async () => {
  const response = await createAgent().get("/missing-page");

  assert.equal(response.status, 404);
  assert.match(response.text, /Something went wrong|Not found/i);
});
