import mongoose from "mongoose";

const approvedMemberSchema = new mongoose.Schema(
	{
		residenceMemberId: { type: String, required: true, unique: true, trim: true },
		firstName: { type: String, required: true, trim: true },
		lastName: { type: String, required: true, trim: true },
		memberType: {
			type: String,
			enum: ["resident", "staff", "maintenance"],
			default: "resident",
		},
		roomNumber: { type: String, default: "" },
		isActive: { type: Boolean, default: true },
	},
	{ timestamps: true }
);

const ApprovedMember = mongoose.model("ApprovedMember", approvedMemberSchema);

export default ApprovedMember;
