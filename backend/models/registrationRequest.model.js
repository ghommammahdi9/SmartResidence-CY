import mongoose from "mongoose";

const registrationRequestSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		username: { type: String, required: true, trim: true },
		email: { type: String, required: true, trim: true, lowercase: true, unique: true },
		password: { type: String, required: true },
		firstName: { type: String, required: true, trim: true },
		lastName: { type: String, required: true, trim: true },
		dateOfBirth: { type: Date, default: null },
		birthDate: { type: Date, default: null },
		gender: {
			type: String,
			enum: ["Homme", "Femme", "Autre", "homme", "femme", "non specifie"],
			default: "Autre",
		},
		memberType: { type: String, default: "resident" },
		residenceMemberId: { type: String, default: "" },
		verificationCode: { type: String, default: null },
		emailVerificationToken: { type: String, default: null },
		codeExpiresAt: { type: Date, default: null },
		lastCodeSentAt: { type: Date, default: null },
		status: {
			type: String,
			enum: ["pending_email", "pending_admin", "approved", "rejected"],
			default: "pending_email",
		},
		rejectionReason: { type: String, default: "" },
		reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
		reviewedAt: { type: Date, default: null },
		notes: { type: String, default: "" },
	},
	{ timestamps: true }
);

const RegistrationRequest = mongoose.model("RegistrationRequest", registrationRequestSchema);

export default RegistrationRequest;
