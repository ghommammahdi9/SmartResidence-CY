import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, ".env"), override: false });

const maskSecret = (value) => {
	if (!value) return "(missing)";
	const raw = String(value);
	if (raw.length <= 5) return "*****";
	return `${"*".repeat(Math.max(raw.length - 5, 5))}${raw.slice(-5)}`;
};

const printConfig = () => {
	console.log("[SMTP TEST] Effective configuration");
	console.log({
		SMTP_HOST: process.env.SMTP_HOST || "(missing)",
		SMTP_PORT: process.env.SMTP_PORT || "(missing)",
		SMTP_USER: process.env.SMTP_USER || "(missing)",
		SMTP_PASS: maskSecret(process.env.SMTP_PASS),
		SMTP_FROM: process.env.SMTP_FROM || "(missing)",
	});
};

const run = async () => {
	printConfig();

	try {
		const nodemailer = await import("nodemailer");
		const transporter = nodemailer.default.createTransport({
			host: process.env.SMTP_HOST,
			port: Number(process.env.SMTP_PORT),
			secure: false,
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS,
			},
		});

		console.log("[SMTP TEST] Running transporter.verify()...");
		await transporter.verify();
		console.log("[SMTP TEST] transporter.verify() succeeded.");

		console.log("[SMTP TEST] Sending test email to aldwineeb@gmail.com...");
		const result = await transporter.sendMail({
			from: process.env.SMTP_FROM,
			to: "aldwineeb@gmail.com",
			subject: "SmartResidence CY SMTP test",
			text: "This is a SmartResidence CY SMTP test email.",
			html: "<p>This is a <strong>SmartResidence CY</strong> SMTP test email.</p>",
		});

		console.log("[SMTP TEST] Test email sent successfully.");
		console.log(result);
	} catch (error) {
		console.error("[SMTP TEST] Failure", {
			message: error.message,
			code: error.code,
			response: error.response,
			responseCode: error.responseCode,
			command: error.command,
			fullError: error,
		});
		process.exitCode = 1;
	}
};

run();
