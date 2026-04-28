import logoCYU from "../assets/branding/logo-cyu.png";
import logoCYTech from "../assets/branding/logo-cytech.png";

const Footer = () => (
	<footer className='mt-16 border-t border-slate-700/40 bg-slate-950/80'>
		<div className='page-shell py-8'>
			<div className='grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end'>
				<div>
					<p className='text-sm uppercase tracking-[0.35em] text-emerald-300'>SmartResidence CY</p>
					<h2 className='mt-3 text-2xl font-semibold text-white'>Plateforme intelligente pour residence universitaire connectee</h2>
					<p className='mt-3 max-w-2xl text-sm text-slate-400'>
						Projet MERN academique centre sur les objets connectes, la supervision des zones, la gestion
						des services residents, les logs, les rapports et la progression des utilisateurs.
					</p>
				</div>
				<div className='flex flex-wrap items-center gap-6 lg:justify-end'>
					<img src={logoCYU} alt='Logo CY Universite' className='h-12 w-auto rounded-2xl bg-white/90 p-2' />
					<img src={logoCYTech} alt='Logo CY Tech' className='h-12 w-auto rounded-2xl bg-white/90 p-2' />
				</div>
			</div>
			<div className='mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4 text-xs text-slate-500'>
				<p>SmartResidence CY — CY Tech ING1 2025-2026</p>
				<p>Projet realise par Saad Mohamed & Mehdi Ghommam</p>
			</div>
		</div>
	</footer>
);

export default Footer;
