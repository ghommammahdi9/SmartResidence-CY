import Reservation from "../models/reservation.model.js";
import { logAction } from "../lib/logging.js";

const SERVICE_LABELS = {
	study_room: "Salle d'etude",
	laundry: "Laverie",
};

const isValidTime = (value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(String(value || ""));

const toDateOnly = (value) => {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return null;
	date.setHours(0, 0, 0, 0);
	return date;
};

const isPastDate = (date) => {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	return date < today;
};

const findConflictingReservation = ({ serviceType, date, startTime, endTime }) =>
	Reservation.findOne({
		serviceType,
		date,
		status: { $in: ["pending", "confirmed"] },
		startTime: { $lt: endTime },
		endTime: { $gt: startTime },
	});

const validateReservationSlot = ({ serviceType, date, startTime, endTime }) => {
	const reservationDate = toDateOnly(date);

	if (!SERVICE_LABELS[serviceType]) {
		return { error: { status: 400, message: "Type de reservation invalide." } };
	}
	if (!reservationDate) {
		return { error: { status: 400, message: "Date de reservation invalide." } };
	}
	if (isPastDate(reservationDate)) {
		return { error: { status: 400, message: "La date de reservation ne peut pas etre dans le passe." } };
	}
	if (!isValidTime(startTime) || !isValidTime(endTime) || startTime >= endTime) {
		return { error: { status: 400, message: "Creneau horaire invalide." } };
	}

	return { reservationDate };
};

export const getMyReservations = async (req, res) => {
	try {
		const reservations = await Reservation.find({ user: req.user._id }).sort({ date: -1, startTime: -1 });
		return res.json({ reservations });
	} catch (error) {
		return res.status(500).json({ message: "Impossible de charger les reservations.", error: error.message });
	}
};

export const createReservation = async (req, res) => {
	try {
		const { serviceType, date, startTime, endTime, notes } = req.body;
		const { reservationDate, error } = validateReservationSlot({ serviceType, date, startTime, endTime });

		if (error) {
			return res.status(error.status).json({ message: error.message });
		}

		const conflict = await findConflictingReservation({ serviceType, date: reservationDate, startTime, endTime });
		if (conflict) {
			return res.status(409).json({ message: "Ce créneau est déjà réservé. Veuillez choisir un autre horaire." });
		}

		const reservation = await Reservation.create({
			user: req.user._id,
			serviceType,
			date: reservationDate,
			startTime,
			endTime,
			status: "confirmed",
			notes: notes || "",
		});

		await logAction({
			userId: req.user._id,
			actionType: "reservation_created",
			targetType: "Reservation",
			targetId: reservation._id,
			metadata: { serviceType, date: reservationDate, startTime, endTime },
		});

		return res.status(201).json({ reservation, message: `${SERVICE_LABELS[serviceType]} reservee.` });
	} catch (error) {
		return res.status(500).json({ message: "Impossible de creer la reservation.", error: error.message });
	}
};

export const checkAvailability = async (req, res) => {
	try {
		const { serviceType, date, startTime, endTime } = req.query;
		const { reservationDate, error } = validateReservationSlot({ serviceType, date, startTime, endTime });

		if (error) {
			return res.status(error.status).json({ available: false, message: error.message });
		}

		const conflict = await findConflictingReservation({ serviceType, date: reservationDate, startTime, endTime });
		if (conflict) {
			return res.status(409).json({ available: false, message: "Ce créneau est déjà réservé. Veuillez choisir un autre horaire." });
		}

		return res.json({ available: true });
	} catch (error) {
		return res.status(500).json({ available: false, message: "Impossible de verifier la disponibilite.", error: error.message });
	}
};

export const cancelReservation = async (req, res) => {
	try {
		const reservation = await Reservation.findOne({ _id: req.params.id, user: req.user._id });
		if (!reservation) {
			return res.status(404).json({ message: "Reservation introuvable." });
		}
		if (reservation.status === "cancelled") {
			return res.json({ reservation, message: "Reservation deja annulee." });
		}

		reservation.status = "cancelled";
		await reservation.save();

		await logAction({
			userId: req.user._id,
			actionType: "reservation_cancelled",
			targetType: "Reservation",
			targetId: reservation._id,
			metadata: { serviceType: reservation.serviceType },
		});

		return res.json({ reservation, message: "Reservation annulee." });
	} catch (error) {
		return res.status(500).json({ message: "Impossible d'annuler la reservation.", error: error.message });
	}
};

export const getAllReservations = async (req, res) => {
	try {
		const reservations = await Reservation.find({})
			.populate("user", "firstName lastName email userType level")
			.sort({ date: -1, startTime: -1 });
		return res.json({ reservations });
	} catch (error) {
		return res.status(500).json({ message: "Impossible de charger les reservations.", error: error.message });
	}
};
