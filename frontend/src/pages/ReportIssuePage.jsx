import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";
import SectionHeader from "../components/SectionHeader";
import StatePanel from "../components/StatePanel";

const categories = ["Plomberie", "Electricite", "Chauffage", "Serrure", "Reseau", "Proprete", "Autre"];
const priorities = [
	{ value: "low", label: "Basse" },
	{ value: "medium", label: "Moyenne" },
	{ value: "high", label: "Haute" },
];

const ReportIssuePage = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [zones, setZones] = useState([]);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [form, setForm] = useState({
		zone: "",
		category: "Autre",
		description: "",
		priority: "medium",
	});

	useEffect(() => {
		let active = true;

		axios
			.get("/public/overview")
			.then((res) => {
				if (!active) return;
				const nextZones = res.data.zones || [];
				const preselectedZone = location.state?.zoneId;
				setZones(nextZones);
				setForm((current) => ({
					...current,
					zone: current.zone || preselectedZone || nextZones[0]?._id || "",
				}));
				setLoading(false);
				setError("");
			})
			.catch((requestError) => {
				if (!active) return;
				setLoading(false);
				setError(requestError.response?.data?.message || "Impossible de charger les zones de la residence.");
			});

		return () => {
			active = false;
		};
	}, [location.state]);

	const selectedZone = useMemo(() => zones.find((zone) => zone._id === form.zone), [zones, form.zone]);

	const handleSubmit = async (event) => {
		event.preventDefault();
		setSubmitting(true);
		try {
			await axios.post("/maintenance", form);
			toast.success("Votre demande a ete envoyee");
			navigate("/dashboard");
		} catch (requestError) {
			toast.error(requestError.response?.data?.message || "Impossible d envoyer la demande.");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className='page-shell space-y-6'>
			<SectionHeader
				eyebrow='Maintenance'
				title='Signaler un probleme'
				description='Envoyez un signalement clair a l equipe SmartResidence CY pour qu une intervention soit prise en charge rapidement.'
			/>
			{loading && <StatePanel message='Chargement du formulaire de signalement...' />}
			{error && <StatePanel tone='error' title='Formulaire indisponible' message={error} />}
			{!loading && !error && (
				<div className='grid gap-6 xl:grid-cols-[0.95fr_1.05fr]'>
					<form className='panel p-6' onSubmit={handleSubmit}>
						<div className='grid gap-4'>
							<label className='text-sm'>
								<span className='mb-2 block text-slate-300'>Zone</span>
								<select className='field' value={form.zone} onChange={(event) => setForm({ ...form, zone: event.target.value })} required>
									{zones.map((zone) => (
										<option key={zone._id} value={zone._id}>
											{zone.name}
										</option>
									))}
								</select>
							</label>

							<label className='text-sm'>
								<span className='mb-2 block text-slate-300'>Categorie du probleme</span>
								<select className='field' value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
									{categories.map((category) => (
										<option key={category} value={category}>
											{category}
										</option>
									))}
								</select>
							</label>

							<label className='text-sm'>
								<span className='mb-2 block text-slate-300'>Description</span>
								<textarea
									className='field min-h-32'
									value={form.description}
									onChange={(event) => setForm({ ...form, description: event.target.value })}
									required
									minLength={10}
									placeholder='Expliquez le probleme observe, l emplacement precis et l impact pour les residents.'
								/>
							</label>

							<fieldset className='text-sm'>
								<legend className='mb-2 block text-slate-300'>Priorite</legend>
								<div className='grid gap-3 sm:grid-cols-3'>
									{priorities.map((priority) => (
										<label key={priority.value} className='glass-card flex cursor-pointer items-center gap-3 p-4'>
											<input
												type='radio'
												name='priority'
												value={priority.value}
												checked={form.priority === priority.value}
												onChange={(event) => setForm({ ...form, priority: event.target.value })}
											/>
											<span className='text-slate-200'>{priority.label}</span>
										</label>
									))}
								</div>
							</fieldset>

							<button className='btn-primary' type='submit' disabled={submitting}>
								{submitting ? "Envoi en cours..." : "Envoyer la demande"}
							</button>
						</div>
					</form>

					<div className='panel-strong p-6'>
						<p className='text-xs uppercase tracking-[0.3em] text-emerald-300'>Signalement resident</p>
						<h2 className='mt-3 text-2xl font-semibold text-white'>{selectedZone?.name || "Zone de residence"}</h2>
						<p className='mt-3 text-slate-300'>
							Utilisez ce formulaire pour prevenir l equipe de maintenance d un probleme dans votre zone ou dans un espace commun.
						</p>
						<div className='mt-5 grid gap-3'>
							<div className='glass-card p-4'>
								<p className='font-semibold text-white'>Conseil de redaction</p>
								<p className='mt-2 text-sm text-slate-300'>Precisez le symptome, l horaire d observation et si le probleme bloque un usage quotidien.</p>
							</div>
							<div className='glass-card p-4'>
								<p className='font-semibold text-white'>Zones prises en charge</p>
								<p className='mt-2 text-sm text-slate-300'>{zones.map((zone) => zone.name).join(" · ")}</p>
							</div>
							<div className='glass-card p-4'>
								<p className='font-semibold text-white'>Statut apres envoi</p>
								<p className='mt-2 text-sm text-slate-300'>Votre demande apparaitra ensuite dans votre suivi personnel avec les statuts pending, in_progress ou completed.</p>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ReportIssuePage;
