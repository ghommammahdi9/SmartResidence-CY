import express from "express";
import { getAnnouncements, getFreeTour, getOverview, searchPublicContent } from "../controllers/public.controller.js";

const router = express.Router();

router.get("/overview", getOverview);
router.get("/tour", getFreeTour);
router.get("/announcements", getAnnouncements);
router.get("/search", searchPublicContent);

export default router;
