import { Router } from "express";
import requireAuth from "../middleware/require-auth.js";
import folderController from "../controllers/folder-controller.js";

const router = Router();

router.use(requireAuth);
router.get("/", folderController.index);

export default router;
