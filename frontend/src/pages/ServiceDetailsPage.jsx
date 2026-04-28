import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../lib/axios";
import SectionHeader from "../components/SectionHeader";
import StatePanel from "../components/StatePanel";
import StatusBadge from "../components/StatusBadge";
import SmartModesPanel from "../components/SmartModesPanel";
import servicesIcon from "../assets/icons/services.png";
import accessIcon from "../assets/icons/access.png";
import alertsIcon from "../assets/icons/alerts.png";

const ServiceDetailsPage = () => {
	const { id } = useParams();
	const [service, setService] = useState(null);
	const [status, setStatus] = useState({ loading: true, error: "" });

	useEffect(() => {
		axios
			.get(`/services/${id}`)
			.then((res) => {
				setService(res.data.service);
				setStatus({ loading: false, error: "" });
			})
			.catch((error) => setStatus({ loading: false, error: error.response?.data?.message || "Service introuvable." }));
	}, [id]);

	return (
		<div className='page-shell space-y-6'>
			<SectionHeader eyebrow='Visualisation' title='Consultation de service' description='La consultation detaillee d’un service attribue aussi les points de progression.' />
			{status.loading && <StatePanel message='Chargement du service...' />}
			{status.error && <StatePanel tone='error' title='Service indisponible' message={status.error} />}
			{service && (
				<div className='space-y-6'>
					<div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
						<div className='metric-tile'>
							<img alt='' className='h-10 w-10 rounded-2xl object-contain' src={servicesIcon} />
							<p className='text-sm text-slate-300'>Demandes</p>
							<p className='text-2xl font-semibold text-white'>{service.usageStats?.requests ?? 0}</p>
						</div>
						<div className='metric-tile'>
							<img alt='' className='h-10 w-10 rounded-2xl object-contain' src={alertsIcon} />
							<p className='text-sm text-slate-300'>Satisfaction</p>
							<p className='text-2xl font-semibold text-white'>{service.usageStats?.satisfaction ?? 0}</p>
						</div>
						<div className='metric-tile'>
							<img alt='' className='h-10 w-10 rounded-2xl object-contain' src={accessIcon} />
							<p className='text-sm text-slate-300'>Disponibilite</p>
							<p className='text-2xl font-semibold text-white capitalize'>{service.availability}</p>
						</div>
						<div className='metric-tile'>
							<img alt='' className='h-10 w-10 rounded-2xl object-contain' src={servicesIcon} />
							<p className='text-sm text-slate-300'>Statut</p>
							<p className='text-2xl font-semibold text-white capitalize'>{service.status}</p>
						</div>
					</div>
					<div className='grid gap-6 lg:grid-cols-2'>
						<div className='panel p-6'>
							<h2 className='text-3xl font-semibold'>{service.name}</h2>
							<div className='mt-4 flex flex-wrap gap-2'>
								<StatusBadge value={service.status} />
								<StatusBadge value={service.availability} variant='info' />
							</div>
							<p className='mt-4 text-slate-300'>{service.description}</p>
						</div>
						<div className='panel p-6'>
							<h3 className='text-2xl font-semibold'>Informations de service</h3>
							<div className='mt-4 grid gap-3 text-sm text-slate-300'>
								<p>Zone: {service.zone?.name}</p>
								<p>Categorie: {service.category?.name}</p>
								<p>Disponibilite: {service.availability}</p>
								<p>Statut: {service.status}</p>
								<p>Demandes enregistrees: {service.usageStats?.requests ?? 0}</p>
								<p>Satisfaction: {service.usageStats?.satisfaction ?? 0}</p>
							</div>
						</div>
					</div>
					<SmartModesPanel />
				</div>
			)}
		</div>
	);
};

export default ServiceDetailsPage;
