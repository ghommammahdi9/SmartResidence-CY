import mongoose from "mongoose";

const maintenanceRequestSchema = new mongoose.Schema(
	{
		requester: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		device: { type: mongoose.Schema.Types.ObjectId, ref: "ConnectedDevice", default: null },
		zone: { type: mongoose.Schema.Types.ObjectId, ref: "Zone", default: null },
		type: { type: String, enum: ["maintenance", "deletion"], required: true },
		category: {
			type: String,
			enum: ["Plomberie", "Electricite", "Chauffage", "Serrure", "Reseau", "Proprete", "Autre"],
			default: "Autre",
		},
		reason: { type: String, required: true },
		priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
		photo: { type: String, default: "" },
		status: { type: String, enum: ["pending", "in_progress", "completed", "approved", "rejected"], default: "pending" },
		reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
	},
	{ timestamps: true }
);

const MaintenanceRequest = mongoose.model("MaintenanceRequest", maintenanceRequestSchema);

export default MaintenanceRequest;
