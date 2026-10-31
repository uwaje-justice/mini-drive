import { Router } from "express";

import notFound from "../middleware/api-not-found.js";
import apiHeaders from "../middleware/headers.js";
import { sendData } from "../responses.js";
import authRouter from "./auth.js";
import driveRouter from "./drive.js";
import filesRouter from "./files.js";
import foldersRouter from "./folders.js";
import publicSharesRouter from "./public-shares.js";
import searchRouter from "./search.js";

const router = Router();

router.use(apiHeaders);
router.get("/health", (req, res) => sendData(res, { status: "ok" }));
router.use("/auth", authRouter);
router.use("/drive", driveRouter);
router.use("/folders", foldersRouter);
router.use("/files", filesRouter);
router.use("/search", searchRouter);
router.use("/public/shares", publicSharesRouter);
router.use(notFound);

export default router;
