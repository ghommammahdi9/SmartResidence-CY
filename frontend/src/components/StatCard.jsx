const StatCard = ({ label, value, helper, tone = "emerald", icon, suffix }) => {
	const tones = {
		emerald: "from-emerald-400/20 to-emerald-500/5 text-emerald-200",
		sky: "from-sky-400/20 to-sky-500/5 text-sky-200",
		amber: "from-amber-300/20 to-amber-500/5 text-amber-100",
		rose: "from-rose-300/20 to-rose-500/5 text-rose-100",
	};

	return (
		<div className={`panel card-safe bg-gradient-to-br ${tones[tone] || tones.emerald} p-5`}>
			<div className='flex min-w-0 items-start justify-between gap-4'>
				<p className='safe-text min-w-0 text-sm uppercase tracking-[0.18em] text-slate-300'>{label}</p>
				{icon && <img src={icon} alt='' className='h-10 w-10 shrink-0 rounded-2xl bg-slate-800/70 object-contain p-2' />}
			</div>
			<p className='metric-value mt-4 text-2xl font-semibold sm:text-3xl'>
				{value}
				{suffix ? <span className='ml-1 text-base font-medium text-slate-300'>{suffix}</span> : null}
			</p>
			{helper && <p className='safe-text mt-2 text-sm text-slate-300'>{helper}</p>}
		</div>
	);
};

export default StatCard;
