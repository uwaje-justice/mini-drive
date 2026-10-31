import { Router } from "express";
import requireAuth from "../middleware/require-auth.js";
import validate from "../middleware/validate.js";
import folderValidator from "../validators/folder-validator.js";
import shareValidator from "../validators/share-validator.js";
import folderController from "../controllers/folder-controller.js";
import shareController from "../controllers/share-controller.js";

const { folderRules, moveRules } = folderValidator;
const { shareRules } = shareValidator;
const router = Router();

router.use(requireAuth);

router.get("/", folderController.index);
router.get("/new", folderController.newForm);
router.post("/", folderRules, validate("folders/new"), folderController.create);
router.get("/:id", folderController.show);
router.get("/:id/share", shareController.show);
router.post(
  "/:id/share",
  shareRules,
  validate("folders/share", shareController.loadSharePage),
  shareController.create,
);
router.post("/:id/share/:shareId/revoke", shareController.revoke);
router.get("/:id/edit", folderController.editForm);
router.post(
  "/:id/edit",
  folderRules,
  validate("folders/edit", folderController.loadEditPage),
  folderController.update,
);
router.get("/:id/move", folderController.moveForm);
router.post(
  "/:id/move",
  moveRules,
  validate("folders/move", folderController.loadMovePage),
  folderController.move,
);
router.post("/:id/delete", folderController.remove);

export default router;
