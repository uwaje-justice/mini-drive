import { Router } from "express";

import folderController from "../controllers/folder-controller.js";
import requireAuth from "../middleware/require-auth.js";

const router = Router();

router.use(requireAuth);
router.get("/", folderController.index);

export default router;
