import { Router } from "express";
import requireAuth from "../middleware/require-auth.js";
import validate from "../middleware/validate.js";
import folderValidator from "../validators/folder-validator.js";
import folderController from "../controllers/folder-controller.js";

const { folderRules } = folderValidator;
const router = Router();

router.use(requireAuth);

router.get("/", folderController.index);
router.get("/new", folderController.newForm);
router.post("/", folderRules, validate("folders/new"), folderController.create);
router.get("/:id", folderController.show);
router.get("/:id/edit", folderController.editForm);
router.post(
  "/:id/edit",
  folderRules,
  validate("folders/edit"),
  folderController.update,
);
router.post("/:id/delete", folderController.remove);

export default router;
