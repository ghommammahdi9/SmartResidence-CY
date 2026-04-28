import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import RegistrationRequest from "../models/registrationRequest.model.js";
import ApprovedMember from "../models/approvedMember.model.js";
import AccessLog from "../models/accessLog.model.js";
import { awardPointsAndProgress } from "../lib/gamification.js";
import { logAction } from "../lib/logging.js";
import {
	buildDemoVerificationResponse,
	buildVerificationChallenge,
	getVerificationResendCooldownMs,
	normalizeEmail,
	sendVerificationCode,
} from "../lib/verification.js";

const generateTokens = (userId) => {
	const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: "15m",
	});

	const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
		expiresIn: "7d",
	});

	return { accessToken, refreshToken };
};

const setCookies = (res, accessToken, refreshToken) => {
	res.cookie("accessToken", accessToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
		maxAge: 15 * 60 * 1000,
	});
	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
		maxAge: 7 * 24 * 60 * 60 * 1000,
	});
};

const calculateAge = (birthDate) => {
	if (!birthDate) return undefined;
	const now = new Date();
	const birth = new Date(birthDate);
	let age = now.getFullYear() - birth.getFullYear();
	const monthDelta = now.getMonth() - birth.getMonth();
	if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < birth.getDate())) {
		age -= 1;
	}
	return age;
};

const sendVerificationForRequest = async (request) => {
	const delivery = await sendVerificationCode({
		email: request.email,
		firstName: request.firstName,
		code: request.verificationCode,
		expiresAt: request.codeExpiresAt,
	});

	return {
		delivery,
		demoVerification:
			delivery.mode === "demo"
				? buildDemoVerificationResponse({
					email: request.email,
					code: request.verificationCode,
					token: request.emailVerificationToken,
					expiresAt: request.codeExpiresAt,
				})
				: null,
	};
};

const buildSignupSuccessResponse = ({ request, delivery, demoVerification }) => ({
	success: true,
	message:
		delivery.mode === "smtp"
			? "Registration request created. Please check your email for the verification code."
			: delivery.mode === "smtp_error"
				? "Account created. Email could not be sent. Check server console for verification code (demo mode)."
				: "Registration request created. Please check your email for the verification code.",
	requiresVerification: true,
	email: request.email,
	demoCode: process.env.NODE_ENV === "development" && delivery.mode !== "smtp" ? request.verificationCode : undefined,
	demoVerification,
	verificationDelivery: delivery.mode,
	verificationDeliveryMessage: delivery.message,
});

export const signup = async (req, res) => {
	const {
		username,
		email,
		password,
		firstName,
		lastName,
		dateOfBirth,
		birthDate,
		gender,
		memberType,
		residenceMemberId,
	} = req.body;

	try {
		const normalizedEmail = normalizeEmail(email);
		const resolvedBirthDate = dateOfBirth || birthDate || null;

		if (!username || !normalizedEmail || !password || !firstName || !lastName) {
			return res.status(400).json({ success: false, message: "Missing required signup fields." });
		}

		const existingUser = await User.findOne({ email: normalizedEmail });
		if (existingUser) {
			return res.status(400).json({ success: false, message: "Account already exists" });
		}

		const approvedMember = await ApprovedMember.findOne({
			residenceMemberId: (residenceMemberId || "").trim(),
			isActive: true,
		});

		if (!approvedMember) {
			return res.status(400).json({
				success: false,
				message: "Ce numero de membre n'est pas reconnu. Seuls les membres de la residence peuvent s'inscrire.",
			});
		}

		const existingRequest = await RegistrationRequest.findOne({
			email: normalizedEmail,
			status: { $in: ["pending_email", "pending_admin"] },
		});

		const verificationChallenge = buildVerificationChallenge();
		const passwordHash = await bcrypt.hash(password, 10);
		const requestPayload = {
			username,
			email: normalizedEmail,
			password: passwordHash,
			firstName,
			lastName,
			dateOfBirth: resolvedBirthDate,
			birthDate: resolvedBirthDate,
			gender: gender || "Autre",
			memberType: memberType || approvedMember.memberType || "resident",
			residenceMemberId: (residenceMemberId || "").trim(),
			verificationCode: verificationChallenge.code,
			emailVerificationToken: verificationChallenge.token,
			codeExpiresAt: verificationChallenge.expiresAt,
			lastCodeSentAt: new Date(),
			rejectionReason: "",
			notes: "",
		};

		let request;
		if (existingRequest) {
			if (existingRequest.status === "pending_admin") {
				return res.status(400).json({
					success: false,
					message: "Your registration request is already awaiting administrator approval.",
				});
			}

			Object.assign(existingRequest, {
				...requestPayload,
				status: "pending_email",
				reviewedBy: null,
				reviewedAt: null,
			});
			request = await existingRequest.save();
		} else {
			request = await RegistrationRequest.create({
				...requestPayload,
				status: "pending_email",
			});
		}

		const { delivery, demoVerification } = await sendVerificationForRequest(request);

		await logAction({
			userId: null,
			actionType: existingRequest ? "registration_request_updated" : "registration_requested",
			targetType: "RegistrationRequest",
			targetId: request._id,
			metadata: { email: request.email, username: request.username, deliveryMode: delivery.mode },
		});

		if (delivery.mode === "smtp_error") {
			console.log(`DEMO FALLBACK - Verification code for ${request.email}: ${request.verificationCode}`);
			console.error("[SmartResidence CY][Signup Verification Delivery Failed]", {
				email: request.email,
				message: delivery.message,
				error: delivery.error,
				errorCode: delivery.errorCode,
				errorResponse: delivery.errorResponse,
			});
		}

		return res.status(201).json(buildSignupSuccessResponse({ request, delivery, demoVerification }));
	} catch (error) {
		console.error("Error in signup controller", {
			message: error.message,
			code: error.code,
			response: error.response,
			fullError: error,
		});
		return res.status(500).json({ success: false, message: error.message });
	}
};

