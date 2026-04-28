import { computeDeviceHealth } from "../utils/deviceHealth";

const HEALTH_CLASSES = {
	good: "bg-emerald-400/10 text-emerald-200 border-emerald-400/20",
	watch: "bg-amber-300/10 text-amber-100 border-amber-300/20",
	critical: "bg-rose-400/10 text-rose-100 border-rose-400/20",
};

const HealthScoreBadge = ({ device, showScore = true }) => {
	const health = computeDeviceHealth(device);

	return (
		<span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${HEALTH_CLASSES[health.tone] || HEALTH_CLASSES.good}`}>
			<span>{health.label}</span>
			{showScore ? <span className='text-[11px] opacity-80'>{health.score}/100</span> : null}
		</span>
	);
};

export default HealthScoreBadge;

