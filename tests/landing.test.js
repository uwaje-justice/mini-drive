import { test, onTestFinished } from "vitest";
import assert from "node:assert/strict";
import {
  cleanupUser,
  createAgent,
  registerUser,
} from "./helpers.js";

test("landing page presents the public drive sections", async () => {
  const response = await createAgent().get("/");

  assert.equal(response.status, 200);
  assert.match(response.text, /Your files, in one calm place/i);
  assert.match(response.text, /id="features"/);
  assert.match(response.text, /id="how-it-works"/);
  assert.match(response.text, /id="privacy"/);
  assert.match(response.text, /id="cta-title"/);
  assert.match(response.text, /\/auth\/register/);
  assert.match(response.text, /\/auth\/login/);
  assert.match(response.text, /\/fonts\/roboto\/index\.css/);
  assert.match(response.text, /\/css\/landing\.css/);
  assert.doesNotMatch(response.text, /welcome to my mini drive/i);
  assert.doesNotMatch(response.text, /fonts\.googleapis\.com/i);
});

test("landing page shows drive actions for signed-in users", async () => {
  const client = createAgent();
  const user = await registerUser(client, "landing");
  onTestFinished(() => cleanupUser(user));

  const response = await client.get("/");

  assert.equal(response.status, 200);
  assert.match(response.text, new RegExp(user.email));
  assert.match(response.text, /Open my drive/);
  assert.match(response.text, /\/folders/);
});

test("landing styles and local font assets are served", async () => {
  const client = createAgent();

  const fontCss = await client.get("/fonts/roboto/index.css");
  const fontFile = await client.get(
    "/fonts/roboto/files/roboto-latin-wght-normal.woff2",
  );
  const tokens = await client.get("/css/tokens.css");
  const base = await client.get("/css/base.css");
  const landing = await client.get("/css/landing.css");

  assert.equal(fontCss.status, 200);
  assert.match(fontCss.headers["content-type"], /text\/css/);
  assert.match(fontCss.text, /Roboto Variable/);

  assert.equal(fontFile.status, 200);
  assert.match(fontFile.headers["content-type"], /font\/woff2/);

  assert.equal(tokens.status, 200);
  assert.equal(base.status, 200);
  assert.equal(landing.status, 200);
  assert.match(landing.text, /\.hero/);
});
