import { Router } from "express";
import requireAuth from "../middleware/require-auth.js";
import searchController from "../controllers/search-controller.js";

const router = Router();

router.use(requireAuth);
router.get("/", searchController.index);

export default router;
