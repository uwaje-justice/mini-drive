import { Router } from "express";
import requireAuth from "../middleware/require-auth.js";
import uploadFile from "../middleware/upload.js";
import fileController from "../controllers/file-controller.js";

const router = Router();

router.use(requireAuth);
router.post("/upload", uploadFile, fileController.upload);
router.get("/:id", fileController.show);
router.get("/:id/download", fileController.download);
router.post("/:id/delete", fileController.remove);

export default router;
