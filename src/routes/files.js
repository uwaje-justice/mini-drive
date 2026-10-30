import { Router } from "express";
import requireAuth from "../middleware/require-auth.js";
import uploadFile from "../middleware/upload.js";
import fileController from "../controllers/file-controller.js";

const router = Router();

router.use(requireAuth);
router.post("/upload", uploadFile, fileController.upload);

export default router;
