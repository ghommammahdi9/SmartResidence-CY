const levelThresholds = [
	{ level: "expert", minPoints: 12, userType: "administrateur" },
	{ level: "avance", minPoints: 7, userType: "complexe" },
	{ level: "intermediaire", minPoints: 3, userType: "simple" },
	{ level: "debutant", minPoints: 0, userType: "simple" },
];

export const resolveLevel = (points) => {
	return levelThresholds.find((entry) => points >= entry.minPoints) || levelThresholds[levelThresholds.length - 1];
};

export const awardPointsAndProgress = async (
	user,
	pointsToAdd = 0,
	{ incrementAccess = false, incrementAction = false } = {}
) => {
	user.points = Number((user.points + pointsToAdd).toFixed(2));
	if (incrementAccess) user.accessCount += 1;
	if (incrementAction) user.actionCount += 1;

	const resolved = resolveLevel(user.points);
	const isFixedStaffRole = ["staff", "maintenance", "administration"].includes(user.memberType);
	if (isFixedStaffRole && user.userType === "complexe") {
		user.level = user.level === "expert" ? "expert" : "avance";
		return user;
	}

	user.level = resolved.level;

	if (user.userType !== "administrateur") {
		user.userType = resolved.userType;
	}

	return user;
};
