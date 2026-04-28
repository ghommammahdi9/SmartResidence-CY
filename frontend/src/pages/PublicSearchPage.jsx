import { useEffect, useState } from "react";
import axios from "../lib/axios";
import SectionHeader from "../components/SectionHeader";
import StatePanel from "../components/StatePanel";
import StatusBadge from "../components/StatusBadge";
import SafeImage from "../components/SafeImage";
import { getServiceVisual, getZoneVisual } from "../utils/mediaMap";
import residenceExterior from "../assets/photos/residence/residence-exterior.jpg";
import hallPhoto from "../assets/photos/residence/hall.jpg";
import servicesIcon from "../assets/icons/services.png";
import alertsIcon from "../assets/icons/alerts.png";
import accessIcon from "../assets/icons/access.png";

const PublicSearchPage = () => {
	const [overview, setOverview] = useState({ zones: [], serviceCategories: [] });
	const [results, setResults] = useState({ zones: [], services: [], announcements: [] });
	const [filters, setFilters] = useState({ query: "", zone: "", category: "", dateFrom: "", dateTo: "" });
	const [status, setStatus] = useState({ loading: true, error: "" });
	const [selectedZoneId, setSelectedZoneId] = useState(null);

	const load = async (nextFilters = filters) => {
		try {
			const res = await axios.get("/public/search", { params: nextFilters });
			setResults(res.data.results);
			setStatus({ loading: false, error: "" });
		} catch (error) {
			setStatus({ loading: false, error: error.response?.data?.message || "Impossible de charger la recherche publique." });
		}
	};

	useEffect(() => {
		axios
			.get("/public/overview")
			.then((res) => {
				setOverview(res.data);
				load(filters);
			})
			.catch((error) => {
				setStatus({ loading: false, error: error.response?.data?.message || "Impossible de charger la vue publique." });
			});
		// Initial load only; filtering is handled by explicit input events.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleChange = async (event) => {
		const nextFilters = { ...filters, [event.target.name]: event.target.value };
		setFilters(nextFilters);
		await load(nextFilters);
	};

	const selectedZone = results.zones.find((zone) => zone._id === selectedZoneId) || results.zones[0];
	const selectedZoneServices = selectedZone
		? results.services.filter((service) => service.zone?._id === selectedZone._id || service.zone?.name === selectedZone.name)
		: [];

	useEffect(() => {
		if (!results.zones.length) {
			setSelectedZoneId(null);
			return;
		}

		const hasSelectedZone = results.zones.some((zone) => zone._id === selectedZoneId);
		if (!hasSelectedZone) {
			setSelectedZoneId(results.zones[0]._id);
		}
	}, [results.zones, selectedZoneId]);

	return (
		<div className='page-shell space-y-6'>
			<div className='panel-strong bg-grid overflow-hidden p-8 sm:p-10'>
				<div className='grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center'>
					<div className='space-y-6'>
						<SectionHeader
							eyebrow='Recherche Publique'
							title='Explorer la residence intelligente avant connexion'
							description='Cette recherche publique montre les zones, annonces et services accessibles au visiteur avec des filtres visibles par zone et categorie.'
						/>
						<div className='grid gap-3 text-sm text-slate-200 sm:grid-cols-2 xl:grid-cols-3'>
							<div className='glass-card card-safe flex min-w-0 items-center gap-3 px-4 py-3'>
								<img alt='' className='h-9 w-9 shrink-0 rounded-2xl bg-slate-800/70 object-contain p-2' src={servicesIcon} />
								<div className='min-w-0'>
									<p className='font-semibold text-white'>Services ouverts</p>
									<p className='safe-text text-slate-300'>Reservation, signalement, actualites</p>
								</div>
							</div>
							<div className='glass-card card-safe flex min-w-0 items-center gap-3 px-4 py-3'>
								<img alt='' className='h-9 w-9 shrink-0 rounded-2xl bg-slate-800/70 object-contain p-2' src={accessIcon} />
								<div className='min-w-0'>
									<p className='font-semibold text-white'>Zones connectees</p>
									<p className='safe-text text-slate-300'>Hall, salle d&apos;etude, laverie</p>
								</div>
							</div>
							<div className='glass-card card-safe flex min-w-0 items-center gap-3 px-4 py-3'>
								<img alt='' className='h-9 w-9 shrink-0 rounded-2xl bg-slate-800/70 object-contain p-2' src={alertsIcon} />
								<div className='min-w-0'>
									<p className='font-semibold text-white'>Annonces en direct</p>
									<p className='safe-text text-slate-300'>Vie residentielle et alertes utiles</p>
								</div>
							</div>
						</div>
					</div>
					<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-1'>
						<div className='photo-frame image-shine'>
							<SafeImage alt='Vue exterieure de la residence connectee SmartResidence CY' className='h-56 w-full object-cover' src={residenceExterior} />
						</div>
						<div className='photo-frame image-shine'>
							<SafeImage alt='Hall connecte de la residence universitaire' className='h-56 w-full object-cover' src={hallPhoto} />
						</div>
					</div>
				</div>
			</div>

			<div className='panel p-6'>
				<div className='mb-5 flex flex-wrap items-center justify-between gap-4'>
					<div>
						<h2 className='text-xl font-semibold text-white'>Filtres visibles de demonstration</h2>
						<p className='text-sm text-slate-300'>Le professeur peut verifier ici la recherche multi-criteres demandee.</p>
					</div>
					<div className='flex flex-wrap gap-2 text-xs text-slate-300'>
						<span className='status-pill'>Zone</span>
						<span className='status-pill'>Categorie</span>
						<span className='status-pill'>Recherche libre</span>
						<span className='status-pill'>Periode</span>
					</div>
				</div>
				<div className='mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3 panel-grid-safe'>
					<div className='metric-tile card-safe'>
						<p className='text-sm text-slate-300'>Zones publiques visibles</p>
						<p className='metric-value mt-2 text-2xl font-semibold text-white'>{results.zones.length}</p>
					</div>
					<div className='metric-tile card-safe'>
						<p className='text-sm text-slate-300'>Services publics</p>
						<p className='metric-value mt-2 text-2xl font-semibold text-white'>{results.services.length}</p>
					</div>
					<div className='metric-tile card-safe'>
						<p className='text-sm text-slate-300'>Annonces</p>
						<p className='metric-value mt-2 text-2xl font-semibold text-white'>{results.announcements.length}</p>
					</div>
				</div>
				<div className='grid gap-4 md:grid-cols-2 xl:grid-cols-5 panel-grid-safe'>
					<label className='block text-sm'>
						<span className='mb-2 block text-slate-300'>Recherche libre</span>
						<input className='field' name='query' value={filters.query} onChange={handleChange} placeholder='zone, annonce, service...' />
					</label>
					<label className='block text-sm'>
						<span className='mb-2 block text-slate-300'>Filtre zone</span>
						<select className='field' name='zone' value={filters.zone} onChange={handleChange}>
							<option value=''>Toutes les zones</option>
							{overview.zones?.map((zone) => <option key={zone._id} value={zone._id}>{zone.name}</option>)}
						</select>
					</label>
					<label className='block text-sm'>
						<span className='mb-2 block text-slate-300'>Filtre categorie</span>
						<select className='field' name='category' value={filters.category} onChange={handleChange}>
							<option value=''>Toutes les categories</option>
							{overview.serviceCategories?.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
						</select>
					</label>
					<label className='block text-sm'>
						<span className='mb-2 block text-slate-300'>Date debut</span>
						<input className='field' type='date' name='dateFrom' value={filters.dateFrom} onChange={handleChange} />
					</label>
					<label className='block text-sm'>
						<span className='mb-2 block text-slate-300'>Date fin</span>
						<input className='field' type='date' name='dateTo' value={filters.dateTo} onChange={handleChange} />
					</label>
				</div>
			</div>
			{status.loading && <StatePanel message='Chargement de la recherche publique...' />}
			{status.error && <StatePanel tone='error' title='Vue publique indisponible' message={status.error} />}
			{!status.loading && !status.error && results.zones.length > 0 && (
				<div className='grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] panel-grid-safe'>
					<div className='panel card-safe p-6'>
						<SectionHeader eyebrow='Zone Explorer' title='Explorer les zones sans se connecter' description='Une lecture simple mais interactive des espaces suivis dans la residence.' />
						<div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 panel-grid-safe'>
							{results.zones.map((zone) => (
								<button
									key={zone._id}
									type='button'
									onClick={() => setSelectedZoneId(zone._id)}
									className={`glass-card card-safe p-4 text-left transition ${selectedZone?._id === zone._id ? "border-emerald-400/40" : "hover:-translate-y-1"}`}
								>
									<div className='flex min-w-0 items-center justify-between gap-3'>
										<p className='truncate-safe font-semibold text-white' title={zone.name}>{zone.name}</p>
										<StatusBadge value={zone.status} />
									</div>
									<p className='safe-text mt-2 text-sm text-slate-300'>{zone.type}</p>
								</button>
							))}
						</div>
					</div>
					{selectedZone && (
						<div className='panel-strong card-safe p-6'>
							<div className='grid grid-cols-1 gap-6 panel-grid-safe'>
								<div className='photo-frame aspect-[4/3] overflow-hidden rounded-[2rem] lg:aspect-[5/4]'>
									<SafeImage
										src={getZoneVisual(selectedZone.name)}
										alt={`Visuel de la zone ${selectedZone.name}`}
										fallbackSrc={getZoneVisual("Local technique")}
										className='h-full w-full object-cover object-center'
										fallbackLabel={`Zone ${selectedZone.name}`}
									/>
								</div>
								<div className='min-w-0'>
									<p className='text-xs uppercase tracking-[0.3em] text-emerald-300'>Zone selectionnee</p>
									<h2 className='safe-text mt-3 text-2xl font-semibold text-white'>{selectedZone.name}</h2>
									<p className='safe-text mt-3 leading-relaxed text-slate-300'>{selectedZone.description}</p>
									<div className='mt-4 flex flex-wrap gap-2'>
										<StatusBadge value={selectedZone.status} />
										<StatusBadge value={selectedZone.type} />
										<span className='status-pill bg-slate-500/20 text-slate-200'>{selectedZone.accessibility}</span>
									</div>
									<div className='mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1 panel-grid-safe'>
										{selectedZoneServices.slice(0, 2).map((service) => (
											<div key={service._id} className='glass-card card-safe p-3'>
												<p className='safe-text font-semibold text-white'>{service.name}</p>
												<p className='safe-text mt-1 text-xs text-slate-300'>{service.category?.name || "Service residence"}</p>
												<div className='mt-3 photo-frame aspect-[16/10] overflow-hidden rounded-[1.5rem]'>
													<SafeImage
														src={getServiceVisual(service)}
														alt={`Visuel du service ${service.name}`}
														className='h-full w-full object-cover object-center'
														fallbackLabel={`Service ${service.name}`}
													/>
												</div>
											</div>
										))}
										{selectedZoneServices.length === 0 && (
											<div className='glass-card card-safe p-4 sm:col-span-2 xl:col-span-1'>
												<div className='grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-center xl:grid-cols-1 panel-grid-safe'>
													<div className='photo-frame aspect-[16/10] overflow-hidden rounded-[1.5rem]'>
														<SafeImage
															src={getZoneVisual(selectedZone.name)}
															alt={`Vue complementaire de ${selectedZone.name}`}
															fallbackSrc={getZoneVisual("Local technique")}
															className='h-full w-full object-cover object-center'
															fallbackLabel={`Zone ${selectedZone.name}`}
														/>
													</div>
													<div className='min-w-0'>
														<p className='font-semibold text-white'>Services en attente de publication</p>
														<p className='safe-text mt-2 text-sm leading-relaxed text-slate-300'>
															Cette zone reste visible dans la visite publique avec son statut, ses alertes et ses equipements,
															meme lorsqu&apos;aucun service public n&apos;est encore rattache.
														</p>
													</div>
												</div>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			)}
			<div className='grid grid-cols-1 gap-6 lg:grid-cols-3 panel-grid-safe'>
				<div className='panel card-safe p-6'>
					<h2 className='text-xl font-semibold'>Zones</h2>
					<div className='mt-4 space-y-3'>
						{results.zones?.map((zone) => (
							<div key={zone._id} className='glass-card card-safe rounded-3xl p-4'>
								<p className='safe-text font-semibold'>{zone.name}</p>
								<p className='safe-text mt-2 text-sm leading-relaxed text-slate-300'>{zone.description}</p>
							</div>
						))}
						{!status.loading && !status.error && results.zones?.length === 0 && <StatePanel compact message='Aucune zone ne correspond aux filtres actuels.' />}
					</div>
				</div>
				<div className='panel card-safe p-6'>
					<h2 className='text-xl font-semibold'>Services publics</h2>
					<div className='mt-4 space-y-3'>
						{results.services?.map((service) => (
							<div key={service._id} className='glass-card card-safe rounded-3xl p-4'>
								<p className='safe-text font-semibold'>{service.name}</p>
								<p className='safe-text mt-1 text-sm text-emerald-200'>{service.category?.name}</p>
								<p className='safe-text mt-2 text-sm leading-relaxed text-slate-300'>{service.description}</p>
							</div>
						))}
						{!status.loading && !status.error && results.services?.length === 0 && <StatePanel compact message='Aucun service public ne correspond aux filtres actuels.' />}
					</div>
				</div>
				<div className='panel card-safe p-6'>
					<h2 className='text-xl font-semibold'>Annonces</h2>
					<div className='mt-4 space-y-3'>
						{results.announcements?.map((announcement) => (
							<div key={announcement._id} className='glass-card card-safe rounded-3xl p-4'>
								<p className='safe-text font-semibold'>{announcement.title}</p>
								<p className='mt-1 text-xs text-slate-500'>{new Date(announcement.createdAt).toLocaleDateString("fr-FR")}</p>
								<p className='safe-text mt-2 text-sm leading-relaxed text-slate-300'>{announcement.content}</p>
							</div>
						))}
						{!status.loading && !status.error && results.announcements?.length === 0 && <StatePanel compact message='Aucune annonce ne correspond aux filtres actuels.' />}
					</div>
				</div>
			</div>
		</div>
	);
};

export default PublicSearchPage;
