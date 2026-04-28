import { useEffect, useState } from "react";
import axios from "../lib/axios";
import SectionHeader from "../components/SectionHeader";
import { formatDate } from "../utils/format";

const AnnouncementsPage = () => {
	const [announcements, setAnnouncements] = useState([]);

	useEffect(() => {
		axios.get("/public/announcements").then((res) => setAnnouncements(res.data.announcements)).catch(() => null);
	}, []);

	return (
		<div className='page-shell'>
			<SectionHeader eyebrow='Information' title='Annonces et informations publiques' description='Actualites residents, maintenance planifiee et informations accessibles aux visiteurs.' />
			<div className='grid gap-4'>
				{announcements.map((announcement) => (
					<article key={announcement._id} className='panel p-6'>
						<div className='flex flex-wrap items-center justify-between gap-3'>
							<p className='text-xs uppercase tracking-[0.3em] text-amber-200'>{announcement.category}</p>
							<p className='text-sm text-slate-400'>{formatDate(announcement.publishedAt)}</p>
						</div>
						<h2 className='mt-3 text-2xl font-semibold'>{announcement.title}</h2>
						<p className='mt-4 text-slate-300'>{announcement.content}</p>
					</article>
				))}
			</div>
		</div>
	);
};

export default AnnouncementsPage;