export const login = async (req, res) => {
	try {
		const email = normalizeEmail(req.body.email);
		const { password } = req.body;
		const user = await User.findOne({ email });

		if (!user) {
			const request = await RegistrationRequest.findOne({ email });
			if (request?.status === "pending_email") {
				return res.status(403).json({
					success: false,
					message: "Please verify your email first.",
					needsVerification: true,
					email,
				});
			}
			if (request?.status === "pending_admin") {
				return res.status(403).json({
					success: false,
					message: "Your email is verified. Your account is awaiting administrator approval.",
				});
			}
			if (request?.status === "rejected") {
				return res.status(403).json({
					success: false,
					message: "Your registration request has been rejected.",
				});
			}
			return res.status(401).json({ success: false, message: "Invalid email or password" });
		}

		if (!(await user.comparePassword(password))) {
			return res.status(401).json({ success: false, message: "Invalid email or password" });
		}

		if (!user.emailVerified) {
			return res.status(403).json({ success: false, message: "Please verify your email first.", needsVerification: true, email });
		}

		if (user.approvalStatus !== "approved") {
			return res.status(403).json({ success: false, message: "Your account is awaiting administrator approval." });
		}

		const { accessToken, refreshToken } = generateTokens(user._id);
		setCookies(res, accessToken, refreshToken);
		user.lastLoginAt = new Date();
		await awardPointsAndProgress(user, 0.25, { incrementAccess: true });
		await user.save();
		await AccessLog.create({
			user: user._id,
			accessType: "login",
			route: "/api/auth/login",
			metadata: { userType: user.userType, level: user.level },
		});

		return res.json({ success: true, user: user.toSafeObject() });
	} catch (error) {
		console.error("Error in login controller", error);
		return res.status(500).json({ success: false, message: error.message });
	}
};

