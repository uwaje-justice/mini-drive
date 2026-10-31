import { Router } from "express";
import requireAuth from "../middleware/require-auth.js";
import uploadFiles from "../middleware/upload.js";
import validate from "../middleware/validate.js";
import fileValidator from "../validators/file-validator.js";
import { csrfProtection } from "../middleware/csrf.js";
import fileController from "../controllers/file-controller.js";

const { fileRules, moveRules } = fileValidator;
const router = Router();

router.use(requireAuth);
router.post("/upload", uploadFiles, csrfProtection, fileController.upload);
router.get("/:id", fileController.show);
router.get("/:id/download", fileController.download);
router.get("/:id/preview", fileController.preview);
router.get("/:id/edit", fileController.editForm);
router.post(
  "/:id/edit",
  fileRules,
  validate("files/edit", fileController.loadEditPage),
  fileController.rename,
);
router.post(
  "/:id/move",
  moveRules,
  validate("files/edit", fileController.loadEditPage),
  fileController.move,
);
router.post("/:id/delete", fileController.remove);

export default router;
