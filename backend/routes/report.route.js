import express from "express";
import { exportCsvReport, getReportOverview } from "../controllers/report.controller.js";
import { adminRoute, protectRoute, requireApprovedUser, requireGestionAccess } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/overview", protectRoute, requireApprovedUser, requireGestionAccess, getReportOverview);
router.get("/export.csv", protectRoute, adminRoute, exportCsvReport);

export default router;
