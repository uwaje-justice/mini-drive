import { test, onTestFinished } from "vitest";
import assert from "node:assert/strict";
import {
  bytes,
  cleanupUser,
  createAgent,
  createFolder,
  createShareLink,
  findFile,
  registerUser,
  uploadFile,
} from "./helpers.js";

test("authenticated pages use the sidebar app shell", async () => {
  const client = createAgent();
  const user = await registerUser(client, "app-shell");
  onTestFinished(() => cleanupUser(user));

  const folder = await createFolder(client, user, "Projects");
  const page = await client.get("/folders");
  const folderPage = await client.get(`/folders/${folder.id}`);
  const searchPage = await client.get("/search");

  for (const response of [page, folderPage, searchPage]) {
    assert.equal(response.status, 200);
    assert.match(response.text, /class="app-page"/);
    assert.match(response.text, /class="app-sidebar"/);
    assert.match(response.text, /class="app-main"/);
    assert.match(response.text, /\/css\/app\.css/);
    assert.match(response.text, /\/css\/drive\.css/);
    assert.doesNotMatch(response.text, /class="site-header"/);
  }

  assert.doesNotMatch(page.text, /class="app-topbar"/);
  assert.doesNotMatch(folderPage.text, /class="app-topbar"/);
  assert.match(searchPage.text, /class="app-topbar"/);
  assert.match(page.text, /<h1>My drive<\/h1>/);
  assert.match(page.text, /aria-current="page"/);
  assert.match(page.text, /class="file-drop"/);
  assert.match(folderPage.text, /class="breadcrumbs"/);
  assert.match(folderPage.text, /class="menu__panel"/);
  assert.match(folderPage.text, /class="upload-form"/);
  assert.match(searchPage.text, /<h1>Search<\/h1>/);
  assert.match(searchPage.text, /class="app-search"/);
  assert.match(searchPage.text, /href="\/search" aria-current="page"/);
});

test("file and form pages use the app shell and shared components", async () => {
  const client = createAgent();
  const user = await registerUser(client, "app-details");
  onTestFinished(() => cleanupUser(user));

  const folder = await createFolder(client, user, "Images");
  await uploadFile(client, {
    folderId: folder.id,
    name: "sample.png",
    buffer: bytes.png,
    contentType: "image/png",
  });
  const file = await findFile(user.id, "sample.png");
  const filePage = await client.get(`/files/${file.id}`);
  const editPage = await client.get(`/files/${file.id}/edit`);
  const newFolderPage = await client.get("/folders/new");
  const movePage = await client.get(`/folders/${folder.id}/move`);
  const sharePage = await client.get(`/folders/${folder.id}/share`);

  assert.equal(filePage.status, 200);
  assert.doesNotMatch(filePage.text, /class="app-topbar"/);
  assert.match(filePage.text, /class="page-header__file-icon"/);
  assert.match(filePage.text, /class="panel file-details"/);
  assert.match(filePage.text, /class="file-preview__image"/);
  assert.match(filePage.text, /class="panel danger-zone"/);

  for (const response of [editPage, newFolderPage, movePage, sharePage]) {
    assert.equal(response.status, 200);
    assert.match(response.text, /class="app-page"/);
    assert.match(response.text, /class="panel form-panel"/);
    assert.doesNotMatch(response.text, /class="app-topbar"/);
  }

  assert.match(editPage.text, /<h2 id="rename-title">Rename<\/h2>/);
  assert.match(editPage.text, /<h2 id="move-title">Move<\/h2>/);
  assert.match(sharePage.text, /No links yet/);
});

test("logged-in share pages skip the app shell", async () => {
  const client = createAgent();
  const user = await registerUser(client, "app-share");
  onTestFinished(() => cleanupUser(user));

  const folder = await createFolder(client, user, "Shared");
  const child = await createFolder(client, user, "Nested", folder.id);
  const link = await createShareLink(client, folder);
  const response = await client.get(
    `/share/${link.token}/folders/${child.id}`,
  );

  assert.equal(response.status, 200);
  assert.match(response.text, /class="site-header"/);
  assert.match(response.text, /\/css\/drive\.css/);
  assert.doesNotMatch(response.text, /\/css\/app\.css/);
  assert.doesNotMatch(response.text, /class="app-sidebar"/);
  assert.doesNotMatch(response.text, /class="app-page"/);
  assert.match(response.text, /Back/);
  assert.match(response.text, /class="container shared-page"/);
});

test("app and drive styles are served", async () => {
  const client = createAgent();

  const appStyles = await client.get("/css/app.css");
  const driveStyles = await client.get("/css/drive.css");

  assert.equal(appStyles.status, 200);
  assert.match(appStyles.headers["content-type"], /text\/css/);
  assert.match(appStyles.text, /\.app-sidebar/);
  assert.match(appStyles.text, /\.file-layout/);

  assert.equal(driveStyles.status, 200);
  assert.match(driveStyles.headers["content-type"], /text\/css/);
  assert.match(driveStyles.text, /\.folder-grid/);
  assert.match(driveStyles.text, /\.file-row/);
});
