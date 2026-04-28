const getAccessValues = (user) => ({
	role: String(user?.role || "").toLowerCase(),
	userType: String(user?.userType || "").toLowerCase(),
	level: String(user?.level || "").toLowerCase(),
});

const hasExplicitRole = ({ role, userType }) => Boolean(role || userType);

const ROLE_LABELS = {
	simple: "Résident",
	complexe: "Personnel résidence",
	administrateur: "Administrateur",
	admin: "Administrateur",
	visiteur: "Visiteur",
};

const MEMBER_TYPE_LABELS = {
	resident: "Étudiant résident",
	staff: "Personnel résidence",
	maintenance: "Personnel maintenance",
	administration: "Administration",
};

const LEVEL_LABELS = {
	debutant: "Nouveau résident",
	intermediaire: "Résident actif",
	avance: "Référent opérationnel",
	expert: "Superviseur confirmé",
};

const fallbackLabel = (value) =>
	String(value || "")
		.replaceAll("_", " ")
		.replace(/^\w/, (char) => char.toUpperCase());

export const getUserTypeLabel = (value) => ROLE_LABELS[String(value || "").toLowerCase()] || fallbackLabel(value);

export const getRoleLabel = (userOrValue) => {
	const value =
		typeof userOrValue === "string"
			? userOrValue
			: userOrValue?.userType || userOrValue?.role || "visiteur";
	return getUserTypeLabel(value);
};

export const getMemberTypeLabel = (value) =>
	MEMBER_TYPE_LABELS[String(value || "").toLowerCase()] || fallbackLabel(value || "resident");

export const getLevelLabel = (value) => LEVEL_LABELS[String(value || "").toLowerCase()] || fallbackLabel(value);

export const getUserDisplayRole = (user) => getRoleLabel(user);

export const getUserDisplayLevel = (user) => getLevelLabel(user?.level);

export const isSimpleUser = (user) => {
	const { role, userType } = getAccessValues(user);
	return role === "simple" || userType === "simple";
};

export const isResident = isSimpleUser;

export const isComplex = (user) => {
	const { role, userType } = getAccessValues(user);
	return role === "complexe" || userType === "complexe";
};

export const isStaff = isComplex;

export const canAccessGestion = (user) => {
	const { role, userType, level } = getAccessValues(user);
	const explicitRole = hasExplicitRole({ role, userType });
	return (
		role === "complexe" ||
		role === "administrateur" ||
		role === "admin" ||
		userType === "complexe" ||
		userType === "administrateur" ||
		userType === "admin" ||
		(!explicitRole && (level === "avance" || level === "expert"))
	);
};

export const isAdmin = (user) => {
	const { role, userType, level } = getAccessValues(user);
	const explicitRole = hasExplicitRole({ role, userType });
	return role === "administrateur" || role === "admin" || userType === "administrateur" || userType === "admin" || (!explicitRole && level === "expert");
};

export const canAccessDevices = (user) => canAccessGestion(user) || isAdmin(user);

export const canAccessMembers = (user) => canAccessGestion(user) || isAdmin(user);

export const canAccessReports = (user) => isAdmin(user);

export const canAccessAdmin = (user) => isAdmin(user);

export const canViewMembers = (user) => canAccessMembers(user);

export const canConfigureServices = (user) => canAccessGestion(user);
