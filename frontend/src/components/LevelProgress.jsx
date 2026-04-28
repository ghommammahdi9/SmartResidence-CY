import { getLevelLabel } from "../utils/access";

const LEVELS = [
	{ key: "debutant", threshold: 0, next: 3, unlock: "Accès résident de base" },
	{ key: "intermediaire", threshold: 3, next: 7, unlock: "Résident actif avec usages réguliers" },
	{ key: "avance", threshold: 7, next: 12, unlock: "Accès Personnel résidence / Gestion" },
	{ key: "expert", threshold: 12, next: null, unlock: "Supervision confirmée" },
];

const LevelProgress = ({ points = 0, level = "debutant" }) => {
	const currentLevel = LEVELS.find((item) => item.key === level) || LEVELS[0];
	const nextThreshold = currentLevel.next;
	const progress = nextThreshold
		? Math.min(100, Math.max(0, ((points - currentLevel.threshold) / (nextThreshold - currentLevel.threshold)) * 100))
		: 100;
	const remaining = nextThreshold ? Math.max(0, Number((nextThreshold - points).toFixed(2))) : 0;

	return (
		<div className='glass-card rounded-3xl p-5'>
			<div className='flex flex-wrap items-center justify-between gap-3'>
				<div>
					<p className='text-xs uppercase tracking-[0.25em] text-slate-400'>Progression utilisateur</p>
					<h3 className='mt-2 text-xl font-semibold text-white'>{getLevelLabel(level)}</h3>
				</div>
				<p className='text-sm text-emerald-200'>{points} points</p>
			</div>
			<div className='mt-4 h-3 overflow-hidden rounded-full bg-slate-900/80'>
				<div className='h-full rounded-full bg-gradient-to-r from-emerald-300 via-sky-300 to-amber-200 transition-all duration-500' style={{ width: `${progress}%` }} />
			</div>
			<p className='mt-3 text-sm text-slate-300'>
				{nextThreshold ? `Encore ${remaining} points pour atteindre le niveau suivant.` : "Niveau maximal atteint pour la démonstration."}
			</p>
			<p className='mt-2 text-xs text-slate-500'>{currentLevel.unlock}</p>
		</div>
	);
};

export default LevelProgress;
