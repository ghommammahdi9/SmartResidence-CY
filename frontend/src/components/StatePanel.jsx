const StatePanel = ({ title, message, tone = "default", compact = false }) => {
	const toneClasses = {
		default: "border-slate-700/40 bg-slate-900/50 text-slate-300",
		error: "border-rose-400/20 bg-rose-400/10 text-rose-100",
		success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
	};

	return (
		<div className={`panel ${compact ? "p-4" : "p-6"} ${toneClasses[tone] || toneClasses.default}`}>
			{title && <h2 className={`${compact ? "text-base" : "text-xl"} font-semibold text-white`}>{title}</h2>}
			<p className={title ? "mt-2" : ""}>{message}</p>
		</div>
	);
};

export default StatePanel;
