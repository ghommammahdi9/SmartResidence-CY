import { ChartColumn, LogIn, LogOut, Menu, Search, Shield, UserPlus, Users, Wrench, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { canAccessDevices, canAccessGestion, canAccessMembers, canAccessReports, isAdmin, isSimpleUser } from "../utils/access";
import StatusBadge from "./StatusBadge";
import logoCYU from "../assets/branding/logo-cyu.png";
import logoCYTech from "../assets/branding/logo-cytech.png";

const Navbar = () => {
	const { user, logout } = useUserStore();
	const location = useLocation();
	const [mobileOpen, setMobileOpen] = useState(false);

	const navItems = user
		? [
				{ to: "/", label: "Accueil" },
				{ to: "/announcements", label: "Informations" },
			]
		: [
				{ to: "/", label: "Accueil" },
				{ to: "/tour", label: "Visite libre" },
				{ to: "/announcements", label: "Informations" },
				{ to: "/public-search", label: "Recherche publique" },
			];

	const memberItems = user
		? [
				{ to: "/dashboard", label: "Visualisation" },
				{ to: "/my-residence", label: "Ma résidence" },
				{ to: "/services", label: "Services" },
				{ to: "/reservations", label: "Réservations" },
				{ to: "/report-issue", label: "Signaler" },
				...(canAccessMembers(user) ? [{ to: "/members", label: "Residents" }] : []),
				...(canAccessDevices(user) ? [{ to: "/devices", label: "Objets connectés" }] : []),
			]
		: [];

	const gestionItems = canAccessGestion(user)
		? [
				{ to: "/gestion", label: "Gestion", icon: Wrench },
				...(canAccessReports(user) ? [{ to: "/reports", label: "Rapports", icon: ChartColumn }] : []),
			]
		: [];

	const adminItems = isAdmin(user)
		? [
				{ to: "/administration", label: "Administration", icon: Shield },
				{ to: "/logs", label: "Logs", icon: Search },
			]
		: [];

	const navClass = (to, activeClass) =>
		`rounded-full px-3 py-2 text-sm font-medium transition whitespace-nowrap ${location.pathname === to ? activeClass : "hover:bg-slate-800/60"}`;

	return (
		<header className='sticky top-0 left-0 z-40 w-full border-b border-white/10 bg-slate-950/80 shadow-[0_10px_30px_rgba(2,6,23,0.18)] backdrop-blur-xl'>
			<div className='page-shell py-4'>
				<div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
					<Link to='/' className='flex shrink-0 items-center gap-3 text-emerald-300 sm:gap-4'>
						<div className='flex shrink-0 items-center gap-2'>
							<img src={logoCYU} alt='Logo CY Universite' className='h-10 w-auto shrink-0 rounded-xl bg-white/95 p-1.5 object-contain sm:h-12' />
							<img src={logoCYTech} alt='Logo CY Tech' className='h-10 w-auto shrink-0 rounded-xl bg-white/95 p-1.5 object-contain sm:h-12' />
						</div>
						<div className='shrink-0'>
							<p className='whitespace-nowrap text-[10px] uppercase tracking-[0.22em] text-slate-400 sm:text-xs sm:tracking-[0.3em]'>CY Residence Lab</p>
							<p className='whitespace-nowrap text-xl font-semibold leading-tight text-emerald-300 sm:text-2xl'>SmartResidence CY</p>
						</div>
					</Link>

					<div className='flex min-w-0 flex-1 flex-col gap-3 lg:items-end'>
						<div className='flex items-center justify-between gap-3 lg:hidden'>
							{user && (
								<Link className='min-w-0 rounded-full bg-slate-900 px-4 py-2 text-sm text-slate-200' to='/profile'>
									<span className='inline-flex min-w-0 items-center gap-2'>
										<Users size={16} />
										<span className='truncate-safe'>{user.firstName}</span>
									</span>
								</Link>
							)}
							<button
								type='button'
								className='rounded-full border border-slate-700/50 bg-slate-900/80 p-3 text-slate-100'
								aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
								onClick={() => setMobileOpen((current) => !current)}
							>
								{mobileOpen ? <X size={18} /> : <Menu size={18} />}
							</button>
						</div>
						<nav className={`${mobileOpen ? "flex" : "hidden"} min-w-0 flex-col gap-2 text-slate-200 lg:flex lg:flex-row lg:flex-wrap lg:items-center lg:justify-end`}>
							{navItems.map((item) => (
								<Link key={item.to} to={item.to} className={navClass(item.to, "bg-emerald-400/15 text-emerald-200")} onClick={() => setMobileOpen(false)}>
									{item.label}
								</Link>
							))}
							{memberItems.map((item) => (
								<Link key={item.to} to={item.to} className={navClass(item.to, "bg-sky-400/15 text-sky-200")} onClick={() => setMobileOpen(false)}>
									{item.label}
								</Link>
							))}
							{gestionItems.map((item) => {
								const Icon = item.icon;
								return (
									<Link key={item.to} to={item.to} className='whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium hover:bg-slate-800/60' onClick={() => setMobileOpen(false)}>
										<span className='inline-flex items-center gap-2'>
											<Icon size={16} />
											{item.label}
										</span>
									</Link>
								);
							})}
							{adminItems.map((item) => {
								const Icon = item.icon;
								return (
									<Link key={item.to} to={item.to} className='whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium hover:bg-slate-800/60' onClick={() => setMobileOpen(false)}>
										<span className='inline-flex items-center gap-2'>
											<Icon size={16} />
											{item.label}
										</span>
									</Link>
								);
							})}
							{!user && (
								<>
									<Link to='/signup' className='rounded-full px-3 py-2 hover:bg-slate-800/60 lg:hidden' onClick={() => setMobileOpen(false)}>Inscription</Link>
									<Link to='/login' className='rounded-full px-3 py-2 hover:bg-slate-800/60 lg:hidden' onClick={() => setMobileOpen(false)}>Connexion</Link>
								</>
							)}
						</nav>

						<div className='hidden flex-wrap items-center justify-end gap-3 lg:flex'>
							{user && (
								<Link className='max-w-[18rem] rounded-full bg-slate-900 px-4 py-2 text-sm text-slate-200' to='/profile' title={`${user.firstName} ${user.lastName}`}>
									<span className='inline-flex min-w-0 items-center gap-2'>
										<Users size={16} />
										<span className='truncate-safe'>{user.firstName} {user.lastName}</span>
									</span>
								</Link>
							)}
							{user ? (
								<button className='btn-secondary' onClick={logout}>
									<LogOut size={18} className='mr-2' />
									Deconnexion
								</button>
							) : (
								<>
									<Link to='/signup' className='btn-primary'>
										<UserPlus className='mr-2' size={18} />
										Inscription
									</Link>
									<Link to='/login' className='btn-secondary'>
										<LogIn className='mr-2' size={18} />
										Connexion
									</Link>
								</>
							)}
						</div>
					</div>
				</div>
				{user && (
					<div className='mt-3 flex min-w-0 flex-wrap items-center gap-2 text-xs text-slate-300'>
						<StatusBadge value={user.userType} />
						<StatusBadge value={user.level} />
						<span className='status-pill bg-amber-400/10 text-amber-100'>Points: {user.points}</span>
						{isSimpleUser(user) && <span className='status-pill bg-sky-400/10 text-sky-200'>Espace résident</span>}
						{canAccessGestion(user) && !isAdmin(user) && <span className='status-pill bg-emerald-400/10 text-emerald-100'>Personnel résidence</span>}
						{isAdmin(user) && <span className='status-pill bg-rose-400/10 text-rose-100'>Administration complete</span>}
					</div>
				)}
				{!user && (
					<div className='mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400'>
						<span className='status-pill bg-slate-900'>Information visiteurs</span>
						<span className='status-pill bg-slate-900'>Visite libre</span>
						<span className='status-pill bg-slate-900'>Recherche publique</span>
					</div>
				)}
			</div>
		</header>
	);
};

export default Navbar;
