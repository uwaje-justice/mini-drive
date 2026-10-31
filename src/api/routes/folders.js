import { Router } from "express";
import requireAuth from "../middleware/require-auth.js";
import validate from "../middleware/validate.js";
import folderController from "../controllers/folder-controller.js";
import shareController from "../controllers/share-controller.js";
import folderValidator from "../../validators/folder-validator.js";
import shareValidator from "../../validators/share-validator.js";

const { folderRules, moveRules } = folderValidator;
const { shareRules } = shareValidator;
const router = Router();

router.use(requireAuth);

router.post("/", folderRules, validate, folderController.create);
router.get("/:id/move-targets", folderController.moveTargets);
router.get("/:id/shares", shareController.index);
router.post(
  "/:id/shares",
  shareRules,
  validate,
  shareController.create,
);
router.delete("/:id/shares/:shareId", shareController.revoke);
router.get("/:id", folderController.show);
router.patch("/:id", folderRules, validate, folderController.rename);
router.post("/:id/move", moveRules, validate, folderController.move);
router.delete("/:id", folderController.remove);

export default router;
