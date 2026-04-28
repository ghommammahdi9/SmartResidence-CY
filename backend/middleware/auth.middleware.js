import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import AccessLog from "../models/accessLog.model.js";

const getAccessValues = (user) => ({
	role: String(user?.role || "").toLowerCase(),
	userType: String(user?.userType || "").toLowerCase(),
	level: String(user?.level || "").toLowerCase(),
});

const hasExplicitRole = ({ role, userType }) => Boolean(role || userType);

const canUseGestion = (user) => {
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

const canUseAdmin = (user) => {
	const { role, userType, level } = getAccessValues(user);
	const explicitRole = hasExplicitRole({ role, userType });
	return role === "administrateur" || role === "admin" || userType === "administrateur" || userType === "admin" || (!explicitRole && level === "expert");
};

export const protectRoute = async (req, res, next) => {
	try {
		const accessToken = req.cookies.accessToken;

		if (!accessToken) {
			return res.status(401).json({ message: "Unauthorized - No access token provided" });
		}

		try {
			const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
			const user = await User.findById(decoded.userId).select("-password");

			if (!user) {
				return res.status(401).json({ message: "User not found" });
			}

			req.user = user;
			await AccessLog.create({
				user: user._id,
				accessType: "route_access",
				route: req.originalUrl,
				metadata: { method: req.method, userType: user.userType, level: user.level },
			});

			next();
		} catch (error) {
			if (error.name === "TokenExpiredError") {
				return res.status(401).json({ message: "Unauthorized - Access token expired" });
			}
			throw error;
		}
	} catch (error) {
		console.log("Error in protectRoute middleware", error.message);
		return res.status(401).json({ message: "Unauthorized - Invalid access token" });
	}
};

export const requireApprovedUser = (req, res, next) => {
	if (!req.user?.emailVerified) {
		return res.status(403).json({ message: "Email verification is required." });
	}
	if (req.user?.approvalStatus !== "approved") {
		return res.status(403).json({ message: "Administrator approval is required." });
	}
	next();
};

export const requireGestionAccess = (req, res, next) => {
	if (req.user && canUseGestion(req.user)) {
		next();
	} else {
		return res.status(403).json({ message: "Access denied - Gestion module only" });
	}
};

export const adminRoute = (req, res, next) => {
	if (req.user && canUseAdmin(req.user)) {
		next();
	} else {
		return res.status(403).json({ message: "Access denied - Admin only" });
	}
};
