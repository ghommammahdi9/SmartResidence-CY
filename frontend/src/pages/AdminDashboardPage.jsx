import { useEffect, useState } from "react";
import { CheckCircle2, Database, Download, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";
import SectionHeader from "../components/SectionHeader";
import StatePanel from "../components/StatePanel";
import StatusBadge from "../components/StatusBadge";
import HealthScoreBadge from "../components/HealthScoreBadge";
import LevelProgress from "../components/LevelProgress";
import { computeDeviceHealth } from "../utils/deviceHealth";
import { getMemberTypeLabel } from "../utils/access";
import accessIcon from "../assets/icons/access.png";
import maintenanceIcon from "../assets/icons/maintenance.png";
import servicesIcon from "../assets/icons/services.png";
import alertsIcon from "../assets/icons/alerts.png";

const initialServiceForm = {
	name: "",
	description: "",
	category: "",
	zone: "",
	availability: "daily",
	status: "active",
};

const initialSettingForm = { key: "", value: "", description: "" };
const initialApprovedMemberForm = {
	residenceMemberId: "",
	firstName: "",
	lastName: "",
	memberType: "resident",
	roomNumber: "",
};

const safe = (val, fallback = []) => val || fallback;
const numberOrZero = (val) => {
	const value = Number(val);
	return Number.isFinite(value) ? value : 0;
};
const formatDate = (val, options = {}) => {
	if (!val) return options.fallback || "-";
	const date = new Date(val);
	if (Number.isNaN(date.getTime())) return options.fallback || "-";
	return options.withTime ? date.toLocaleString("fr-FR") : date.toLocaleDateString("fr-FR");
};

const AdminDashboardPage = () => {
	const [data, setData] = useState({});
	const [status, setStatus] = useState({ loading: true, error: "" });
	const [rejectionReasons, setRejectionReasons] = useState({});
	const [newDeviceCategory, setNewDeviceCategory] = useState("");
	const [newServiceCategory, setNewServiceCategory] = useState("");
	const [serviceForm, setServiceForm] = useState(initialServiceForm);
	const [settingForm, setSettingForm] = useState(initialSettingForm);
	const [approvedMemberForm, setApprovedMemberForm] = useState(initialApprovedMemberForm);
	const [activeAdminPanel, setActiveAdminPanel] = useState("requests");
	const [integrityReport, setIntegrityReport] = useState(null);
	const [dataOpsStatus, setDataOpsStatus] = useState({ backingUp: false, checkingIntegrity: false });

	const load = async () => {
		try {
			const results = await Promise.allSettled([
				axios.get("/admin/dashboard"),
				axios.get("/admin/registration-requests"),
				axios.get("/admin/device-categories"),
				axios.get("/admin/service-categories"),
				axios.get("/admin/approved-members"),
				axios.get("/admin/statistics"),
			]);

			const getValue = (result, fallback = {}) => {
				if (result.status === "fulfilled") return result.value.data;
				return fallback;
			};

			const dashboardData = getValue(results[0], {});
			const registrationData = getValue(results[1], {});
			const deviceCatData = getValue(results[2], {});
			const serviceCatData = getValue(results[3], {});
			const approvedData = getValue(results[4], {});
			const statsData = getValue(results[5], {});
			const failedRequests = results.filter((result) => result.status === "rejected");

			setData({
				...dashboardData,
				users: dashboardData.users || [],
				devices: dashboardData.devices || [],
				recentAccess: dashboardData.recentAccess || [],
				recentActions: dashboardData.recentActions || [],
				maintenanceRequests: dashboardData.maintenanceRequests || [],
				settings: dashboardData.settings || [],
				registrationRequests: registrationData.requests || registrationData.registrationRequests || [],
				deviceCategories: deviceCatData.categories || deviceCatData.deviceCategories || [],
				serviceCategories: serviceCatData.categories || serviceCatData.serviceCategories || [],
				approvedMembers: approvedData.members || approvedData.approvedMembers || [],
				statistics: statsData || {},
			});
			setStatus({
				loading: false,
				error: failedRequests.length ? "Certaines donnees administratives sont indisponibles, affichage partiel active." : "",
			});
		} catch (error) {
			setStatus({ loading: false, error: error.response?.data?.message || "Impossible de charger l'administration." });
		}
	};

	useEffect(() => {
		load().catch(() => setStatus({ loading: false, error: "Erreur de chargement." }));
	}, []);

	const canReviewRegistration = (requestStatus) => requestStatus === "pending_admin" || requestStatus === "pending";

	const approveRegistration = async (id) => {
		try {
			await axios.put(`/admin/registration-requests/${id}/approve`);
			toast.success("Demande approuvée, email de vérification envoyé");
			await load();
		} catch (error) {
			toast.error(error.response?.data?.message || "Impossible d'approuver la demande.");
		}
	};

	const rejectRegistration = async (id) => {
		try {
			await axios.put(`/admin/registration-requests/${id}/reject`, {
				rejectionReason: rejectionReasons[id] || "",
			});
			toast.success("Demande rejetée");
			await load();
		} catch (error) {
			toast.error(error.response?.data?.message || "Impossible de rejeter la demande.");
		}
	};

	const updateUser = async (id, payload) => {
		try {
			await axios.patch(`/admin/users/${id}`, payload);
			toast.success("Utilisateur mis a jour.");
			await load();
		} catch (error) {
			toast.error(error.response?.data?.message || "Erreur mise a jour utilisateur.");
		}
	};

	const deleteUser = async (id) => {
		try {
			await axios.delete(`/admin/users/${id}`);
			toast.success("Utilisateur supprime.");
			await load();
		} catch (error) {
			toast.error(error.response?.data?.message || "Erreur suppression utilisateur.");
		}
	};

	const addDeviceCategory = async () => {
		if (!newDeviceCategory) return;
		try {
			await axios.post("/admin/device-categories", { name: newDeviceCategory, description: "Ajout admin" });
			setNewDeviceCategory("");
			await load();
		} catch (error) {
			toast.error(error.response?.data?.message || "Erreur ajout categorie.");
		}
	};

	const addServiceCategory = async () => {
		if (!newServiceCategory) return;
		try {
			await axios.post("/admin/service-categories", { name: newServiceCategory, description: "Ajout admin" });
			setNewServiceCategory("");
			await load();
		} catch (error) {
			toast.error(error.response?.data?.message || "Erreur ajout categorie.");
		}
	};

	const reviewRequest = async (id, statusValue) => {
		try {
			await axios.patch(`/admin/maintenance-requests/${id}`, { status: statusValue });
			toast.success("Demande de maintenance mise a jour.");
			await load();
		} catch (error) {
			toast.error(error.response?.data?.message || "Erreur mise a jour maintenance.");
		}
	};

	const createService = async (event) => {
		event.preventDefault();
		try {
			await axios.post("/services", {
				...serviceForm,
				usageStats: { requests: 0, satisfaction: 0 },
			});
			toast.success("Service ajoute.");
			setServiceForm(initialServiceForm);
			await load();
		} catch (error) {
			toast.error(error.response?.data?.message || "Erreur ajout service.");
		}
	};

	const saveSetting = async (event) => {
		event.preventDefault();
		try {
			const parsedValue = Number.isNaN(Number(settingForm.value)) ? settingForm.value : Number(settingForm.value);
			await axios.post("/admin/settings", { ...settingForm, value: parsedValue });
			toast.success("Regle mise a jour.");
			setSettingForm(initialSettingForm);
			await load();
		} catch (error) {
			toast.error(error.response?.data?.message || "Erreur sauvegarde regle.");
		}
	};

	const createApprovedMember = async (event) => {
		event.preventDefault();
		try {
			await axios.post("/admin/approved-members", approvedMemberForm);
			toast.success("Membre autorise ajoute.");
			setApprovedMemberForm(initialApprovedMemberForm);
			await load();
		} catch (error) {
			toast.error(error.response?.data?.message || "Erreur ajout membre.");
		}
	};

	const deleteApprovedMember = async (id) => {
		try {
			await axios.delete(`/admin/approved-members/${id}`);
			toast.success("Membre autorise retire.");
			await load();
		} catch (error) {
			toast.error(error.response?.data?.message || "Erreur suppression membre.");
		}
	};

	const downloadBackup = async () => {
		try {
			setDataOpsStatus((current) => ({ ...current, backingUp: true }));
			const response = await axios.get("/admin/backup", { responseType: "blob" });
			const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/json" }));
			const link = document.createElement("a");
			link.href = url;
			link.download = `smartresidence_backup_${Date.now()}.json`;
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);
			toast.success("Sauvegarde telechargee");
			await load();
		} catch (error) {
			toast.error(error.response?.data?.message || "Impossible de telecharger la sauvegarde.");
		} finally {
			setDataOpsStatus((current) => ({ ...current, backingUp: false }));
		}
	};

	const checkIntegrity = async () => {
		try {
			setDataOpsStatus((current) => ({ ...current, checkingIntegrity: true }));
			const response = await axios.get("/admin/data-integrity");
			setIntegrityReport(response.data);
			toast.success(response.data.status === "ok" ? "Integrite verifiee" : "Verification terminee avec alertes");
		} catch (error) {
			toast.error(error.response?.data?.message || "Impossible de verifier l integrite des donnees.");
		} finally {
			setDataOpsStatus((current) => ({ ...current, checkingIntegrity: false }));
		}
	};

	const stats = data.statistics || {};
	const devices = safe(data.devices);
	const users = safe(data.users);
	const registrationRequests = safe(data.registrationRequests);
	const maintenanceRequests = safe(data.maintenanceRequests);
	const recentActions = safe(data.recentActions);
	const settings = safe(data.settings);
	const approvedMembers = safe(data.approvedMembers);
	const serviceCategories = safe(data.serviceCategories);

	const estimatedDatabaseSize = (() => {
		const totalDocs =
			(stats.totalUsers || 0) +
			(stats.totalDevices || 0) +
			(stats.totalServices || 0) +
			(stats.totalZones || 0) +
			(stats.totalTelemetryEntries || 0) +
			(safe(data.recentAccess).length) +
			(recentActions.length) +
			(maintenanceRequests.length) +
			(registrationRequests.length) +
			(approvedMembers.length) +
			(settings.length);
		return `${Math.max(1, (totalDocs * 2.4) / 1024).toFixed(2)} Mo estimés`;
	})();

	return (
		<div className='page-shell space-y-6'>
			<SectionHeader eyebrow='Administration' title='Centre de commandement SmartResidence CY' description='Validation des inscriptions, roles, maintenance, services, regles et integrite globale de la plateforme.' />
			{status.loading && <StatePanel message='Chargement des donnees administratives...' />}
			{status.error && <StatePanel tone='error' title='Administration indisponible' message={status.error} />}
			{!status.loading && (
				<>
					<div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
						<div className='panel p-5'><div className='flex items-start justify-between gap-3'><div><p className='text-xs uppercase tracking-[0.3em] text-slate-400'>Energie totale</p><p className='mt-4 text-3xl font-semibold text-white'>{numberOrZero(stats.totalEnergyConsumption).toFixed(1)}</p></div><img src={maintenanceIcon} alt='Consommation energetique totale' className='h-11 w-11 rounded-2xl bg-white/10 p-2' /></div><p className='mt-3 text-sm text-slate-300'>kWh consolides sur la residence.</p></div>
						<div className='panel p-5'><div className='flex items-start justify-between gap-3'><div><p className='text-xs uppercase tracking-[0.3em] text-slate-400'>Eau totale</p><p className='mt-4 text-3xl font-semibold text-white'>{numberOrZero(stats.totalWaterConsumption).toFixed(1)}</p></div><img src={alertsIcon} alt='Consommation d eau totale' className='h-11 w-11 rounded-2xl bg-white/10 p-2' /></div><p className='mt-3 text-sm text-slate-300'>Litres telemetriques consolides.</p></div>
						<div className='panel p-5'><div className='flex items-start justify-between gap-3'><div><p className='text-xs uppercase tracking-[0.3em] text-slate-400'>Connexion semaine</p><p className='mt-4 text-3xl font-semibold text-white'>{numberOrZero(stats.userConnectionRate).toFixed(0)}%</p></div><img src={accessIcon} alt='Taux de connexion utilisateurs' className='h-11 w-11 rounded-2xl bg-white/10 p-2' /></div><p className='mt-3 text-sm text-slate-300'>Utilisateurs actifs sur 7 jours.</p></div>
						<div className='panel p-5'><div className='flex items-start justify-between gap-3'><div><p className='text-xs uppercase tracking-[0.3em] text-slate-400'>Batterie moyenne</p><p className='mt-4 text-3xl font-semibold text-white'>{numberOrZero(stats.averageBatteryLevel).toFixed(0)}%</p></div><img src={servicesIcon} alt='Niveau moyen de batterie des devices' className='h-11 w-11 rounded-2xl bg-white/10 p-2' /></div><p className='mt-3 text-sm text-slate-300'>Sante generale du parc connecte.</p></div>
					</div>
					<div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
						<div className='glass-card p-4'>
							<p className='text-sm text-slate-300'>Devices actifs</p>
							<p className='mt-2 text-2xl font-semibold text-white'>{stats.devicesByStatus?.active || 0}/{stats.totalDevices || devices.length}</p>
						</div>
						<div className='glass-card p-4'>
							<p className='text-sm text-slate-300'>Demandes maintenance en attente</p>
							<p className='mt-2 text-2xl font-semibold text-white'>{stats.totalMaintenanceRequests?.pending || 0}</p>
						</div>
						<div className='glass-card p-4'>
							<p className='text-sm text-slate-300'>Inscriptions a traiter</p>
							<p className='mt-2 text-2xl font-semibold text-white'>{(stats.registrationStats?.pending_admin || 0) + (stats.registrationStats?.pending_email || 0)}</p>
						</div>
					</div>
					<div className='panel p-6'>
						<div className='flex flex-wrap items-center justify-between gap-3'>
							<h2 className='text-2xl font-semibold text-white'>Top services et synthese residence</h2>
							<span className='status-pill bg-sky-400/10 text-sky-100'>Statistiques globales</span>
						</div>
						<div className='mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5'>
							{safe(stats.mostUsedServices).slice(0, 5).map((service) => (
								<div key={service._id || service.name} className='glass-card p-4'>
									<p className='text-sm text-slate-300'>{service.name}</p>
									<p className='mt-2 text-2xl font-semibold text-white'>{service.requests}</p>
									<p className='mt-1 text-xs text-slate-500'>demandes</p>
								</div>
							))}
						</div>
					</div>

					<div className='panel p-6'>
						<div className='flex flex-wrap items-center justify-between gap-3'>
							<div>
								<p className='text-xs uppercase tracking-[0.3em] text-slate-400'>Gestion des donnees</p>
								<h2 className='mt-2 text-2xl font-semibold text-white'>Sauvegarde et verification d integrite</h2>
							</div>
							<span className='status-pill bg-emerald-400/10 text-emerald-100'>Operations admin</span>
						</div>
						<div className='mt-5 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]'>
							<div className='grid gap-4 sm:grid-cols-2'>
								<button type='button' className='glass-card p-5 text-left' onClick={downloadBackup} disabled={dataOpsStatus.backingUp}>
									<div className='flex items-center gap-3 text-emerald-200'>
										<Download size={18} />
										<p className='font-semibold'>Sauvegarder la BDD</p>
									</div>
									<p className='mt-3 text-sm text-slate-300'>{dataOpsStatus.backingUp ? "Generation du backup en cours..." : "Telecharge un instantane JSON complet de SmartResidence CY."}</p>
								</button>
								<button type='button' className='glass-card p-5 text-left' onClick={checkIntegrity} disabled={dataOpsStatus.checkingIntegrity}>
									<div className='flex items-center gap-3 text-sky-200'>
										<ShieldCheck size={18} />
										<p className='font-semibold'>Verifier l integrite</p>
									</div>
									<p className='mt-3 text-sm text-slate-300'>{dataOpsStatus.checkingIntegrity ? "Analyse en cours..." : "Controle les references orphelines, roles, niveaux, telemetry et zones vides."}</p>
								</button>
								<div className='glass-card p-5 sm:col-span-2'>
									<div className='flex items-center gap-3 text-amber-100'>
										<Database size={18} />
										<p className='font-semibold'>Etat de la base</p>
									</div>
									<div className='mt-4 grid gap-3 md:grid-cols-3 text-sm text-slate-300'>
										<div>
											<p className='text-slate-400'>Derniere sauvegarde</p>
											<p className='mt-1 text-white'>{formatDate(stats.lastBackupAt, { fallback: "Aucune encore", withTime: true })}</p>
										</div>
										<div>
											<p className='text-slate-400'>Documents sauvegardes</p>
											<p className='mt-1 text-white'>{stats.lastBackupDocumentCount || 0}</p>
										</div>
										<div>
											<p className='text-slate-400'>Taille estimee</p>
											<p className='mt-1 text-white'>{estimatedDatabaseSize}</p>
										</div>
									</div>
								</div>
							</div>
							<div>
								{!integrityReport && (
									<StatePanel message='Aucun rapport d integrite lance pour le moment. Utilisez le bouton ci-contre pour analyser la coherence des donnees.' />
								)}
								{integrityReport && integrityReport.status === "ok" && (
									<div className='glass-card border-emerald-400/20 bg-emerald-400/10 p-5'>
										<div className='flex items-center gap-3 text-emerald-100'>
											<CheckCircle2 size={20} />
											<p className='font-semibold'>Toutes les verifications sont passees ✓</p>
										</div>
										<p className='mt-3 text-sm text-emerald-50'>Controle effectue le {formatDate(integrityReport.checkedAt, { withTime: true })}.</p>
										<p className='mt-2 text-sm text-emerald-50'>Aucune anomalie bloquante detectee sur les 6 controles techniques.</p>
									</div>
								)}
								{integrityReport && integrityReport.status === "issues_found" && (
									<div className='glass-card border-amber-400/20 bg-amber-400/10 p-5'>
										<p className='font-semibold text-amber-50'>Verification terminee avec alertes</p>
										<p className='mt-2 text-sm text-amber-50'>Controle effectue le {formatDate(integrityReport.checkedAt, { withTime: true })}.</p>
										<div className='mt-4 space-y-3'>
											{safe(integrityReport.issues).map((issue, index) => (
												<div key={`${issue.type}-${index}`} className='rounded-2xl border border-amber-200/15 bg-slate-950/30 p-3 text-sm text-slate-200'>
													<p className='font-medium text-white'>{issue.type}</p>
													<p className='mt-1'>{issue.message}</p>
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						</div>
					</div>

					<div className='grid gap-6 xl:grid-cols-2'>
						<div className='panel-strong p-6'>
							<div className='mb-4 flex flex-wrap gap-2'>
								<button type='button' className={activeAdminPanel === "requests" ? "btn-primary px-4 py-2 text-sm" : "btn-secondary px-4 py-2 text-sm"} onClick={() => setActiveAdminPanel("requests")}>Inscriptions</button>
								<button type='button' className={activeAdminPanel === "maintenance" ? "btn-primary px-4 py-2 text-sm" : "btn-secondary px-4 py-2 text-sm"} onClick={() => setActiveAdminPanel("maintenance")}>Maintenance</button>
							</div>
							{activeAdminPanel === "requests" ? (
								<>
								<h2 className='text-2xl font-semibold text-white'>Demandes d&apos;inscription</h2>
							<div className='mt-4 overflow-x-auto'>
								<table className='min-w-full text-left text-sm text-slate-300'>
									<thead className='text-slate-100'>
										<tr>
											<th className='pb-3 pr-4'>Nom</th>
											<th className='pb-3 pr-4'>Email</th>
											<th className='pb-3 pr-4'>Member ID</th>
											<th className='pb-3 pr-4'>Status</th>
											<th className='pb-3 pr-4'>Date</th>
											<th className='pb-3 pr-4'>Actions</th>
										</tr>
									</thead>
									<tbody>
										{registrationRequests.length === 0 && (
											<tr>
												<td className='py-4 text-slate-400' colSpan='6'>Aucune demande disponible.</td>
											</tr>
										)}
										{registrationRequests.map((request) => (
											<tr key={request._id} className='border-t border-slate-700/30 align-top'>
												<td className='py-3 pr-4 font-medium text-white'><span className='truncate-safe block max-w-[13rem]' title={`${request.firstName} ${request.lastName}`}>{request.firstName} {request.lastName}</span></td>
												<td className='py-3 pr-4'><span className='truncate-safe block max-w-[16rem]' title={request.email}>{request.email}</span></td>
												<td className='py-3 pr-4'><span className='truncate-safe block max-w-[10rem]' title={request.residenceMemberId || "-"}>{request.residenceMemberId || "-"}</span></td>
												<td className='py-3 pr-4'><StatusBadge value={request.status} /></td>
												<td className='py-3 pr-4'>{formatDate(request.createdAt)}</td>
												<td className='py-3 pr-4'>
													{canReviewRegistration(request.status) ? (
														<div className='space-y-2'>
															<div className='flex flex-wrap gap-2'>
																<button
																	className='rounded-2xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/25'
																	onClick={() => approveRegistration(request._id)}
																>
																	Approuver
																</button>
																<button
																	type='button'
																	className='rounded-2xl border border-rose-400/30 bg-rose-500/15 px-4 py-2 text-sm font-medium text-rose-100 transition hover:bg-rose-500/25'
																	onClick={() => rejectRegistration(request._id)}
																>
																	Rejeter
																</button>
															</div>
															<input
																className='field min-w-[220px]'
																placeholder='Raison optionnelle de rejet'
																value={rejectionReasons[request._id] || ""}
																onChange={(event) =>
																	setRejectionReasons((current) => ({ ...current, [request._id]: event.target.value }))
																}
															/>
														</div>
													) : request.status === "pending_email" ? (
														<span className='inline-flex rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-100'>En attente email</span>
													) : request.status === "approved" ? (
														<span className='inline-flex rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-100'>Approuvé</span>
													) : (
														<span className='inline-flex rounded-full border border-rose-300/30 bg-rose-400/10 px-3 py-1 text-xs font-semibold text-rose-100'>Rejeté</span>
													)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
								</>
							) : (
								<>
									<h2 className='text-2xl font-semibold text-white'>Maintenance / suppression</h2>
									<div className='mt-4 space-y-3'>
										{maintenanceRequests.length === 0 && <StatePanel message='Aucune demande de maintenance ouverte.' />}
										{maintenanceRequests.map((request) => (
											<div key={request._id} className='glass-card p-4'>
												<div className='flex items-center justify-between gap-3'>
													<p className='font-semibold text-white'>{request.device?.name || "Device inconnu"}</p>
													<StatusBadge value={request.status} />
												</div>
												<p className='mt-2 text-sm text-slate-300'>{request.type} - {request.reason}</p>
												<div className='mt-4 flex gap-2'>
													<button className='btn-primary px-4 py-2 text-sm' onClick={() => reviewRequest(request._id, "approved")}>Approuver</button>
													<button className='btn-secondary px-4 py-2 text-sm' onClick={() => reviewRequest(request._id, "rejected")}>Rejeter</button>
												</div>
											</div>
										))}
									</div>
								</>
							)}
						</div>
						<div className='panel p-6'>
							<h2 className='text-2xl font-semibold text-white'>Journal recent</h2>
							<div className='mt-4 space-y-3'>
								{recentActions.length === 0 && <StatePanel message='Aucune action recente.' />}
								{recentActions.slice(0, 6).map((action) => (
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

					<div className='grid gap-6 xl:grid-cols-[1.15fr_0.85fr]'>
						<div className='panel p-6'>
							<h2 className='text-2xl font-semibold text-white'>Utilisateurs et niveaux</h2>
							<div className='mt-4 overflow-x-auto'>
								<table className='min-w-full text-left text-sm text-slate-300'>
									<thead className='text-slate-100'><tr><th className='pb-3 pr-4'>Nom</th><th className='pb-3 pr-4'>Type</th><th className='pb-3 pr-4'>Niveau</th><th className='pb-3 pr-4'>Points</th><th className='pb-3 pr-4'>Actions</th></tr></thead>
									<tbody>
										{users.length === 0 && <tr><td className='py-4 text-slate-400' colSpan='5'>Aucun utilisateur.</td></tr>}
										{users.map((user) => (
											<tr key={user._id} className='border-t border-slate-700/30'>
												<td className='py-3 pr-4 font-medium text-white'><span className='truncate-safe block max-w-[14rem]' title={`${user.firstName} ${user.lastName}`}>{user.firstName} {user.lastName}</span></td>
												<td className='py-3 pr-4'><StatusBadge value={user.userType || user.role} /></td>
												<td className='py-3 pr-4'><StatusBadge value={user.level} /></td>
												<td className='py-3 pr-4'>{user.points}</td>
												<td className='py-3 pr-4'>
													<div className='flex flex-wrap gap-2'>
														<button className='btn-secondary px-3 py-2 text-xs' onClick={() => updateUser(user._id, { points: Number(user.points) + 1 })}>+1 point</button>
														<button className='btn-secondary px-3 py-2 text-xs' onClick={() => updateUser(user._id, { userType: "complexe", level: "avance" })}>Promouvoir personnel</button>
														<button className='btn-secondary px-3 py-2 text-xs' onClick={() => updateUser(user._id, { userType: "administrateur", level: "expert" })}>Promouvoir admin</button>
														<button className='btn-secondary px-3 py-2 text-xs' onClick={() => deleteUser(user._id)}>Supprimer</button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>

						<div className='grid gap-6'>
							<div className='panel p-6'>
								<h2 className='text-2xl font-semibold text-white'>Vision de progression</h2>
								<div className='mt-4 space-y-4'>
									{users.slice(0, 3).map((user) => (
										<LevelProgress key={user._id} points={user.points} level={user.level} />
									))}
									{users.length === 0 && <StatePanel message='Aucun utilisateur.' />}
								</div>
							</div>
							<div className='panel p-6'>
								<h2 className='text-2xl font-semibold text-white'>Categories</h2>
								<div className='mt-4 grid gap-6'>
									<div>
										<p className='mb-3 text-sm uppercase tracking-[0.25em] text-slate-300'>Devices</p>
										<div className='flex gap-3'>
											<input className='field' value={newDeviceCategory} onChange={(e) => setNewDeviceCategory(e.target.value)} placeholder='Nouvelle categorie device' />
											<button className='btn-primary' onClick={addDeviceCategory} type='button'>Ajouter</button>
										</div>
									</div>
									<div>
										<p className='mb-3 text-sm uppercase tracking-[0.25em] text-slate-300'>Services</p>
										<div className='flex gap-3'>
											<input className='field' value={newServiceCategory} onChange={(e) => setNewServiceCategory(e.target.value)} placeholder='Nouvelle categorie service' />
											<button className='btn-primary' onClick={addServiceCategory} type='button'>Ajouter</button>
										</div>
									</div>
								</div>
							</div>
							<div className='panel p-6'>
								<h2 className='text-2xl font-semibold text-white'>Regles actuelles</h2>
								<div className='mt-4 space-y-3'>
									{settings.length === 0 && <StatePanel message='Aucune regle configuree.' />}
									{settings.map((setting) => (
										<div key={setting._id} className='glass-card p-4'>
											<p className='font-semibold text-white'>{setting.key}</p>
											<p className='mt-1 text-sm text-slate-300'>Valeur: {String(setting.value)}</p>
											<p className='mt-1 text-sm text-slate-500'>{setting.description}</p>
										</div>
									))}
								</div>
							</div>
							<div className='panel p-6'>
								<div className='flex flex-wrap items-center justify-between gap-3'>
									<h2 className='text-2xl font-semibold text-white'>Membres autorises</h2>
									<span className='status-pill bg-emerald-400/10 text-emerald-100'>Controle residenceMemberId</span>
								</div>
								<form className='mt-4 grid gap-4' onSubmit={createApprovedMember}>
									<div className='grid gap-4 md:grid-cols-2'>
										<label className='text-sm'><span className='mb-2 block text-slate-300'>ID membre</span><input className='field' value={approvedMemberForm.residenceMemberId} onChange={(e) => setApprovedMemberForm({ ...approvedMemberForm, residenceMemberId: e.target.value })} required /></label>
										<label className='text-sm'><span className='mb-2 block text-slate-300'>Type</span><select className='field' value={approvedMemberForm.memberType} onChange={(e) => setApprovedMemberForm({ ...approvedMemberForm, memberType: e.target.value })}><option value='resident'>Étudiant résident</option><option value='staff'>Personnel résidence</option><option value='maintenance'>Personnel maintenance</option></select></label>
										<label className='text-sm'><span className='mb-2 block text-slate-300'>Prenom</span><input className='field' value={approvedMemberForm.firstName} onChange={(e) => setApprovedMemberForm({ ...approvedMemberForm, firstName: e.target.value })} required /></label>
										<label className='text-sm'><span className='mb-2 block text-slate-300'>Nom</span><input className='field' value={approvedMemberForm.lastName} onChange={(e) => setApprovedMemberForm({ ...approvedMemberForm, lastName: e.target.value })} required /></label>
										<label className='text-sm md:col-span-2'><span className='mb-2 block text-slate-300'>Chambre</span><input className='field' value={approvedMemberForm.roomNumber} onChange={(e) => setApprovedMemberForm({ ...approvedMemberForm, roomNumber: e.target.value })} /></label>
									</div>
									<button className='btn-primary' type='submit'>Ajouter membre autorise</button>
								</form>
								<div className='mt-4 overflow-x-auto'>
									<table className='min-w-full text-left text-sm text-slate-300'>
										<thead className='text-slate-100'><tr><th className='pb-3 pr-4'>ID</th><th className='pb-3 pr-4'>Nom</th><th className='pb-3 pr-4'>Type</th><th className='pb-3 pr-4'>Chambre</th><th className='pb-3 pr-4'>Action</th></tr></thead>
										<tbody>
											{approvedMembers.length === 0 && <tr><td className='py-4 text-slate-400' colSpan='5'>Aucun membre autorise.</td></tr>}
											{approvedMembers.map((member) => (
												<tr key={member._id} className='border-t border-slate-700/30'>
													<td className='py-3 pr-4 font-medium text-white'><span className='truncate-safe block max-w-[10rem]' title={member.residenceMemberId}>{member.residenceMemberId}</span></td>
													<td className='py-3 pr-4'><span className='truncate-safe block max-w-[12rem]' title={`${member.firstName} ${member.lastName}`}>{member.firstName} {member.lastName}</span></td>
													<td className='py-3 pr-4'>{getMemberTypeLabel(member.memberType)}</td>
													<td className='py-3 pr-4'>{member.roomNumber || "-"}</td>
													<td className='py-3 pr-4'><button className='btn-secondary px-3 py-2 text-xs' type='button' onClick={() => deleteApprovedMember(member._id)}>Retirer</button></td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</div>

					{devices.length > 0 && (
					<div className='panel p-6'>
						<div className='flex flex-wrap items-center justify-between gap-3'>
							<h2 className='text-2xl font-semibold text-white'>Sante du parc connecte</h2>
							<p className='text-sm text-slate-400'>Lecture predictive basee sur batterie, connectivite, maintenance et disponibilite.</p>
						</div>
						<div className='mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
							{devices.slice(0, 4).map((device) => (
								<div key={device._id} className='glass-card p-4'>
									<div className='flex items-center justify-between gap-3'>
										<p className='font-semibold text-white'>{device.name}</p>
										<HealthScoreBadge device={device} />
									</div>
									<p className='mt-2 text-sm text-slate-300'>{device.zone?.name}</p>
									<p className='mt-2 text-xs text-slate-500'>Score: {computeDeviceHealth(device).score}/100</p>
								</div>
							))}
						</div>
					</div>
					)}

					<div className='grid gap-6 xl:grid-cols-2'>
						<form className='panel p-6' onSubmit={createService}>
							<h2 className='text-2xl font-semibold text-white'>Ajouter un service</h2>
							<div className='mt-4 grid gap-4 md:grid-cols-2'>
								<label className='text-sm'><span className='mb-2 block text-slate-300'>Nom</span><input className='field' value={serviceForm.name} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} required /></label>
								<label className='text-sm'><span className='mb-2 block text-slate-300'>Zone</span><select className='field' value={serviceForm.zone} onChange={(e) => setServiceForm({ ...serviceForm, zone: e.target.value })} required><option value=''>Choisir</option>{devices.flatMap((device) => device.zone ? [device.zone] : []).filter((zone, index, array) => array.findIndex((item) => item._id === zone._id) === index).map((zone) => <option key={zone._id} value={zone._id}>{zone.name}</option>)}</select></label>
								<label className='text-sm'><span className='mb-2 block text-slate-300'>Categorie</span><select className='field' value={serviceForm.category} onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })} required><option value=''>Choisir</option>{serviceCategories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select></label>
								<label className='text-sm'><span className='mb-2 block text-slate-300'>Disponibilite</span><select className='field' value={serviceForm.availability} onChange={(e) => setServiceForm({ ...serviceForm, availability: e.target.value })}><option value='daily'>daily</option><option value='weekly'>weekly</option><option value='on-demand'>on-demand</option></select></label>
								<label className='text-sm'><span className='mb-2 block text-slate-300'>Statut</span><select className='field' value={serviceForm.status} onChange={(e) => setServiceForm({ ...serviceForm, status: e.target.value })}><option value='active'>active</option><option value='limited'>limited</option><option value='maintenance'>maintenance</option></select></label>
								<label className='text-sm md:col-span-2'><span className='mb-2 block text-slate-300'>Description</span><textarea className='field min-h-24' value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} required /></label>
							</div>
							<button className='btn-primary mt-6' type='submit'>Ajouter le service</button>
						</form>

						<form className='panel p-6' onSubmit={saveSetting}>
							<h2 className='text-2xl font-semibold text-white'>Regles et alertes globales</h2>
							<div className='mt-4 flex flex-wrap gap-2 text-xs'>
								<button type='button' className='btn-secondary px-3 py-2 text-xs' onClick={() => setSettingForm({ key: "alerts.batteryThreshold", value: "20", description: "Seuil de batterie faible en pourcentage." })}>Seuil batterie</button>
								<button type='button' className='btn-secondary px-3 py-2 text-xs' onClick={() => setSettingForm({ key: "alerts.energyThreshold", value: "50", description: "Seuil de surconsommation en kWh par device." })}>Seuil energie</button>
								<button type='button' className='btn-secondary px-3 py-2 text-xs' onClick={() => setSettingForm({ key: "alerts.inactivityDays", value: "7", description: "Nombre de jours sans interaction avant alerte." })}>Seuil inactivite</button>
								<button type='button' className='btn-secondary px-3 py-2 text-xs' onClick={() => setSettingForm({ key: "alerts.autoMaintenance", value: "1", description: "Active la maintenance automatique sur device alerte." })}>Auto-maintenance</button>
							</div>
							<div className='mt-4 grid gap-4'>
								<input className='field' value={settingForm.key} onChange={(e) => setSettingForm({ ...settingForm, key: e.target.value })} placeholder='points.login' required />
								<input className='field' value={settingForm.value} onChange={(e) => setSettingForm({ ...settingForm, value: e.target.value })} placeholder='0.25' required />
								<textarea className='field min-h-24' value={settingForm.description} onChange={(e) => setSettingForm({ ...settingForm, description: e.target.value })} placeholder='Description de la regle' />
							</div>
							<button className='btn-primary mt-6' type='submit'>Enregistrer la regle</button>
						</form>
					</div>
				</>
			)}
		</div>
	);
};

export default AdminDashboardPage;
