import express from "express";
import {
	login,
	logout,
	signup,
	refreshToken,
	getProfile,
	verifyEmail,
	verifyEmailCode,
	resendVerificationCode,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.get("/verify-email", verifyEmail);
router.post("/verify-email", verifyEmail);
router.post("/verify-email-code", verifyEmailCode);
router.post("/resend-verification-code", resendVerificationCode);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/profile", protectRoute, getProfile);

export default router;
