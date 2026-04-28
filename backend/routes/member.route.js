import express from "express";
import {
	createOwnMaintenanceRequest,
	getDashboard,
	getMemberProfile,
	getMembers,
	getMyResidence,
	getOwnAccessHistory,
	getOwnMaintenanceRequests,
	updateOwnProfile,
} from "../controllers/member.controller.js";
import { protectRoute, requireApprovedUser, requireGestionAccess } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, requireApprovedUser, requireGestionAccess, getMembers);
router.get("/me/dashboard", protectRoute, requireApprovedUser, getDashboard);
router.put("/me", protectRoute, requireApprovedUser, updateOwnProfile);
router.get("/me/residence", protectRoute, requireApprovedUser, getMyResidence);
router.get("/me/access-history", protectRoute, requireApprovedUser, getOwnAccessHistory);
router.get("/me/maintenance-requests", protectRoute, requireApprovedUser, getOwnMaintenanceRequests);
router.post("/me/maintenance-requests", protectRoute, requireApprovedUser, createOwnMaintenanceRequest);
router.get("/:id", protectRoute, requireApprovedUser, requireGestionAccess, getMemberProfile);

export default router;
