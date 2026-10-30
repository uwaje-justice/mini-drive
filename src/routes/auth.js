import { Router } from "express";
import authController from "../controllers/auth-controller.js";
import validate from "../middleware/validate.js";
import authValidator from "../validators/auth-validator.js";

const { loginRules, registerRules } = authValidator;
const router = Router();

router.get("/register", authController.showRegister);
router.post(
  "/register",
  registerRules,
  validate("auth/register"),
  authController.register,
);

router.get("/login", authController.showLogin);
router.post("/login", loginRules, validate("auth/login"), authController.login);

router.post("/logout", authController.logout);

export default router;
