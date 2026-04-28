import mongoose from "mongoose";

const globalSettingSchema = new mongoose.Schema(
	{
		key: { type: String, required: true, unique: true, trim: true },
		value: { type: mongoose.Schema.Types.Mixed, required: true },
		description: { type: String, default: "" },
	},
	{ timestamps: true }
);

const GlobalSetting = mongoose.model("GlobalSetting", globalSettingSchema);

export default GlobalSetting;
