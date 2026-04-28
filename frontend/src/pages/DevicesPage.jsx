import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../lib/axios";
import SectionHeader from "../components/SectionHeader";
import StatePanel from "../components/StatePanel";
import StatusBadge from "../components/StatusBadge";
import HealthScoreBadge from "../components/HealthScoreBadge";
import { computeDeviceHealth } from "../utils/deviceHealth";
import { useUserStore } from "../stores/useUserStore";
import { canAccessGestion, isAdmin } from "../utils/access";
import energyIcon from "../assets/icons/energy.png";
import securityIcon from "../assets/icons/security.png";
import maintenanceIcon from "../assets/icons/maintenance.png";

const DevicesPage = () => {
	const [data, setData] = useState({ devices: [], filters: { zones: [], categories: [] } });
	const [filters, setFilters] = useState({ search: "", zone: "", category: "", status: "", batteryLevel: "" });
	const [status, setStatus] = useState({ loading: true, error: "" });
	const { user } = useUserStore();

	const getAlertBadges = (device) => {
		const settings = data.settings || { batteryThreshold: 20, energyThreshold: 50, inactivityDays: 7 };
		const badges = [];
		if ((device.batteryLevel ?? 100) < settings.batteryThreshold) badges.push("Batterie faible");
		if ((device.energyUsage ?? 0) > settings.energyThreshold) badges.push("Surconsommation");
		const lastInteraction = device.lastInteraction ? new Date(device.lastInteraction) : null;
		if (lastInteraction) {
			const diffDays = (Date.now() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24);
			if (diffDays > settings.inactivityDays) badges.push("Inactif");
		}
		return badges;
	};

	const load = async (nextFilters = filters) => {
		try {
			const res = await axios.get("/devices", { params: nextFilters });
			setData(res.data);
			setStatus({ loading: false, error: "" });
		} catch (error) {
			setStatus({ loading: false, error: error.response?.data?.message || "Impossible de charger les devices." });
		}
	};

	useEffect(() => {
		load(filters);
		// Initial load only; filtering is handled by explicit input events.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleChange = async (event) => {
		const next = { ...filters, [event.target.name]: event.target.value };
		setFilters(next);
		await load(next);
	};

	return (
		<div className='page-shell space-y-6'>
			<div className='panel-strong bg-grid overflow-hidden p-8 sm:p-10'>
				<div className='grid gap-6 lg:grid-cols-[1.1fr_0.9fr]'>
					<div className='min-w-0'>
						<SectionHeader eyebrow='Visualisation' title='Objets connectes' description='Recherche authentifiee avec filtres visibles par zone, categorie et statut.' />
					</div>
					<div className='grid grid-cols-1 gap-4 sm:grid-cols-3 panel-grid-safe'>
						<div className='metric-tile card-safe'>
							<img alt='' className='h-10 w-10 shrink-0 rounded-2xl bg-slate-800/70 object-contain p-2' src={energyIcon} />
							<p className='text-sm text-slate-300'>Consommation suivie</p>
							<p className='metric-value text-2xl font-semibold text-white'>{data.devices.length}</p>
						</div>
						<div className='metric-tile card-safe'>
							<img alt='' className='h-10 w-10 shrink-0 rounded-2xl bg-slate-800/70 object-contain p-2' src={securityIcon} />
							<p className='text-sm text-slate-300'>Zones surveillees</p>
							<p className='metric-value text-2xl font-semibold text-white'>{data.filters.zones.length}</p>
						</div>
						<div className='metric-tile card-safe'>
							<img alt='' className='h-10 w-10 shrink-0 rounded-2xl bg-slate-800/70 object-contain p-2' src={maintenanceIcon} />
							<p className='text-sm text-slate-300'>Devices critiques</p>
							<p className='metric-value text-2xl font-semibold text-white'>{data.devices.filter((device) => computeDeviceHealth(device).tone === "critical").length}</p>
						</div>
					</div>
				</div>
			</div>
			<div className='panel p-6'>
				<div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
					<p className='safe-text text-sm text-slate-300'>
						{isAdmin(user)
							? "Mode Administrateur: consultation complete, suppression directe et gestion avancee disponibles."
							: canAccessGestion(user)
								? "Mode personnel résidence: consultation, pilotage des statuts et maintenance via le module Gestion."
								: "Mode résident: les objets connectés techniques sont réservés au personnel résidence."}
					</p>
					{canAccessGestion(user) && (
						<Link to='/gestion' className='btn-secondary'>
							Acceder a la gestion
						</Link>
					)}
				</div>
				<div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
					<p className='text-sm text-slate-300'>{data.devices.length} objets trouves</p>
					<button className='btn-secondary px-3 py-2 text-sm' type='button' onClick={() => { const cleared = { search: "", zone: "", category: "", status: "", batteryLevel: "" }; setFilters(cleared); load(cleared); }}>Effacer les filtres</button>
				</div>
				<div className={`grid gap-4 panel-grid-safe ${canAccessGestion(user) ? "md:grid-cols-2 xl:grid-cols-5" : "md:grid-cols-2 xl:grid-cols-4"}`}>
					<input className='field' name='search' value={filters.search} onChange={handleChange} placeholder='Recherche device' />
					<select className='field' name='zone' value={filters.zone} onChange={handleChange}><option value=''>Toutes les zones</option>{data.filters.zones.map((zone) => <option key={zone._id} value={zone._id}>{zone.name}</option>)}</select>
					<select className='field' name='category' value={filters.category} onChange={handleChange}><option value=''>Toutes les categories</option>{data.filters.categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select>
					<select className='field' name='status' value={filters.status} onChange={handleChange}><option value=''>Tous les statuts</option><option value='active'>active</option><option value='inactive'>inactive</option><option value='alert'>alert</option><option value='offline'>offline</option></select>
					{canAccessGestion(user) && <select className='field' name='batteryLevel' value={filters.batteryLevel} onChange={handleChange}><option value=''>Toutes batteries</option><option value='low'>Faible &lt;20%</option><option value='medium'>Moyen</option><option value='good'>Bon</option></select>}
				</div>
			</div>
			{status.loading && <StatePanel message='Chargement des objets connectes...' />}
			{status.error && <StatePanel tone='error' title='Chargement impossible' message={status.error} />}
			{!status.loading && !status.error && data.devices.length === 0 && <StatePanel message='Aucun device ne correspond aux filtres actuels.' />}
			<div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3 panel-grid-safe'>
				{data.devices.map((device) => (
					<Link key={device._id} to={`/devices/${device._id}`} className='panel card-safe p-6 transition duration-300 hover:-translate-y-1 hover:border-emerald-400/30'>
						<p className='truncate-safe text-sm uppercase tracking-[0.22em] text-emerald-300' title={device.category?.name}>{device.category?.name}</p>
						<h2 className='safe-text mt-3 text-2xl font-semibold'>{device.name}</h2>
						<p className='safe-text mt-2 text-slate-300'>{device.description}</p>
						<div className='mt-5 flex flex-wrap gap-2 text-xs text-slate-300'>
							<span className='status-pill' title={device.zone?.name}>{device.zone?.name}</span>
							<StatusBadge value={device.status} />
							{canAccessGestion(user) && <StatusBadge value={device.maintenanceStatus} variant='warning' />}
							{canAccessGestion(user) && <HealthScoreBadge device={device} />}
							{canAccessGestion(user) && getAlertBadges(device).map((badge) => (
								<span key={`${device._id}-${badge}`} className='inline-flex rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-100'>
									{badge}
								</span>
							))}
						</div>
						{canAccessGestion(user) ? (
							<>
								<div className='mt-5 grid grid-cols-2 gap-3 text-sm text-slate-300 panel-grid-safe'>
									<div className='glass-card card-safe rounded-2xl p-3'>
										<p>Signal</p>
										<p className='metric-value mt-1 text-lg font-semibold text-white'>{device.connectivitySignal ?? 0}%</p>
									</div>
									<div className='glass-card card-safe rounded-2xl p-3'>
										<p>Batterie</p>
										<p className='metric-value mt-1 text-lg font-semibold text-white'>{device.batteryLevel ?? 0}%</p>
									</div>
								</div>
								<p className='mt-4 text-xs text-slate-500'>Health score: {computeDeviceHealth(device).score}/100</p>
							</>
						) : (
							<p className='mt-5 text-sm text-slate-400'>Vue résident: nom, zone et statut uniquement.</p>
						)}
					</Link>
				))}
			</div>
		</div>
	);
};

export default DevicesPage;
