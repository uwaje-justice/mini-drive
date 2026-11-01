import { Router } from "express";

import authController from "../controllers/auth-controller.js";
import requireAuth from "../middleware/require-auth.js";
import validate from "../middleware/validate.js";
import authValidator from "../validators/auth-validator.js";

const { emailChangeRules, loginRules, passwordChangeRules, registerRules } =
  authValidator;
const router = Router();

router.get("/session", authController.session);
router.post("/register", registerRules, validate, authController.register);
router.post("/login", loginRules, validate, authController.login);
router.post("/logout", authController.logout);
router.patch(
  "/email",
  requireAuth,
  emailChangeRules,
  validate,
  authController.email,
);
router.patch(
  "/password",
  requireAuth,
  passwordChangeRules,
  validate,
  authController.password,
);

export default router;
