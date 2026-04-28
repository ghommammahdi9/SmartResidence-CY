import express from "express";
import { createMaintenanceIssue } from "../controllers/member.controller.js";
import { protectRoute, requireApprovedUser } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, requireApprovedUser, createMaintenanceIssue);

export default router;
