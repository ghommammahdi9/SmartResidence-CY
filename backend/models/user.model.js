import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const publicProfileSchema = new mongoose.Schema(
	{
		bio: { type: String, default: "" },
		interests: [{ type: String }],
	},
	{ _id: false }
);

const userSchema = new mongoose.Schema(
	{
		username: { type: String, required: [true, "Username is required"], unique: true, trim: true },
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: {
			type: String,
			required: [true, "Password is required"],
			minlength: [6, "Password must be at least 6 characters long"],
		},
		firstName: { type: String, required: true, trim: true },
		lastName: { type: String, required: true, trim: true },
		birthDate: { type: Date },
		age: { type: Number, min: 0 },
		gender: { type: String, default: "non specifie" },
		memberType: { type: String, default: "resident" },
		photo: { type: String, default: "" },
		residenceMemberId: { type: String, trim: true, default: "" },
		isResidenceMember: { type: Boolean, default: true },
		emailVerified: { type: Boolean, default: false },
		emailVerificationToken: { type: String, default: null },
		emailVerificationExpiresAt: { type: Date, default: null },
		emailVerificationCodeHash: { type: String, default: null },
		emailVerificationLastSentAt: { type: Date, default: null },
		lastCodeSentAt: { type: Date, default: null },
		approvalStatus: {
			type: String,
			enum: ["pending", "approved", "rejected"],
			default: "pending",
		},
		userType: {
			type: String,
			enum: ["simple", "complexe", "administrateur"],
			default: "simple",
		},
		level: {
			type: String,
			enum: ["debutant", "intermediaire", "avance", "expert"],
			default: "debutant",
		},
		points: { type: Number, default: 0 },
		accessCount: { type: Number, default: 0 },
		actionCount: { type: Number, default: 0 },
		lastLoginAt: { type: Date, default: null },
		publicProfile: { type: publicProfileSchema, default: () => ({}) },
	},
	{
		timestamps: true,
	}
);

// Pre-save hook to hash password before saving to database
userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();
	if (typeof this.password === "string" && this.password.startsWith("$2")) return next();

	try {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		next(error);
	}
});

userSchema.methods.comparePassword = async function (password) {
	return bcrypt.compare(password, this.password);
};

userSchema.methods.toSafeObject = function () {
	return {
		_id: this._id,
		username: this.username,
		email: this.email,
		firstName: this.firstName,
		lastName: this.lastName,
		birthDate: this.birthDate,
		age: this.age,
		gender: this.gender,
		memberType: this.memberType,
		photo: this.photo,
		residenceMemberId: this.residenceMemberId,
		isResidenceMember: this.isResidenceMember,
		emailVerified: this.emailVerified,
		approvalStatus: this.approvalStatus,
		userType: this.userType,
		level: this.level,
		points: this.points,
		accessCount: this.accessCount,
		actionCount: this.actionCount,
		lastLoginAt: this.lastLoginAt,
		publicProfile: this.publicProfile,
		createdAt: this.createdAt,
		updatedAt: this.updatedAt,
	};
};

const User = mongoose.model("User", userSchema);

export default User;
