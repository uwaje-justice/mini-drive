import { Router } from "express";

import driveController from "../controllers/drive-controller.js";
import folderController from "../controllers/folder-controller.js";
import requireAuth from "../middleware/require-auth.js";

const router = Router();

router.use(requireAuth);
router.get("/overview", driveController.overview);
router.get("/activity", driveController.activity);
router.delete("/activity/:id", driveController.removeActivity);
router.delete("/activity", driveController.clearActivity);
router.get("/categories/:category", driveController.category);
router.get("/", folderController.index);

export default router;
