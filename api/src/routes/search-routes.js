import { Router } from "express";

import searchController from "../controllers/search-controller.js";
import requireAuth from "../middleware/require-auth.js";

const router = Router();

router.use(requireAuth);
router.get("/", searchController.index);

export default router;
