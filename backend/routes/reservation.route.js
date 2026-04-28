import express from "express";
import { cancelReservation, checkAvailability, createReservation, getMyReservations } from "../controllers/reservation.controller.js";
import { protectRoute, requireApprovedUser } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRoute, requireApprovedUser);

router.get("/my", getMyReservations);
router.get("/availability", checkAvailability);
router.post("/", createReservation);
router.patch("/:id/cancel", cancelReservation);

export default router;
