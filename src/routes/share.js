import { Router } from "express";
import shareController from "../controllers/share-controller.js";

const router = Router();

router.use((req, res, next) => {
  res.set({
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer",
    "X-Robots-Tag": "noindex, nofollow",
    "X-Content-Type-Options": "nosniff",
  });

  next();
});

router.get("/:token", shareController.showPublicFolder);
router.get("/:token/folders/:folderId", shareController.showPublicFolder);
router.get("/:token/files/:fileId/download", shareController.downloadPublicFile);
router.get("/:token/files/:fileId/preview", shareController.previewPublicFile);

export default router;
