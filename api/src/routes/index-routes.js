import { Router } from "express";

import apiHeaders from "../middleware/headers.js";
import { sendData } from "../responses.js";
import authRouter from "./auth-routes.js";
import driveRouter from "./drive-routes.js";
import filesRouter from "./files-routes.js";
import foldersRouter from "./folders-routes.js";
import publicSharesRouter from "./public-shares-routes.js";
import searchRouter from "./search-routes.js";

const router = Router();

router.use(apiHeaders);
router.get("/health", (req, res) => sendData(res, { status: "ok" }));
router.use("/auth", authRouter);
router.use("/drive", driveRouter);
router.use("/folders", foldersRouter);
router.use("/files", filesRouter);
router.use("/search", searchRouter);
router.use("/public/shares", publicSharesRouter);

export default router;
