import ConnectedDevice from "../models/connectedDevice.model.js";
import DeviceTelemetry from "../models/deviceTelemetry.model.js";
import ResidenceService from "../models/residenceService.model.js";
import User from "../models/user.model.js";
import AccessLog from "../models/accessLog.model.js";
import ActionLog from "../models/actionLog.model.js";

export const getReportOverview = async (req, res) => {
	try {
		const [devices, telemetry, services, users, recentAccess, recentActions] = await Promise.all([
			ConnectedDevice.find({}).populate("zone category"),
			DeviceTelemetry.find({}).sort({ timestamp: -1 }),
			ResidenceService.find({}).populate("zone category"),
			User.find({}),
			AccessLog.find({}).populate("user").sort({ createdAt: -1 }).limit(10),
			ActionLog.find({}).populate("user").sort({ createdAt: -1 }).limit(10),
		]);

		const totalEnergyConsumption = telemetry.reduce((sum, item) => sum + (item.energyUsage || 0), 0);
		const totalWaterConsumption = telemetry.reduce((sum, item) => sum + (item.waterUsage || 0), 0);
		const devicesByStatus = devices.reduce((acc, device) => {
			acc[device.status] = (acc[device.status] || 0) + 1;
			return acc;
		}, {});
		const inefficientDevices = devices.filter((device) => device.energyUsage > 120 || device.maintenanceStatus !== "normal");
		const usersByLevel = users.reduce((acc, user) => {
			acc[user.level] = (acc[user.level] || 0) + 1;
			return acc;
		}, {});
		const mostUsedServices = services
			.map((service) => ({
				_id: service._id,
				name: service.name,
				requests: service.usageStats.requests,
			}))
			.sort((a, b) => b.requests - a.requests)
			.slice(0, 5);

		res.json({
			totalEnergyConsumption,
			totalWaterConsumption,
			devicesByStatus,
			maintenanceAlerts: devices.filter((device) => device.maintenanceStatus !== "normal").length,
			inefficientDevices,
			mostUsedServices,
			usersByLevel,
			accessRate: recentAccess.length,
			actionCounts: recentActions.length,
			recentAccess,
			recentActions,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const exportCsvReport = async (req, res) => {
	try {
		const devices = await ConnectedDevice.find({}).populate("zone category");
		const rows = [
			["deviceId", "name", "zone", "category", "status", "energyUsage", "waterUsage", "maintenanceStatus"].join(","),
			...devices.map((device) =>
				[
					device.deviceId,
					device.name,
					device.zone?.name || "",
					device.category?.name || "",
					device.status,
					device.energyUsage,
					device.waterUsage,
					device.maintenanceStatus,
				]
					.map((value) => `"${String(value).replace(/"/g, '""')}"`)
					.join(",")
			),
		];

		res.setHeader("Content-Type", "text/csv");
		res.setHeader("Content-Disposition", 'attachment; filename="smartresidence-report.csv"');
		res.send(rows.join("\n"));
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
