import express from "express";
import {
	adminRoute,
	protectRoute,
} from "../middleware/auth.middleware.js";
import {
	approveRegistrationRequest,
	createApprovedMember,
	deviceCategoryHandlers,
	deleteApprovedMember,
	deleteUser,
	downloadDatabaseBackup,
	exportDevicesCsv,
	exportFullJson,
	exportTelemetryCsv,
	exportUsersCsv,
	getAccessLogs,
	getActionLogs,
	getAdminStatistics,
	getApprovedMembers,
	getDataIntegrityReport,
	getAdminDashboard,
	getRegistrationRequests,
	getSettings,
	rejectRegistrationRequest,
	reviewMaintenanceRequest,
	reviewRegistration,
	serviceCategoryHandlers,
	updateUser,
	upsertSetting,
} from "../controllers/admin.controller.js";
import { getAllReservations } from "../controllers/reservation.controller.js";

const router = express.Router();

router.use(protectRoute, adminRoute);

router.get("/dashboard", getAdminDashboard);
router.get("/registration-requests", getRegistrationRequests);
router.get("/statistics", getAdminStatistics);
router.get("/settings", getSettings);
router.patch("/registrations/:id/review", reviewRegistration);
router.put("/registration-requests/:id/approve", approveRegistrationRequest);
router.put("/registration-requests/:id/reject", rejectRegistrationRequest);
router.patch("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.get("/device-categories", deviceCategoryHandlers.list);
router.post("/device-categories", deviceCategoryHandlers.create);
router.delete("/device-categories/:id", deviceCategoryHandlers.delete);
router.get("/service-categories", serviceCategoryHandlers.list);
router.post("/service-categories", serviceCategoryHandlers.create);
router.delete("/service-categories/:id", serviceCategoryHandlers.delete);
router.get("/logs/access", getAccessLogs);
router.get("/logs/actions", getActionLogs);
router.get("/export/devices-csv", exportDevicesCsv);
router.get("/export/users-csv", exportUsersCsv);
router.get("/export/telemetry-csv", exportTelemetryCsv);
router.get("/export/full-json", exportFullJson);
router.get("/backup", downloadDatabaseBackup);
router.get("/data-integrity", getDataIntegrityReport);
router.get("/approved-members", getApprovedMembers);
router.get("/reservations", getAllReservations);
router.post("/approved-members", createApprovedMember);
router.delete("/approved-members/:id", deleteApprovedMember);
router.patch("/maintenance-requests/:id", reviewMaintenanceRequest);
router.post("/settings", upsertSetting);

export default router;
