import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import RegistrationRequest from "../models/registrationRequest.model.js";
import DeviceCategory from "../models/deviceCategory.model.js";
import ServiceCategory from "../models/serviceCategory.model.js";
import MaintenanceRequest from "../models/maintenanceRequest.model.js";
import AccessLog from "../models/accessLog.model.js";
import ActionLog from "../models/actionLog.model.js";
import ConnectedDevice from "../models/connectedDevice.model.js";
import DeviceTelemetry from "../models/deviceTelemetry.model.js";
import ResidenceService from "../models/residenceService.model.js";
import GlobalSetting from "../models/globalSetting.model.js";
import ApprovedMember from "../models/approvedMember.model.js";
import Zone from "../models/zone.model.js";
import Announcement from "../models/announcement.model.js";
import { resolveLevel } from "../lib/gamification.js";
import { logAction } from "../lib/logging.js";
import {
	buildDemoVerificationResponse,
	buildVerificationChallenge,
	sendVerificationCode,
} from "../lib/verification.js";

const sanitizeNestedUser = (user) => {
	if (!user) return null;
	const plain = typeof user.toObject === "function" ? user.toObject() : { ...user };
	delete plain.password;
	delete plain.emailVerificationToken;
	delete plain.emailVerificationExpiresAt;
	delete plain.emailVerificationCodeHash;
	delete plain.emailVerificationLastSentAt;
	delete plain.lastCodeSentAt;
	return plain;
};

const sanitizeRegistrationRequest = (request) => {
	const plain = typeof request.toObject === "function" ? request.toObject() : { ...request };
	delete plain.password;
	delete plain.verificationCode;
	delete plain.emailVerificationToken;
	plain.user = sanitizeNestedUser(plain.user);
	plain.reviewedBy = sanitizeNestedUser(plain.reviewedBy);
	return plain;
};

const toCsv = (rows) =>
	rows
		.map((row) =>
			row
				.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
				.join(",")
		)
		.join("\n");

const calculateBackupMetadata = (backup) => ({
	backupDate: new Date().toISOString(),
	platform: "SmartResidence CY",
	version: "1.0.0",
	totalDocuments: Object.keys(backup)
		.filter((key) => key !== "metadata")
		.reduce((sum, key) => sum + (Array.isArray(backup[key]) ? backup[key].length : 0), 0),
});

