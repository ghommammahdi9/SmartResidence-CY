import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock, WashingMachine } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";
import SectionHeader from "../components/SectionHeader";
import StatePanel from "../components/StatePanel";
import StatusBadge from "../components/StatusBadge";

const serviceOptions = [
	{ value: "study_room", label: "Salle d'etude", helper: "Creneaux calmes pour travailler seul ou en groupe.", icon: CalendarDays },
	{ value: "laundry", label: "Laverie", helper: "Reservation d'un passage machine dans la laverie.", icon: WashingMachine },
];

const slots = [
	{ startTime: "08:00", endTime: "10:00" },
	{ startTime: "10:00", endTime: "12:00" },
	{ startTime: "14:00", endTime: "16:00" },
	{ startTime: "16:00", endTime: "18:00" },
	{ startTime: "18:00", endTime: "20:00" },
];

const todayIso = () => new Date().toISOString().slice(0, 10);

const formatReservationDate = (value) => {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "-";
	return date.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short" });
};

const ReservationsPage = () => {
	const [reservations, setReservations] = useState([]);
	const [status, setStatus] = useState({ loading: true, error: "" });
	const [submitting, setSubmitting] = useState(false);
	const [availability, setAvailability] = useState({ checking: false, status: "", message: "" });
	const [form, setForm] = useState({
		serviceType: "study_room",
		date: todayIso(),
		slot: "08:00-10:00",
		notes: "",
	});

	const selectedService = useMemo(
		() => serviceOptions.find((option) => option.value === form.serviceType) || serviceOptions[0],
		[form.serviceType]
	);
	const SelectedIcon = selectedService.icon;

	const load = async () => {
		try {
			const response = await axios.get("/reservations/my");
			setReservations(response.data.reservations || []);
			setStatus({ loading: false, error: "" });
		} catch (error) {
			setStatus({ loading: false, error: error.response?.data?.message || "Impossible de charger vos reservations." });
		}
	};

	useEffect(() => {
		load().catch(() => null);
	}, []);

	const submit = async (event) => {
		event.preventDefault();
		const [startTime, endTime] = form.slot.split("-");
		setSubmitting(true);
		setAvailability({ checking: false, status: "", message: "" });
		try {
			const response = await axios.post("/reservations", {
				serviceType: form.serviceType,
				date: form.date,
				startTime,
				endTime,
				notes: form.notes,
			});
			toast.success(response.data.message || "Reservation creee.");
			setForm((current) => ({ ...current, notes: "" }));
			await load();
		} catch (error) {
			const message = error.response?.status === 409
				? "Ce créneau est déjà réservé. Veuillez choisir un autre horaire."
				: error.response?.data?.message || "Reservation impossible.";
			setAvailability({ checking: false, status: "unavailable", message });
			toast.error(message);
		} finally {
			setSubmitting(false);
		}
	};

	const checkSlotAvailability = async () => {
		const [startTime, endTime] = form.slot.split("-");
		setAvailability({ checking: true, status: "", message: "" });
		try {
			await axios.get("/reservations/availability", {
				params: {
					serviceType: form.serviceType,
					date: form.date,
					startTime,
					endTime,
				},
			});
			setAvailability({ checking: false, status: "available", message: "Créneau disponible." });
		} catch (error) {
			const message = error.response?.status === 409
				? "Ce créneau est déjà réservé. Veuillez choisir un autre horaire."
				: error.response?.data?.message || "Disponibilite impossible a verifier.";
			setAvailability({ checking: false, status: "unavailable", message });
		}
	};

	const cancel = async (id) => {
		try {
			const response = await axios.patch(`/reservations/${id}/cancel`);
			toast.success(response.data.message || "Reservation annulee.");
			await load();
		} catch (error) {
			toast.error(error.response?.data?.message || "Annulation impossible.");
		}
	};

	return (
		<div className='page-shell space-y-6'>
			<SectionHeader
				eyebrow='Reservations'
				title='Reserver un espace resident'
				description="Salle d'etude et laverie sont reservables depuis votre espace SmartResidence CY."
			/>

			<div className='grid gap-6 xl:grid-cols-[0.9fr_1.1fr]'>
				<form className='panel-strong card-safe bg-grid p-6' onSubmit={submit}>
					<div className='flex min-w-0 items-start gap-3'>
						<div className='rounded-2xl bg-emerald-400/10 p-3 text-emerald-200'>
							<SelectedIcon size={22} />
						</div>
						<div className='min-w-0'>
							<p className='text-xs uppercase tracking-[0.28em] text-emerald-300'>Nouveau creneau</p>
							<h2 className='safe-text mt-2 text-2xl font-semibold text-white'>{selectedService.label}</h2>
							<p className='safe-text mt-2 text-sm text-slate-300'>{selectedService.helper}</p>
						</div>
					</div>

					<div className='mt-6 grid gap-4'>
						<label className='text-sm'>
							<span className='mb-2 block text-slate-300'>Type</span>
							<select className='field' value={form.serviceType} onChange={(event) => setForm({ ...form, serviceType: event.target.value })}>
								{serviceOptions.map((option) => (
									<option key={option.value} value={option.value}>{option.label}</option>
								))}
							</select>
						</label>
						<label className='text-sm'>
							<span className='mb-2 block text-slate-300'>Date</span>
							<input className='field' type='date' min={todayIso()} value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required />
						</label>
						<label className='text-sm'>
							<span className='mb-2 block text-slate-300'>Creneau</span>
							<select className='field' value={form.slot} onChange={(event) => setForm({ ...form, slot: event.target.value })}>
								{slots.map((slot) => (
									<option key={`${slot.startTime}-${slot.endTime}`} value={`${slot.startTime}-${slot.endTime}`}>
										{slot.startTime} - {slot.endTime}
									</option>
								))}
							</select>
						</label>
						<label className='text-sm'>
							<span className='mb-2 block text-slate-300'>Note optionnelle</span>
							<textarea className='field min-h-24' value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder='Ex: travail de groupe, machine fragile...' />
						</label>
					</div>

					<p className='mt-5 text-sm text-slate-300'>La disponibilité est vérifiée automatiquement avant confirmation.</p>
					{availability.message && (
						<p className={`mt-3 rounded-2xl border px-4 py-3 text-sm ${availability.status === "available" ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-100" : "border-rose-300/25 bg-rose-400/10 text-rose-100"}`}>
							{availability.message}
						</p>
					)}

					<div className='mt-6 flex flex-col gap-3 sm:flex-row'>
						<button className='btn-secondary flex-1' type='button' disabled={availability.checking || submitting} onClick={checkSlotAvailability}>
							{availability.checking ? "Verification..." : "Verifier disponibilite"}
						</button>
						<button className='btn-primary flex-1' type='submit' disabled={submitting}>
						{submitting ? "Reservation..." : "Confirmer la reservation"}
						</button>
					</div>
				</form>

				<div className='panel card-safe p-6'>
					<div className='flex flex-wrap items-center justify-between gap-3'>
						<div>
							<p className='text-xs uppercase tracking-[0.28em] text-slate-400'>Mes reservations</p>
							<h2 className='mt-2 text-2xl font-semibold text-white'>Planning personnel</h2>
						</div>
						<span className='status-pill bg-sky-400/10 text-sky-200'>{reservations.length} total</span>
					</div>

					{status.loading && <div className='mt-5'><StatePanel message='Chargement des reservations...' /></div>}
					{status.error && <div className='mt-5'><StatePanel tone='error' title='Reservations indisponibles' message={status.error} /></div>}
					{!status.loading && !status.error && reservations.length === 0 && (
						<div className='mt-5'><StatePanel message='Aucune reservation pour le moment.' /></div>
					)}

					<div className='mt-5 space-y-3'>
						{reservations.map((reservation) => {
							const service = serviceOptions.find((option) => option.value === reservation.serviceType) || serviceOptions[0];
							const isCancelled = reservation.status === "cancelled";
							return (
								<div key={reservation._id} className='glass-card card-safe p-4'>
									<div className='flex min-w-0 items-start justify-between gap-3'>
										<div className='min-w-0'>
											<p className='truncate-safe font-semibold text-white' title={service.label}>{service.label}</p>
											<p className='mt-2 flex items-center gap-2 text-sm text-slate-300'>
												<Clock size={15} />
												<span>{formatReservationDate(reservation.date)} · {reservation.startTime}-{reservation.endTime}</span>
											</p>
										</div>
										<StatusBadge value={reservation.status} />
									</div>
									{reservation.notes && <p className='safe-text mt-3 text-sm text-slate-400'>{reservation.notes}</p>}
									{!isCancelled && (
										<button className='btn-secondary mt-4 px-4 py-2 text-sm' type='button' onClick={() => cancel(reservation._id)}>
											Annuler
										</button>
									)}
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ReservationsPage;
