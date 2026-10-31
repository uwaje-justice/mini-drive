import { randomUUID } from "node:crypto";
import { test, onTestFinished } from "vitest";
import assert from "node:assert/strict";
import prisma from "../src/lib/prisma.js";
import {
  cleanupUser,
  createAgent,
  registerUser,
} from "./helpers.js";

const createFile = (ownerId, { name, folderId = null }) =>
  prisma.file.create({
    data: {
      name,
      nameKey: name.toLowerCase(),
      storageProvider: "local",
      storageKey: randomUUID(),
      mimeType: "text/plain",
      size: 10,
      ownerId,
      folderId,
      folderKey: folderId ?? "root",
    },
  });

test("search finds folders and files across the drive, case-insensitively", async () => {
  const client = createAgent();
  const user = await registerUser(client, "search-owner");
  const other = await registerUser(createAgent(), "search-other");
  onTestFinished(async () => {
    await cleanupUser(other);
    await cleanupUser(user);
  });

  const parent = await prisma.folder.create({
    data: {
      name: "Parent",
      nameKey: "parent",
      ownerId: user.id,
      parentKey: "root",
    },
  });
  const child = await prisma.folder.create({
    data: {
      name: "Child",
      nameKey: "child",
      ownerId: user.id,
      parentId: parent.id,
      parentKey: parent.id,
    },
  });
  await prisma.folder.create({
    data: {
      name: "Report archive",
      nameKey: "report archive",
      ownerId: user.id,
      parentId: child.id,
      parentKey: child.id,
    },
  });
  await createFile(user.id, {
    name: "Quarterly Report.txt",
    folderId: child.id,
  });
  await createFile(user.id, { name: "report.pdf" });
  await createFile(other.id, { name: "report-private.txt" });

  const response = await client.get("/search?q=REPORT");

  assert.equal(response.status, 200);
  assert.match(response.text, /3 of 3 results/);
  assert.match(response.text, /Quarterly Report\.txt/);
  assert.match(response.text, /report\.pdf/);
  assert.match(response.text, /Report archive/);
  assert.match(response.text, /Parent \/ Child/);
  assert.doesNotMatch(response.text, /report-private\.txt/);
});

test("search pages results and keeps the query in pagination links", async () => {
  const client = createAgent();
  const user = await registerUser(client, "search-pages");
  onTestFinished(() => cleanupUser(user));

  await prisma.file.createMany({
    data: Array.from({ length: 25 }, (_, index) => {
      const name = `match ${String(index + 1).padStart(2, "0")}.txt`;

      return {
        name,
        nameKey: name.toLowerCase(),
        storageProvider: "local",
        storageKey: randomUUID(),
        mimeType: "text/plain",
        size: 10,
        ownerId: user.id,
        folderKey: "root",
      };
    }),
  });

  const response = await client.get("/search?q=match&page=2");

  assert.equal(response.status, 200);
  assert.match(response.text, /5 of 25 results/);
  assert.match(response.text, /Page 2 of 2/);
  assert.match(response.text, /match 21\.txt/);
  assert.doesNotMatch(response.text, /match 01\.txt/);
  assert.match(response.text, /href="\/search\?q=match&amp;page=1"/);
});

test("blank searches render without querying or failing", async () => {
  const client = createAgent();
  const user = await registerUser(client, "search-blank");
  onTestFinished(() => cleanupUser(user));

  const response = await client.get("/search?q=%20%20");

  assert.equal(response.status, 200);
  assert.match(response.text, /<h1>Search<\/h1>/);
  assert.doesNotMatch(response.text, /results for/);
});
