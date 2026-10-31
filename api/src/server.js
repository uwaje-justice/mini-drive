import app from "./app.js";
import env from "./lib/env.js";

const port = env("PORT", 3000);

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});

server.on("error", (error) => {
  console.error(error);
  process.exitCode = 1;
});
