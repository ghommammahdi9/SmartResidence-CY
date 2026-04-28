import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import SectionHeader from "../components/SectionHeader";
import StatusBadge from "../components/StatusBadge";
import SafeImage from "../components/SafeImage";
import logoCyu from "../assets/branding/logo-cyu.png";
import logoCytech from "../assets/branding/logo-cytech.png";
import campusPhoto from "../assets/photos/campus/campus-cy.png";

const LoginPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showDemoAccounts, setShowDemoAccounts] = useState(false);
	const { login, loading } = useUserStore();
	const navigate = useNavigate();
	const location = useLocation();

	const handleSubmit = async (event) => {
		event.preventDefault();
		const result = await login(email, password);
		if (result?.success) {
			navigate(location.state?.from || "/dashboard");
			return;
		}

		if (result?.needsVerification) {
			navigate(`/verify-email?email=${encodeURIComponent(result.email)}`);
		}
	};

	return (
		<div className='page-shell'>
			<div className='mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]'>
				<div className='panel-strong bg-grid overflow-hidden px-6 py-8 sm:px-8 sm:py-10'>
					<div className='mx-auto w-full max-w-lg'>
						<div className='flex items-center gap-4'>
							<img alt='Logo CY Universite' className='h-12 w-auto rounded-2xl bg-white/90 object-contain p-2' src={logoCyu} />
							<img alt='Logo CY Tech' className='h-12 w-auto rounded-2xl bg-white/90 object-contain p-2' src={logoCytech} />
						</div>
						<div className='mt-8'>
							<SectionHeader eyebrow='Connexion' title='Acceder au module Visualisation' description='Seuls les comptes verifies et approuves accedent aux espaces membres.' />
						</div>
						<form className='space-y-5' onSubmit={handleSubmit}>
							<label className='block text-sm'>
								<span className='mb-2 block text-slate-300'>Email</span>
								<input className='field' type='email' value={email} onChange={(e) => setEmail(e.target.value)} required />
							</label>
							<label className='block text-sm'>
								<span className='mb-2 block text-slate-300'>Mot de passe</span>
								<input className='field' type='password' value={password} onChange={(e) => setPassword(e.target.value)} required />
							</label>
							<div className='grid gap-3 sm:grid-cols-2'>
								<button className='btn-primary w-full' disabled={loading} type='submit'>{loading ? "Connexion..." : "Se connecter"}</button>
								<Link className='btn-secondary w-full' to='/signup'>Creer un compte</Link>
							</div>
						</form>
						<div className='mt-6 rounded-2xl border border-slate-700/40 bg-slate-900/50 p-5 text-sm text-slate-300'>
							<button
								type='button'
								className='flex w-full items-center justify-between gap-3 text-left'
								aria-expanded={showDemoAccounts}
								aria-controls='demo-accounts-panel'
								onClick={() => setShowDemoAccounts((current) => !current)}
							>
								<div className='min-w-0'>
									<p className='font-semibold text-white'>Comptes de test</p>
									<p className='mt-1 text-xs text-slate-400'>Section masquee par defaut pour une presentation plus propre.</p>
								</div>
								<ChevronDown className={`shrink-0 transition ${showDemoAccounts ? "rotate-180" : ""}`} size={18} />
							</button>
							{showDemoAccounts && (
								<div id='demo-accounts-panel' className='mt-4 border-t border-slate-800/80 pt-4'>
									<p>Administrateur Saad: saad.admin@smartresidence.cy / Admin123!</p>
									<p className='mt-2'>Résident Mehdi: mehdi@smartresidence.cy / Member123!</p>
									<p className='mt-2'>Personnel résidence Saad: saad@smartresidence.cy / Member123!</p>
									<div className='mt-4 flex flex-wrap gap-2'>
										<StatusBadge value='simple' />
										<StatusBadge value='complexe' />
										<StatusBadge value='administrateur' />
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
				<div className='panel overflow-hidden p-0'>
					<SafeImage alt='Campus CY et residence universitaire SmartResidence CY' className='h-full min-h-[420px] w-full object-cover' src={campusPhoto} />
					<div className='border-t border-slate-800/80 p-6 text-sm text-slate-300'>
						<p className='font-semibold text-white'>Connexion demo-ready</p>
						<p className='mt-2'>L&apos;interface met en avant l&apos;identite CY, l&apos;approbation des comptes et la progression par niveau pour soutenir la presentation du projet.</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
