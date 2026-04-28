export const formatDate = (value) => {
	if (!value) return "Non disponible";
	return new Date(value).toLocaleString("fr-FR", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

export const formatNumber = (value) => Number(value || 0).toLocaleString("fr-FR", { maximumFractionDigits: 2 });