export const getAdminDashboard = async (req, res) => {
	try {
		const [users, registrationRequests, maintenanceRequests, devices, services, recentAccess, recentActions, settings] =
			await Promise.all([
				User.find({}).sort({ createdAt: -1 }),
				RegistrationRequest.find({}).populate("user reviewedBy").sort({ createdAt: -1 }),
				MaintenanceRequest.find({}).populate("requester device reviewedBy").sort({ createdAt: -1 }),
				ConnectedDevice.find({}).populate("zone category").sort({ createdAt: -1 }),
				ResidenceService.find({}).populate("zone category").sort({ createdAt: -1 }),
				AccessLog.find({}).populate("user").sort({ createdAt: -1 }).limit(10),
				ActionLog.find({}).populate("user").sort({ createdAt: -1 }).limit(10),
				GlobalSetting.find({}).sort({ key: 1 }),
			]);

		res.json({
			users: users.map((user) => user.toSafeObject()),
			pendingRequests: registrationRequests.map(sanitizeRegistrationRequest),
			registrationRequests: registrationRequests.map(sanitizeRegistrationRequest),
			maintenanceRequests,
			devices,
			services,
			recentAccess,
			recentActions,
			settings,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getRegistrationRequests = async (req, res) => {
	try {
		const requests = await RegistrationRequest.find({})
			.populate("user reviewedBy")
			.sort({ createdAt: -1 });

		return res.json({ requests: requests.map(sanitizeRegistrationRequest) });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

export const approveRegistrationRequest = async (req, res) => {
	try {
		const request = await RegistrationRequest.findById(req.params.id).populate("user");
		if (!request) {
			return res.status(404).json({ message: "Registration request not found." });
		}

		if (request.status === "pending") {
			const linkedUser = request.user;
			request.username = request.username || linkedUser?.username || request.email?.split("@")[0] || "resident";
			request.firstName = request.firstName || linkedUser?.firstName || request.username || "Resident";
			request.lastName = request.lastName || linkedUser?.lastName || "SmartResidence";
			request.memberType = request.memberType || linkedUser?.memberType || "resident";
			request.residenceMemberId = request.residenceMemberId || linkedUser?.residenceMemberId || "";
			request.dateOfBirth = request.dateOfBirth || request.birthDate || linkedUser?.birthDate || null;
			request.birthDate = request.birthDate || request.dateOfBirth || linkedUser?.birthDate || null;
			request.gender = request.gender || linkedUser?.gender || "Autre";
			request.password = request.password || linkedUser?.password || (await bcrypt.hash(`legacy-${request.email}-${Date.now()}`, 10));

			const verificationChallenge = buildVerificationChallenge();
			request.verificationCode = verificationChallenge.code;
			request.emailVerificationToken = verificationChallenge.token;
			request.codeExpiresAt = verificationChallenge.expiresAt;
			request.lastCodeSentAt = new Date();
			request.status = "pending_email";
			request.rejectionReason = "";
			request.reviewedBy = req.user._id;
			request.reviewedAt = new Date();
			await request.save();

			const delivery = await sendVerificationCode({
				email: request.email,
				firstName: request.firstName,
				code: request.verificationCode,
				expiresAt: request.codeExpiresAt,
			});

			await logAction({
				userId: req.user._id,
				actionType: "registration_sent_to_email_verification",
				targetType: "RegistrationRequest",
				targetId: request._id,
				metadata: { email: request.email, deliveryMode: delivery.mode },
			});

			return res.json({
				message: "Demande approuvee, email de verification envoye",
				request: sanitizeRegistrationRequest(request),
				verificationDelivery: delivery.mode,
				demoVerification:
					delivery.mode === "demo"
						? buildDemoVerificationResponse({
							email: request.email,
							code: request.verificationCode,
							token: request.emailVerificationToken,
							expiresAt: request.codeExpiresAt,
						})
						: null,
			});
		}

		if (request.status !== "pending_admin") {
			return res.status(400).json({ message: "Only pending_admin or legacy pending requests can be approved." });
		}

		const existingUser = await User.findOne({ email: request.email });
		if (existingUser) {
			return res.status(400).json({ message: "A user already exists for this email." });
		}

		const user = await User.create({
			username: request.username,
			email: request.email,
			password: request.password,
			firstName: request.firstName,
			lastName: request.lastName,
			birthDate: request.dateOfBirth || request.birthDate || null,
			age: request.dateOfBirth || request.birthDate ? resolveAge(request.dateOfBirth || request.birthDate) : undefined,
			gender: request.gender || "non specifie",
			memberType: request.memberType || "resident",
			residenceMemberId: request.residenceMemberId || "",
			emailVerified: true,
			approvalStatus: "approved",
			userType: "simple",
			level: "debutant",
			points: 0,
			accessCount: 0,
			actionCount: 0,
			lastLoginAt: null,
		});

		request.user = user._id;
		request.status = "approved";
		request.rejectionReason = "";
		request.reviewedBy = req.user._id;
		request.reviewedAt = new Date();
		await request.save();

		await logAction({
			userId: req.user._id,
			actionType: "registration_approved",
			targetType: "RegistrationRequest",
			targetId: request._id,
			metadata: { email: request.email, userId: user._id },
		});

		return res.json({
			message: "Demande approuvee, email de verification envoye",
			request: sanitizeRegistrationRequest(request),
			user: user.toSafeObject(),
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

export const rejectRegistrationRequest = async (req, res) => {
	try {
		const request = await RegistrationRequest.findById(req.params.id);
		if (!request) {
			return res.status(404).json({ message: "Registration request not found." });
		}

		const nextNotes = req.body.notes || request.notes || "";
		const nextRejectionReason = req.body.rejectionReason || req.body.notes || "";
		const reviewedAt = new Date();

		const updatedRequest = await RegistrationRequest.findByIdAndUpdate(
			req.params.id,
			{
				$set: {
					status: "rejected",
					rejectionReason: nextRejectionReason,
					notes: nextNotes,
					reviewedBy: req.user._id,
					reviewedAt,
				},
			},
			{
				new: true,
				runValidators: false,
			}
		);

		await logAction({
			userId: req.user._id,
			actionType: "registration_rejected",
			targetType: "RegistrationRequest",
			targetId: request._id,
			metadata: { email: request.email, rejectionReason: nextRejectionReason },
		});

		return res.json({ message: "Registration request rejected.", request: sanitizeRegistrationRequest(updatedRequest) });
	} catch (error) {
		console.error("rejectRegistrationRequest failed", {
			message: error.message,
			code: error.code,
			stack: error.stack,
		});
		return res.status(500).json({ message: error.message });
	}
};

export const reviewRegistration = async (req, res) => {
	const { status } = req.body;
	if (status === "approved") {
		return approveRegistrationRequest(req, res);
	}
	if (status === "rejected") {
		return rejectRegistrationRequest(req, res);
	}
	return res.status(400).json({ message: "Unsupported registration review status." });
};

export const updateUser = async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user) {
			return res.status(404).json({ message: "User not found." });
		}

		const allowedFields = ["approvalStatus", "userType", "level", "points", "memberType"];
		for (const field of allowedFields) {
			if (req.body[field] !== undefined) {
				user[field] = req.body[field];
			}
		}

		if (req.body.points !== undefined && req.body.level === undefined && req.body.userType === undefined) {
			const resolved = resolveLevel(Number(req.body.points));
			if (user.userType !== "administrateur") {
				user.userType = resolved.userType;
			}
			user.level = resolved.level;
		}

		await user.save();
		await logAction({
			userId: req.user._id,
			actionType: "user_updated",
			targetType: "User",
			targetId: user._id,
			metadata: req.body,
		});
		res.json({ message: "User updated successfully.", user: user.toSafeObject() });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const deleteUser = async (req, res) => {
	try {
		const user = await User.findByIdAndDelete(req.params.id);
		if (!user) {
			return res.status(404).json({ message: "User not found." });
		}
		await RegistrationRequest.deleteMany({ user: req.params.id });
		await logAction({
			userId: req.user._id,
			actionType: "user_deleted",
			targetType: "User",
			targetId: req.params.id,
			metadata: { email: user.email },
		});
		res.json({ message: "User deleted successfully." });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const createCategoryHandlers = (Model, targetType) => ({
	list: async (req, res) => {
		const categories = await Model.find({}).sort({ name: 1 });
		res.json({ categories });
	},
	create: async (req, res) => {
		const category = await Model.create(req.body);
		await logAction({
			userId: req.user._id,
			actionType: `${targetType.toLowerCase()}_created`,
			targetType,
			targetId: category._id,
			metadata: { name: category.name },
		});
		res.status(201).json({ category });
	},
	delete: async (req, res) => {
		await Model.findByIdAndDelete(req.params.id);
		await logAction({
			userId: req.user._id,
			actionType: `${targetType.toLowerCase()}_deleted`,
			targetType,
			targetId: req.params.id,
		});
		res.json({ message: `${targetType} deleted.` });
	},
});

export const deviceCategoryHandlers = createCategoryHandlers(DeviceCategory, "DeviceCategory");
export const serviceCategoryHandlers = createCategoryHandlers(ServiceCategory, "ServiceCategory");

export const getAccessLogs = async (req, res) => {
	const logs = await AccessLog.find({}).populate("user").sort({ createdAt: -1 }).limit(100);
	res.json({ logs });
};

export const getApprovedMembers = async (req, res) => {
	try {
		const members = await ApprovedMember.find({}).sort({ residenceMemberId: 1 });
		return res.json({ members });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

export const createApprovedMember = async (req, res) => {
	try {
		const member = await ApprovedMember.create(req.body);
		await logAction({
			userId: req.user._id,
			actionType: "approved_member_created",
			targetType: "ApprovedMember",
			targetId: member._id,
			metadata: { residenceMemberId: member.residenceMemberId },
		});
		return res.status(201).json({ member });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

export const deleteApprovedMember = async (req, res) => {
	try {
		const member = await ApprovedMember.findByIdAndDelete(req.params.id);
		if (!member) {
			return res.status(404).json({ message: "Approved member not found." });
		}
		await logAction({
			userId: req.user._id,
			actionType: "approved_member_deleted",
			targetType: "ApprovedMember",
			targetId: req.params.id,
			metadata: { residenceMemberId: member.residenceMemberId },
		});
		return res.json({ message: "Approved member deleted." });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

export const getActionLogs = async (req, res) => {
	const logs = await ActionLog.find({}).populate("user").sort({ createdAt: -1 }).limit(100);
	res.json({ logs });
};

export const getAdminStatistics = async (req, res) => {
	try {
		const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
		const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

		const [users, devices, telemetry, services, maintenanceRequests, registrationRequests, accessLogs, totalZones, settings] = await Promise.all([
			User.find({}),
			ConnectedDevice.find({}).populate("zone"),
			DeviceTelemetry.find({ timestamp: { $gte: last30Days } }),
			ResidenceService.find({}).sort({ "usageStats.requests": -1 }),
			MaintenanceRequest.find({}),
			RegistrationRequest.find({}),
			AccessLog.find({ createdAt: { $gte: lastWeek }, accessType: "login" }),
			Zone.countDocuments({}),
			GlobalSetting.find({ key: { $in: ["system.lastBackupAt", "system.lastBackupDocumentCount"] } }),
		]);

		const totalEnergyConsumption = telemetry.reduce((sum, item) => sum + (item.energyUsage || 0), 0);
		const totalWaterConsumption = telemetry.reduce((sum, item) => sum + (item.waterUsage || 0), 0);
		const userConnectionRate = users.length ? (new Set(accessLogs.map((log) => String(log.user))).size / users.length) * 100 : 0;
		const mostUsedServices = services
			.map((service) => ({
				_id: service._id,
				name: service.name,
				requests: service.usageStats?.requests || 0,
			}))
			.slice(0, 5);
		const devicesByStatus = devices.reduce((acc, device) => {
			acc[device.status] = (acc[device.status] || 0) + 1;
			return acc;
		}, { active: 0, inactive: 0, maintenance: 0 });
		const devicesByZone = Object.values(
			devices.reduce((acc, device) => {
				const zoneName = device.zone?.name || "Non assignee";
				acc[zoneName] = acc[zoneName] || { zone: zoneName, count: 0 };
				acc[zoneName].count += 1;
				return acc;
			}, {})
		);
		const averageBatteryLevel = devices.length
			? devices.reduce((sum, device) => sum + (device.batteryLevel || 0), 0) / devices.length
			: 0;
		const totalMaintenanceRequests = maintenanceRequests.reduce(
			(acc, request) => {
				acc[request.status] = (acc[request.status] || 0) + 1;
				return acc;
			},
			{ pending: 0, approved: 0, rejected: 0 }
		);
		const registrationStats = registrationRequests.reduce(
			(acc, request) => {
				acc[request.status] = (acc[request.status] || 0) + 1;
				return acc;
			},
			{ pending_admin: 0, pending_email: 0, approved: 0, rejected: 0, pending: 0 }
		);

		const lastBackupAt = settings.find((setting) => setting.key === "system.lastBackupAt")?.value || null;
		const lastBackupDocumentCount = settings.find((setting) => setting.key === "system.lastBackupDocumentCount")?.value || 0;

		return res.json({
			totalUsers: users.length,
			totalDevices: devices.length,
			totalServices: services.length,
			totalZones,
			totalTelemetryEntries: telemetry.length,
			totalEnergyConsumption,
			totalWaterConsumption,
			userConnectionRate,
			mostUsedServices,
			devicesByStatus,
			devicesByZone,
			averageBatteryLevel,
			totalMaintenanceRequests,
			registrationStats,
			lastBackupAt,
			lastBackupDocumentCount,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

export const downloadDatabaseBackup = async (_req, res) => {
	try {
		const backup = {
			metadata: {},
			users: await User.find({}).select("-password"),
			registrationRequests: await RegistrationRequest.find({}).select("-password -verificationCode"),
			approvedMembers: await ApprovedMember.find({}),
			zones: await Zone.find({}),
			devices: await ConnectedDevice.find({}),
			telemetry: await DeviceTelemetry.find({}),
			deviceCategories: await DeviceCategory.find({}),
			services: await ResidenceService.find({}),
			serviceCategories: await ServiceCategory.find({}),
			announcements: await Announcement.find({}),
			accessLogs: await AccessLog.find({}).sort({ createdAt: -1 }).limit(500),
			actionLogs: await ActionLog.find({}).sort({ createdAt: -1 }).limit(500),
			maintenanceRequests: await MaintenanceRequest.find({}),
			globalSettings: await GlobalSetting.find({}),
		};

		backup.metadata = calculateBackupMetadata(backup);

		await Promise.all([
			GlobalSetting.findOneAndUpdate(
				{ key: "system.lastBackupAt" },
				{ key: "system.lastBackupAt", value: backup.metadata.backupDate, description: "Horodatage de la derniere sauvegarde admin." },
				{ upsert: true, new: true }
			),
			GlobalSetting.findOneAndUpdate(
				{ key: "system.lastBackupDocumentCount" },
				{ key: "system.lastBackupDocumentCount", value: backup.metadata.totalDocuments, description: "Nombre total de documents inclus dans la derniere sauvegarde admin." },
				{ upsert: true, new: true }
			),
		]);

		res.setHeader("Content-Type", "application/json");
		res.setHeader("Content-Disposition", `attachment; filename=smartresidence_backup_${Date.now()}.json`);
		return res.json(backup);
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

export const getDataIntegrityReport = async (_req, res) => {
	try {
		const issues = [];
		const [devices, zones, deviceCategories, users, telemetry] = await Promise.all([
			ConnectedDevice.find({}),
			Zone.find({}),
			DeviceCategory.find({}),
			User.find({}),
			DeviceTelemetry.find({}),
		]);

		const zoneIds = new Set(zones.map((zone) => String(zone._id)));
		const categoryIds = new Set(deviceCategories.map((category) => String(category._id)));
		const deviceIds = new Set(devices.map((device) => String(device._id)));

		for (const device of devices) {
			if (device.zone && !zoneIds.has(String(device.zone))) {
				issues.push({ type: "orphan_device", message: `Device "${device.name}" references non-existent zone ${device.zone}` });
			}
			if (device.category && !categoryIds.has(String(device.category))) {
				issues.push({ type: "orphan_device_category", message: `Device "${device.name}" references non-existent category` });
			}
		}

		const validRoles = ["visiteur", "simple", "complexe", "administrateur"];
		const validLevels = ["debutant", "intermediaire", "avance", "expert"];
		for (const user of users) {
			const effectiveRole = user.userType || user.role;
			if (!validRoles.includes(effectiveRole)) {
				issues.push({ type: "invalid_role", message: `User "${user.username}" has invalid role "${effectiveRole}"` });
			}
			if (!validLevels.includes(user.level)) {
				issues.push({ type: "invalid_level", message: `User "${user.username}" has invalid level "${user.level}"` });
			}
		}

		for (const entry of telemetry) {
			if (entry.device && !deviceIds.has(String(entry.device))) {
				issues.push({ type: "orphan_telemetry", message: `Telemetry entry references deleted device ${entry.device}` });
			}
		}

		for (const zone of zones) {
			const count = devices.filter((device) => String(device.zone) === String(zone._id)).length;
			if (count === 0) {
				issues.push({ type: "empty_zone", severity: "warning", message: `Zone "${zone.name}" has no devices` });
			}
		}

		return res.json({
			status: issues.filter((issue) => issue.severity !== "warning").length === 0 ? "ok" : "issues_found",
			totalChecks: 6,
			issuesFound: issues.length,
			issues,
			checkedAt: new Date().toISOString(),
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

export const getSettings = async (_req, res) => {
	try {
		const settings = await GlobalSetting.find({}).sort({ key: 1 });
		return res.json({ settings });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

export const reviewMaintenanceRequest = async (req, res) => {
	try {
		const request = await MaintenanceRequest.findById(req.params.id).populate("device");
		if (!request) {
			return res.status(404).json({ message: "Request not found." });
		}
		request.status = req.body.status;
		request.reviewedBy = req.user._id;
		await request.save();

		if (request.type === "deletion" && request.status === "approved" && request.device) {
			await ConnectedDevice.findByIdAndDelete(request.device._id);
		}

		await logAction({
			userId: req.user._id,
			actionType: "maintenance_request_reviewed",
			targetType: "MaintenanceRequest",
			targetId: request._id,
			metadata: { status: req.body.status },
		});

		res.json({ message: "Request reviewed.", request });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const upsertSetting = async (req, res) => {
	try {
		const setting = await GlobalSetting.findOneAndUpdate({ key: req.body.key }, req.body, {
			new: true,
			upsert: true,
		});
		res.json({ setting });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const exportDevicesCsv = async (_req, res) => {
	try {
		const devices = await ConnectedDevice.find({}).populate("zone category");
		const rows = [
			["name", "deviceId", "zone", "category", "status", "brand", "batteryLevel", "lastInteraction"],
			...devices.map((device) => [
				device.name,
				device.deviceId,
				device.zone?.name || "",
				device.category?.name || "",
				device.status,
				device.brand || "",
				device.batteryLevel ?? "",
				device.lastInteraction ? new Date(device.lastInteraction).toISOString() : "",
			]),
		];
		res.setHeader("Content-Type", "text/csv");
		res.setHeader("Content-Disposition", 'attachment; filename="devices_export.csv"');
		return res.send(toCsv(rows));
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

export const exportUsersCsv = async (_req, res) => {
	try {
		const users = await User.find({}).sort({ createdAt: -1 });
		const rows = [
			["username", "email", "firstName", "lastName", "role", "level", "points", "createdAt"],
			...users.map((user) => [
				user.username,
				user.email,
				user.firstName,
				user.lastName,
				user.userType,
				user.level,
				user.points,
				user.createdAt ? new Date(user.createdAt).toISOString() : "",
			]),
		];
		res.setHeader("Content-Type", "text/csv");
		res.setHeader("Content-Disposition", 'attachment; filename="users_export.csv"');
		return res.send(toCsv(rows));
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

export const exportTelemetryCsv = async (_req, res) => {
	try {
		const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
		const telemetry = await DeviceTelemetry.find({ timestamp: { $gte: last30Days } }).populate("device");
		const rows = [
			["device", "timestamp", "energyUsage", "waterUsage", "statusSnapshot"],
			...telemetry.map((entry) => [
				entry.device?.name || "",
				entry.timestamp ? new Date(entry.timestamp).toISOString() : "",
				entry.energyUsage,
				entry.waterUsage,
				entry.statusSnapshot,
			]),
		];
		res.setHeader("Content-Type", "text/csv");
		res.setHeader("Content-Disposition", 'attachment; filename="telemetry_export.csv"');
		return res.send(toCsv(rows));
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

export const exportFullJson = async (_req, res) => {
	try {
		const [users, devices, services, zones, telemetry, accessLogs, actionLogs, announcements] = await Promise.all([
			User.find({}),
			ConnectedDevice.find({}).populate("zone category"),
			ResidenceService.find({}).populate("zone category"),
			Zone.find({}),
			DeviceTelemetry.find({}).populate("device"),
			AccessLog.find({}).populate("user"),
			ActionLog.find({}).populate("user"),
			Announcement.find({}),
		]);
		res.setHeader("Content-Type", "application/json");
		res.setHeader("Content-Disposition", 'attachment; filename="smartresidence_export.json"');
		return res.json({ users, devices, services, zones, telemetry, accessLogs, actionLogs, announcements });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

const resolveAge = (birthDate) => {
	if (!birthDate) return undefined;
	const now = new Date();
	const birth = new Date(birthDate);
	let age = now.getFullYear() - birth.getFullYear();
	const monthDelta = now.getMonth() - birth.getMonth();
	if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < birth.getDate())) {
		age -= 1;
	}
	return age < 0 ? undefined : age;
};
