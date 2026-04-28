import { useState } from "react";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";
import SectionHeader from "../components/SectionHeader";
import { useUserStore } from "../stores/useUserStore";
import { getLevelLabel, getMemberTypeLabel, getRoleLabel } from "../utils/access";
import StatusBadge from "../components/StatusBadge";
import LevelProgress from "../components/LevelProgress";
import accessIcon from "../assets/icons/access.png";
import servicesIcon from "../assets/icons/services.png";
import alertsIcon from "../assets/icons/alerts.png";

const ProfilePage = () => {
	const { user, checkAuth } = useUserStore();
	const [saving, setSaving] = useState(false);
	const [accessLogs, setAccessLogs] = useState([]);
	const [form, setForm] = useState({
		firstName: user?.firstName || "",
		lastName: user?.lastName || "",
		gender: user?.gender || "non specifie",
		memberType: user?.memberType || "",
		publicProfile: {
			bio: user?.publicProfile?.bio || "",
			interests: user?.publicProfile?.interests?.join(", ") || "",
		},
	});

	const handleSubmit = async (event) => {
		event.preventDefault();
		setSaving(true);
		try {
			await axios.put("/members/me", {
				...form,
				publicProfile: {
					bio: form.publicProfile.bio,
					interests: form.publicProfile.interests.split(",").map((item) => item.trim()).filter(Boolean),
				},
			});
			await checkAuth();
			toast.success("Profil mis a jour.");
		} finally {
			setSaving(false);
		}
	};

	useEffect(() => {
		axios.get("/members/me/access-history").then((res) => setAccessLogs(res.data.logs || [])).catch(() => setAccessLogs([]));
	}, []);

	const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();

	return (
		<div className='page-shell space-y-6'>
			<div className='panel-strong bg-grid p-8 sm:p-10'>
				<div className='grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center'>
					<div className='flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center'>
						<div className='flex h-24 w-24 shrink-0 items-center justify-center rounded-[2rem] bg-gradient-to-br from-emerald-300 via-teal-300 to-cyan-300 text-3xl font-black text-slate-950 shadow-2xl shadow-emerald-500/20'>
							{initials}
						</div>
						<div className='min-w-0'>
							<SectionHeader eyebrow='Profil' title={`${user.firstName} ${user.lastName}`} description='Informations personnelles, progression, et presence dans l ecosysteme SmartResidence CY.' />
							<div className='mt-4 flex flex-wrap gap-2'>
								<StatusBadge value={user.userType} />
								<StatusBadge value={user.level} variant='info' />
							</div>
						</div>
					</div>
					<div className='grid gap-4 sm:grid-cols-3'>
						<div className='metric-tile'>
							<img alt='' className='h-10 w-10 rounded-2xl object-contain' src={accessIcon} />
							<p className='text-sm text-slate-300'>Acces</p>
							<p className='text-2xl font-semibold text-white'>{user.accessCount ?? 0}</p>
						</div>
						<div className='metric-tile'>
							<img alt='' className='h-10 w-10 rounded-2xl object-contain' src={servicesIcon} />
							<p className='text-sm text-slate-300'>Actions</p>
							<p className='text-2xl font-semibold text-white'>{user.actionCount ?? 0}</p>
						</div>
						<div className='metric-tile'>
							<img alt='' className='h-10 w-10 rounded-2xl object-contain' src={alertsIcon} />
							<p className='text-sm text-slate-300'>Points</p>
							<p className='text-2xl font-semibold text-white'>{user.points ?? 0}</p>
						</div>
					</div>
				</div>
			</div>
			<div className='grid gap-6 lg:grid-cols-[0.8fr_1.2fr]'>
				<div className='panel p-6'>
					<h2 className='text-2xl font-semibold'>Carte de membre</h2>
					<div className='space-y-3 text-sm text-slate-300'>
						<p className='truncate-safe' title={user.email}>Email: {user.email}</p>
						<p>Role: {getRoleLabel(user)}</p>
						<p>Type de membre: {getMemberTypeLabel(user.memberType)}</p>
						<p>Niveau: {getLevelLabel(user.level)}</p>
						<p>Points: {user.points}</p>
						<p>Residence ID: {user.residenceMemberId || "Non renseigne"}</p>
					</div>
					<div className='mt-6'>
						<LevelProgress points={user.points} level={user.level} />
					</div>
				</div>
				<div className='panel p-6'>
					<h2 className='text-2xl font-semibold'>Editer mon profil</h2>
					<form className='mt-6 grid gap-4 md:grid-cols-2' onSubmit={handleSubmit}>
						<label className='text-sm'><span className='mb-2 block text-slate-300'>Prenom</span><input className='field' value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></label>
						<label className='text-sm'><span className='mb-2 block text-slate-300'>Nom</span><input className='field' value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></label>
						<label className='text-sm'><span className='mb-2 block text-slate-300'>Genre</span><input className='field' value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} /></label>
						<label className='text-sm'><span className='mb-2 block text-slate-300'>Type de membre</span><input className='field' value={form.memberType} onChange={(e) => setForm({ ...form, memberType: e.target.value })} /></label>
						<label className='md:col-span-2 text-sm'><span className='mb-2 block text-slate-300'>Bio publique</span><textarea className='field min-h-28' value={form.publicProfile.bio} onChange={(e) => setForm({ ...form, publicProfile: { ...form.publicProfile, bio: e.target.value } })} /></label>
						<label className='md:col-span-2 text-sm'><span className='mb-2 block text-slate-300'>Centres d&apos;interet</span><input className='field' value={form.publicProfile.interests} onChange={(e) => setForm({ ...form, publicProfile: { ...form.publicProfile, interests: e.target.value } })} placeholder='energie, maintenance, vie etudiante' /></label>
						<div className='md:col-span-2'><button className='btn-primary' disabled={saving} type='submit'>{saving ? "Enregistrement..." : "Enregistrer"}</button></div>
					</form>
				</div>
			</div>
			<div className='panel p-6'>
				<h2 className='text-2xl font-semibold'>Mon historique d&apos;acces</h2>
				<div className='mt-4 overflow-x-auto'>
					<table className='min-w-full text-left text-sm text-slate-300'>
						<thead className='text-slate-100'><tr><th className='pb-3 pr-4'>Date</th><th className='pb-3 pr-4'>Heure</th><th className='pb-3 pr-4'>Zone / Route</th></tr></thead>
						<tbody>
							{accessLogs.map((log) => {
								const date = new Date(log.createdAt);
								return (
									<tr key={log._id} className='border-t border-slate-700/30'>
										<td className='py-3 pr-4'>{date.toLocaleDateString("fr-FR")}</td>
										<td className='py-3 pr-4'>{date.toLocaleTimeString("fr-FR")}</td>
										<td className='py-3 pr-4'><span className='truncate-safe block max-w-[22rem]' title={log.metadata?.zone || log.route}>{log.metadata?.zone || log.route}</span></td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export default ProfilePage;
