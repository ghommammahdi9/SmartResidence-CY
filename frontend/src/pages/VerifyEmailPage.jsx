import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";
import SectionHeader from "../components/SectionHeader";
import SafeImage from "../components/SafeImage";
import studySpace from "../assets/photos/residence/study-space.avif";

const VerifyEmailPage = () => {
	const [searchParams] = useSearchParams();
	const {
		verifyEmailCode,
		resendVerificationCode,
		loading,
		lastVerification,
		lastVerificationDelivery,
		lastVerificationMessage,
		lastVerificationRetryAfter,
	} = useUserStore();
	const [state, setState] = useState({ loadingToken: false, message: "", tone: "info" });
	const [form, setForm] = useState({
		email: searchParams.get("email") || "",
		code: "",
	});
	const [resendCountdown, setResendCountdown] = useState(0);

	const demoPanel = useMemo(() => {
		if (!lastVerification || !lastVerification.code) return null;
		return {
			email: lastVerification.email,
			code: lastVerification.code,
			expiresAt: lastVerification.expiresAt,
		};
	}, [lastVerification]);

	useEffect(() => {
		const initialCooldown = Number(searchParams.get("cooldown") || 0);
		if (initialCooldown > 0) {
			setResendCountdown(initialCooldown);
		}
	}, [searchParams]);

	useEffect(() => {
		const token = searchParams.get("token");

		if (!token) {
			return;
		}

		setState({ loadingToken: true, message: "", tone: "info" });
		axios
			.get("/auth/verify-email", { params: { token } })
			.then((res) => setState({ loadingToken: false, message: res.data.message, tone: "success" }))
			.catch((error) =>
				setState({
					loadingToken: false,
					message: error.response?.data?.message || "Verification impossible.",
					tone: "error",
				})
			);
	}, [searchParams]);

	useEffect(() => {
		if (lastVerificationRetryAfter > 0) {
			setResendCountdown(lastVerificationRetryAfter);
		}
	}, [lastVerificationRetryAfter]);

	useEffect(() => {
		if (resendCountdown <= 0) {
			return;
		}

		const timer = window.setInterval(() => {
			setResendCountdown((current) => {
				if (current <= 1) {
					window.clearInterval(timer);
					return 0;
				}
				return current - 1;
			});
		}, 1000);

		return () => window.clearInterval(timer);
	}, [resendCountdown]);

	const handleSubmit = async (event) => {
		event.preventDefault();
		const response = await verifyEmailCode(form);
		if (response?.message) {
			setState({ loadingToken: false, message: response.message, tone: "success" });
		}
	};

	const handleResend = async () => {
		const response = await resendVerificationCode(form.email);
		if (response?.message) {
			setState({ loadingToken: false, message: response.message, tone: "success" });
			setResendCountdown(60);
		}
	};

	return (
		<div className='page-shell'>
			<div className='mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]'>
				<div className='panel-strong bg-grid p-8 sm:p-10'>
					<SectionHeader
						eyebrow='Verification'
						title='Verifier votre email avec un code'
						description='Saisissez l email et le code a 6 chiffres genere lors de l inscription. Une fois l email verifie, le compte attend encore la validation administrateur.'
					/>
					<form className='mt-6 grid gap-4' onSubmit={handleSubmit}>
						<label className='text-sm'>
							<span className='mb-2 block text-slate-300'>Email</span>
							<input
								className='field'
								type='email'
								value={form.email}
								onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
								required
							/>
						</label>
						<label className='text-sm'>
							<span className='mb-2 block text-slate-300'>Code de verification</span>
							<input
								className='field tracking-[0.35em]'
								inputMode='numeric'
								maxLength={6}
								placeholder='123456'
								value={form.code}
								onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.replace(/\D/g, "").slice(0, 6) }))}
								required
							/>
						</label>
						<div className='flex flex-wrap gap-3'>
							<button className='btn-primary' disabled={loading || state.loadingToken} type='submit'>
								{loading ? "Verification..." : "Verifier le code"}
							</button>
							<button className='btn-secondary' disabled={loading || !form.email || resendCountdown > 0} onClick={handleResend} type='button'>
								{loading ? "Envoi..." : resendCountdown > 0 ? `Renvoyer un code (${resendCountdown}s)` : "Renvoyer un code"}
							</button>
						</div>
					</form>

					{state.loadingToken && <p className='mt-5 text-sm text-slate-300'>Verification du lien en cours...</p>}
					{state.message && (
						<div className={`mt-5 rounded-3xl border p-5 text-sm ${
							state.tone === "success"
								? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
								: state.tone === "error"
									? "border-rose-400/20 bg-rose-400/10 text-rose-100"
									: "border-slate-700/70 bg-slate-900/60 text-slate-200"
						}`}>
							{state.message}
						</div>
					)}

					{lastVerificationDelivery === "smtp" && lastVerificationMessage && (
						<div className='mt-6 rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5 text-sm text-emerald-100'>
							<p className='font-semibold'>Code envoye par email</p>
							<p className='mt-2'>A verification code has been sent to your email address.</p>
						</div>
					)}

					{lastVerificationDelivery === "smtp_error" && lastVerificationMessage && (
						<div className='mt-6 rounded-3xl border border-amber-300/20 bg-amber-300/10 p-5 text-sm text-amber-50'>
							<p className='font-semibold'>Envoi email a verifier</p>
							<p className='mt-2'>{lastVerificationMessage}</p>
						</div>
					)}

					{demoPanel && (
						<div className='mt-6 rounded-3xl border border-amber-300/20 bg-amber-300/10 p-5 text-sm text-amber-50'>
							<p className='font-semibold'>Code demo local disponible</p>
							<p className='mt-2'>Pour la presentation locale, le backend expose le code tant que l envoi SMTP n est pas configure.</p>
							<p className='mt-4 text-3xl font-semibold tracking-[0.35em] text-white'>{demoPanel.code}</p>
							<p className='mt-2 text-xs text-amber-100/80'>Email cible: {demoPanel.email} · Expire le {new Date(demoPanel.expiresAt).toLocaleString("fr-FR")}</p>
						</div>
					)}

					<div className='mt-8 flex flex-wrap gap-3'>
						<Link className='btn-primary' to='/login'>Aller a la connexion</Link>
						<Link className='btn-secondary' to='/signup'>Retour inscription</Link>
						<Link className='btn-secondary' to='/'>Retour accueil</Link>
					</div>
				</div>

				<div className='panel overflow-hidden p-0'>
					<SafeImage alt='Espace d etude connecte de la residence SmartResidence CY' className='h-full min-h-[420px] w-full object-cover object-center' src={studySpace} />
					<div className='border-t border-slate-800/80 p-6 text-sm text-slate-300'>
						<p className='font-semibold text-white'>Sequence de validation</p>
						<p className='mt-2'>1. Inscription  2. Verification par code  3. Approbation administrateur  4. Acces complet a la plateforme.</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default VerifyEmailPage;
