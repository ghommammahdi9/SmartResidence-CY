import mongoose from "mongoose";

const deviceCategorySchema = new mongoose.Schema(
	{
		name: { type: String, required: true, unique: true, trim: true },
		description: { type: String, default: "" },
	},
	{ timestamps: true }
);

const DeviceCategory = mongoose.model("DeviceCategory", deviceCategorySchema);

export default DeviceCategory;
