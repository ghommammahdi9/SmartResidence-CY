import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../lib/axios";
import SectionHeader from "../components/SectionHeader";
import StatePanel from "../components/StatePanel";
import StatusBadge from "../components/StatusBadge";
import { getLevelLabel, getMemberTypeLabel, getUserTypeLabel } from "../utils/access";

const MembersPage = () => {
	const [members, setMembers] = useState([]);
	const [status, setStatus] = useState({ loading: true, error: "" });
	const [filters, setFilters] = useState({ search: "", userType: "", memberType: "", level: "" });

	useEffect(() => {
		axios
			.get("/members")
			.then((res) => {
				setMembers(res.data.members);
				setStatus({ loading: false, error: "" });
			})
			.catch((error) => setStatus({ loading: false, error: error.response?.data?.message || "Impossible de charger les membres." }));
	}, []);

	const filteredMembers = members.filter((member) => {
		const searchMatch = !filters.search || member.username?.toLowerCase().includes(filters.search.toLowerCase());
		const userTypeMatch = !filters.userType || member.userType === filters.userType;
		const typeMatch = !filters.memberType || member.memberType === filters.memberType;
		const levelMatch = !filters.level || member.level === filters.level;
		return searchMatch && userTypeMatch && typeMatch && levelMatch;
	});

	return (
		<div className='page-shell space-y-6'>
			<div className='panel-strong card-safe bg-grid p-8 sm:p-10'>
				<SectionHeader eyebrow='Visualisation' title='Membres de la residence' description='Profils publics des utilisateurs approuves pour encourager la lecture du systeme de progression.' />
				<div className='mt-4 flex flex-wrap gap-2'>
					<StatusBadge value='simple' />
					<StatusBadge value='complexe' />
					<StatusBadge value='administrateur' />
				</div>
			</div>
			<div className='panel card-safe p-6'>
				<p className='safe-text mb-4 text-sm text-slate-400'>
					Chaque filtre contient des profils de démonstration pour tester la recherche par type et par niveau.
				</p>
				<div className='grid gap-4 md:grid-cols-2 xl:grid-cols-5 panel-grid-safe'>
					<label className='text-sm'><span className='mb-2 block text-slate-300'>Recherche username</span><input className='field' value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} /></label>
					<label className='text-sm'><span className='mb-2 block text-slate-300'>Rôle</span><select className='field' value={filters.userType} onChange={(e) => setFilters({ ...filters, userType: e.target.value })}><option value=''>Tous</option><option value='simple'>{getUserTypeLabel("simple")}</option><option value='complexe'>{getUserTypeLabel("complexe")}</option><option value='administrateur'>{getUserTypeLabel("administrateur")}</option></select></label>
					<label className='text-sm'><span className='mb-2 block text-slate-300'>Type membre</span><select className='field' value={filters.memberType} onChange={(e) => setFilters({ ...filters, memberType: e.target.value })}><option value=''>Tous</option><option value='resident'>Étudiant résident</option><option value='staff'>Personnel résidence</option><option value='maintenance'>Personnel maintenance</option><option value='administration'>Administration</option></select></label>
					<label className='text-sm'><span className='mb-2 block text-slate-300'>Niveau</span><select className='field' value={filters.level} onChange={(e) => setFilters({ ...filters, level: e.target.value })}><option value=''>Tous</option><option value='debutant'>{getLevelLabel("debutant")}</option><option value='intermediaire'>{getLevelLabel("intermediaire")}</option><option value='avance'>{getLevelLabel("avance")}</option><option value='expert'>{getLevelLabel("expert")}</option></select></label>
					<div className='text-sm text-slate-300'><span className='mb-2 block text-slate-300'>Resultat</span><div className='field flex items-center'>{filteredMembers.length} profils trouves</div></div>
				</div>
			</div>
			{status.loading && <StatePanel message='Chargement des profils residents...' />}
			{status.error && <StatePanel tone='error' title='Chargement impossible' message={status.error} />}
			{!status.loading && !status.error && members.length === 0 && <StatePanel message='Aucun membre approuve a afficher pour le moment.' />}
			<div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3 panel-grid-safe'>
				{filteredMembers.map((member) => (
					<Link key={member._id} to={`/members/${member._id}`} className='panel card-safe p-6 transition hover:-translate-y-1'>
						<div className='flex min-w-0 items-center justify-between gap-3'>
							<p className='truncate-safe text-sm uppercase tracking-[0.22em] text-emerald-300' title={getUserTypeLabel(member.userType)}>{getUserTypeLabel(member.userType)}</p>
							<StatusBadge value={member.level} />
						</div>
						<h2 className='truncate-safe mt-3 text-2xl font-semibold' title={member.username}>{member.username}</h2>
						<p className='safe-text mt-2 text-slate-300'>{member.publicProfile?.bio || "Aucune bio publique."}</p>
						<div className='mt-4 flex flex-wrap gap-2 text-xs text-slate-300'>
							<span className='badge-nowrap bg-slate-900 px-3 py-1 text-xs font-medium text-slate-300' title={getMemberTypeLabel(member.memberType)}>{getMemberTypeLabel(member.memberType)}</span>
							<span className='status-pill bg-slate-900'>{member.age ?? "n/a"} ans</span>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
};

export default MembersPage;
