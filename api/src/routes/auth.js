import { Router } from "express";

import authController from "../controllers/auth-controller.js";
import validate from "../middleware/validate.js";
import authValidator from "../validators/auth-validator.js";

const { loginRules, registerRules } = authValidator;
const router = Router();

router.get("/session", authController.session);
router.post("/register", registerRules, validate, authController.register);
router.post("/login", loginRules, validate, authController.login);
router.post("/logout", authController.logout);

export default router;
