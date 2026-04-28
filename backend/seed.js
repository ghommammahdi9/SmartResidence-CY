import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDB } from "./lib/db.js";
import User from "./models/user.model.js";
import RegistrationRequest from "./models/registrationRequest.model.js";
import Zone from "./models/zone.model.js";
import DeviceCategory from "./models/deviceCategory.model.js";
import ServiceCategory from "./models/serviceCategory.model.js";
import ConnectedDevice from "./models/connectedDevice.model.js";
import DeviceTelemetry from "./models/deviceTelemetry.model.js";
import ResidenceService from "./models/residenceService.model.js";
import Announcement from "./models/announcement.model.js";
import AccessLog from "./models/accessLog.model.js";
import ActionLog from "./models/actionLog.model.js";
import MaintenanceRequest from "./models/maintenanceRequest.model.js";
import GlobalSetting from "./models/globalSetting.model.js";
import ApprovedMember from "./models/approvedMember.model.js";
import Reservation from "./models/reservation.model.js";

dotenv.config();

const seed = async () => {
	await connectDB();

	await Promise.all([
		User.deleteMany({}),
		RegistrationRequest.deleteMany({}),
		Zone.deleteMany({}),
		DeviceCategory.deleteMany({}),
		ServiceCategory.deleteMany({}),
		ConnectedDevice.deleteMany({}),
		DeviceTelemetry.deleteMany({}),
		ResidenceService.deleteMany({}),
		Announcement.deleteMany({}),
		AccessLog.deleteMany({}),
		ActionLog.deleteMany({}),
		MaintenanceRequest.deleteMany({}),
		GlobalSetting.deleteMany({}),
		ApprovedMember.deleteMany({}),
		Reservation.deleteMany({}),
	]);

	const users = await User.create([
		{
			username: "saad_admin",
			email: "saad.admin@smartresidence.cy",
			password: "Admin123!",
			firstName: "Saad",
			lastName: "Ghommam",
			age: 32,
			gender: "homme",
			memberType: "administration",
			residenceMemberId: "ADM-001",
			emailVerified: true,
			approvalStatus: "approved",
			userType: "administrateur",
			level: "expert",
			points: 15,
			accessCount: 14,
			actionCount: 28,
			lastLoginAt: new Date(),
			publicProfile: { bio: "Administrateur principal de SmartResidence CY et superviseur de la plateforme." },
		},
		{
			username: "mehdi",
			email: "mehdi@smartresidence.cy",
			password: "Member123!",
			firstName: "Mehdi",
			lastName: "Ghommam",
			age: 21,
			gender: "homme",
			memberType: "resident",
			residenceMemberId: "RES-014",
			emailVerified: true,
			approvalStatus: "approved",
			userType: "simple",
			level: "intermediaire",
			points: 4.5,
			accessCount: 10,
			actionCount: 7,
			lastLoginAt: new Date(),
			publicProfile: { bio: "Resident SmartResidence CY et utilisateur regulier des services et espaces communs." },
		},
		{
			username: "saad",
			email: "saad@smartresidence.cy",
			password: "Member123!",
			firstName: "Saad",
			lastName: "Ghommam",
			age: 24,
			gender: "homme",
			memberType: "staff",
			residenceMemberId: "RES-021",
			emailVerified: true,
			approvalStatus: "approved",
			userType: "complexe",
			level: "avance",
			points: 6.0,
			accessCount: 18,
			actionCount: 19,
			lastLoginAt: new Date(),
			publicProfile: { bio: "Personnel residence charge du suivi operationnel des equipements et des alertes techniques." },
		},
		{
			username: "alice_student",
			email: "alice@smartresidence.cy",
			password: "Member123!",
			firstName: "Alice",
			lastName: "Martin",
			age: 20,
			gender: "femme",
			memberType: "resident",
			residenceMemberId: "RES-103",
			emailVerified: true,
			approvalStatus: "approved",
			userType: "simple",
			level: "debutant",
			points: 1.25,
			accessCount: 4,
			actionCount: 2,
			lastLoginAt: new Date(),
			publicProfile: { bio: "Etudiante residente et utilisatrice de la salle d'etude." },
		},
		{
			username: "bob_student",
			email: "bob@smartresidence.cy",
			password: "Member123!",
			firstName: "Bob",
			lastName: "Dupont",
			age: 22,
			gender: "homme",
			memberType: "resident",
			residenceMemberId: "RES-104",
			emailVerified: true,
			approvalStatus: "approved",
			userType: "simple",
			level: "debutant",
			points: 0.75,
			accessCount: 3,
			actionCount: 1,
			lastLoginAt: new Date(),
			publicProfile: { bio: "Resident present en couloir A et utilisateur regulier de la cuisine commune." },
		},
		{
			username: "claire_student",
			email: "claire@smartresidence.cy",
			password: "Member123!",
			firstName: "Claire",
			lastName: "Bernard",
			age: 21,
			gender: "femme",
			memberType: "resident",
			residenceMemberId: "RES-105",
			emailVerified: true,
			approvalStatus: "approved",
			userType: "simple",
			level: "intermediaire",
			points: 2.0,
			accessCount: 6,
			actionCount: 3,
			lastLoginAt: new Date(),
			publicProfile: { bio: "Residente interessee par les services d energie et les actualites du campus." },
		},
		{
			username: "nathan_staff",
			email: "nathan.staff@smartresidence.cy",
			password: "Member123!",
			firstName: "Nathan",
			lastName: "Richard",
			age: 29,
			gender: "homme",
			memberType: "staff",
			residenceMemberId: "RES-116",
			emailVerified: true,
			approvalStatus: "approved",
			userType: "complexe",
			level: "expert",
			points: 10.5,
			accessCount: 22,
			actionCount: 24,
			lastLoginAt: new Date(),
			publicProfile: { bio: "Personnel residence senior charge de la supervision operationnelle et des interventions." },
		},
	]);

	const [admin, simpleUser, complexeUser] = users;
	const pendingPasswordHash = await bcrypt.hash("Member123!", 10);

	await ApprovedMember.create([
		{ residenceMemberId: "RES-101", firstName: "Saad", lastName: "Mohamed", memberType: "staff", roomNumber: "Admin" },
		{ residenceMemberId: "RES-102", firstName: "Mehdi", lastName: "Ghommam", memberType: "resident", roomNumber: "B-211" },
		{ residenceMemberId: "RES-103", firstName: "Alice", lastName: "Martin", memberType: "resident", roomNumber: "A-105" },
		{ residenceMemberId: "RES-104", firstName: "Bob", lastName: "Dupont", memberType: "resident", roomNumber: "A-108" },
		{ residenceMemberId: "RES-105", firstName: "Claire", lastName: "Bernard", memberType: "resident", roomNumber: "B-203" },
		{ residenceMemberId: "RES-106", firstName: "David", lastName: "Leroy", memberType: "resident", roomNumber: "B-207" },
		{ residenceMemberId: "RES-107", firstName: "Emma", lastName: "Petit", memberType: "resident", roomNumber: "A-112" },
		{ residenceMemberId: "RES-108", firstName: "Francois", lastName: "Moreau", memberType: "maintenance", roomNumber: "Tech" },
		{ residenceMemberId: "RES-109", firstName: "Gabrielle", lastName: "Simon", memberType: "resident", roomNumber: "B-215" },
		{ residenceMemberId: "RES-110", firstName: "Hugo", lastName: "Laurent", memberType: "resident", roomNumber: "A-101" },
		{ residenceMemberId: "RES-111", firstName: "Ines", lastName: "Lefebvre", memberType: "resident", roomNumber: "B-220" },
		{ residenceMemberId: "RES-112", firstName: "Jules", lastName: "Roux", memberType: "resident", roomNumber: "A-115" },
		{ residenceMemberId: "RES-113", firstName: "Karine", lastName: "David", memberType: "resident", roomNumber: "B-225" },
		{ residenceMemberId: "RES-114", firstName: "Lucas", lastName: "Bertrand", memberType: "resident", roomNumber: "A-120" },
		{ residenceMemberId: "RES-115", firstName: "Marie", lastName: "Robert", memberType: "resident", roomNumber: "B-230" },
		{ residenceMemberId: "RES-116", firstName: "Nathan", lastName: "Richard", memberType: "staff", roomNumber: "Admin" },
		{ residenceMemberId: "RES-117", firstName: "Olivia", lastName: "Durand", memberType: "resident", roomNumber: "A-125" },
		{ residenceMemberId: "RES-118", firstName: "Pierre", lastName: "Dubois", memberType: "resident", roomNumber: "B-235" },
		{ residenceMemberId: "RES-119", firstName: "Quentin", lastName: "Thomas", memberType: "resident", roomNumber: "A-130" },
		{ residenceMemberId: "RES-120", firstName: "Rose", lastName: "Garcia", memberType: "resident", roomNumber: "B-240" },
		{ residenceMemberId: "ADM-001", firstName: "Saad", lastName: "Ghommam", memberType: "staff", roomNumber: "Admin" },
		{ residenceMemberId: "RES-014", firstName: "Mehdi", lastName: "Ghommam", memberType: "resident", roomNumber: "B-211" },
		{ residenceMemberId: "RES-021", firstName: "Saad", lastName: "Ghommam", memberType: "staff", roomNumber: "A-201" },
	]);

	await RegistrationRequest.create([
		{
			email: "mehdi.pending@smartresidence.cy",
			username: "mehdi_pending",
			password: pendingPasswordHash,
			firstName: "Mehdi",
			lastName: "Ghommam",
			dateOfBirth: new Date("2002-03-12"),
			birthDate: new Date("2002-03-12"),
			gender: "homme",
			memberType: "resident",
			residenceMemberId: "RES-099",
			verificationCode: null,
			emailVerificationToken: null,
			codeExpiresAt: null,
			lastCodeSentAt: new Date(),
			status: "pending_admin",
			notes: "Attente de validation administrative apres verification email.",
		},
		{
			email: "saad.pending@smartresidence.cy",
			username: "saad_pending",
			password: pendingPasswordHash,
			firstName: "Saad",
			lastName: "Ghommam",
			dateOfBirth: new Date("2001-09-18"),
			birthDate: new Date("2001-09-18"),
			gender: "homme",
			memberType: "resident",
			residenceMemberId: "RES-111",
			verificationCode: "482913",
			emailVerificationToken: "seed-demo-token",
			codeExpiresAt: new Date(Date.now() + 1000 * 60 * 15),
			lastCodeSentAt: new Date(),
			status: "pending_email",
			notes: "Verification des informations de Saad en cours.",
		},
	]);

	const zones = await Zone.create([
		{ name: "Hall principal", description: "Zone d'accueil et de circulation.", type: "circulation", accessibility: "haute", status: "active" },
		{ name: "Salle d'etude", description: "Salle de travail collaborative et reservee.", type: "travail", accessibility: "haute", status: "active" },
		{ name: "Laverie", description: "Zone dediee au lavage et au sechage.", type: "service", accessibility: "standard", status: "active" },
		{ name: "Cuisine commune", description: "Cuisine partagee de la residence.", type: "vie commune", accessibility: "standard", status: "active" },
		{ name: "Couloir A", description: "Couloir principal niveau A.", type: "circulation", accessibility: "standard", status: "active" },
		{ name: "Couloir B", description: "Couloir principal niveau B.", type: "circulation", accessibility: "standard", status: "active" },
		{ name: "Local technique", description: "Zone reservee aux equipements techniques.", type: "technique", accessibility: "restreinte", status: "restricted" },
	]);

	const deviceCategories = await DeviceCategory.create([
		{ name: "Securite", description: "Protection, acces et surveillance." },
		{ name: "Energie", description: "Suivi energetique et optimisation." },
		{ name: "Confort", description: "Temperature, eclairage et presence." },
		{ name: "Eau", description: "Consommation et detection de fuite." },
	]);

	const serviceCategories = await ServiceCategory.create([
		{ name: "Reservation", description: "Services de reservation des espaces communs." },
		{ name: "Maintenance", description: "Signalements et suivi des incidents." },
		{ name: "Consommation", description: "Consultation des donnees eau et energie." },
		{ name: "Vie residence", description: "Actualites et acces zones communes." },
		{ name: "Securite", description: "Services lies a l acces, a la surete et a la supervision." },
	]);

	const zoneByName = Object.fromEntries(zones.map((zone) => [zone.name, zone]));
	const deviceCategoryByName = Object.fromEntries(deviceCategories.map((item) => [item.name, item]));
	const serviceCategoryByName = Object.fromEntries(serviceCategories.map((item) => [item.name, item]));

	const deviceBlueprints = [
		{ deviceId: "DEV-001", name: "Thermostat Salon Etude", description: "Thermostat principal de l espace d etude partage.", brand: "Nest", model: "T3007", type: "thermostat", category: "Confort", zone: "Salle d'etude", status: "active", connectivityType: "wifi", connectivitySignal: 92, batteryLevel: 84, firmwareVersion: "3.2.1", maintenanceStatus: "normal", currentValues: { temperature: 22.4 }, targetValues: { targetTemperature: 21, mode: "eco", schedule: "08:00-22:00" }, energyUsage: 42, waterUsage: 0, createdBy: complexeUser._id },
		{ deviceId: "DEV-002", name: "Thermostat Laverie", description: "Thermostat de confort pour la laverie connectee.", brand: "Netatmo", model: "Therm-L2", type: "thermostat", category: "Confort", zone: "Laverie", status: "active", connectivityType: "zigbee", connectivitySignal: 78, batteryLevel: 73, firmwareVersion: "2.9.0", maintenanceStatus: "inspection", currentValues: { temperature: 20.2 }, targetValues: { targetTemperature: 19, mode: "auto", schedule: "06:00-23:00" }, energyUsage: 38, waterUsage: 0, createdBy: complexeUser._id },
		{ deviceId: "DEV-003", name: "Camera Hall", description: "Camera d entree pour supervision du hall principal.", brand: "Hikvision", model: "DS-2CD", type: "camera", category: "Securite", zone: "Hall principal", status: "active", connectivityType: "ethernet", connectivitySignal: 100, batteryLevel: 100, firmwareVersion: "5.8.0", maintenanceStatus: "normal", currentValues: { uptime: 99.8 }, targetValues: { resolution: "1080p", nightVision: true, motionDetection: true }, energyUsage: 16, waterUsage: 0, createdBy: admin._id },
		{ deviceId: "DEV-004", name: "Camera Couloir A", description: "Surveillance du couloir A et detection de mouvement.", brand: "Axis", model: "P3245", type: "camera", category: "Securite", zone: "Couloir A", status: "active", connectivityType: "ethernet", connectivitySignal: 97, batteryLevel: 100, firmwareVersion: "4.4.2", maintenanceStatus: "inspection", currentValues: { uptime: 98.9 }, targetValues: { resolution: "720p", nightVision: true, motionDetection: true }, energyUsage: 14, waterUsage: 0, createdBy: admin._id },
		{ deviceId: "DEV-005", name: "Lumiere Cuisine", description: "Eclairage intelligent de la cuisine commune.", brand: "Philips Hue", model: "Hue Kitchen", type: "lighting", category: "Confort", zone: "Cuisine commune", status: "active", connectivityType: "wifi", connectivitySignal: 82, batteryLevel: 100, firmwareVersion: "6.1.0", maintenanceStatus: "normal", currentValues: { brightness: 68 }, targetValues: { brightness: 70, color: "warm", schedule: "17:00-23:30" }, energyUsage: 54, waterUsage: 0, createdBy: complexeUser._id },
		{ deviceId: "DEV-006", name: "Lumiere Salle d'etude", description: "Eclairage adaptatif pour la salle d etude.", brand: "Ikea Dirigera", model: "Study Beam", type: "lighting", category: "Confort", zone: "Salle d'etude", status: "inactive", connectivityType: "wifi", connectivitySignal: 69, batteryLevel: 100, firmwareVersion: "1.8.3", maintenanceStatus: "critical", currentValues: { brightness: 0 }, targetValues: { brightness: 75, color: "neutral", schedule: "08:00-00:00" }, energyUsage: 58, waterUsage: 0, createdBy: complexeUser._id },
		{ deviceId: "DEV-007", name: "Compteur Hall", description: "Compteur energetique du hall principal.", brand: "Schneider", model: "PowerHall", type: "energy-meter", category: "Energie", zone: "Hall principal", status: "active", connectivityType: "ethernet", connectivitySignal: 100, batteryLevel: 100, firmwareVersion: "7.0.0", maintenanceStatus: "normal", currentValues: { currentPower: 2.6 }, targetValues: { dailyLimit: 45 }, energyUsage: 126, waterUsage: 0, createdBy: admin._id },
		{ deviceId: "DEV-008", name: "Compteur Laverie", description: "Compteur energetique des machines de laverie.", brand: "Legrand", model: "WashMeter", type: "energy-meter", category: "Energie", zone: "Laverie", status: "active", connectivityType: "ethernet", connectivitySignal: 91, batteryLevel: 100, firmwareVersion: "7.1.3", maintenanceStatus: "maintenance_needed", currentValues: { currentPower: 4.1 }, targetValues: { dailyLimit: 55 }, energyUsage: 159, waterUsage: 0, createdBy: admin._id },
		{ deviceId: "DEV-009", name: "Compteur eau cuisine", description: "Suivi de la consommation d eau en cuisine commune.", brand: "AquaSafe", model: "FlowOne", type: "water-meter", category: "Eau", zone: "Cuisine commune", status: "active", connectivityType: "lora", connectivitySignal: 76, batteryLevel: 61, firmwareVersion: "2.4.5", maintenanceStatus: "inspection", currentValues: { flow: 12.3 }, targetValues: { dailyLimit: 180 }, energyUsage: 8, waterUsage: 210, createdBy: complexeUser._id },
		{ deviceId: "DEV-010", name: "Detecteur fumee Local technique", description: "Detecteur de fumee et surchauffe du local technique.", brand: "Bosch", model: "Smoke Pro", type: "smoke-detector", category: "Securite", zone: "Local technique", status: "active", connectivityType: "zigbee", connectivitySignal: 72, batteryLevel: 58, firmwareVersion: "3.5.2", maintenanceStatus: "maintenance_needed", currentValues: { smokeLevel: 0.03 }, targetValues: { threshold: 0.25 }, energyUsage: 5, waterUsage: 0, createdBy: admin._id },
		{ deviceId: "DEV-011", name: "Serrure connectee Hall", description: "Controle intelligent d acces du hall principal.", brand: "Yale", model: "Entry Secure", type: "smart-lock", category: "Securite", zone: "Hall principal", status: "active", connectivityType: "bluetooth", connectivitySignal: 89, batteryLevel: 46, firmwareVersion: "5.0.1", maintenanceStatus: "inspection", currentValues: { locked: true }, targetValues: { locked: true }, energyUsage: 12, waterUsage: 0, createdBy: admin._id },
		{ deviceId: "DEV-012", name: "Ventilation Local technique", description: "Controle de ventilation et temperature du local technique.", brand: "AirFlow", model: "Vent-X", type: "ventilation-controller", category: "Confort", zone: "Local technique", status: "alert", connectivityType: "wifi", connectivitySignal: 63, batteryLevel: 39, firmwareVersion: "1.2.0", maintenanceStatus: "critical", currentValues: { rpm: 1210 }, targetValues: { mode: "auto", targetTemperature: 19 }, energyUsage: 88, waterUsage: 0, createdBy: complexeUser._id },
		{ deviceId: "DEV-013", name: "Capteur mouvement Couloir B", description: "Capteur de mouvement pour le couloir B.", brand: "PresenceLab", model: "Move-B", type: "motion-sensor", category: "Confort", zone: "Couloir B", status: "active", connectivityType: "wifi", connectivitySignal: 88, batteryLevel: 67, firmwareVersion: "2.0.0", maintenanceStatus: "normal", currentValues: { occupancy: 7 }, targetValues: { occupancyAlert: 25 }, energyUsage: 7, waterUsage: 0, createdBy: simpleUser._id },
		{ deviceId: "DEV-014", name: "Capteur lave-linge Laverie", description: "Capteur de vibration et cycle machine.", brand: "WashSense", model: "Cycle-1", type: "washing-machine-sensor", category: "Eau", zone: "Laverie", status: "active", connectivityType: "wifi", connectivitySignal: 74, batteryLevel: 49, firmwareVersion: "1.7.6", maintenanceStatus: "inspection", currentValues: { cyclesToday: 5 }, targetValues: { cycleAlert: 8 }, energyUsage: 18, waterUsage: 95, createdBy: complexeUser._id },
		{ deviceId: "DEV-015", name: "Capteur humidite Cuisine", description: "Capteur d humidite et confort de la cuisine commune.", brand: "Airthings", model: "Hum-K", type: "humidity-sensor", category: "Eau", zone: "Cuisine commune", status: "active", connectivityType: "zigbee", connectivitySignal: 83, batteryLevel: 71, firmwareVersion: "3.0.4", maintenanceStatus: "normal", currentValues: { humidity: 52 }, targetValues: { humidityAlert: 68 }, energyUsage: 6, waterUsage: 12, createdBy: simpleUser._id },
	];

	const devices = await ConnectedDevice.create(
		deviceBlueprints.map((device, index) => ({
			...device,
			category: deviceCategoryByName[device.category]._id,
			zone: zoneByName[device.zone]._id,
			installationDate: new Date(Date.now() - (index + 25) * 24 * 60 * 60 * 1000),
			lastInteraction: new Date(Date.now() - ((index % 8) + 1) * 60 * 60 * 1000),
		}))
	);

	const telemetryEntries = devices.flatMap((device, index) =>
		Array.from({ length: 30 }).flatMap((_, day) =>
			Array.from({ length: 2 }).map((__, reading) => {
				const baseTimestamp = new Date(Date.now() - day * 24 * 60 * 60 * 1000 - reading * 12 * 60 * 60 * 1000);
				const energyValue = Number((Math.max(0.2, (device.energyUsage || 10) / 30 + ((day + reading + index) % 5) * 0.18)).toFixed(2));
				const waterValue = Number((Math.max(0, (device.waterUsage || 0) / 30 + ((day + reading + index) % 4) * 0.4)).toFixed(2));
				return {
					device: device._id,
					timestamp: baseTimestamp,
					metrics:
						device.type === "thermostat"
							? { temperature: 18 + ((day + reading + index) % 7) }
							: device.type === "camera"
								? { uptime: 99 + ((day + reading) % 2) * 0.5, storage: 40 + ((day + index) % 30) }
								: device.type === "energy-meter"
									? { currentPower: 0.8 + ((day + reading + index) % 5) * 0.7 }
									: { signal: Math.max(45, (device.connectivitySignal || 80) - ((day + reading) % 12)) },
					energyUsage: energyValue,
					waterUsage: waterValue,
					statusSnapshot: device.status,
				};
			})
		)
	);

	await DeviceTelemetry.create(telemetryEntries);

	await ResidenceService.create([
		{
			name: "Reservation salle d'etude",
			description: "Reservation des plages horaires pour la salle d'etude.",
			category: serviceCategoryByName.Reservation._id,
			zone: zoneByName["Salle d'etude"]._id,
			availability: "daily",
			status: "active",
			usageStats: { requests: 24, satisfaction: 4.5 },
		},
		{
			name: "Signalement incident",
			description: "Declaration d'un incident ou besoin de maintenance.",
			category: serviceCategoryByName.Maintenance._id,
			zone: zoneByName["Hall principal"]._id,
			availability: "on-demand",
			status: "active",
			usageStats: { requests: 17, satisfaction: 4.1 },
		},
		{
			name: "Consultation consommation energetique",
			description: "Tableaux de bord energie du batiment et par zone.",
			category: serviceCategoryByName.Consommation._id,
			zone: zoneByName["Local technique"]._id,
			availability: "daily",
			status: "active",
			usageStats: { requests: 31, satisfaction: 4.7 },
		},
		{
			name: "Consultation consommation d'eau",
			description: "Suivi de la consommation d'eau et des alertes.",
			category: serviceCategoryByName.Consommation._id,
			zone: zoneByName.Laverie._id,
			availability: "daily",
			status: "active",
			usageStats: { requests: 20, satisfaction: 4.2 },
		},
		{
			name: "Actualites residence",
			description: "Informations utiles et annonces de la residence.",
			category: serviceCategoryByName["Vie residence"]._id,
			zone: zoneByName["Hall principal"]._id,
			availability: "weekly",
			status: "active",
			usageStats: { requests: 39, satisfaction: 4.8 },
		},
		{
			name: "Acces zones communes",
			description: "Consultation des droits et horaires des zones communes.",
			category: serviceCategoryByName["Vie residence"]._id,
			zone: zoneByName["Cuisine commune"]._id,
			availability: "daily",
			status: "limited",
			usageStats: { requests: 14, satisfaction: 4.0 },
		},
		{
			name: "Disponibilite laverie",
			description: "Consulter les cycles de laverie et l'occupation actuelle.",
			category: serviceCategoryByName.Reservation._id,
			zone: zoneByName.Laverie._id,
			availability: "daily",
			status: "active",
			usageStats: { requests: 22, satisfaction: 4.3 },
		},
		{
			name: "Etat salle d'etude",
			description: "Occupation en temps reel et places restantes.",
			category: serviceCategoryByName.Reservation._id,
			zone: zoneByName["Salle d'etude"]._id,
			availability: "daily",
			status: "active",
			usageStats: { requests: 28, satisfaction: 4.6 },
		},
		{
			name: "Infos Wi-Fi residence",
			description: "Mot de passe, couverture reseau et assistance connexion.",
			category: serviceCategoryByName["Vie residence"]._id,
			zone: zoneByName["Hall principal"]._id,
			availability: "daily",
			status: "active",
			usageStats: { requests: 18, satisfaction: 4.4 },
		},
		{
			name: "Alerte securite et acces",
			description: "Consulter les incidents de securite et les restrictions d'acces.",
			category: serviceCategoryByName.Securite._id,
			zone: zoneByName["Hall principal"]._id,
			availability: "on-demand",
			status: "active",
			usageStats: { requests: 11, satisfaction: 4.1 },
		},
	]);

	await Announcement.create([
		{ title: "Maintenance preventive du local technique", content: "Une intervention preventive est planifiee jeudi matin sur le compteur energetique principal.", category: "maintenance", audience: "all", createdBy: admin._id, isPublic: true },
		{ title: "Nouvelle politique d'acces aux zones communes", content: "Les residents verifies peuvent consulter leurs droits d'acces directement depuis SmartResidence CY.", category: "acces", audience: "all", createdBy: admin._id, isPublic: true },
		{ title: "Atelier eco-gestes en cuisine commune", content: "Session d'information vendredi a 18h pour reduire la consommation d'eau et d'energie.", category: "evenement", audience: "public", createdBy: simpleUser._id, isPublic: true },
		{ title: "Test des cameras de couloir", content: "Des tests de vision nocturne auront lieu cette semaine en couloir A et B.", category: "securite", audience: "all", createdBy: admin._id, isPublic: true },
		{ title: "Planning laverie optimise", content: "La reservation de la laverie est conseillee en dehors des pics de consommation.", category: "service", audience: "all", createdBy: complexeUser._id, isPublic: true },
		{ title: "Alerte humidite cuisine", content: "Le systeme recommande une aeration renforcee en cuisine commune.", category: "alerte", audience: "all", createdBy: complexeUser._id, isPublic: true },
		{ title: "Semaine residence connectee", content: "Decouvrez les modules Information, Visualisation, Gestion et Administration.", category: "campus", audience: "public", createdBy: admin._id, isPublic: true },
		{ title: "Regles d acces salle d etude", content: "Les acces sont limites apres 23h pour securiser les espaces communs.", category: "acces", audience: "all", createdBy: admin._id, isPublic: true },
	]);

	const accessLogEntries = Array.from({ length: 120 }).map((_, index) => {
		const user = [admin, simpleUser, complexeUser][index % 3];
		const route = ["/api/auth/login", "/api/devices", "/api/services", "/api/reports/overview"][index % 4];
		return {
			user: user._id,
			accessType: index % 4 === 0 ? "login" : "route_access",
			route,
			metadata: { level: user.level, userType: user.userType },
			createdAt: new Date(Date.now() - index * 6 * 60 * 60 * 1000),
		};
	});
	await AccessLog.create(accessLogEntries);

	const actionTypes = ["device_viewed", "service_viewed", "device_updated", "registration_reviewed", "maintenance_request_reviewed"];
	const actionLogEntries = Array.from({ length: 60 }).map((_, index) => {
		const user = [admin, simpleUser, complexeUser][index % 3];
		const device = devices[index % devices.length];
		return {
			user: user._id,
			actionType: actionTypes[index % actionTypes.length],
			targetType: index % 2 === 0 ? "ConnectedDevice" : "ResidenceService",
			targetId: device._id.toString(),
			metadata: { sample: index + 1, zone: device.zone.toString() },
			createdAt: new Date(Date.now() - index * 8 * 60 * 60 * 1000),
		};
	});
	await ActionLog.create(actionLogEntries);

	await MaintenanceRequest.create([
		{ requester: complexeUser._id, device: devices[1]._id, type: "maintenance", reason: "Camera du hall a verifier suite a chute de signal.", status: "pending" },
		{ requester: complexeUser._id, device: devices[5]._id, type: "deletion", reason: "Eclairage obsolete a remplacer par un modele plus sobre.", status: "approved" },
		{ requester: admin._id, device: devices[7]._id, type: "maintenance", reason: "Compteur laverie a recalibrer.", status: "approved" },
		{ requester: simpleUser._id, device: devices[9]._id, type: "maintenance", reason: "Alerte fumee trop sensible.", status: "pending" },
		{ requester: complexeUser._id, device: devices[10]._id, type: "maintenance", reason: "Batterie serrure faible.", status: "approved" },
		{ requester: admin._id, device: devices[11]._id, type: "maintenance", reason: "Ventilation en surconsommation.", status: "pending" },
		{ requester: simpleUser._id, device: devices[12]._id, type: "maintenance", reason: "Capteur mouvement a reinitialiser.", status: "rejected" },
		{ requester: complexeUser._id, device: devices[13]._id, type: "maintenance", reason: "Capteur lave-linge a inspecter.", status: "approved" },
		{ requester: admin._id, device: devices[14]._id, type: "maintenance", reason: "Capteur humidite proche du seuil critique.", status: "pending" },
		{ requester: complexeUser._id, device: devices[6]._id, type: "deletion", reason: "Migration prevue vers un compteur plus recent.", status: "pending" },
	]);

	await Reservation.create([
		{
			user: simpleUser._id,
			serviceType: "study_room",
			date: new Date(Date.now() + 24 * 60 * 60 * 1000),
			startTime: "14:00",
			endTime: "15:00",
			status: "confirmed",
			notes: "Revision en groupe pour le projet SmartResidence CY.",
		},
		{
			user: complexeUser._id,
			serviceType: "laundry",
			date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
			startTime: "18:00",
			endTime: "19:00",
			status: "confirmed",
			notes: "Creneau laverie apres intervention maintenance.",
		},
		{
			user: simpleUser._id,
			serviceType: "laundry",
			date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
			startTime: "08:00",
			endTime: "10:00",
			status: "cancelled",
			notes: "Ancienne reservation annulee pour demo.",
		},
	]);

	await GlobalSetting.create([
		{ key: "points.login", value: 0.25, description: "Points accordes a chaque connexion." },
		{ key: "points.consultation", value: 0.5, description: "Points accordes a la consultation d'un device ou service." },
		{ key: "gestion.unlockLevel", value: "avance", description: "Niveau d'acces au module Gestion." },
		{ key: "admin.unlockLevel", value: "expert", description: "Niveau d'acces automatique au module Administration." },
		{ key: "alerts.batteryThreshold", value: 20, description: "Seuil de batterie faible en pourcentage." },
		{ key: "alerts.energyThreshold", value: 50, description: "Seuil de surconsommation en kWh." },
		{ key: "alerts.inactivityDays", value: 7, description: "Nombre de jours sans interaction avant alerte." },
		{ key: "alerts.autoMaintenance", value: true, description: "Active la maintenance automatique pour les devices critiques." },
	]);

	console.log("SmartResidence CY seed completed.");
	process.exit(0);
};

seed().catch((error) => {
	console.error("Seed failed:", error);
	process.exit(1);
});
