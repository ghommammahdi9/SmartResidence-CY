import mongoose from "mongoose";

const zoneSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, unique: true, trim: true },
		description: { type: String, required: true },
		type: { type: String, required: true },
		accessibility: { type: String, default: "standard" },
		status: { type: String, enum: ["active", "restricted", "maintenance"], default: "active" },
	},
	{ timestamps: true }
);

const Zone = mongoose.model("Zone", zoneSchema);

export default Zone;
