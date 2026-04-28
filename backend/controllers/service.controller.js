import ResidenceService from "../models/residenceService.model.js";
import Zone from "../models/zone.model.js";
import ServiceCategory from "../models/serviceCategory.model.js";
import { awardPointsAndProgress } from "../lib/gamification.js";
import { logAction } from "../lib/logging.js";

const buildServiceFilter = (query) => {
	const filter = {};
	if (query.zone) filter.zone = query.zone;
	if (query.category) filter.category = query.category;
	if (query.status) filter.status = query.status;
	if (query.availability) filter.availability = query.availability;
	if (query.search) {
		const regex = new RegExp(query.search, "i");
		filter.$or = [{ name: regex }, { description: regex }];
	}
	return filter;
};

export const getServices = async (req, res) => {
	try {
		const [services, zones, categories] = await Promise.all([
			ResidenceService.find(buildServiceFilter(req.query)).populate("zone category").sort({ name: 1 }),
			Zone.find({}).sort({ name: 1 }),
			ServiceCategory.find({}).sort({ name: 1 }),
		]);
		res.json({ services, filters: { zones, categories } });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getServiceById = async (req, res) => {
	try {
		const service = await ResidenceService.findById(req.params.id).populate("zone category");
		if (!service) {
			return res.status(404).json({ message: "Service not found." });
		}
		service.usageStats.requests += 1;
		await service.save();
		await awardPointsAndProgress(req.user, 0.5, { incrementAction: true });
		await req.user.save();
		await logAction({
			userId: req.user._id,
			actionType: "service_viewed",
			targetType: "ResidenceService",
			targetId: service._id,
			metadata: { serviceName: service.name },
		});
		res.json({ service });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const createService = async (req, res) => {
	try {
		const service = await ResidenceService.create(req.body);
		await logAction({
			userId: req.user._id,
			actionType: "service_created",
			targetType: "ResidenceService",
			targetId: service._id,
			metadata: { name: service.name },
		});
		res.status(201).json({ message: "Service created successfully.", service });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const updateService = async (req, res) => {
	try {
		const service = await ResidenceService.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate("zone category");
		if (!service) {
			return res.status(404).json({ message: "Service not found." });
		}
		await logAction({
			userId: req.user._id,
			actionType: "service_updated",
			targetType: "ResidenceService",
			targetId: service._id,
			metadata: { updatedFields: Object.keys(req.body) },
		});
		res.json({ message: "Service updated successfully.", service });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const deleteService = async (req, res) => {
	try {
		const service = await ResidenceService.findByIdAndDelete(req.params.id);
		if (!service) {
			return res.status(404).json({ message: "Service not found." });
		}
		await logAction({
			userId: req.user._id,
			actionType: "service_deleted",
			targetType: "ResidenceService",
			targetId: req.params.id,
			metadata: { name: service.name },
		});
		res.json({ message: "Service deleted successfully." });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
