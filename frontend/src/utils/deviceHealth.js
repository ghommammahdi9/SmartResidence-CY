const HOURS_IN_DAY = 24;

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));

const getHoursSince = (value) => {
	if (!value) return null;
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return null;
	return (Date.now() - date.getTime()) / (1000 * 60 * 60);
};

export const computeDeviceHealth = (device) => {
	let score = 100;
	const reasons = [];

	if (!device) {
		return { score: 0, label: "Critique", tone: "critical", reasons: ["Device indisponible"] };
	}

	if ((device.batteryLevel ?? 100) < 60) {
		score -= 10;
		reasons.push("batterie moyenne");
	}

	if ((device.batteryLevel ?? 100) < 30) {
		score -= 20;
		reasons.push("batterie faible");
	}

	if ((device.connectivitySignal ?? 100) < 75) {
		score -= 10;
		reasons.push("signal instable");
	}

	if ((device.connectivitySignal ?? 100) < 45) {
		score -= 20;
		reasons.push("connectivite faible");
	}

	if (device.status === "inactive" || device.status === "offline") {
		score -= 22;
		reasons.push("device peu disponible");
	}

	if (device.status === "alert") {
		score -= 18;
		reasons.push("alerte active");
	}

	if (device.maintenanceStatus === "inspection") {
		score -= 10;
		reasons.push("inspection recommandee");
	}

	if (device.maintenanceStatus === "maintenance_needed") {
		score -= 20;
		reasons.push("maintenance requise");
	}

	if (device.maintenanceStatus === "critical") {
		score -= 30;
		reasons.push("etat critique");
	}

	if ((device.energyUsage ?? 0) > 120) {
		score -= 10;
		reasons.push("consommation elevee");
	}

	const hoursSinceInteraction = getHoursSince(device.lastInteraction);
	if (hoursSinceInteraction !== null && hoursSinceInteraction > HOURS_IN_DAY * 7) {
		score -= 15;
		reasons.push("peu d interactions recentes");
	}

	const finalScore = clamp(Math.round(score));
	if (finalScore >= 75) {
		return { score: finalScore, label: "Bon", tone: "good", reasons };
	}
	if (finalScore >= 45) {
		return { score: finalScore, label: "A surveiller", tone: "watch", reasons };
	}
	return { score: finalScore, label: "Critique", tone: "critical", reasons };
};

