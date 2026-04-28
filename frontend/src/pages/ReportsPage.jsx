import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import axios from "../lib/axios";
import SectionHeader from "../components/SectionHeader";
import { formatNumber } from "../utils/format";
import { saveAs } from "./saveAsFallback";
import { useUserStore } from "../stores/useUserStore";
import { isAdmin } from "../utils/access";
import StatePanel from "../components/StatePanel";
import HealthScoreBadge from "../components/HealthScoreBadge";
import StatCard from "../components/StatCard";
import energyIcon from "../assets/icons/energy.png";
import waterIcon from "../assets/icons/water.png";
import alertsIcon from "../assets/icons/alerts.png";
import servicesIcon from "../assets/icons/services.png";

const chartColors = ["#5dd39e", "#70a9ff", "#f6bd60", "#ef6f6c"];

const ReportsPage = () => {
	const [report, setReport] = useState(null);
	const [status, setStatus] = useState({ loading: true, error: "" });
	const { user } = useUserStore();

	useEffect(() => {
		axios
			.get("/reports/overview")
			.then((res) => {
				setReport(res.data);
				setStatus({ loading: false, error: "" });
			})
			.catch((error) => setStatus({ loading: false, error: error.response?.data?.message || "Impossible de charger les rapports." }));
	}, []);

	const exportCsv = async () => {
		const response = await axios.get("/reports/export.csv", { responseType: "blob" });
		saveAs(response.data, "smartresidence-report.csv");
	};

	const exportAdminFile = async (url, filename) => {
		const response = await axios.get(url, { responseType: "blob" });
		saveAs(response.data, filename);
	};

	const statusData = Object.entries(report?.devicesByStatus || {}).map(([name, value]) => ({ name, value }));
	const usersByLevel = Object.entries(report?.usersByLevel || {}).map(([name, value]) => ({ name, value }));

	return (
		<div className='page-shell space-y-6'>
			<SectionHeader eyebrow='Rapports' title='Statistiques SmartResidence CY' description='Consommation, maintenance, niveaux utilisateurs, services utilises et export CSV.' />
			{status.loading && <StatePanel message='Generation des rapports en cours...' />}
			{status.error && <StatePanel tone='error' title='Rapports indisponibles' message={status.error} />}
			{report && (
				<>
					<div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
						<StatCard label='Energie totale' value={formatNumber(report.totalEnergyConsumption)} suffix='kWh' helper='Synthese de consommation globale' icon={energyIcon} />
						<StatCard label='Eau totale' value={formatNumber(report.totalWaterConsumption)} suffix='L' helper='Lecture consolidee de la residence' tone='sky' icon={waterIcon} />
						<StatCard label='Alertes maintenance' value={report.maintenanceAlerts} helper='Incidents ou anomalies prioritaires' tone='amber' icon={alertsIcon} />
						<StatCard label='Actions recentes' value={report.actionCounts} helper='Trace des operations recentes' tone='rose' icon={servicesIcon} />
					</div>
					<div className='grid gap-6 xl:grid-cols-2'>
						<div className='panel p-6'>
							<h2 className='text-2xl font-semibold'>Devices par statut</h2>
							<div className='mt-6 h-80'>
								<ResponsiveContainer width='100%' height='100%'>
									<PieChart>
										<Pie data={statusData} dataKey='value' nameKey='name' outerRadius={110}>
											{statusData.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}
										</Pie>
										<Tooltip />
									</PieChart>
								</ResponsiveContainer>
							</div>
						</div>
						<div className='panel p-6'>
							<h2 className='text-2xl font-semibold'>Utilisateurs par niveau</h2>
							<div className='mt-6 h-80'>
								<ResponsiveContainer width='100%' height='100%'>
									<BarChart data={usersByLevel}>
										<CartesianGrid strokeDasharray='3 3' stroke='rgba(173,196,234,0.12)' />
										<XAxis dataKey='name' stroke='#adc4ea' />
										<YAxis stroke='#adc4ea' />
										<Tooltip />
										<Bar dataKey='value' fill='#70a9ff' radius={[8, 8, 0, 0]} />
									</BarChart>
								</ResponsiveContainer>
							</div>
						</div>
					</div>
					<div className='grid gap-6 xl:grid-cols-[0.95fr_1.05fr]'>
						<div className='panel p-6'>
							<div className='flex flex-wrap items-center justify-between gap-3'>
								<h2 className='text-2xl font-semibold'>Services les plus utilises</h2>
								<span className='status-pill bg-sky-400/10 text-sky-200'>Insights usage</span>
							</div>
							<div className='mt-4 space-y-3'>
								{report.mostUsedServices.map((service, index) => (
									<div key={service._id} className='glass-card p-4'>
										<div className='flex items-center justify-between gap-3'>
											<p className='font-semibold text-white'>{index + 1}. {service.name}</p>
											<p className='text-sm text-slate-300'>{service.requests} demandes</p>
										</div>
									</div>
								))}
							</div>
						</div>
						<div className='panel p-6'>
							<h2 className='text-2xl font-semibold'>Activite recente</h2>
							<div className='mt-4 grid gap-3'>
								{report.recentActions.slice(0, 5).map((action) => (
									<div key={action._id} className='glass-card p-4'>
										<div className='flex items-center justify-between gap-3'>
											<p className='font-semibold text-white'>{action.actionType}</p>
											<p className='text-xs text-slate-400'>{action.user?.firstName || "Systeme"}</p>
										</div>
										<p className='mt-2 text-sm text-slate-300'>{action.targetType}</p>
									</div>
								))}
							</div>
						</div>
					</div>
					<div className='grid gap-6 xl:grid-cols-[1fr_1fr]'>
						<div className='panel p-6'>
							<h2 className='text-2xl font-semibold'>Acces recents</h2>
							<div className='mt-4 space-y-3'>
								{report.recentAccess.slice(0, 5).map((access) => (
									<div key={access._id} className='glass-card p-4'>
										<div className='flex items-center justify-between gap-3'>
											<p className='font-semibold text-white'>{access.accessType}</p>
											<p className='text-xs text-slate-400'>{access.user?.firstName || "Systeme"}</p>
										</div>
										<p className='mt-2 text-sm text-slate-300'>{access.route}</p>
									</div>
								))}
							</div>
						</div>
						<div className='panel p-6'>
							<div className='flex flex-wrap items-center justify-between gap-3'>
								<h2 className='text-2xl font-semibold'>Controle export</h2>
								{isAdmin(user) && <button className='btn-primary' onClick={exportCsv} type='button'>Exporter CSV</button>}
							</div>
							<div className='mt-4 grid gap-3'>
								{isAdmin(user) && (
									<div className='glass-card p-4'>
										<p className='font-semibold text-white'>Exporter les donnees</p>
										<div className='mt-3 flex flex-wrap gap-2'>
											<button className='btn-secondary px-3 py-2 text-sm' type='button' onClick={() => exportAdminFile("/admin/export/devices-csv", "devices_export.csv")}>Exporter Objets (CSV)</button>
											<button className='btn-secondary px-3 py-2 text-sm' type='button' onClick={() => exportAdminFile("/admin/export/users-csv", "users_export.csv")}>Exporter Utilisateurs (CSV)</button>
											<button className='btn-secondary px-3 py-2 text-sm' type='button' onClick={() => exportAdminFile("/admin/export/telemetry-csv", "telemetry_export.csv")}>Exporter Telemetrie (CSV)</button>
											<button className='btn-secondary px-3 py-2 text-sm' type='button' onClick={() => exportAdminFile("/admin/export/full-json", "smartresidence_export.json")}>Exporter tout (JSON)</button>
										</div>
									</div>
								)}
								<div className='glass-card p-4'>
									<p className='font-semibold text-white'>Export professor-ready</p>
									<p className='mt-2 text-sm text-slate-300'>Le CSV exporte l inventaire device, les zones, statuts, consommations et maintenance pour une soutenance ou un rendu.</p>
								</div>
								<div className='glass-card p-4'>
									<p className='font-semibold text-white'>Lecture rapide</p>
									<p className='mt-2 text-sm text-slate-300'>Les rapports affichent aussi les services les plus utilises, les niveaux utilisateurs et les signaux critiques du parc.</p>
								</div>
							</div>
						</div>
					</div>
					<div className='panel p-6'>
						<div className='flex flex-wrap items-center justify-between gap-3'>
							<h2 className='text-2xl font-semibold'>Equipements inefficients</h2>
							<span className='status-pill bg-rose-400/10 text-rose-100'>Maintenance predictive</span>
						</div>
						<div className='mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
							{report.inefficientDevices.map((device) => (
								<div key={device._id} className='rounded-2xl border border-rose-400/20 bg-rose-400/5 p-4'>
									<div className='flex items-center justify-between gap-3'>
										<p className='font-semibold text-rose-100'>{device.name}</p>
										<HealthScoreBadge device={device} />
									</div>
									<p className='mt-2 text-sm text-slate-300'>{device.zone?.name}</p>
									<p className='mt-2 text-sm text-slate-300'>Energie: {formatNumber(device.energyUsage)} kWh</p>
									<p className='mt-2 text-sm text-slate-300'>Maintenance: {device.maintenanceStatus}</p>
								</div>
							))}
						</div>
					</div>
				</>
			)}
		</div>
	);
};

export default ReportsPage;
