import express from "express";
import { createService, deleteService, getServiceById, getServices, updateService } from "../controllers/service.controller.js";
import { adminRoute, protectRoute, requireApprovedUser, requireGestionAccess } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, requireApprovedUser, getServices);
router.get("/:id", protectRoute, requireApprovedUser, getServiceById);
router.post("/", protectRoute, requireApprovedUser, requireGestionAccess, createService);
router.put("/:id", protectRoute, requireApprovedUser, requireGestionAccess, updateService);
router.delete("/:id", protectRoute, requireApprovedUser, adminRoute, deleteService);

export default router;
