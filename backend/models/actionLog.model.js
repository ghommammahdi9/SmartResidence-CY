import mongoose from "mongoose";

const actionLogSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
		actionType: { type: String, required: true },
		targetType: { type: String, required: true },
		targetId: { type: String, default: "" },
		metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
		createdAt: { type: Date, default: Date.now },
	},
	{ timestamps: false }
);

const ActionLog = mongoose.model("ActionLog", actionLogSchema);

export default ActionLog;
