import mongoose from "mongoose";

const accessLogSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
		accessType: { type: String, required: true },
		route: { type: String, required: true },
		metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
		createdAt: { type: Date, default: Date.now },
	},
	{ timestamps: false }
);

const AccessLog = mongoose.model("AccessLog", accessLogSchema);

export default AccessLog;
