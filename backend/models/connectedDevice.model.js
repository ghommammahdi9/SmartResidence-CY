import mongoose from "mongoose";

const connectedDeviceSchema = new mongoose.Schema(
	{
		deviceId: { type: String, required: true, unique: true, trim: true },
		name: { type: String, required: true, trim: true },
		description: { type: String, required: true },
		brand: { type: String, default: "" },
		model: { type: String, default: "" },
		type: { type: String, required: true },
		category: { type: mongoose.Schema.Types.ObjectId, ref: "DeviceCategory", required: true },
		zone: { type: mongoose.Schema.Types.ObjectId, ref: "Zone", required: true },
		status: { type: String, enum: ["active", "inactive", "alert", "offline"], default: "active" },
		connectivityType: { type: String, default: "Wi-Fi" },
		connectivitySignal: { type: Number, default: 100 },
		batteryLevel: { type: Number, default: 100 },
		firmwareVersion: { type: String, default: "" },
		installationDate: { type: Date, default: Date.now },
		currentValues: { type: mongoose.Schema.Types.Mixed, default: {} },
		targetValues: { type: mongoose.Schema.Types.Mixed, default: {} },
		lastInteraction: { type: Date, default: Date.now },
		energyUsage: { type: Number, default: 0 },
		waterUsage: { type: Number, default: 0 },
		maintenanceStatus: {
			type: String,
			enum: ["normal", "inspection", "maintenance_needed", "critical"],
			default: "normal",
		},
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
		deletionRequestStatus: {
			type: String,
			enum: ["none", "pending", "approved", "rejected"],
			default: "none",
		},
		isPublic: { type: Boolean, default: true },
	},
	{ timestamps: true }
);

const ConnectedDevice = mongoose.model("ConnectedDevice", connectedDeviceSchema);

export default ConnectedDevice;
