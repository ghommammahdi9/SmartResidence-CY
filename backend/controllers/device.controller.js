import ConnectedDevice from "../models/connectedDevice.model.js";
import DeviceTelemetry from "../models/deviceTelemetry.model.js";
import MaintenanceRequest from "../models/maintenanceRequest.model.js";
import Zone from "../models/zone.model.js";
import DeviceCategory from "../models/deviceCategory.model.js";
import GlobalSetting from "../models/globalSetting.model.js";
import { awardPointsAndProgress } from "../lib/gamification.js";
import { logAction } from "../lib/logging.js";

const buildDeviceFilter = (query) => {
	const filter = {};
	if (query.zone) filter.zone = query.zone;
	if (query.category) filter.category = query.category;
	if (query.status) filter.status = query.status;
	if (query.maintenanceStatus) filter.maintenanceStatus = query.maintenanceStatus;
	if (query.brand) filter.brand = new RegExp(query.brand, "i");
	if (query.type) filter.type = new RegExp(query.type, "i");
	if (query.batteryLevel === "low") filter.batteryLevel = { $lt: 20 };
	if (query.batteryLevel === "medium") filter.batteryLevel = { $gte: 20, $lt: 60 };
	if (query.batteryLevel === "good") filter.batteryLevel = { $gte: 60 };
	if (query.search) {
		const regex = new RegExp(query.search, "i");
		filter.$or = [{ name: regex }, { description: regex }, { deviceId: regex }, { type: regex }];
	}
	return filter;
};

const getDeviceThresholdSettings = async () => {
	const settings = await GlobalSetting.find({
		key: { $in: ["alerts.batteryThreshold", "alerts.energyThreshold", "alerts.inactivityDays", "alerts.autoMaintenance"] },
	});
	const map = Object.fromEntries(settings.map((setting) => [setting.key, setting.value]));
	return {
		batteryThreshold: Number(map["alerts.batteryThreshold"] ?? 20),
		energyThreshold: Number(map["alerts.energyThreshold"] ?? 50),
		inactivityDays: Number(map["alerts.inactivityDays"] ?? 7),
		autoMaintenance: Boolean(map["alerts.autoMaintenance"] ?? false),
	};
};

const toSimpleDevice = (device) => ({
	_id: device._id,
	deviceId: device.deviceId,
	name: device.name,
	description: device.description,
	status: device.status,
	zone: device.zone,
	category: device.category,
});

export const getDevices = async (req, res) => {
	try {
		const [devices, zones, categories, settings] = await Promise.all([
			ConnectedDevice.find(buildDeviceFilter(req.query)).populate("zone category createdBy").sort({ name: 1 }),
			Zone.find({}).sort({ name: 1 }),
			DeviceCategory.find({}).sort({ name: 1 }),
			getDeviceThresholdSettings(),
		]);

		const payloadDevices = req.user?.userType === "simple" ? devices.map(toSimpleDevice) : devices;
		const payloadSettings = req.user?.userType === "simple" ? null : settings;
		res.json({ devices: payloadDevices, filters: { zones, categories }, settings: payloadSettings });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getDeviceById = async (req, res) => {
	try {
		const device = await ConnectedDevice.findById(req.params.id).populate("zone category createdBy");
		if (!device) {
			return res.status(404).json({ message: "Device not found." });
		}

		await awardPointsAndProgress(req.user, 0.5, { incrementAction: true });
		await req.user.save();
		await logAction({
			userId: req.user._id,
			actionType: "device_viewed",
			targetType: "ConnectedDevice",
			targetId: device._id,
			metadata: { deviceName: device.name },
		});

		if (req.user?.userType === "simple") {
			return res.json({ device: toSimpleDevice(device), telemetry: [], settings: null });
		}

		const telemetry = await DeviceTelemetry.find({ device: device._id }).sort({ timestamp: -1 }).limit(10);
		const settings = await getDeviceThresholdSettings();
		res.json({ device, telemetry, settings });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const createDevice = async (req, res) => {
	try {
		const device = await ConnectedDevice.create({
			...req.body,
			createdBy: req.user._id,
		});
		await awardPointsAndProgress(req.user, 1.0, { incrementAction: true });
		await req.user.save();
		await logAction({
			userId: req.user._id,
			actionType: "device_created",
			targetType: "ConnectedDevice",
			targetId: device._id,
			metadata: { name: device.name },
		});
		res.status(201).json({ message: "Device created successfully.", device });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const updateDevice = async (req, res) => {
	try {
		const device = await ConnectedDevice.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate("zone category");
		if (!device) {
			return res.status(404).json({ message: "Device not found." });
		}
		await awardPointsAndProgress(req.user, 0.75, { incrementAction: true });
		await req.user.save();
		await logAction({
			userId: req.user._id,
			actionType: "device_updated",
			targetType: "ConnectedDevice",
			targetId: device._id,
			metadata: { updatedFields: Object.keys(req.body) },
		});
		res.json({ message: "Device updated successfully.", device });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const toggleDeviceStatus = async (req, res) => {
	try {
		const device = await ConnectedDevice.findById(req.params.id);
		if (!device) {
			return res.status(404).json({ message: "Device not found." });
		}
		device.status = device.status === "active" ? "inactive" : "active";
		await device.save();
		await awardPointsAndProgress(req.user, 0.5, { incrementAction: true });
		await req.user.save();
		await logAction({
			userId: req.user._id,
			actionType: "device_toggled",
			targetType: "ConnectedDevice",
			targetId: device._id,
			metadata: { status: device.status },
		});
		res.json({ message: "Device status updated.", device });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const requestDeviceDeletion = async (req, res) => {
	try {
		const device = await ConnectedDevice.findById(req.params.id);
		if (!device) {
			return res.status(404).json({ message: "Device not found." });
		}
		device.deletionRequestStatus = "pending";
		await device.save();
		const request = await MaintenanceRequest.create({
			requester: req.user._id,
			device: device._id,
			type: "deletion",
			reason: req.body.reason || "Deletion requested from gestion module.",
		});
		await awardPointsAndProgress(req.user, 0.75, { incrementAction: true });
		await req.user.save();
		await logAction({
			userId: req.user._id,
			actionType: "device_deletion_requested",
			targetType: "MaintenanceRequest",
			targetId: request._id,
			metadata: { deviceName: device.name },
		});
		res.status(201).json({ message: "Deletion request submitted.", request });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getDeviceStatistics = async (req, res) => {
	try {
		if (req.user?.userType === "simple") {
			return res.status(403).json({ message: "Acces reserve aux gestionnaires" });
		}
		const device = await ConnectedDevice.findById(req.params.id);
		if (!device) {
			return res.status(404).json({ message: "Device not found." });
		}
		const telemetry = await DeviceTelemetry.find({ device: device._id }).sort({ timestamp: -1 }).limit(20);
		const totals = telemetry.reduce(
			(acc, item) => {
				acc.energyUsage += item.energyUsage || 0;
				acc.waterUsage += item.waterUsage || 0;
				return acc;
			},
			{ energyUsage: 0, waterUsage: 0 }
		);
		res.json({ device, telemetry, totals });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const deleteDevice = async (req, res) => {
	try {
		const device = await ConnectedDevice.findByIdAndDelete(req.params.id);
		if (!device) {
			return res.status(404).json({ message: "Device not found." });
		}
		await logAction({
			userId: req.user._id,
			actionType: "device_deleted",
			targetType: "ConnectedDevice",
			targetId: req.params.id,
			metadata: { name: device.name },
		});
		res.json({ message: "Device deleted successfully." });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
