import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../lib/axios";
import SectionHeader from "../components/SectionHeader";
import StatePanel from "../components/StatePanel";
import StatusBadge from "../components/StatusBadge";
import SmartModesPanel from "../components/SmartModesPanel";
import SafeImage from "../components/SafeImage";
import { getServiceVisual } from "../utils/mediaMap";
import { useUserStore } from "../stores/useUserStore";
import { canConfigureServices, isAdmin } from "../utils/access";
import servicesIcon from "../assets/icons/services.png";
import accessIcon from "../assets/icons/access.png";
import alertsIcon from "../assets/icons/alerts.png";

const ServicesPage = () => {
	const [data, setData] = useState({ services: [], filters: { zones: [], categories: [] } });
	const [filters, setFilters] = useState({ search: "", zone: "", category: "", availability: "" });
	const [status, setStatus] = useState({ loading: true, error: "" });
	const { user } = useUserStore();
	const visibleServices = canConfigureServices(user)
		? data.services
		: data.services.filter((service) => service.category?.name !== "Consommation");

	const load = async (nextFilters = filters) => {
		try {
			const res = await axios.get("/services", { params: nextFilters });
			setData(res.data);
			setStatus({ loading: false, error: "" });
		} catch (error) {
			setStatus({ loading: false, error: error.response?.data?.message || "Impossible de charger les services." });
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
						<SectionHeader eyebrow='Visualisation' title='Services residents' description='Services consultables avec filtres de zone, categorie et disponibilite.' />
					</div>
					<div className='grid grid-cols-1 gap-4 sm:grid-cols-3 panel-grid-safe'>
						<div className='metric-tile card-safe'>
							<img alt='' className='h-10 w-10 shrink-0 rounded-2xl bg-slate-800/70 object-contain p-2' src={servicesIcon} />
							<p className='text-sm text-slate-300'>Services visibles</p>
							<p className='metric-value text-2xl font-semibold text-white'>{visibleServices.length}</p>
						</div>
						<div className='metric-tile card-safe'>
							<img alt='' className='h-10 w-10 shrink-0 rounded-2xl bg-slate-800/70 object-contain p-2' src={accessIcon} />
							<p className='text-sm text-slate-300'>Zones reliees</p>
							<p className='metric-value text-2xl font-semibold text-white'>{data.filters.zones.length}</p>
						</div>
						<div className='metric-tile card-safe'>
							<img alt='' className='h-10 w-10 shrink-0 rounded-2xl bg-slate-800/70 object-contain p-2' src={alertsIcon} />
							<p className='text-sm text-slate-300'>Categories proposees</p>
							<p className='metric-value text-2xl font-semibold text-white'>{data.filters.categories.length}</p>
						</div>
					</div>
				</div>
			</div>
			<div className='panel p-6'>
				<div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
					<p className='safe-text text-sm text-slate-300'>
						{isAdmin(user)
							? "Mode Administrateur: creation, suppression et categorisation des services disponibles."
							: canConfigureServices(user)
								? "Mode personnel résidence: configuration et association des services par zone."
								: "Mode résident: consultation des services, disponibilités et réservations."}
					</p>
					{canConfigureServices(user) && (
						<Link to={isAdmin(user) ? "/administration" : "/gestion"} className='btn-secondary'>
							{isAdmin(user) ? "Administrer les services" : "Configurer les services"}
						</Link>
					)}
				</div>
				<div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
					<p className='text-sm text-slate-300'>{visibleServices.length} services trouves</p>
					<button className='btn-secondary px-3 py-2 text-sm' type='button' onClick={() => { const cleared = { search: "", zone: "", category: "", availability: "" }; setFilters(cleared); load(cleared); }}>Effacer les filtres</button>
				</div>
				<div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4 panel-grid-safe'>
					<input className='field' name='search' value={filters.search} onChange={handleChange} placeholder='Recherche service' />
					<select className='field' name='zone' value={filters.zone} onChange={handleChange}><option value=''>Toutes les zones</option>{data.filters.zones.map((zone) => <option key={zone._id} value={zone._id}>{zone.name}</option>)}</select>
					<select className='field' name='category' value={filters.category} onChange={handleChange}><option value=''>Toutes les categories</option>{data.filters.categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select>
					<select className='field' name='availability' value={filters.availability} onChange={handleChange}><option value=''>Toutes disponibilites</option><option value='daily'>daily</option><option value='weekly'>weekly</option><option value='on-demand'>on-demand</option></select>
				</div>
			</div>
			{status.loading && <StatePanel message='Chargement des services residents...' />}
			{status.error && <StatePanel tone='error' title='Chargement impossible' message={status.error} />}
			{!status.loading && !status.error && visibleServices.length === 0 && <StatePanel message='Aucun service ne correspond aux filtres actuels.' />}
			<div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3 panel-grid-safe'>
				{visibleServices.map((service) => (
					<Link key={service._id} to={`/services/${service._id}`} className='panel card-safe p-6 transition duration-300 hover:-translate-y-1 hover:border-amber-300/30'>
						<div className='photo-frame mb-4'>
							<SafeImage
								src={getServiceVisual(service)}
								alt={`Visuel du service ${service.name}`}
								className='h-40 w-full object-cover'
								fallbackLabel={`Service ${service.name}`}
							/>
						</div>
						<p className='truncate-safe text-sm uppercase tracking-[0.22em] text-amber-200' title={service.category?.name}>{service.category?.name}</p>
						<h2 className='safe-text mt-3 text-2xl font-semibold'>{service.name}</h2>
						<p className='safe-text mt-2 text-slate-300'>{service.description}</p>
						<div className='mt-5 flex flex-wrap gap-2 text-xs text-slate-300'>
							<span className='status-pill' title={service.zone?.name}>{service.zone?.name}</span>
							<StatusBadge value={service.availability} variant='info' />
							<StatusBadge value={service.status} />
						</div>
						<div className='mt-5 glass-card card-safe rounded-2xl p-3 text-sm text-slate-300'>
							<p>Demandes enregistrees</p>
							<p className='metric-value mt-1 text-lg font-semibold text-white'>{service.usageStats?.requests ?? 0}</p>
						</div>
					</Link>
				))}
			</div>
			{canConfigureServices(user) && <SmartModesPanel />}
		</div>
	);
};

export default ServicesPage;
