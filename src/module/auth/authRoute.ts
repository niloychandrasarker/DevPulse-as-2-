import { Router } from "express";
import { authController } from "./authController";

const router = Router();

router.post("/signup", authController.signUpController);
router.post("/login", authController.loginController);

export const authRoute = router;
