import User from "../models/user.model.js";
import AccessLog from "../models/accessLog.model.js";
import ActionLog from "../models/actionLog.model.js";
import Announcement from "../models/announcement.model.js";
import ApprovedMember from "../models/approvedMember.model.js";
import Zone from "../models/zone.model.js";
import ConnectedDevice from "../models/connectedDevice.model.js";
import MaintenanceRequest from "../models/maintenanceRequest.model.js";
import ResidenceService from "../models/residenceService.model.js";

const toPublicMember = (member) => ({
	_id: member._id,
	username: member.username,
	age: member.age,
	gender: member.gender,
	memberType: member.memberType,
	photo: member.photo,
	userType: member.userType,
	level: member.level,
	points: member.points,
	publicProfile: member.publicProfile,
});

const MAINTENANCE_CATEGORIES = ["Plomberie", "Electricite", "Chauffage", "Serrure", "Reseau", "Proprete", "Autre"];

const normalizeMaintenanceCategory = (value) => {
	const matched = MAINTENANCE_CATEGORIES.find((category) => category.toLowerCase() === String(value || "").trim().toLowerCase());
	return matched || "Autre";
};

export const getDashboard = async (req, res) => {
	try {
		const [recentAccesses, recentActions, communityCount, announcements, maintenanceRequests, approvedMember, services] = await Promise.all([
			AccessLog.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(5),
			ActionLog.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(5),
			User.countDocuments({ approvalStatus: "approved" }),
			Announcement.find({ isPublic: true }).sort({ createdAt: -1 }).limit(4),
			MaintenanceRequest.find({ requester: req.user._id }).populate("zone device").sort({ createdAt: -1 }).limit(5),
			ApprovedMember.findOne({ residenceMemberId: req.user.residenceMemberId, isActive: true }),
			ResidenceService.find({ status: { $in: ["active", "limited"] } }).populate("zone").sort({ "usageStats.requests": -1 }).limit(4),
		]);

		const zoneWidgets = {
			laundry: "Disponible",
			study: "Ouverte",
			kitchen: "Disponible",
		};

		res.json({
			user: req.user.toSafeObject(),
			recentAccesses,
			recentActions,
			communityCount,
			announcements,
			maintenanceRequests,
			residenceMember: approvedMember,
			studentWidgets: zoneWidgets,
			quickServices: services,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const updateOwnProfile = async (req, res) => {
	try {
		const allowedFields = ["firstName", "lastName", "gender", "photo", "memberType", "publicProfile"];
		for (const field of allowedFields) {
			if (req.body[field] !== undefined) {
				req.user[field] = req.body[field];
			}
		}
		await req.user.save();
		res.json({ message: "Profile updated successfully.", user: req.user.toSafeObject() });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getMembers = async (req, res) => {
	try {
		const members = await User.find({ approvalStatus: "approved" })
			.select("-password -emailVerificationToken -emailVerificationCodeHash -emailVerificationLastSentAt -emailVerificationExpiresAt")
			.sort({ firstName: 1, lastName: 1 });

		const payload = req.user.userType === "administrateur" ? members.map((member) => member.toSafeObject()) : members.map(toPublicMember);
		res.json({ members: payload });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getMemberProfile = async (req, res) => {
	try {
		const member = await User.findById(req.params.id).select("-password -emailVerificationToken -emailVerificationCodeHash -emailVerificationLastSentAt -emailVerificationExpiresAt");
		if (!member) {
			return res.status(404).json({ message: "Member not found." });
		}
		res.json({ member: req.user.userType === "administrateur" ? member.toSafeObject() : toPublicMember(member) });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getMyResidence = async (req, res) => {
	try {
		const approvedMember = await ApprovedMember.findOne({ residenceMemberId: req.user.residenceMemberId, isActive: true });
		const roomNumber = approvedMember?.roomNumber || "Zone etudiante";
		const preferredZoneName = roomNumber.startsWith("B-") ? "Couloir B" : roomNumber.startsWith("A-") ? "Couloir A" : "Hall principal";
		const zone = await Zone.findOne({ name: preferredZoneName });
		const [nearbyDevices, announcements] = await Promise.all([
			ConnectedDevice.find(zone ? { zone: zone._id } : {}).populate("zone").sort({ name: 1 }).limit(6),
			Announcement.find({ isPublic: true }).sort({ createdAt: -1 }).limit(4),
		]);
		return res.json({
			roomNumber,
			zone,
			nearbyDevices: nearbyDevices.map((device) => ({
				_id: device._id,
				name: device.name,
				status: device.status,
				zone: device.zone,
			})),
			studentName: `${req.user.firstName} ${req.user.lastName}`.trim(),
			usefulInfo: {
				wifi: "CY-Residence / smartcy2026",
				emergencyContacts: ["Accueil: 01 23 45 67 80", "Maintenance: 01 23 45 67 81"],
				quietHours: "22h00 - 07h00",
				commonAreaRules: ["Cuisine nettoyee apres usage", "Badge obligatoire pour les zones communes", "Respect des horaires de silence"],
				rules: ["Silence apres 22h", "Cuisine nettoyee apres usage", "Badge obligatoire pour les zones communes"],
			},
			announcements,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

export const createMaintenanceIssue = async (req, res) => {
	try {
		if (!req.body.zone) {
			return res.status(400).json({ message: "La zone est requise." });
		}

		const description = String(req.body.description || "").trim();
		if (description.length < 10) {
			return res.status(400).json({ message: "La description doit contenir au moins 10 caracteres." });
		}

		const zone = await Zone.findById(req.body.zone);
		if (!zone) {
			return res.status(404).json({ message: "Zone introuvable pour ce signalement." });
		}

		const request = await MaintenanceRequest.create({
			requester: req.user._id,
			zone: zone._id,
			type: "maintenance",
			category: normalizeMaintenanceCategory(req.body.category),
			reason: description,
			priority: req.body.priority || "medium",
			photo: req.body.photo || "",
			status: "pending",
		});
		return res.status(201).json({ request, message: "Signalement enregistre." });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

export const createOwnMaintenanceRequest = createMaintenanceIssue;

export const getOwnMaintenanceRequests = async (req, res) => {
	try {
		const requests = await MaintenanceRequest.find({ requester: req.user._id }).populate("zone device").sort({ createdAt: -1 });
		return res.json({ requests });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

export const getOwnAccessHistory = async (req, res) => {
	try {
		const logs = await AccessLog.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10);
		return res.json({ logs });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};
