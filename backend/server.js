import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";


import authRoutes from "./routes/auth.route.js";
import publicRoutes from "./routes/public.route.js";
import memberRoutes from "./routes/member.route.js";
import maintenanceRoutes from "./routes/maintenance.route.js";
import deviceRoutes from "./routes/device.route.js";
import serviceRoutes from "./routes/service.route.js";
import adminRoutes from "./routes/admin.route.js";
import reportRoutes from "./routes/report.route.js";
import reservationRoutes from "./routes/reservation.route.js";

import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __dirname = path.resolve();

app.use(express.json({ limit: "10mb" })); // allows you to parse the body of the request
app.use(cookieParser());
app.use(cors({
  origin: [process.env.CLIENT_URL, "http://localhost:5173", "http://localhost:3000"].filter(Boolean),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.get("/api/health", (req, res) => {
	res.json({ status: "ok", project: "SmartResidence CY" });
});

app.use("/api/auth", authRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reports", reportRoutes);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

app.listen(PORT, () => {
	console.log("Server is running on http://localhost:" + PORT);
	connectDB();
});
