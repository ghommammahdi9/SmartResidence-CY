import mongoose from "mongoose";

const serviceCategorySchema = new mongoose.Schema(
	{
		name: { type: String, required: true, unique: true, trim: true },
		description: { type: String, default: "" },
	},
	{ timestamps: true }
);

const ServiceCategory = mongoose.model("ServiceCategory", serviceCategorySchema);

export default ServiceCategory;
