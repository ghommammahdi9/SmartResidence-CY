import Announcement from "../models/announcement.model.js";
import Zone from "../models/zone.model.js";
import ResidenceService from "../models/residenceService.model.js";
import DeviceCategory from "../models/deviceCategory.model.js";
import ServiceCategory from "../models/serviceCategory.model.js";
import ConnectedDevice from "../models/connectedDevice.model.js";

export const getOverview = async (req, res) => {
	try {
		const [announcements, rawZones, services, devices, deviceCategories, serviceCategories] = await Promise.all([
			Announcement.find({ isPublic: true }).sort({ publishedAt: -1 }).limit(4),
			Zone.find({}).sort({ name: 1 }),
			ResidenceService.find({ isPublic: true }).populate("zone category").sort({ name: 1 }),
			ConnectedDevice.find({ isPublic: true }).populate("zone category").sort({ createdAt: -1 }),
			DeviceCategory.find({}).sort({ name: 1 }),
			ServiceCategory.find({}).sort({ name: 1 }),
		]);

		const zones = rawZones.map((zone) => {
			const zoneDevices = devices.filter((device) => String(device.zone?._id) === String(zone._id));
			const zoneServices = services.filter((service) => String(service.zone?._id) === String(zone._id));
			const alertCount = zoneDevices.filter(
				(device) =>
					device.status === "alert" ||
					device.status === "offline" ||
					device.maintenanceStatus === "critical" ||
					device.maintenanceStatus === "maintenance_needed" ||
					Number(device.batteryLevel || 0) < 20
			).length;
			const energyUsage = zoneDevices.reduce((sum, device) => sum + Number(device.energyUsage || 0), 0);

			return {
				...zone.toObject(),
				deviceCount: zoneDevices.length,
				alertCount,
				serviceCount: zoneServices.length,
				energyUsage: Number(energyUsage.toFixed(1)),
			};
		});

		res.json({
			project: "SmartResidence CY",
			modules: ["Information", "Visualisation", "Gestion", "Administration"],
			announcements,
			zones,
			services,
			devices,
			featuredDevices: devices.slice(0, 6),
			deviceCategories,
			serviceCategories,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getAnnouncements = async (req, res) => {
	try {
		const announcements = await Announcement.find({ isPublic: true }).sort({ publishedAt: -1 });
		res.json({ announcements });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getFreeTour = async (req, res) => {
	res.json({
		title: "Visite libre SmartResidence CY",
		highlights: [
			"Suivi des objets connectes par zone",
			"Services residents et annonces en temps reel",
			"Progression par points, niveaux et droits d'acces",
			"Maintenance, journaux et rapports d'administration",
		],
	});
};

export const searchPublicContent = async (req, res) => {
	try {
		const { query = "", zone = "", category = "", dateFrom = "", dateTo = "" } = req.query;
		const regex = new RegExp(query, "i");

		const serviceFilter = { isPublic: true };
		if (category) serviceFilter.category = category;
		if (zone) serviceFilter.zone = zone;
		const announcementFilter = { isPublic: true };
		if (dateFrom || dateTo) {
			announcementFilter.createdAt = {};
			if (dateFrom) announcementFilter.createdAt.$gte = new Date(dateFrom);
			if (dateTo) announcementFilter.createdAt.$lte = new Date(dateTo);
		}

		const [zones, services, announcements] = await Promise.all([
			Zone.find({
				...(zone ? { _id: zone } : {}),
				$or: [{ name: regex }, { description: regex }, { type: regex }],
			}),
			ResidenceService.find({
				...serviceFilter,
				$or: [{ name: regex }, { description: regex }, { status: regex }],
			}).populate("zone category"),
			Announcement.find({
				...announcementFilter,
				$or: [{ title: regex }, { content: regex }, { category: regex }],
			}),
		]);

		res.json({
			results: {
				zones,
				services,
				announcements,
			},
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
