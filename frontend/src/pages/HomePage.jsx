import { useEffect, useState } from "react";
import { ArrowRight, ChartNoAxesCombined, ShieldCheck, Sparkles, Users, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "../lib/axios";
import SectionHeader from "../components/SectionHeader";
import StatePanel from "../components/StatePanel";
import StatusBadge from "../components/StatusBadge";
import SmartModesPanel from "../components/SmartModesPanel";
import HealthScoreBadge from "../components/HealthScoreBadge";
import SafeImage from "../components/SafeImage";
import { computeDeviceHealth } from "../utils/deviceHealth";
import { getServiceVisual, getZoneVisual } from "../utils/mediaMap";
import { useUserStore } from "../stores/useUserStore";
import logoCYU from "../assets/branding/logo-cyu.png";
import logoCYTech from "../assets/branding/logo-cytech.png";
import campusImage from "../assets/photos/campus/campus-cy.png";
import exteriorImage from "../assets/photos/residence/residence-exterior.jpg";
import roomOneImage from "../assets/photos/residence/room-1.jpg";
import roomTwoImage from "../assets/photos/residence/room-2.jpg";
import commonRoomImage from "../assets/photos/residence/common-room.jpg";
import hallImage from "../assets/photos/residence/hall.jpg";
import studyImage from "../assets/photos/residence/study-space.avif";
import floorPlanImage from "../assets/photos/residence/floorplan.jpg";
import energyIcon from "../assets/icons/energy.png";
import waterIcon from "../assets/icons/water.png";
import securityIcon from "../assets/icons/security.png";
import maintenanceIcon from "../assets/icons/maintenance.png";
import accessIcon from "../assets/icons/access.png";
import alertsIcon from "../assets/icons/alerts.png";
import servicesIcon from "../assets/icons/services.png";

const residenceGallery = [
	{ image: exteriorImage, title: "Residence exterieure", text: "Facade et contexte d'implantation sur le campus." },
	{ image: roomOneImage, title: "Chambre resident", text: "Espaces personnels integres a une residence connectee." },
	{ image: studyImage, title: "Espace d'etude", text: "Zone de travail reservee et suivie en temps reel." },
	{ image: commonRoomImage, title: "Salon commun", text: "Vie collective, services residents et confort numerique." },
	{ image: hallImage, title: "Hall principal", text: "Acces, circulation et capteurs de presence." },
	{ image: roomTwoImage, title: "Seconde chambre", text: "Ambiance residentielle premium et fonctionnelle." },
];

const moduleCards = [
	{ icon: Sparkles, title: "Information", text: "Annonces, zones publiques, moteur de recherche, presentation du projet et visite libre." },
	{ icon: ChartNoAxesCombined, title: "Visualisation", text: "Dashboards, profils membres, devices, services et lecture des historiques." },
	{ icon: Wrench, title: "Gestion", text: "Pilotage des equipements, demandes de suppression, maintenance et supervision des anomalies." },
	{ icon: ShieldCheck, title: "Administration", text: "Validation des inscriptions, roles, niveaux, categories, journaux et export des rapports." },
];

const roleCards = [
	{ title: "visiteur", helper: "Acces public aux informations et a la visite du projet.", color: "text-slate-200" },
	{ title: "résident", helper: "Étudiant résident avec dashboard personnel, services, réservations et signalements.", color: "text-sky-200" },
	{ title: "personnel résidence", helper: "Profil opérationnel avec accès Gestion, objets connectés et suivi maintenance.", color: "text-amber-100" },
	{ title: "Administrateur", helper: "Pilotage global, validation, categories, logs, rapports et maintenance.", color: "text-fuchsia-100" },
];

const HomePage = () => {
	const { user } = useUserStore();
	const [data, setData] = useState({ announcements: [], zones: [], services: [], devices: [], featuredDevices: [] });
	const [status, setStatus] = useState({ loading: true, error: "" });
	const [selectedZoneId, setSelectedZoneId] = useState(null);

	useEffect(() => {
		axios
			.get("/public/overview")
			.then((res) => {
				setData(res.data);
				setStatus({ loading: false, error: "" });
			})
			.catch((error) => setStatus({ loading: false, error: error.response?.data?.message || "Impossible de charger l'accueil SmartResidence CY." }));
	}, []);

	const liveOverview = [
		{ icon: energyIcon, label: "Energie", value: "1 480 kWh", helper: "Compteur principal et alertes d'inefficacite" },
		{ icon: waterIcon, label: "Eau", value: "130 L", helper: "Suivi de la laverie et detection de fuite" },
		{ icon: securityIcon, label: "Securite", value: "3 zones actives", helper: "Camera, serrure connectee, detecteur de fumee" },
		{ icon: maintenanceIcon, label: "Maintenance", value: "2 alertes", helper: "Inspection et priorisation des interventions" },
		{ icon: accessIcon, label: "Acces", value: "Hall supervise", helper: "Presences, droits et circulation controlee" },
		{ icon: alertsIcon, label: "Alertes", value: "Temps reel", helper: "Statuts device, eau, energie et incidents" },
		{ icon: servicesIcon, label: "Services", value: `${data.services?.length || 0} actifs`, helper: "Reservations, signalements et infos residents" },
	];

	const whyItems = [
		{
			title: "Une lecture immediate du batiment",
			text: "La plateforme traduit les zones, devices, alertes et services en une vue comprehensible pour un encadrant universitaire.",
		},
		{
			title: "Des parcours utilisateurs progressifs",
			text: "Le systeme de points, niveaux et roles rend le projet plus intelligent qu un simple tableau de bord statique.",
		},
		{
			title: "Une logique orientee decision",
			text: "Gestion, maintenance, approbations, journaux et rapports donnent une vraie profondeur academique au prototype.",
		},
	];

	const zoneCards = data.zones.map((zone) => {
		const zoneDevices = data.devices.filter((device) => device.zone?._id === zone._id);
		const zoneServices = data.services.filter((service) => service.zone?._id === zone._id);
		return {
			...zone,
			zoneDevices,
			zoneServices,
			alertCount: zone.alertCount ?? zoneDevices.filter((device) => device.status === "alert" || computeDeviceHealth(device).tone === "critical").length,
			energyUsage: zone.energyUsage ?? zoneDevices.reduce((sum, device) => sum + (device.energyUsage || 0), 0),
			deviceCount: zone.deviceCount ?? zoneDevices.length,
			serviceCount: zone.serviceCount ?? zoneServices.length,
			accessState: zone.status === "restricted" ? "Acces restreint" : "Acces autorise",
		};
	});

	const selectedZone = zoneCards.find((zone) => zone._id === selectedZoneId) || zoneCards[0];

	return (
		<div className='page-shell space-y-10'>
			<section className='hero-shell grid gap-8 p-6 sm:p-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-center xl:p-10'>
				<div className='relative z-10'>
					<div className='flex flex-wrap items-center gap-3'>
						<img src={logoCYU} alt='Logo CY Universite' className='h-12 w-auto rounded-2xl bg-white/95 p-2' />
						<img src={logoCYTech} alt='Logo CY Tech' className='h-12 w-auto rounded-2xl bg-white/95 p-2' />
						<span className='rounded-full border border-emerald-300/20 bg-emerald-400/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-emerald-200'>
							Smart Building Academic Platform
						</span>
					</div>
					<h1 className='mt-8 max-w-4xl text-4xl font-bold leading-tight text-white sm:text-6xl'>
						SmartResidence CY fait de la residence universitaire un espace pilote, connecte et demonstrable.
					</h1>
					<p className='mt-6 max-w-3xl text-lg leading-8 text-slate-300'>
						Une plateforme MERN pensee comme un centre de supervision intelligent pour les zones communes,
						les objets connectes, la maintenance, les services residents et la progression des utilisateurs.
					</p>
					<div className='mt-8 flex flex-wrap gap-3'>
						<Link className='btn-primary' to='/public-search'>
							Explorer SmartResidence CY
							<ArrowRight className='ml-2' size={18} />
						</Link>
						<Link className='btn-secondary' to='/tour'>Visite libre du projet</Link>
						<Link className='btn-secondary' to='/signup'>Creer un compte resident</Link>
					</div>
					<div className='mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 panel-grid-safe'>
						<div className='metric-tile card-safe'>
							<p className='text-xs uppercase tracking-[0.28em] text-slate-400'>Zones connectees</p>
							<p className='metric-value mt-3 text-2xl font-semibold text-white sm:text-3xl'>{data.zones?.length || 0}</p>
							<p className='safe-text mt-2 text-sm text-slate-300'>Hall, etude, cuisine, couloirs, laverie, technique.</p>
						</div>
						<div className='metric-tile card-safe'>
							<p className='text-xs uppercase tracking-[0.28em] text-slate-400'>Objets suivis</p>
							<p className='metric-value mt-3 text-2xl font-semibold text-white sm:text-3xl'>{data.devices?.length || 0}</p>
							<p className='safe-text mt-2 text-sm text-slate-300'>Capteurs, serrure, camera, compteur et eclairage.</p>
						</div>
						<div className='metric-tile card-safe'>
							<p className='text-xs uppercase tracking-[0.28em] text-slate-400'>Modules</p>
							<p className='metric-value mt-3 text-2xl font-semibold text-white sm:text-3xl'>4</p>
							<p className='safe-text mt-2 text-sm text-slate-300'>Information, Visualisation, Gestion et Administration.</p>
						</div>
					</div>
				</div>

					<div className='grid gap-4 lg:grid-cols-2'>
						<div className='photo-frame lg:col-span-2'>
							<SafeImage src={campusImage} alt='Vue du campus CY et de son environnement universitaire' className='image-shine h-full min-h-[260px] w-full object-cover' />
						</div>
						<div className='photo-frame'>
							<SafeImage src={exteriorImage} alt='Exterieur de la residence universitaire' className='image-shine h-56 w-full object-cover' />
						</div>
						<div className='photo-frame'>
							<SafeImage src={hallImage} alt='Hall principal de la residence' className='image-shine h-56 w-full object-cover' />
						</div>
					</div>
			</section>

			<section className='grid gap-6 xl:grid-cols-3 panel-grid-safe'>
				<div className='xl:col-span-2 panel card-safe p-6'>
					<SectionHeader
						eyebrow='Why SmartResidence CY'
						title='Un prototype qui va au-dela du minimum fonctionnel'
						description='La plateforme montre comment une residence universitaire peut devenir plus lisible, plus sure et plus efficace grace aux objets connectes et a des parcours utilisateurs progressifs.'
					/>
					<div className='grid gap-4 md:grid-cols-3 panel-grid-safe'>
						{whyItems.map((item) => (
							<div key={item.title} className='glass-card card-safe p-5'>
								<h3 className='safe-text text-xl font-semibold text-white'>{item.title}</h3>
								<p className='safe-text mt-3 text-sm leading-relaxed text-slate-300'>{item.text}</p>
							</div>
						))}
					</div>
				</div>
				<div className='panel-strong card-safe p-6'>
					<p className='text-xs uppercase tracking-[0.3em] text-emerald-300'>Statistiques express</p>
					<div className='mt-5 space-y-4'>
						<div className='metric-tile card-safe'>
							<p className='text-sm text-slate-300'>Devices sains</p>
							<p className='metric-value mt-2 text-2xl font-semibold text-white sm:text-3xl'>{data.devices.filter((device) => computeDeviceHealth(device).tone === "good").length}</p>
						</div>
						<div className='metric-tile card-safe'>
							<p className='text-sm text-slate-300'>Zones en alerte</p>
							<p className='metric-value mt-2 text-2xl font-semibold text-white sm:text-3xl'>{zoneCards.filter((zone) => zone.alertCount > 0).length}</p>
						</div>
						<div className='metric-tile card-safe'>
							<p className='text-sm text-slate-300'>Services visibles</p>
							<p className='metric-value mt-2 text-2xl font-semibold text-white sm:text-3xl'>{data.services.length}</p>
						</div>
					</div>
				</div>
			</section>

			<section className='panel-strong bg-grid p-6 sm:p-8'>
				<SectionHeader
					eyebrow='SmartResidence Live Overview'
					title='Un tableau de bord qui ressemble a un centre de controle residentiel'
					description='Cette section met en scene les signaux essentiels du batiment: energie, eau, securite, maintenance, acces et services.'
				/>
				{status.loading && <StatePanel message='Chargement de la vue d’ensemble connectee...' />}
				{status.error && <StatePanel tone='error' title='Vue indisponible' message={status.error} />}
				{!status.loading && !status.error && (
					<div className='grid gap-4 xl:grid-cols-[1.1fr_0.9fr] panel-grid-safe'>
						<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3 panel-grid-safe'>
							{liveOverview.map((item) => (
								<div key={item.label} className='glass-card card-safe p-5'>
									<div className='flex min-w-0 items-start justify-between gap-3'>
										<div className='min-w-0'>
											<p className='safe-text text-xs uppercase tracking-[0.3em] text-slate-400'>{item.label}</p>
											<p className='metric-value mt-4 text-2xl font-semibold text-white sm:text-3xl'>{item.value}</p>
										</div>
										<img src={item.icon} alt='' className='h-10 w-10 shrink-0 rounded-2xl bg-slate-800/70 object-contain p-2' />
									</div>
									<p className='safe-text mt-4 text-sm leading-relaxed text-slate-300'>{item.helper}</p>
								</div>
							))}
						</div>
						<div className='grid gap-4'>
							<div className='glass-card card-safe p-5'>
								<p className='text-xs uppercase tracking-[0.3em] text-slate-400'>Activite recente</p>
								<div className='mt-5 space-y-4'>
									{data.announcements?.slice(0, 3).map((announcement, index) => (
										<div key={announcement._id} className='flex min-w-0 gap-4'>
											<div className='mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-xs font-semibold text-emerald-200'>{index + 1}</div>
											<div className='min-w-0'>
												<p className='safe-text font-semibold text-white'>{announcement.title}</p>
												<p className='safe-text mt-1 text-sm leading-relaxed text-slate-300'>{announcement.content}</p>
											</div>
										</div>
									))}
								</div>
							</div>
							<div className='glass-card card-safe p-5'>
								<p className='text-xs uppercase tracking-[0.3em] text-slate-400'>Quick service access</p>
								<div className='mt-4 grid gap-3 sm:grid-cols-2 panel-grid-safe'>
									{data.services?.slice(0, 4).map((service) => (
										<div key={service._id} className='card-safe rounded-2xl border border-slate-700/40 bg-slate-900/60 p-4'>
											<p className='safe-text font-semibold text-white'>{service.name}</p>
											<p className='truncate-safe mt-2 text-sm text-slate-300' title={service.zone?.name || "Residence"}>{service.zone?.name || "Residence"}</p>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				)}
			</section>

			<SmartModesPanel />

			<section className='space-y-6'>
				<SectionHeader
					eyebrow='Student Life In The Residence'
					title='Une residence qui conjugue confort, securite et experience etudiante'
					description='Les visuels reels donnent au projet une presence forte et rendent la promesse SmartResidence CY concrete des la page d’accueil.'
				/>
				<div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
						{residenceGallery.map((item) => (
							<div key={item.title} className='photo-frame group'>
								<SafeImage src={item.image} alt={item.title} className='image-shine h-64 w-full object-cover' />
								<div className='border-t border-slate-700/40 p-5'>
								<h3 className='text-xl font-semibold text-white'>{item.title}</h3>
								<p className='mt-2 text-sm text-slate-300'>{item.text}</p>
							</div>
						</div>
					))}
				</div>
			</section>

			<section className='grid gap-6 xl:grid-cols-[1fr_1fr] panel-grid-safe'>
				<div className='panel card-safe p-6'>
					<SectionHeader eyebrow='How It Works' title='Les 4 modules SmartResidence CY' description='Une architecture pedagogique pour montrer le cycle complet de la plateforme.' />
					<div className='grid gap-4'>
						{moduleCards.map((item) => (
							<div key={item.title} className='glass-card card-safe flex min-w-0 items-start gap-4 p-5'>
								<div className='shrink-0 rounded-2xl bg-emerald-400/10 p-3 text-emerald-200'>
									<item.icon size={20} />
								</div>
								<div className='min-w-0'>
									<h3 className='safe-text text-xl font-semibold text-white'>{item.title}</h3>
									<p className='safe-text mt-2 text-sm leading-relaxed text-slate-300'>{item.text}</p>
								</div>
							</div>
						))}
					</div>
				</div>
				<div className='panel card-safe p-6'>
					<SectionHeader eyebrow='User Roles' title='Des roles progressifs et lisibles pour la demonstration' description='Chaque profil a un niveau de lecture et d’action cohérent avec le systeme de points et de progression.' />
					<div className='grid gap-4 sm:grid-cols-2 panel-grid-safe'>
						{roleCards.map((role) => (
							<div key={role.title} className='glass-card card-safe p-5'>
								<div className='flex min-w-0 items-center justify-between gap-3'>
									<h3 className={`safe-text text-xl font-semibold sm:text-2xl ${role.color}`}>{role.title}</h3>
									<Users className='shrink-0 text-slate-400' size={20} />
								</div>
								<p className='safe-text mt-3 text-sm leading-relaxed text-slate-300'>{role.helper}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className='grid gap-6 xl:grid-cols-[0.95fr_1.05fr] panel-grid-safe'>
				<div className='panel card-safe p-6'>
					<SectionHeader eyebrow='Connected Residence Zones' title='Plan et zones suivies dans le batiment' description='Les zones de la residence deviennent des espaces lisibles et pilotables grace aux devices associes.' />
					<div className='photo-frame'>
						<SafeImage src={floorPlanImage} alt='Plan de la residence et de ses zones connectees' className='image-shine h-[360px] w-full object-cover' />
					</div>
				</div>
				<div className='space-y-4'>
					<div className='grid gap-4 sm:grid-cols-2 panel-grid-safe'>
						{zoneCards.map((zone) => (
							<button
								key={zone._id}
								type='button'
								onClick={() => setSelectedZoneId(zone._id)}
								className={`glass-card card-safe p-5 text-left transition duration-300 ${selectedZone?._id === zone._id ? "border-emerald-400/40 shadow-xl shadow-emerald-500/10" : "hover:-translate-y-1"}`}
							>
								<div className='flex min-w-0 items-center justify-between gap-3'>
									<h3 className='truncate-safe text-xl font-semibold text-white' title={zone.name}>{zone.name}</h3>
									<StatusBadge value={zone.status} />
								</div>
								<p className='safe-text mt-3 text-sm leading-relaxed text-slate-300'>{zone.description}</p>
								<div className='mt-4 flex flex-wrap gap-2 text-xs text-slate-300'>
									<span className='status-pill bg-slate-500/20 text-slate-200'>{zone.deviceCount} devices</span>
									<span className='status-pill bg-slate-500/20 text-slate-200'>{zone.alertCount} alertes</span>
								</div>
							</button>
						))}
					</div>
					{selectedZone && (
						<div className='panel-strong card-safe p-6'>
							<div className='grid grid-cols-1 gap-6 2xl:grid-cols-[0.9fr_1.1fr] panel-grid-safe'>
								<div className='space-y-4'>
									<div className='photo-frame'>
										<SafeImage
											src={getZoneVisual(selectedZone.name)}
											alt={`Vue representative de la zone ${selectedZone.name}`}
											className='zone-hero-image'
											fallbackLabel={`Zone ${selectedZone.name}`}
										/>
									</div>
									<div className='glass-card card-safe p-4'>
										<p className='text-sm font-semibold text-white'>Lecture de la zone</p>
										<p className='safe-text mt-3 text-sm leading-relaxed text-slate-300'>{selectedZone.description}</p>
										<div className='mt-4 flex flex-wrap gap-2'>
											<StatusBadge value={selectedZone.status} />
											<StatusBadge value={selectedZone.type} />
											<span className='status-pill bg-slate-500/20 text-slate-200'>{selectedZone.accessibility}</span>
										</div>
									</div>
								</div>
								<div className='min-w-0'>
									<div className='flex min-w-0 flex-wrap items-center justify-between gap-3'>
										<div className='min-w-0'>
											<p className='text-xs uppercase tracking-[0.3em] text-emerald-300'>Zone active</p>
											<h3 className='safe-text mt-2 text-2xl font-semibold text-white'>{selectedZone.name}</h3>
										</div>
										<div className='flex flex-wrap gap-2'>
											<StatusBadge value={selectedZone.status} />
											<span className='status-pill bg-slate-500/20 text-slate-200'>{selectedZone.accessState}</span>
										</div>
									</div>
									<div className='mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4 2xl:grid-cols-4 panel-grid-safe'>
										<div className='metric-tile card-safe p-4'>
											<p className='text-sm text-slate-300'>Devices</p>
											<p className='metric-value mt-2 text-2xl font-semibold text-white'>{selectedZone.deviceCount}</p>
										</div>
										<div className='metric-tile card-safe p-4'>
											<p className='text-sm text-slate-300'>Alertes</p>
											<p className='metric-value mt-2 text-2xl font-semibold text-white'>{selectedZone.alertCount}</p>
										</div>
										<div className='metric-tile card-safe p-4'>
											<p className='text-sm text-slate-300'>Energie</p>
											<p className='metric-value mt-2 text-2xl font-semibold text-white'>{selectedZone.energyUsage} kWh</p>
										</div>
										<div className='metric-tile card-safe p-4'>
											<p className='text-sm text-slate-300'>Services</p>
											<p className='metric-value mt-2 text-2xl font-semibold text-white'>{selectedZone.serviceCount}</p>
										</div>
									</div>
									<div className='mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2 panel-grid-safe'>
										<div className='glass-card card-safe p-4'>
											<p className='text-sm font-semibold text-white'>Devices associes</p>
											<div className='mt-3 space-y-3'>
												{!user && <StatePanel compact message='Connectez-vous pour voir les details des objets connectes de cette zone.' />}
												{user && selectedZone.zoneDevices.length === 0 && <StatePanel compact message='Aucun objet connecte dans cette zone pour le moment.' />}
												{user && selectedZone.zoneDevices.slice(0, 4).map((device) => (
													<div key={device._id} className='card-safe rounded-2xl border border-slate-700/40 bg-slate-950/40 p-3'>
														<div className='flex min-w-0 flex-wrap items-center justify-between gap-3'>
															<p className='truncate-safe font-semibold text-white' title={device.name}>{device.name}</p>
															<HealthScoreBadge device={device} />
														</div>
													</div>
												))}
											</div>
										</div>
										<div className='glass-card card-safe p-4'>
											<p className='text-sm font-semibold text-white'>Services lies</p>
											<div className='mt-3 space-y-3'>
												{selectedZone.zoneServices.length === 0 && <StatePanel compact message='Aucun service lie a cette zone pour le moment.' />}
												{selectedZone.zoneServices.slice(0, 3).map((service) => (
													<div key={service._id} className='card-safe rounded-2xl border border-slate-700/40 bg-slate-950/40 p-3'>
														<div className='flex min-w-0 flex-wrap items-center justify-between gap-3'>
															<p className='truncate-safe font-semibold text-white' title={service.name}>{service.name}</p>
															<StatusBadge value={service.status} />
														</div>
														<div className='mt-3 photo-frame'>
															<SafeImage
																src={getServiceVisual(service)}
																alt={`Visuel du service ${service.name}`}
																className='h-24 w-full object-cover'
																fallbackLabel={`Service ${service.name}`}
															/>
														</div>
													</div>
												))}
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</section>

			<section className='grid gap-6 lg:grid-cols-2 panel-grid-safe'>
				<div className='panel card-safe p-6'>
					<SectionHeader eyebrow='Informations Publiques' title='Annonces de la residence' description='Le module Information reste demonstrable sans compte, avec un contenu utile et facilement comprehensible.' />
					<div className='space-y-4'>
						{data.announcements?.map((announcement) => (
							<article key={announcement._id} className='glass-card card-safe p-5'>
								<div className='flex min-w-0 flex-wrap items-center justify-between gap-3'>
									<p className='truncate-safe text-xs uppercase tracking-[0.25em] text-amber-200' title={announcement.category}>{announcement.category}</p>
									<StatusBadge value={announcement.audience} />
								</div>
								<h3 className='safe-text mt-3 text-xl font-semibold text-white'>{announcement.title}</h3>
								<p className='safe-text mt-2 leading-relaxed text-slate-300'>{announcement.content}</p>
							</article>
						))}
					</div>
				</div>
				<div className='panel card-safe p-6'>
					<SectionHeader eyebrow='Connected Devices' title='Objets deja supervises' description='Chaque equipement contribue au recit intelligent du projet via ses zones, ses alertes et son statut.' />
					<div className='grid gap-3 sm:grid-cols-2 panel-grid-safe'>
						{(data.featuredDevices?.length ? data.featuredDevices : data.devices)?.map((device) => (
							<div key={device._id} className='glass-card card-safe p-4'>
								<div className='flex min-w-0 items-center justify-between gap-3'>
									<p className='truncate-safe text-sm text-emerald-200' title={device.category?.name}>{device.category?.name}</p>
									<StatusBadge value={device.status} />
								</div>
								<h3 className='safe-text mt-3 text-lg font-semibold text-white'>{device.name}</h3>
								<p className='truncate-safe mt-2 text-sm text-slate-300' title={device.zone?.name}>{device.zone?.name}</p>
								<div className='mt-3'>
									<HealthScoreBadge device={device} />
								</div>
							</div>
						))}
					</div>
				</div>
			</section>
		</div>
	);
};

export default HomePage;
