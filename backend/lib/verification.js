import crypto from "crypto";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const DEFAULT_CODE_TTL_MINUTES = 15;
const DEFAULT_RESEND_COOLDOWN_SECONDS = 60;
let cachedTransporter = null;
let transporterVerified = false;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env"), override: false });

export const getVerificationCodeTtlMs = () => {
	const ttlMinutes = Number(process.env.EMAIL_VERIFICATION_CODE_TTL_MINUTES || DEFAULT_CODE_TTL_MINUTES);
	return ttlMinutes * 60 * 1000;
};

export const getVerificationResendCooldownMs = () => {
	const cooldownSeconds = Number(process.env.EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS || DEFAULT_RESEND_COOLDOWN_SECONDS);
	return cooldownSeconds * 1000;
};

export const isSmtpConfigured = () =>
	Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_FROM);

export const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

export const generateVerificationCode = () => Math.floor(100000 + Math.random() * 900000).toString();

export const generateVerificationToken = () => crypto.randomBytes(20).toString("hex");

export const buildVerificationChallenge = () => {
	const code = generateVerificationCode();
	const token = generateVerificationToken();
	const expiresAt = new Date(Date.now() + getVerificationCodeTtlMs());

	return {
		code,
		token,
		expiresAt,
	};
};

export const buildDemoVerificationResponse = ({ email, code, token, expiresAt }) => ({
	email,
	code,
	expiresAt,
	verifyUrl: `/verify-email?token=${token}&email=${encodeURIComponent(email)}`,
});

const getTransporter = async () => {
	if (cachedTransporter) {
		return cachedTransporter;
	}

	const nodemailer = await import("nodemailer");
	cachedTransporter = nodemailer.default.createTransport({
		host: process.env.SMTP_HOST,
		port: Number(process.env.SMTP_PORT),
		secure: Number(process.env.SMTP_PORT) === 465 ? true : false,
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASS,
		},
	});

	return cachedTransporter;
};

const verifyTransporter = async () => {
	if (transporterVerified) {
		return;
	}

	const transporter = await getTransporter();
	await transporter.verify();
	transporterVerified = true;
};

const buildVerificationEmail = ({ firstName, code, expiresAt }) => ({
	subject: "SmartResidence CY - Code de verification",
	text: `Bonjour ${firstName || "membre"},\n\nVotre code de verification SmartResidence CY est : ${code}\n\nCe code expire le ${expiresAt.toLocaleString(
		"fr-FR"
	)}.\n\nSaisissez ce code dans la page de verification pour confirmer votre adresse email.\n\nEquipe SmartResidence CY`,
	html: `
		<div style="font-family: Arial, sans-serif; background:#f4f7fb; padding:24px; color:#0f172a;">
			<div style="max-width:640px; margin:0 auto; background:#ffffff; border-radius:20px; overflow:hidden; border:1px solid #dbe4f0;">
				<div style="padding:28px; background:linear-gradient(135deg,#0f172a,#134e4a); color:#ffffff;">
					<p style="margin:0; font-size:12px; letter-spacing:0.28em; text-transform:uppercase; opacity:0.8;">SmartResidence CY</p>
					<h1 style="margin:12px 0 0; font-size:28px; line-height:1.2;">Verification de votre adresse email</h1>
				</div>
				<div style="padding:28px;">
					<p style="margin:0 0 16px; font-size:16px;">Bonjour ${firstName || "membre"},</p>
					<p style="margin:0 0 20px; font-size:15px; line-height:1.6;">
						Votre code de verification SmartResidence CY a ete genere. Saisissez-le dans la page de verification pour activer votre compte.
					</p>
					<div style="margin:0 0 20px; padding:20px; background:#ecfdf5; border:1px solid #a7f3d0; border-radius:16px; text-align:center;">
						<p style="margin:0; font-size:12px; letter-spacing:0.24em; text-transform:uppercase; color:#065f46;">Code de verification</p>
						<p style="margin:12px 0 0; font-size:32px; font-weight:700; letter-spacing:0.32em; color:#022c22;">${code}</p>
					</div>
					<p style="margin:0 0 8px; font-size:14px; color:#334155;">
						Expiration : <strong>${expiresAt.toLocaleString("fr-FR")}</strong>
					</p>
					<p style="margin:0; font-size:14px; line-height:1.6; color:#475569;">
						Une fois l email verifie, votre compte restera en attente de validation par l administrateur de la residence.
					</p>
				</div>
			</div>
		</div>
	`,
});

export const sendVerificationCode = async ({ email, firstName, code, expiresAt }) => {
	if (!isSmtpConfigured()) {
		console.log(`[SmartResidence CY][Demo Verification] email=${email} code=${code} expiresAt=${expiresAt.toISOString()}`);
		return { mode: "demo", sent: false, message: "SMTP is not configured. Demo verification remains active." };
	}

	try {
		await verifyTransporter();
		const transporter = await getTransporter();
		const message = buildVerificationEmail({ firstName, code, expiresAt });

		await transporter.sendMail({
			from: process.env.SMTP_FROM,
			to: email,
			subject: message.subject,
			text: message.text,
			html: message.html,
		});

		return { mode: "smtp", sent: true, message: "A verification code has been sent to the email address." };
	} catch (error) {
		console.error("[SmartResidence CY][SMTP Verification Error]", {
			email,
			message: error.message,
			code: error.code,
			response: error.response,
			responseCode: error.responseCode,
			command: error.command,
			fullError: error,
		});
		return {
			mode: "smtp_error",
			sent: false,
			message: "The account was created, but the verification email could not be sent. Please check the SMTP configuration and use resend.",
			error: error.message,
			errorCode: error.code || null,
			errorResponse: error.response || null,
		};
	}
};
