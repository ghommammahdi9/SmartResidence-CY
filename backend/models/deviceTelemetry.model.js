import mongoose from "mongoose";

const deviceTelemetrySchema = new mongoose.Schema(
	{
		device: { type: mongoose.Schema.Types.ObjectId, ref: "ConnectedDevice", required: true },
		timestamp: { type: Date, default: Date.now },
		metrics: { type: mongoose.Schema.Types.Mixed, default: {} },
		energyUsage: { type: Number, default: 0 },
		waterUsage: { type: Number, default: 0 },
		statusSnapshot: { type: String, default: "active" },
	},
	{ timestamps: true }
);

const DeviceTelemetry = mongoose.model("DeviceTelemetry", deviceTelemetrySchema);

export default DeviceTelemetry;
