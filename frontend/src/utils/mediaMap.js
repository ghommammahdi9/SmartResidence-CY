import campusImage from "../assets/photos/campus/campus-cy.png";
import exteriorImage from "../assets/photos/residence/residence-exterior.jpg";
import roomOneImage from "../assets/photos/residence/room-1.jpg";
import roomTwoImage from "../assets/photos/residence/room-2.jpg";
import corridorImage from "../assets/photos/residence/corridor.jpg";
import hallImage from "../assets/photos/residence/hall.jpg";
import laundryRoomImage from "../assets/photos/residence/laundry-room.jpg";
import floorPlanImage from "../assets/photos/residence/floorplan.jpg";
import sharedKitchenImage from "../assets/photos/residence/shared-kitchen.jpg";
import studyImage from "../assets/photos/residence/study-space.avif";

const zoneImageMap = {
	"hall principal": hallImage,
	"salle d'etude": studyImage,
	"salle d’étude": studyImage,
	laverie: laundryRoomImage,
	"cuisine commune": sharedKitchenImage,
	"couloir a": corridorImage,
	"couloir b": corridorImage,
	"local technique": floorPlanImage,
};

const normalizeKey = (value) =>
	String(value || "")
		.trim()
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/\s+/g, " ");

export const getZoneVisual = (zoneName) => {
	if (!zoneName) return exteriorImage;
	const normalizedZoneName = normalizeKey(zoneName);
	return zoneImageMap[zoneName.toLowerCase()] || zoneImageMap[normalizedZoneName] || floorPlanImage;
};

export const getServiceVisual = (service) => {
	const name = normalizeKey(`${service?.name || ""} ${service?.description || ""}`);
	if (name.includes("etude") || name.includes("étude")) return studyImage;
	if (name.includes("actualit")) return campusImage;
	if (name.includes("energie")) return exteriorImage;
	if (name.includes("eau")) return laundryRoomImage;
	if (name.includes("cuisine")) return sharedKitchenImage;
	if (name.includes("acces")) return hallImage;
	if (name.includes("incident") || name.includes("maintenance")) return floorPlanImage;
	return getZoneVisual(service?.zone?.name);
};

export const getSectionFallbackVisual = (section) => {
	const key = normalizeKey(section);
	if (key.includes("campus")) return campusImage;
	if (key.includes("corridor") || key.includes("couloir")) return corridorImage;
	if (key.includes("laundry") || key.includes("laverie")) return laundryRoomImage;
	if (key.includes("kitchen") || key.includes("cuisine")) return sharedKitchenImage;
	if (key.includes("study") || key.includes("etude")) return studyImage;
	if (key.includes("hall")) return hallImage;
	if (key.includes("plan") || key.includes("zone")) return floorPlanImage;
	if (key.includes("room")) return roomOneImage;
	if (key.includes("gallery")) return roomTwoImage;
	return exteriorImage;
};
