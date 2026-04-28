import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";
import SectionHeader from "../components/SectionHeader";
import StatePanel from "../components/StatePanel";
import StatusBadge from "../components/StatusBadge";
import HealthScoreBadge from "../components/HealthScoreBadge";
import energyIcon from "../assets/icons/energy.png";
import maintenanceIcon from "../assets/icons/maintenance.png";
import alertsIcon from "../assets/icons/alerts.png";

const initialForm = {
	deviceId: "",
	name: "",
	description: "",
	brand: "",
	type: "",
	category: "",
	zone: "",
	status: "active",
	connectivityType: "Wi-Fi",
	maintenanceStatus: "normal",
};

const GestionDashboardPage = () => {
	const [devices, setDevices] = useState([]);
	const [filters, setFilters] = useState({ zones: [], categories: [] });
	const [reports, setReports] = useState(null);
	const [form, setForm] = useState(initialForm);
	const [status, setStatus] = useState({ loading: true, error: "" });

	const load = async () => {
		try {
			const [devicesRes, reportsRes] = await Promise.all([axios.get("/devices"), axios.get("/reports/overview")]);
			setDevices(devicesRes.data.devices);
			setFilters(devicesRes.data.filters);
			setReports(reportsRes.data);
			setStatus({ loading: false, error: "" });
		} catch (error) {
			setStatus({ loading: false, error: error.response?.data?.message || "Impossible de charger la gestion." });
		}
	};

	useEffect(() => {
		load().catch(() => null);
	}, []);

	const createDevice = async (event) => {
		event.preventDefault();
		await axios.post("/devices", { ...form, currentValues: {}, targetValues: {} });
		toast.success("Device ajoute.");
		setForm(initialForm);
		await load();
	};

	const toggleDevice = async (id) => {
		await axios.patch(`/devices/${id}/toggle`);
		await load();
	};

	const requestDeletion = async (id) => {
		await axios.post(`/devices/${id}/request-deletion`, { reason: "Requested from gestion dashboard." });
		toast.success("Demande de suppression envoyee.");
		await load();
	};

	return (
		<div className='page-shell space-y-6'>
			<SectionHeader eyebrow='Gestion' title='Poste de pilotage des objets connectes' description='Ajout, activation, maintenance, supervision energetique et decisions de gestion sur les devices de la residence.' />
			{status.loading && <StatePanel message='Chargement de l’espace Gestion...' />}
			{status.error && <StatePanel tone='error' title='Gestion indisponible' message={status.error} />}
			{!status.loading && !status.error && (
				<>
					<div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
						<div className='panel p-5'><div className='flex items-start justify-between gap-3'><div><p className='text-xs uppercase tracking-[0.3em] text-slate-400'>Devices</p><p className='mt-4 text-3xl font-semibold text-white'>{devices.length}</p></div><img src={alertsIcon} alt='' className='h-11 w-11 rounded-2xl bg-white/10 p-2' /></div><p className='mt-3 text-sm text-slate-300'>Inventaire pilotable pour la residence.</p></div>
						<div className='panel p-5'><div className='flex items-start justify-between gap-3'><div><p className='text-xs uppercase tracking-[0.3em] text-slate-400'>Alertes maintenance</p><p className='mt-4 text-3xl font-semibold text-white'>{reports?.maintenanceAlerts || 0}</p></div><img src={maintenanceIcon} alt='' className='h-11 w-11 rounded-2xl bg-white/10 p-2' /></div><p className='mt-3 text-sm text-slate-300'>Equipements a inspecter ou optimiser.</p></div>
						<div className='panel p-5'><div className='flex items-start justify-between gap-3'><div><p className='text-xs uppercase tracking-[0.3em] text-slate-400'>Energie totale</p><p className='mt-4 text-3xl font-semibold text-white'>{reports?.totalEnergyConsumption?.toFixed(2) || 0}</p></div><img src={energyIcon} alt='' className='h-11 w-11 rounded-2xl bg-white/10 p-2' /></div><p className='mt-3 text-sm text-slate-300'>Lecture consolidee du parc connecte.</p></div>
						<div className='panel p-5'><div className='flex items-start justify-between gap-3'><div><p className='text-xs uppercase tracking-[0.3em] text-slate-400'>Inefficients</p><p className='mt-4 text-3xl font-semibold text-white'>{reports?.inefficientDevices?.length || 0}</p></div><img src={alertsIcon} alt='' className='h-11 w-11 rounded-2xl bg-white/10 p-2' /></div><p className='mt-3 text-sm text-slate-300'>Devices a prioriser dans la demo.</p></div>
					</div>

					<div className='grid gap-6 xl:grid-cols-[0.95fr_1.05fr]'>
						<form className='panel-strong p-6' onSubmit={createDevice}>
							<h2 className='text-2xl font-semibold text-white'>Ajouter un device</h2>
							<div className='mt-5 grid gap-4 md:grid-cols-2'>
								{[["deviceId", "Device ID"], ["name", "Nom"], ["brand", "Marque"], ["type", "Type"]].map(([key, label]) => (
									<label key={key} className='text-sm'>
										<span className='mb-2 block text-slate-300'>{label}</span>
										<input className='field' value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} required={key !== "brand"} />
									</label>
								))}
								<label className='text-sm md:col-span-2'><span className='mb-2 block text-slate-300'>Description</span><textarea className='field min-h-24' value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></label>
								<label className='text-sm'><span className='mb-2 block text-slate-300'>Categorie</span><select className='field' value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required><option value=''>Choisir</option>{filters.categories.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label>
								<label className='text-sm'><span className='mb-2 block text-slate-300'>Zone</span><select className='field' value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} required><option value=''>Choisir</option>{filters.zones.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label>
								<label className='text-sm'><span className='mb-2 block text-slate-300'>Connectivite</span><input className='field' value={form.connectivityType} onChange={(e) => setForm({ ...form, connectivityType: e.target.value })} /></label>
								<label className='text-sm'><span className='mb-2 block text-slate-300'>Maintenance</span><select className='field' value={form.maintenanceStatus} onChange={(e) => setForm({ ...form, maintenanceStatus: e.target.value })}><option value='normal'>normal</option><option value='inspection'>inspection</option><option value='maintenance_needed'>maintenance_needed</option><option value='critical'>critical</option></select></label>
							</div>
							<button className='btn-primary mt-6' type='submit'>Ajouter au systeme</button>
						</form>

						<div className='panel p-6'>
							<h2 className='text-2xl font-semibold text-white'>Signaux de gestion</h2>
							<div className='mt-5 space-y-3'>
								{reports?.inefficientDevices?.slice(0, 5).map((device) => (
									<div key={device._id} className='glass-card p-4'>
										<div className='flex items-center justify-between gap-3'>
											<p className='font-semibold text-white'>{device.name}</p>
											<HealthScoreBadge device={device} />
										</div>
										<p className='mt-2 text-sm text-slate-300'>{device.zone?.name}</p>
										<p className='mt-2 text-xs text-slate-500'>Energie device: {device.energyUsage} kWh</p>
									</div>
								))}
							</div>
						</div>
					</div>

					<div className='panel p-6'>
						<div className='flex flex-wrap items-center justify-between gap-3'>
							<h2 className='text-2xl font-semibold text-white'>Inventaire pilotable</h2>
							<p className='text-sm text-slate-400'>Actions utiles pour la demonstration du module Gestion</p>
						</div>
						<div className='mt-4 overflow-x-auto'>
							<table className='min-w-full text-left text-sm text-slate-300'>
								<thead className='text-slate-100'><tr><th className='pb-3 pr-4'>Nom</th><th className='pb-3 pr-4'>Zone</th><th className='pb-3 pr-4'>Statut</th><th className='pb-3 pr-4'>Maintenance</th><th className='pb-3 pr-4'>Sante</th><th className='pb-3 pr-4'>Actions</th></tr></thead>
								<tbody>
									{devices.map((device) => (
										<tr key={device._id} className='border-t border-slate-700/30'>
											<td className='py-3 pr-4 font-medium text-white'>{device.name}</td>
											<td className='py-3 pr-4'>{device.zone?.name}</td>
											<td className='py-3 pr-4'><StatusBadge value={device.status} /></td>
											<td className='py-3 pr-4'><StatusBadge value={device.maintenanceStatus} /></td>
											<td className='py-3 pr-4'><HealthScoreBadge device={device} /></td>
											<td className='py-3 pr-4'>
												<div className='flex flex-wrap gap-2'>
													<button className='btn-secondary px-3 py-2 text-xs' onClick={() => toggleDevice(device._id)} type='button'>Activer / desactiver</button>
													<button className='btn-secondary px-3 py-2 text-xs' onClick={() => requestDeletion(device._id)} type='button'>Demande suppression</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</>
			)}
		</div>
	);
};

export default GestionDashboardPage;
