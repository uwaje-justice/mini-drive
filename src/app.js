import express from "express";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import env from "./lib/env.js";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.static(join(__dirname, "..", "public")));

app.set("views", join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index", { message: "welcome to my mini drive!!!" });
});

const port = env("PORT", 3000);

app.listen(port, (err) => {
  if (err) throw err;
  console.log(`Server is running on port ${port}.`);
});
