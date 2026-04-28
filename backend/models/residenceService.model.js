import mongoose from "mongoose";

const residenceServiceSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		description: { type: String, required: true },
		category: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceCategory", required: true },
		zone: { type: mongoose.Schema.Types.ObjectId, ref: "Zone", required: true },
		availability: { type: String, enum: ["daily", "weekly", "on-demand"], default: "daily" },
		status: { type: String, enum: ["active", "limited", "maintenance"], default: "active" },
		usageStats: {
			requests: { type: Number, default: 0 },
			satisfaction: { type: Number, default: 0 },
		},
		isPublic: { type: Boolean, default: true },
	},
	{ timestamps: true }
);

const ResidenceService = mongoose.model("ResidenceService", residenceServiceSchema);

export default ResidenceService;
