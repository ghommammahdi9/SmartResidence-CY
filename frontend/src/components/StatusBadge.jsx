const STATUS_STYLES = {
	active: "bg-emerald-400/10 text-emerald-200",
	approved: "bg-emerald-400/10 text-emerald-200",
	normal: "bg-emerald-400/10 text-emerald-200",
	intermediaire: "bg-sky-400/10 text-sky-200",
	avance: "bg-amber-300/10 text-amber-100",
	expert: "bg-fuchsia-300/10 text-fuchsia-100",
	simple: "bg-sky-400/10 text-sky-200",
	complexe: "bg-amber-300/10 text-amber-100",
	administrateur: "bg-fuchsia-300/10 text-fuchsia-100",
	pending: "bg-amber-300/10 text-amber-100",
	inspection: "bg-amber-300/10 text-amber-100",
	limited: "bg-amber-300/10 text-amber-100",
	inactive: "bg-slate-500/20 text-slate-200",
	rejected: "bg-rose-400/10 text-rose-100",
	alert: "bg-rose-400/10 text-rose-100",
	critical: "bg-rose-400/10 text-rose-100",
	maintenance: "bg-rose-400/10 text-rose-100",
	maintenance_needed: "bg-rose-400/10 text-rose-100",
	restricted: "bg-rose-400/10 text-rose-100",
	offline: "bg-slate-500/20 text-slate-200",
};

const VARIANT_STYLES = {
	default: "bg-slate-500/20 text-slate-200",
	info: "bg-sky-400/10 text-sky-200",
	warning: "bg-amber-300/10 text-amber-100",
};

const LABELS = {
	simple: "Résident",
	complexe: "Personnel résidence",
	administrateur: "Administrateur",
	admin: "Administrateur",
	visiteur: "Visiteur",
	resident: "Étudiant résident",
	staff: "Personnel résidence",
	maintenance: "Personnel maintenance",
	administration: "Administration",
	debutant: "Nouveau résident",
	intermediaire: "Résident actif",
	avance: "Référent opérationnel",
	expert: "Superviseur confirmé",
};

const prettify = (value) => LABELS[String(value || "").toLowerCase()] || String(value || "").replaceAll("_", " ");

const StatusBadge = ({ value, variant = "default" }) => {
	const normalizedValue = String(value || "").toLowerCase();
	const label = prettify(value);

	return (
		<span title={label} className={`status-pill ${STATUS_STYLES[normalizedValue] || VARIANT_STYLES[variant] || VARIANT_STYLES.default}`}>
			{label}
		</span>
	);
};

export default StatusBadge;
