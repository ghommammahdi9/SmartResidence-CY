import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../lib/axios";
import SectionHeader from "../components/SectionHeader";
import StatePanel from "../components/StatePanel";
import StatusBadge from "../components/StatusBadge";
import SafeImage from "../components/SafeImage";
import { getZoneVisual } from "../utils/mediaMap";

const MyResidencePage = () => {
	const [data, setData] = useState(null);
	const [status, setStatus] = useState({ loading: true, error: "" });

	const load = async () => {
		try {
			const [residenceRes, maintenanceRes] = await Promise.all([
				axios.get("/members/me/residence"),
				axios.get("/members/me/maintenance-requests"),
			]);
			setData({ ...residenceRes.data, requests: maintenanceRes.data.requests });
			setStatus({ loading: false, error: "" });
		} catch (error) {
			setStatus({ loading: false, error: error.response?.data?.message || "Impossible de charger Ma residence." });
		}
	};

	useEffect(() => {
		load().catch(() => null);
	}, []);

	return (
		<div className='page-shell space-y-6'>
			<SectionHeader eyebrow='Vie residente' title='Ma residence' description='Informations utiles de votre chambre, zone de vie, services proches et suivi de vos signalements.' />
			{status.loading && <StatePanel message='Chargement de votre espace residence...' />}
			{status.error && <StatePanel tone='error' title='Ma residence indisponible' message={status.error} />}
			{data && (
				<>
					<div className='grid gap-6 lg:grid-cols-[0.95fr_1.05fr] panel-grid-safe'>
						<div className='panel-strong card-safe p-6'>
							<div className='photo-frame mb-4'>
								<SafeImage src={getZoneVisual(data.zone?.name)} alt={`Zone ${data.zone?.name || "residence"}`} className='h-64 w-full object-cover object-center' fallbackLabel='Zone residence' />
							</div>
							<h2 className='safe-text text-2xl font-semibold text-white'>{data.studentName || "Resident"} · Chambre {data.roomNumber}</h2>
							<p className='safe-text mt-2 text-slate-300'>{data.zone?.description}</p>
							<div className='mt-4 flex flex-wrap gap-2'>
								<StatusBadge value={data.zone?.status || "active"} />
								<span className='status-pill' title={data.zone?.name}>{data.zone?.name}</span>
							</div>
							<div className='mt-5 grid gap-3 sm:grid-cols-2 text-sm text-slate-300 panel-grid-safe'>
								<div className='glass-card card-safe p-4'>
									<p className='font-semibold text-white'>Wi-Fi residence</p>
									<p className='safe-text mt-2'>{data.usefulInfo.wifi}</p>
								</div>
								<div className='glass-card card-safe p-4'>
									<p className='font-semibold text-white'>Contacts d urgence</p>
									<p className='safe-text mt-2'>{data.usefulInfo.emergencyContacts.join(" · ")}</p>
								</div>
								<div className='glass-card card-safe p-4'>
									<p className='font-semibold text-white'>Heures calmes</p>
									<p className='safe-text mt-2'>{data.usefulInfo.quietHours}</p>
								</div>
								<div className='glass-card card-safe p-4'>
									<p className='font-semibold text-white'>Acces rapide</p>
									<Link className='mt-2 inline-flex text-emerald-300 hover:text-emerald-200' to='/report-issue' state={{ zoneId: data.zone?._id }}>
										Signaler un probleme
									</Link>
								</div>
							</div>
						</div>
						<div className='panel card-safe p-6'>
							<h2 className='text-2xl font-semibold text-white'>Objets proches et infos utiles</h2>
							<div className='mt-4 grid gap-3'>
								{data.nearbyDevices.length === 0 && <StatePanel compact message='Aucun objet connecte dans cette zone pour le moment.' />}
								{data.nearbyDevices.map((device) => (
									<div key={device._id} className='glass-card card-safe p-4'>
										<div className='flex min-w-0 items-center justify-between gap-3'>
											<p className='truncate-safe font-semibold text-white' title={device.name}>{device.name}</p>
											<StatusBadge value={device.status} />
										</div>
										<p className='truncate-safe mt-2 text-sm text-slate-300' title={device.zone?.name}>{device.zone?.name}</p>
									</div>
								))}
							</div>
							<div className='mt-5 card-safe rounded-3xl border border-slate-700/50 bg-slate-950/60 p-5'>
								<p className='text-sm uppercase tracking-[0.25em] text-slate-400'>Regles residents</p>
								<ul className='mt-3 space-y-2 text-sm text-slate-300'>
									{data.usefulInfo.commonAreaRules.map((rule) => <li key={rule}>{rule}</li>)}
								</ul>
							</div>
						</div>
					</div>

					<div className='grid gap-6 xl:grid-cols-[0.9fr_1.1fr] panel-grid-safe'>
						<div className='panel card-safe p-6'>
							<div className='flex flex-wrap items-center justify-between gap-3'>
								<h2 className='text-2xl font-semibold text-white'>Infos residence utiles</h2>
								<Link to='/dashboard' className='btn-secondary'>Retour dashboard</Link>
							</div>
							<div className='mt-5 grid gap-4'>
								<div className='glass-card card-safe p-5'>
									<p className='font-semibold text-white'>Reseau etudiante</p>
									<p className='safe-text mt-2 text-sm text-slate-300'>Wi-Fi: {data.usefulInfo.wifi}</p>
								</div>
								<div className='glass-card card-safe p-5'>
									<p className='font-semibold text-white'>Regles communes</p>
									<p className='safe-text mt-2 text-sm text-slate-300'>{data.usefulInfo.rules.join(" · ")}</p>
								</div>
								<div className='glass-card card-safe p-5'>
									<p className='font-semibold text-white'>Besoin d aide ?</p>
									<p className='safe-text mt-2 text-sm leading-relaxed text-slate-300'>Vous pouvez ouvrir un signalement maintenance pour votre chambre, votre couloir ou un espace commun.</p>
									<Link className='btn-primary mt-4' to='/report-issue' state={{ zoneId: data.zone?._id }}>
										Signaler un probleme
									</Link>
								</div>
								<div className='glass-card card-safe p-5'>
									<p className='font-semibold text-white'>Annonces a venir</p>
									<div className='mt-3 space-y-3'>
										{data.announcements?.map((announcement) => (
											<div key={announcement._id} className='card-safe rounded-2xl border border-slate-700/40 bg-slate-950/40 p-3'>
												<p className='safe-text font-medium text-white'>{announcement.title}</p>
												<p className='safe-text mt-1 text-sm text-slate-300'>{announcement.content}</p>
											</div>
										))}
										{(!data.announcements || data.announcements.length === 0) && <StatePanel compact message='Aucune annonce programmee pour le moment.' />}
									</div>
								</div>
							</div>
						</div>

						<div className='panel card-safe p-6'>
							<h2 className='text-2xl font-semibold text-white'>Mes demandes maintenance</h2>
							<div className='mt-4 space-y-3'>
								{data.requests.map((request) => (
									<div key={request._id} className='glass-card card-safe p-4'>
										<div className='flex min-w-0 items-center justify-between gap-3'>
											<p className='safe-text font-semibold text-white'>{request.category || "Autre"} · {request.reason}</p>
											<StatusBadge value={request.status} />
										</div>
										<p className='mt-2 text-sm text-slate-300'>Priorite: {request.priority}</p>
									</div>
								))}
								{data.requests.length === 0 && <StatePanel compact message='Aucune demande de maintenance personnelle pour le moment.' />}
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
};

export default MyResidencePage;