export const logout = async (req, res) => {
	try {
		res.clearCookie("accessToken");
		res.clearCookie("refreshToken");
		return res.json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		return res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const refreshToken = async (req, res) => {
	try {
		const refreshTokenValue = req.cookies.refreshToken;
		if (!refreshTokenValue) {
			return res.status(401).json({ message: "No refresh token provided" });
		}

		const decoded = jwt.verify(refreshTokenValue, process.env.REFRESH_TOKEN_SECRET);
		const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

		res.cookie("accessToken", accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
			maxAge: 15 * 60 * 1000,
		});

		return res.json({ message: "Token refreshed successfully" });
	} catch (error) {
		console.log("Error in refreshToken controller", error.message);
		res.clearCookie("accessToken");
		res.clearCookie("refreshToken");
		return res.status(401).json({ message: "Invalid refresh token" });
	}
};

export const getProfile = async (req, res) => {
	try {
		return res.json({ user: req.user.toSafeObject() });
	} catch (error) {
		return res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const verifyEmail = async (req, res) => {
	try {
		const token = req.query.token || req.body.token;
		if (!token) {
			return res.status(400).json({ success: false, message: "Verification token is required." });
		}

		const request = await RegistrationRequest.findOne({
			emailVerificationToken: token,
			status: "pending_email",
			codeExpiresAt: { $gt: new Date() },
		});

		if (!request) {
			return res.status(400).json({ success: false, message: "Verification token is invalid or expired." });
		}

		request.status = "pending_admin";
		request.verificationCode = null;
		request.emailVerificationToken = null;
		request.codeExpiresAt = null;
		await request.save();

		await logAction({
			userId: null,
			actionType: "registration_email_verified",
			targetType: "RegistrationRequest",
			targetId: request._id,
			metadata: { email: request.email, method: "token" },
		});

		return res.json({
			success: true,
			message:
				"Email verified successfully. Your account is now awaiting administrator approval. You will be notified when your account is activated.",
		});
	} catch (error) {
		return res.status(500).json({ success: false, message: "Server error", error: error.message });
	}
};

export const verifyEmailCode = async (req, res) => {
	try {
		const email = normalizeEmail(req.body.email);
		const code = String(req.body.code || "").trim();

		if (!email || !code) {
			return res.status(400).json({ success: false, message: "Email and verification code are required." });
		}

		const request = await RegistrationRequest.findOne({ email, status: "pending_email" });
		if (!request) {
			return res.status(404).json({ success: false, message: "No pending registration found for this email" });
		}

		if (!request.codeExpiresAt || request.codeExpiresAt <= new Date()) {
			return res.status(400).json({ success: false, message: "Verification code has expired. Please request a new one." });
		}

		if (String(request.verificationCode) !== code) {
			return res.status(400).json({ success: false, message: "Invalid verification code" });
		}

		request.status = "pending_admin";
		request.verificationCode = null;
		request.emailVerificationToken = null;
		request.codeExpiresAt = null;
		await request.save();

		await logAction({
			userId: null,
			actionType: "registration_email_verified",
			targetType: "RegistrationRequest",
			targetId: request._id,
			metadata: { email: request.email, method: "code" },
		});

		return res.json({
			success: true,
			message:
				"Email verified successfully. Your account is now awaiting administrator approval. You will be notified when your account is activated.",
		});
	} catch (error) {
		return res.status(500).json({ success: false, message: "Server error", error: error.message });
	}
};

export const resendVerificationCode = async (req, res) => {
	try {
		const email = normalizeEmail(req.body.email);
		if (!email) {
			return res.status(400).json({ success: false, message: "Email is required to resend the verification code." });
		}

		const request = await RegistrationRequest.findOne({ email, status: "pending_email" });
		if (!request) {
			return res.status(404).json({ success: false, message: "No pending registration found for this email" });
		}

		const cooldownMs = getVerificationResendCooldownMs();
		if (request.lastCodeSentAt && Date.now() - new Date(request.lastCodeSentAt).getTime() < cooldownMs) {
			const remainingSeconds = Math.ceil((cooldownMs - (Date.now() - new Date(request.lastCodeSentAt).getTime())) / 1000);
			return res.status(429).json({
				success: false,
				message: "Please wait before requesting a new code",
				retryAfter: remainingSeconds,
			});
		}

		const verificationChallenge = buildVerificationChallenge();
		request.verificationCode = verificationChallenge.code;
		request.emailVerificationToken = verificationChallenge.token;
		request.codeExpiresAt = verificationChallenge.expiresAt;
		request.lastCodeSentAt = new Date();
		await request.save();

		const { delivery, demoVerification } = await sendVerificationForRequest(request);

		if (delivery.mode === "smtp_error") {
			console.log(`DEMO FALLBACK - Verification code for ${request.email}: ${request.verificationCode}`);
			console.error("[SmartResidence CY][Resend Verification Delivery Failed]", {
				email: request.email,
				message: delivery.message,
				error: delivery.error,
				errorCode: delivery.errorCode,
				errorResponse: delivery.errorResponse,
			});
		}

		return res.json({
			success: true,
			message:
				delivery.mode === "smtp"
					? "A new verification code has been sent to the email address."
					: delivery.mode === "smtp_error"
						? "Account created. Email could not be sent. Check server console for verification code (demo mode)."
						: "Registration request created. Please check your email for the verification code.",
			email: request.email,
			demoCode: process.env.NODE_ENV === "development" && delivery.mode !== "smtp" ? request.verificationCode : undefined,
			demoVerification,
			verificationDelivery: delivery.mode,
			verificationDeliveryMessage: delivery.message,
		});
	} catch (error) {
		console.error("[SmartResidence CY][Resend Verification Error]", {
			message: error.message,
			code: error.code,
			response: error.response,
			fullError: error,
		});
		return res.status(500).json({ success: false, message: "Server error", error: error.message });
	}
};
