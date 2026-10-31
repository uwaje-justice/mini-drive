import { Router } from "express";

import shareController from "../controllers/share-controller.js";

const router = Router();

router.use((req, res, next) => {
  res.set({
    "Referrer-Policy": "no-referrer",
    "X-Robots-Tag": "noindex, nofollow",
  });

  next();
});

router.get(
  "/:token/files/:fileId/download",
  shareController.downloadPublicFile,
);
router.get(
  "/:token/files/:fileId/preview",
  shareController.previewPublicFile,
);
router.get("/:token/folders/:folderId", shareController.showPublic);
router.get("/:token", shareController.showPublic);

export default router;
