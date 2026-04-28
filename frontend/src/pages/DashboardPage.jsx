import { useEffect, useState } from "react";
import { Bell, Compass, Shield, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "../lib/axios";
import SectionHeader from "../components/SectionHeader";
import StatCard from "../components/StatCard";
import { formatDate } from "../utils/format";
import StatePanel from "../components/StatePanel";
import StatusBadge from "../components/StatusBadge";
import LevelProgress from "../components/LevelProgress";
import { canAccessGestion, getLevelLabel, getRoleLabel, isAdmin, isSimpleUser } from "../utils/access";
import energyIcon from "../assets/icons/energy.png";
import accessIcon from "../assets/icons/access.png";
import servicesIcon from "../assets/icons/services.png";
import alertsIcon from "../assets/icons/alerts.png";

const actionLabels = {
	service_viewed: "Service consulté",
	device_viewed: "Objet consulté",
	device_updated: "Objet mis à jour",
	registration_reviewed: "Inscription traitée",
	maintenance_request_reviewed: "Demande de maintenance traitée",
	reservation_created: "Réservation créée",
	reservation_cancelled: "Réservation annulée",
	issue_reported: "Signalement envoyé",
	maintenance_request_created: "Signalement envoyé",
};

const accessLabels = {
	route_access: "Page consultée",
	login: "Connexion",
	logout: "Deconnexion",
	profile_view: "Profil consulte",
};

const routeLabels = {
	"/api/members/me/dashboard": "Tableau de bord",
	"/api/members/me/residence": "Ma résidence",
	"/api/members/me/maintenance-requests": "Mes signalements",
	"/api/services": "Services",
	"/api/reservations/my": "Mes réservations",
	"/api/auth/login": "Connexion",
};

const hiddenResidentActions = new Set(["device_updated", "registration_reviewed", "maintenance_request_reviewed"]);

const getActionLabel = (type) => actionLabels[type] || "Activite recente";
const getAccessLabel = (type) => accessLabels[type] || "Activité récente";
const getRouteLabel = (route) => routeLabels[route] || "Espace résident";

const DashboardPage = () => {
	const [data, setData] = useState(null);
	const [status, setStatus] = useState({ loading: true, error: "" });

	useEffect(() => {
		axios
			.get("/members/me/dashboard")
			.then((res) => {
				setData(res.data);
				setStatus({ loading: false, error: "" });
			})
			.catch((error) => setStatus({ loading: false, error: error.response?.data?.message || "Impossible de charger le dashboard." }));
	}, []);

	const currentUser = data?.user || {};
	const hasGestionAccess = canAccessGestion(currentUser);
	const hasAdminAccess = isAdmin(currentUser);
	const isSimpleResident = isSimpleUser(currentUser) && !hasGestionAccess && !hasAdminAccess;
	const residentActivity = [
		...(data?.recentAccesses || []).map((item) => ({
			_id: `access-${item._id}`,
			title: item.accessType === "route_access" ? getRouteLabel(item.route) : getAccessLabel(item.accessType),
			helper: item.accessType === "route_access" ? "Page consultée" : "Activité de session",
			createdAt: item.createdAt,
		})),
		...(data?.recentActions || [])
			.filter((item) => !isSimpleResident || !hiddenResidentActions.has(item.actionType))
			.map((item) => ({
				_id: `action-${item._id}`,
				title: getActionLabel(item.actionType),
				helper: item.targetType === "ResidenceService" ? "Service résident" : "Activité résident",
				createdAt: item.createdAt,
			})),
	]
		.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
		.slice(0, 5);

	return (
		<div className='page-shell space-y-6'>
			<SectionHeader eyebrow='Visualisation' title={`Bienvenue ${data?.user?.firstName || ""}`} description='Votre centre de pilotage résident combine progression, activités récentes et accès aux modules intelligents.' />
			{status.loading && <StatePanel message='Chargement de votre espace membre...' />}
			{status.error && <StatePanel tone='error' title='Dashboard indisponible' message={status.error} />}
			{data && (
				<>
					<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 panel-grid-safe'>
						<StatCard label='Points' value={data.user.points} helper={isSimpleResident ? "Progression résidentielle personnelle" : "Progression par consultation et gestion"} icon={energyIcon} />
						<StatCard label='Niveau' value={getLevelLabel(data.user.level)} helper='Progression de Nouveau résident à Superviseur confirmé' tone='sky' icon={servicesIcon} />
						<StatCard label='Acces' value={data.user.accessCount} helper='Nombre total d’acces traces' tone='amber' icon={accessIcon} />
						<StatCard label='Actions' value={data.user.actionCount} helper='Actions utilisateur journalisees' tone='rose' icon={alertsIcon} />
					</div>

					<div className='grid gap-6 xl:grid-cols-[1fr_1fr] panel-grid-safe'>
						<div className='panel-strong card-safe p-6'>
							<div className='flex min-w-0 flex-wrap items-start justify-between gap-4'>
								<div className='min-w-0'>
									<p className='text-xs uppercase tracking-[0.3em] text-emerald-300'>{getRoleLabel(data.user)}</p>
									<h2 className='safe-text mt-3 text-3xl font-semibold text-white'>{data.user.firstName} {data.user.lastName}</h2>
								</div>
								<StatusBadge value={data.user.userType} />
							</div>
							<div className='mt-6 grid gap-4 sm:grid-cols-2 text-sm text-slate-300 panel-grid-safe'>
								<div className='glass-card card-safe p-4'>
									<p className='text-xs uppercase tracking-[0.25em] text-slate-400'>Validation</p>
									<div className='mt-3 flex items-center gap-2'>
										<StatusBadge value={data.user.approvalStatus} />
										<StatusBadge value={data.user.level} />
									</div>
								</div>
								<div className='glass-card card-safe p-4'>
									<p className='text-xs uppercase tracking-[0.25em] text-slate-400'>Derniere connexion</p>
									<p className='mt-3 text-white'>{formatDate(data.user.lastLoginAt)}</p>
								</div>
								{isSimpleResident ? (
									<div className='glass-card card-safe p-4'>
										<p className='text-xs uppercase tracking-[0.25em] text-slate-400'>Residence ID</p>
										<p className='truncate-safe mt-3 text-white' title={data.user.residenceMemberId || "Non renseigne"}>{data.user.residenceMemberId || "Non renseigne"}</p>
									</div>
								) : (
									<div className='glass-card card-safe p-4'>
										<p className='text-xs uppercase tracking-[0.25em] text-slate-400'>Communaute</p>
										<p className='mt-3 text-3xl font-semibold text-white'>{data.communityCount}</p>
										<p className='mt-2 text-slate-300'>membres approuves dans la residence</p>
									</div>
								)}
								<div className='glass-card card-safe p-4'>
									<p className='text-xs uppercase tracking-[0.25em] text-slate-400'>Email</p>
									<div className='mt-3 flex min-w-0 flex-wrap items-center gap-2'>
										<StatusBadge value={data.user.emailVerified ? "approved" : "pending"} />
										<span className='truncate-safe'>{data.user.emailVerified ? "verifie" : "a verifier"}</span>
									</div>
								</div>
							</div>
						</div>

						<div className='panel card-safe p-6'>
							<p className='text-xs uppercase tracking-[0.3em] text-slate-400'>Quick actions</p>
							<div className='mt-4 flex flex-wrap gap-2'>
								<Link to='/my-residence' className='btn-primary'>Ma résidence</Link>
								<Link to='/services' className='btn-secondary'>Services</Link>
								<Link to='/reservations' className='btn-secondary'>Réserver salle d&apos;étude</Link>
								<Link to='/reservations' className='btn-secondary'>Réserver laverie</Link>
								<Link to='/report-issue' className='btn-secondary'>Signaler un probleme</Link>
								{hasGestionAccess && <Link to='/devices' className='btn-secondary'>Objets connectés</Link>}
								{hasGestionAccess && <Link to='/gestion' className='btn-secondary'>Gestion</Link>}
								{hasAdminAccess && <Link to='/administration' className='btn-secondary'>Administration</Link>}
								{hasAdminAccess && <Link to='/logs' className='btn-secondary'>Logs</Link>}
							</div>
							<div className='mt-5 grid gap-4 sm:grid-cols-2 panel-grid-safe'>
								{isSimpleResident ? (
									<>
										<div className='glass-card card-safe p-5'>
											<div className='flex min-w-0 items-center gap-3 text-emerald-200'>
												<Compass size={18} />
												<p className='truncate-safe font-semibold'>Espace résident</p>
											</div>
											<p className='break-anywhere mt-4 text-sm text-slate-300'>Accedez aux informations de votre chambre, aux services et aux signalements personnels.</p>
										</div>
										<div className='glass-card card-safe p-5'>
											<div className='flex min-w-0 items-center gap-3 text-sky-200'>
												<TrendingUp size={18} />
												<p className='truncate-safe font-semibold'>Progression personnelle</p>
											</div>
											<p className='break-anywhere mt-4 text-sm text-slate-300'>Vos connexions et actions alimentent le niveau visible dans votre profil.</p>
										</div>
									</>
								) : (
									<>
										<div className='glass-card card-safe p-5'>
											<div className='flex min-w-0 items-center gap-3 text-emerald-200'>
												<Compass size={18} />
												<p className='truncate-safe font-semibold'>{canAccessGestion(data.user) ? "Gestion active" : "Modules deblocables"}</p>
											</div>
											<p className='break-anywhere mt-4 text-sm text-slate-300'>
												{hasGestionAccess ? "Votre accès Gestion est actif pour piloter les objets et la maintenance." : `Gestion s'ouvre automatiquement au niveau ${getLevelLabel("avance")}.`}
											</p>
										</div>
										<div className='glass-card card-safe p-5'>
											<div className='flex min-w-0 items-center gap-3 text-sky-200'>
												<TrendingUp size={18} />
												<p className='truncate-safe font-semibold'>{isAdmin(data.user) ? "Administration active" : "Administration"}</p>
											</div>
											<p className='break-anywhere mt-4 text-sm text-slate-300'>
												{hasAdminAccess ? "Vous avez accès aux validations, réglages globaux, statistiques et exports." : `Administration s'ouvre au niveau ${getLevelLabel("expert")} ou via validation admin.`}
											</p>
										</div>
									</>
								)}
								<div className='glass-card card-safe p-5'>
									<div className='flex min-w-0 items-center gap-3 text-amber-100'>
										<Bell size={18} />
										<p className='truncate-safe font-semibold'>Activite recente</p>
									</div>
									<p className='break-anywhere mt-4 text-sm text-slate-300'>Les consultations et connexions alimentent vos points et statistiques.</p>
								</div>
								<div className='glass-card card-safe p-5'>
									<div className='flex min-w-0 items-center gap-3 text-fuchsia-100'>
										<Shield size={18} />
										<p className='truncate-safe font-semibold'>Acces securise</p>
									</div>
									<p className='break-anywhere mt-4 text-sm text-slate-300'>Connexion protegee, approbation admin et verification d&apos;email locale.</p>
								</div>
							</div>
						</div>
					</div>

					<div className='grid gap-6 xl:grid-cols-[1.05fr_0.95fr] panel-grid-safe'>
						<LevelProgress points={data.user.points} level={data.user.level} />
						<div className='panel card-safe p-6'>
							<p className='text-xs uppercase tracking-[0.3em] text-slate-400'>Progression et acces</p>
							<div className='mt-5 grid gap-3 sm:grid-cols-2 panel-grid-safe'>
								<div className='glass-card card-safe p-4'>
									<p className='text-sm text-slate-300'>Role actif</p>
									<div className='mt-3'><StatusBadge value={data.user.userType} /></div>
								</div>
								<div className='glass-card card-safe p-4'>
									<p className='text-sm text-slate-300'>Niveau actuel</p>
									<div className='mt-3'><StatusBadge value={data.user.level} /></div>
								</div>
								{isSimpleResident ? (
									<>
										<div className='glass-card card-safe p-4'>
											<p className='text-sm text-slate-300'>Vue active</p>
											<p className='mt-3 text-white'>Resident</p>
										</div>
										<div className='glass-card card-safe p-4'>
											<p className='text-sm text-slate-300'>Priorite</p>
											<p className='mt-3 text-white'>Services et suivi personnel</p>
										</div>
									</>
								) : (
									<>
										<div className='glass-card card-safe p-4'>
											<p className='text-sm text-slate-300'>Deblocage Gestion</p>
											<p className='mt-3 text-white'>{getLevelLabel("avance")}</p>
										</div>
										<div className='glass-card card-safe p-4'>
											<p className='text-sm text-slate-300'>Deblocage Administration</p>
											<p className='mt-3 text-white'>{getLevelLabel("expert")}</p>
										</div>
									</>
								)}
							</div>
						</div>
					</div>

					<div className='grid gap-6 xl:grid-cols-2 panel-grid-safe'>
						<div className='panel card-safe p-6'>
							<h2 className='text-2xl font-semibold text-white'>Disponibilite des espaces</h2>
							<div className='mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 panel-grid-safe'>
								<div className='glass-card card-safe p-4'>
									<p className='text-sm text-slate-300'>Laverie</p>
									<p className='metric-value mt-2 text-xl font-semibold text-white'>{data.studentWidgets?.laundry || "Disponible"}</p>
								</div>
								<div className='glass-card card-safe p-4'>
									<p className='text-sm text-slate-300'>Salle d&apos;etude</p>
									<p className='metric-value mt-2 text-xl font-semibold text-white'>{data.studentWidgets?.study || "Ouverte"}</p>
								</div>
								<div className='glass-card card-safe p-4'>
									<p className='text-sm text-slate-300'>Cuisine commune</p>
									<p className='metric-value mt-2 text-xl font-semibold text-white'>{data.studentWidgets?.kitchen || "Disponible"}</p>
								</div>
							</div>
						</div>
						{hasAdminAccess ? (
							<>
								<div className='panel card-safe p-6'>
									<h2 className='text-2xl font-semibold text-white'>Tracabilite technique</h2>
									<p className='mt-2 text-sm text-slate-400'>Accès bruts réservés à l&apos;administration.</p>
									<div className='mt-5 space-y-3'>
										{data.recentAccesses.map((item) => (
											<div key={item._id} className='glass-card card-safe p-4'>
												<div className='flex min-w-0 items-center justify-between gap-3'>
													<p className='truncate-safe font-semibold text-white' title={item.accessType}>{item.accessType}</p>
													<StatusBadge value='approved' />
												</div>
												<p className='truncate-safe mt-2 text-sm text-slate-300' title={item.route}>{item.route}</p>
												<p className='mt-2 text-xs text-slate-500'>{formatDate(item.createdAt)}</p>
											</div>
										))}
									</div>
								</div>
								<div className='panel card-safe p-6'>
									<h2 className='text-2xl font-semibold text-white'>Actions techniques</h2>
									<p className='mt-2 text-sm text-slate-400'>Journal brut disponible aussi dans Logs.</p>
									<div className='mt-5 space-y-3'>
										{data.recentActions.map((item) => (
											<div key={item._id} className='glass-card card-safe p-4'>
												<div className='flex min-w-0 items-center justify-between gap-3'>
													<p className='truncate-safe font-semibold text-white' title={item.actionType}>{item.actionType}</p>
													<StatusBadge value={item.targetType === "ResidenceService" ? "simple" : "complexe"} />
												</div>
												<p className='truncate-safe mt-2 text-sm text-slate-300' title={item.targetType}>{item.targetType}</p>
												<p className='mt-2 text-xs text-slate-500'>{formatDate(item.createdAt)}</p>
											</div>
										))}
									</div>
								</div>
							</>
						) : (
							<>
								<div className='panel card-safe p-6'>
									<h2 className='text-2xl font-semibold text-white'>{isSimpleResident ? "Mon activité résident" : "Activité opérationnelle"}</h2>
									<div className='mt-5 space-y-3'>
										{residentActivity.map((item) => (
											<div key={item._id} className='glass-card card-safe p-4'>
												<p className='truncate-safe font-semibold text-white' title={item.title}>{item.title}</p>
												<p className='mt-2 text-sm text-slate-300'>{item.helper}</p>
												<p className='mt-2 text-xs text-slate-500'>{formatDate(item.createdAt)}</p>
											</div>
										))}
										{residentActivity.length === 0 && (
											<StatePanel compact message='Aucune activité résident récente. Vous pouvez réserver une salle, consulter les services ou signaler un problème.' />
										)}
									</div>
								</div>
								<div className='panel card-safe p-6'>
									<h2 className='text-2xl font-semibold text-white'>{isSimpleResident ? "Mes signalements" : "Suivi maintenance"}</h2>
									<div className='mt-5 space-y-3'>
										{(data.maintenanceRequests || []).map((request) => (
											<div key={request._id} className='glass-card card-safe p-4'>
												<div className='flex min-w-0 items-center justify-between gap-3'>
													<p className='truncate-safe font-semibold text-white' title={request.reason}>{request.reason || "Signalement résident"}</p>
													<StatusBadge value={request.status} />
												</div>
												<p className='mt-2 text-sm text-slate-300'>{request.category || request.type || "Maintenance"}</p>
												<p className='mt-2 text-xs text-slate-500'>{formatDate(request.createdAt)}</p>
											</div>
										))}
										{(!data.maintenanceRequests || data.maintenanceRequests.length === 0) && (
											<StatePanel compact message='Aucun signalement recent.' />
										)}
									</div>
								</div>
							</>
						)}
						<div className='panel card-safe p-6'>
							<h2 className='text-2xl font-semibold text-white'>Annonces recentes</h2>
							<div className='mt-5 space-y-3'>
								{data.announcements?.map((item) => (
									<div key={item._id} className='glass-card card-safe p-4'>
										<p className='safe-text font-semibold text-white'>{item.title}</p>
										<p className='safe-text mt-2 text-sm text-slate-300'>{item.content}</p>
									</div>
								))}
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
};

export default DashboardPage;
