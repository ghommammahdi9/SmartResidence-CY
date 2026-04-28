import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		serviceType: {
			type: String,
			enum: ["study_room", "laundry"],
			required: true,
		},
		date: { type: Date, required: true },
		startTime: { type: String, required: true },
		endTime: { type: String, required: true },
		status: {
			type: String,
			enum: ["pending", "confirmed", "cancelled"],
			default: "confirmed",
		},
		notes: { type: String, trim: true, default: "" },
	},
	{ timestamps: true }
);

reservationSchema.index({ user: 1, date: -1 });
reservationSchema.index({ serviceType: 1, date: 1, startTime: 1 });

const Reservation = mongoose.model("Reservation", reservationSchema);

export default Reservation;
