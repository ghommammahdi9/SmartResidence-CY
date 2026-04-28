import express from "express";
import {
	createDevice,
	deleteDevice,
	getDeviceById,
	getDevices,
	getDeviceStatistics,
	requestDeviceDeletion,
	toggleDeviceStatus,
	updateDevice,
} from "../controllers/device.controller.js";
import { adminRoute, protectRoute, requireApprovedUser, requireGestionAccess } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, requireApprovedUser, requireGestionAccess, getDevices);
router.get("/:id", protectRoute, requireApprovedUser, requireGestionAccess, getDeviceById);
router.get("/:id/statistics", protectRoute, requireApprovedUser, requireGestionAccess, getDeviceStatistics);
router.post("/", protectRoute, requireApprovedUser, requireGestionAccess, createDevice);
router.put("/:id", protectRoute, requireApprovedUser, requireGestionAccess, updateDevice);
router.patch("/:id/toggle", protectRoute, requireApprovedUser, requireGestionAccess, toggleDeviceStatus);
router.post("/:id/request-deletion", protectRoute, requireApprovedUser, requireGestionAccess, requestDeviceDeletion);
router.delete("/:id", protectRoute, requireApprovedUser, adminRoute, deleteDevice);

export default router;
