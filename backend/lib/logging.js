import ActionLog from "../models/actionLog.model.js";

export const logAction = async ({ userId, actionType, targetType, targetId, metadata = {} }) => {
	await ActionLog.create({
		user: userId || null,
		actionType,
		targetType,
		targetId: targetId ? String(targetId) : "",
		metadata,
	});
};
