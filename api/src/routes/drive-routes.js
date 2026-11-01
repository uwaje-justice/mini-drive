import { Router } from "express";

import driveController from "../controllers/drive-controller.js";
import folderController from "../controllers/folder-controller.js";
import requireAuth from "../middleware/require-auth.js";

const router = Router();

router.use(requireAuth);
router.get("/overview", driveController.overview);
router.get("/categories/:category", driveController.category);
router.get("/", folderController.index);

export default router;
