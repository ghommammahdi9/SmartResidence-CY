import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../lib/axios";
import SectionHeader from "../components/SectionHeader";
import { formatDate, formatNumber } from "../utils/format";
import StatePanel from "../components/StatePanel";
import StatusBadge from "../components/StatusBadge";
import HealthScoreBadge from "../components/HealthScoreBadge";
import { computeDeviceHealth } from "../utils/deviceHealth";
import { useUserStore } from "../stores/useUserStore";
import { canAccessGestion } from "../utils/access";
import energyIcon from "../assets/icons/energy.png";
import waterIcon from "../assets/icons/water.png";
import maintenanceIcon from "../assets/icons/maintenance.png";
import securityIcon from "../assets/icons/security.png";

const DeviceDetailsPage = () => {
	const { id } = useParams();
	const { user } = useUserStore();
	const [data, setData] = useState(null);
	const [stats, setStats] = useState(null);
	const [status, setStatus] = useState({ loading: true, error: "" });

	useEffect(() => {
		Promise.all([axios.get(`/devices/${id}`), axios.get(`/devices/${id}/statistics`)])
			.then(([detailRes, statsRes]) => {
				setData(detailRes.data);
				setStats(statsRes.data);
				setStatus({ loading: false, error: "" });
			})
			.catch((error) => setStatus({ loading: false, error: error.response?.data?.message || "Impossible de charger le device." }));
	}, [id]);

	const getAlertBadges = () => {
		if (!data?.device) return [];
		const settings = data.settings || { batteryThreshold: 20, energyThreshold: 50, inactivityDays: 7 };
		const badges = [];
		if ((data.device.batteryLevel ?? 100) < settings.batteryThreshold) badges.push("Batterie faible");
		if ((data.device.energyUsage ?? 0) > settings.energyThreshold) badges.push("Surconsommation");
		const lastInteraction = data.device.lastInteraction ? new Date(data.device.lastInteraction) : null;
		if (lastInteraction) {
			const diffDays = (Date.now() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24);
			if (diffDays > settings.inactivityDays) badges.push("Inactif");
		}
		return badges;
	};

	return (
		<div className='page-shell space-y-6'>
			<SectionHeader eyebrow='Device' title={data?.device?.name || "Device"} description={data?.device?.description || "Details et telemetry du device."} />
			{status.loading && <StatePanel message='Chargement du device...' />}
			{status.error && <StatePanel tone='error' title='Device indisponible' message={status.error} />}
			{data && stats && (
				<>
					{!canAccessGestion(user) ? (
						<div className='panel p-6'>
							<h2 className='text-2xl font-semibold'>Vue etudiante</h2>
							<div className='mt-4 flex flex-wrap gap-2'>
								<span className='status-pill'>{data.device.zone?.name}</span>
								<StatusBadge value={data.device.status} />
							</div>
							<p className='mt-4 text-slate-300'>Les details techniques, la telemetrie, la batterie et les alertes avancees sont reserves au module Gestion.</p>
						</div>
					) : (
						<>
					<div className='panel-strong p-6'>
						<div className='flex flex-wrap items-center justify-between gap-4'>
							<div>
								<p className='text-xs uppercase tracking-[0.3em] text-emerald-300'>Maintenance predictive</p>
								<h2 className='mt-2 text-2xl font-semibold text-white'>Sante du device et recommandations</h2>
							</div>
							<HealthScoreBadge device={data.device} />
						</div>
						<div className='mt-4 grid gap-3 md:grid-cols-3'>
							<div className='glass-card p-4'>
								<p className='text-sm text-slate-300'>Score global</p>
								<p className='mt-2 text-3xl font-semibold text-white'>{computeDeviceHealth(data.device).score}/100</p>
							</div>
							<div className='glass-card p-4'>
								<p className='text-sm text-slate-300'>Diagnostic</p>
								<p className='mt-2 text-xl font-semibold text-white'>{computeDeviceHealth(data.device).label}</p>
							</div>
							<div className='glass-card p-4'>
								<p className='text-sm text-slate-300'>Facteurs</p>
								<p className='mt-2 text-sm text-slate-200'>{computeDeviceHealth(data.device).reasons.join(", ") || "Aucun signal faible detecte"}</p>
							</div>
						</div>
					</div>
					<div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
						<div className='metric-tile'>
							<img alt='' className='h-10 w-10 rounded-2xl object-contain' src={energyIcon} />
							<p className='text-sm text-slate-300'>Energie totale</p>
							<p className='text-2xl font-semibold text-white'>{formatNumber(stats.totals.energyUsage)} kWh</p>
						</div>
						<div className='metric-tile'>
							<img alt='' className='h-10 w-10 rounded-2xl object-contain' src={waterIcon} />
							<p className='text-sm text-slate-300'>Eau totale</p>
							<p className='text-2xl font-semibold text-white'>{formatNumber(stats.totals.waterUsage)} L</p>
						</div>
						<div className='metric-tile'>
							<img alt='' className='h-10 w-10 rounded-2xl object-contain' src={securityIcon} />
							<p className='text-sm text-slate-300'>Signal reseau</p>
							<p className='text-2xl font-semibold text-white'>{data.device.connectivitySignal}%</p>
						</div>
						<div className='metric-tile'>
							<img alt='' className='h-10 w-10 rounded-2xl object-contain' src={maintenanceIcon} />
							<p className='text-sm text-slate-300'>Maintenance</p>
							<p className='text-2xl font-semibold text-white capitalize'>{data.device.maintenanceStatus}</p>
						</div>
					</div>
					<div className='grid gap-6 lg:grid-cols-[0.9fr_1.1fr]'>
						<div className='panel p-6'>
							<h2 className='text-2xl font-semibold'>Etat courant</h2>
							<div className='mt-4 flex flex-wrap gap-2'>
								<StatusBadge value={data.device.status} />
								<StatusBadge value={data.device.maintenanceStatus} variant='warning' />
								{getAlertBadges().map((badge) => (
									<span key={badge} className='inline-flex rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-100'>{badge}</span>
								))}
							</div>
							<div className='mt-4 grid gap-3 text-sm text-slate-300'>
								<p>Zone: {data.device.zone?.name}</p>
								<p>Statut: {data.device.status}</p>
								<p>Connectivite: {data.device.connectivityType}</p>
								<p>Signal: {data.device.connectivitySignal}%</p>
								<p>Batterie: {data.device.batteryLevel}%</p>
								<p>Derniere interaction: {formatDate(data.device.lastInteraction)}</p>
							</div>
						</div>
						<div className='panel p-6'>
							<h2 className='text-2xl font-semibold'>Consommation et maintenance</h2>
							<div className='mt-4 grid gap-3 sm:grid-cols-2 text-sm text-slate-300'>
								<p>Energie device: {formatNumber(data.device.energyUsage)} kWh</p>
								<p>Eau device: {formatNumber(data.device.waterUsage)} L</p>
								<p>Maintenance: {data.device.maintenanceStatus}</p>
								<p>Deletion request: {data.device.deletionRequestStatus}</p>
								<p>Total energie telemetry: {formatNumber(stats.totals.energyUsage)} kWh</p>
								<p>Total eau telemetry: {formatNumber(stats.totals.waterUsage)} L</p>
							</div>
						</div>
					</div>
					<div className='panel p-6'>
						<h2 className='text-2xl font-semibold'>Telemetry recente</h2>
						<div className='mt-4 overflow-x-auto'>
							<table className='min-w-full text-left text-sm text-slate-300'>
								<thead className='text-slate-100'><tr><th className='pb-3 pr-4'>Horodatage</th><th className='pb-3 pr-4'>Energie</th><th className='pb-3 pr-4'>Eau</th><th className='pb-3 pr-4'>Statut</th></tr></thead>
								<tbody>
									{data.telemetry.map((item) => <tr key={item._id} className='border-t border-slate-700/30'><td className='py-3 pr-4'>{formatDate(item.timestamp)}</td><td className='py-3 pr-4'>{formatNumber(item.energyUsage)}</td><td className='py-3 pr-4'>{formatNumber(item.waterUsage)}</td><td className='py-3 pr-4'>{item.statusSnapshot}</td></tr>)}
								</tbody>
							</table>
						</div>
						{data.telemetry.length === 0 && <div className='mt-4'><StatePanel compact message='Aucune mesure de telemetry recente n est disponible pour ce device.' /></div>}
					</div>
						</>
					)}
				</>
			)}
		</div>
	);
};

export default DeviceDetailsPage;
