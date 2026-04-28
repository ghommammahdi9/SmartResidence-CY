import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import SectionHeader from "../components/SectionHeader";
import StatusBadge from "../components/StatusBadge";
import SafeImage from "../components/SafeImage";
import logoCyu from "../assets/branding/logo-cyu.png";
import logoCytech from "../assets/branding/logo-cytech.png";
import studySpace from "../assets/photos/residence/study-space.avif";

const initialState = {
	username: "",
	email: "",
	password: "",
	confirmPassword: "",
	firstName: "",
	lastName: "",
	birthDate: "",
	gender: "non specifie",
	memberType: "resident",
	residenceMemberId: "",
	isResidenceMember: true,
};

const SignUpPage = () => {
	const [form, setForm] = useState(initialState);
	const { signup, loading } = useUserStore();
	const navigate = useNavigate();

	const handleSubmit = async (event) => {
		event.preventDefault();
		const response = await signup(form);
		if (!response) return;

		navigate(`/verify-email?email=${encodeURIComponent(response.email || form.email)}&cooldown=60`);
	};

	return (
		<div className='page-shell'>
			<div className='mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]'>
				<div className='panel-strong bg-grid overflow-hidden px-6 py-8 sm:px-8 sm:py-10'>
					<div className='mx-auto w-full max-w-3xl'>
						<div className='flex items-center gap-4'>
							<img alt='Logo CY Universite' className='h-12 w-auto rounded-2xl bg-white/90 object-contain p-2' src={logoCyu} />
							<img alt='Logo CY Tech' className='h-12 w-auto rounded-2xl bg-white/90 object-contain p-2' src={logoCytech} />
						</div>
						<div className='mt-8'>
							<SectionHeader eyebrow='Inscription' title='Demande d’acces SmartResidence CY' description="L'inscription cree un compte en attente. L'utilisateur doit verifier son email puis etre approuve par l'administrateur." />
						</div>
						<form className='grid grid-cols-1 gap-4 md:grid-cols-2 panel-grid-safe' onSubmit={handleSubmit}>
							<label className='min-w-0 text-sm'><span className='mb-2 block text-slate-300'>Username</span><input className='field' value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></label>
							<label className='min-w-0 text-sm'><span className='mb-2 block text-slate-300'>Email</span><input className='field' type='email' value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
							<label className='min-w-0 text-sm'><span className='mb-2 block text-slate-300'>Prenom</span><input className='field' value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required /></label>
							<label className='min-w-0 text-sm'><span className='mb-2 block text-slate-300'>Nom</span><input className='field' value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required /></label>
							<label className='min-w-0 text-sm'><span className='mb-2 block text-slate-300'>Date de naissance</span><input className='field' type='date' value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} /></label>
							<label className='min-w-0 text-sm'><span className='mb-2 block text-slate-300'>Genre</span><select className='field' value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}><option value='non specifie'>Non specifie</option><option value='femme'>Femme</option><option value='homme'>Homme</option></select></label>
							<label className='min-w-0 text-sm'><span className='mb-2 block text-slate-300'>Type de membre</span><input className='field' value={form.memberType} onChange={(e) => setForm({ ...form, memberType: e.target.value })} /></label>
							<label className='min-w-0 text-sm'><span className='mb-2 block text-slate-300'>Residence Member ID</span><input className='field' value={form.residenceMemberId} onChange={(e) => setForm({ ...form, residenceMemberId: e.target.value })} /></label>
							<label className='min-w-0 text-sm'><span className='mb-2 block text-slate-300'>Mot de passe</span><input className='field' type='password' value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
							<label className='min-w-0 text-sm'><span className='mb-2 block text-slate-300'>Confirmation</span><input className='field' type='password' value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required /></label>
							<label className='flex min-w-0 items-center gap-3 text-sm text-slate-300 md:col-span-2'>
								<input type='checkbox' checked={form.isResidenceMember} onChange={(e) => setForm({ ...form, isResidenceMember: e.target.checked })} />
								<span className='safe-text'>Je confirme etre membre ou futur membre de la residence universitaire.</span>
							</label>
							<div className='grid gap-3 md:col-span-2 sm:grid-cols-2'>
								<button className='btn-primary w-full' disabled={loading} type='submit'>{loading ? "Enregistrement..." : "Soumettre la demande"}</button>
								<Link className='btn-secondary w-full' to='/login'>J&apos;ai deja un compte</Link>
							</div>
						</form>
					</div>
				</div>
				<div className='panel overflow-hidden p-0'>
					<SafeImage alt='Espace d etude moderne de la residence SmartResidence CY' className='h-full min-h-[420px] w-full object-cover' src={studySpace} />
					<div className='border-t border-slate-800/80 p-6 text-sm text-slate-300'>
						<p className='font-semibold text-white'>Parcours d&apos;admission clair</p>
						<p className='mt-2'>Verification email, approbation administrateur, puis acces progressif aux modules Visualisation, Gestion et Administration.</p>
						<div className='mt-4 flex flex-wrap gap-2'>
							<StatusBadge value='visiteur' />
							<StatusBadge value='simple' />
							<StatusBadge value='complexe' />
							<StatusBadge value='administrateur' />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SignUpPage;
