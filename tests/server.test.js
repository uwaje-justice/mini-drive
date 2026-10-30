import { test, onTestFinished } from "vitest";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";

const freePort = () =>
  new Promise((resolve, reject) => {
    const server = createServer();

    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();

      server.close(() => resolve(port));
    });
  });

const waitForServer = (child) =>
  new Promise((resolve, reject) => {
    let output = "";
    const timer = setTimeout(() => {
      reject(new Error(`Server did not start.\n${output}`));
    }, 10000);

    const read = (chunk) => {
      output += chunk.toString();

      if (output.includes("Server is running on port")) {
        clearTimeout(timer);
        resolve();
      }
    };

    child.stdout.on("data", read);
    child.stderr.on("data", read);
    child.on("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`Server exited with ${code}.\n${output}`));
    });
  });

test("server.js starts the HTTP server", async () => {
  const port = await freePort();
  const child = spawn(process.execPath, ["src/server.js"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: String(port),
      DATABASE_URL: "file:./test.db",
      SESSION_SECRET: "test-secret",
      STORAGE_DRIVER: "local",
      NODE_ENV: "test",
    },
  });
  onTestFinished(() => {
    if (child.exitCode === null && child.signalCode === null) child.kill();
  });

  await waitForServer(child);

  const response = await fetch(`http://127.0.0.1:${port}/`);
  const body = await response.text();

  assert.equal(response.status, 200);
  assert.match(body, /welcome to my mini drive/i);

  child.kill();
  await once(child, "exit");
});
