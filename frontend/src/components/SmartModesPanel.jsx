import { useMemo, useState } from "react";

const MODES = [
	{
		key: "eco",
		label: "Mode Eco",
		impact: "Reduit la consommation et optimise les plages d eclairage.",
		effects: ["Lumieres a 55%", "Priorite economie energie", "Alertes non critiques regroupees", "Temperature stabilisee a 20C"],
	},
	{
		key: "study",
		label: "Mode Etude",
		impact: "Valorise les espaces calmes, la lumiere et l acces aux salles d etude.",
		effects: ["Salle d etude prioritaire", "Luminosite renforcee", "Acces residents elargi", "Notifications services academiques"],
	},
	{
		key: "night",
		label: "Mode Nuit",
		impact: "Active une logique de securite renforcee et de circulation limitee.",
		effects: ["Acces couloirs controles", "Lumieres circulation automatiques", "Surveillance hall renforcee", "Alertes securite prioritaires"],
	},
	{
		key: "absence",
		label: "Mode Absence",
		impact: "Bascule les espaces en veille intelligente avec verification des acces.",
		effects: ["Eclairage minimum", "Surveillance anti intrusion", "Temperature reduite", "Notifications maintenance preservees"],
	},
	{
		key: "security",
		label: "Mode Securite",
		impact: "Passe la residence en supervision haute vigilance.",
		effects: ["Cameras prioritaires", "Verrouillage zones sensibles", "Alertes temps reel", "Acces technique restreint"],
	},
];

const SmartModesPanel = () => {
	const [activeMode, setActiveMode] = useState(MODES[0].key);
	const mode = useMemo(() => MODES.find((item) => item.key === activeMode) || MODES[0], [activeMode]);

	return (
		<div className='panel p-6'>
			<div className='flex flex-wrap items-center justify-between gap-4'>
				<div>
					<p className='text-xs uppercase tracking-[0.3em] text-emerald-300'>Modes intelligents</p>
					<h2 className='mt-3 text-2xl font-semibold text-white'>Automatisations scenarisees pour la residence</h2>
					<p className='mt-3 max-w-2xl text-sm text-slate-300'>Cette demonstration montre que SmartResidence CY ne se limite pas a afficher des objets, mais orchestre aussi des comportements intelligents.</p>
				</div>
				<span className='status-pill bg-emerald-400/10 text-emerald-200'>Simulation demo stable</span>
			</div>
			<div className='mt-6 flex flex-wrap gap-3'>
				{MODES.map((item) => (
					<button
						key={item.key}
						type='button'
						onClick={() => setActiveMode(item.key)}
						className={activeMode === item.key ? "btn-primary px-4 py-2 text-sm" : "btn-secondary px-4 py-2 text-sm"}
					>
						{item.label}
					</button>
				))}
			</div>
			<div className='mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]'>
				<div className='glass-card p-5'>
					<p className='text-xs uppercase tracking-[0.25em] text-slate-400'>Scenario actif</p>
					<h3 className='mt-3 text-2xl font-semibold text-white'>{mode.label}</h3>
					<p className='mt-3 text-sm text-slate-300'>{mode.impact}</p>
				</div>
				<div className='grid gap-3 sm:grid-cols-2'>
					{mode.effects.map((effect) => (
						<div key={effect} className='glass-card p-4 text-sm text-slate-200'>
							{effect}
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default SmartModesPanel;
