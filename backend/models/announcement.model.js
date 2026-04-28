import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, trim: true },
		content: { type: String, required: true },
		category: { type: String, required: true },
		audience: { type: String, default: "all" },
		publishedAt: { type: Date, default: Date.now },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
		isPublic: { type: Boolean, default: true },
	},
	{ timestamps: true }
);

const Announcement = mongoose.model("Announcement", announcementSchema);

export default Announcement;
