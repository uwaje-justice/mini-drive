import { Router } from "express";

import fileController from "../controllers/file-controller.js";
import requireAuth from "../middleware/require-auth.js";
import uploadFiles from "../middleware/upload.js";
import validate from "../middleware/validate.js";
import fileValidator from "../validators/file-validator.js";

const { fileRules, moveRules } = fileValidator;
const router = Router();

router.use(requireAuth);

router.post("/", uploadFiles, fileController.upload);
router.get("/:id/move-targets", fileController.moveTargets);
router.get("/:id/download", fileController.download);
router.get("/:id/preview", fileController.preview);
router.get("/:id", fileController.show);
router.patch("/:id", fileRules, validate, fileController.rename);
router.post("/:id/move", moveRules, validate, fileController.move);
router.delete("/:id", fileController.remove);

export default router;
