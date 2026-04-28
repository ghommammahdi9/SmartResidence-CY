import { useEffect, useState } from "react";
import axios from "../lib/axios";
import SectionHeader from "../components/SectionHeader";
import { formatDate } from "../utils/format";

const LogsPage = () => {
	const [data, setData] = useState({ access: [], actions: [] });

	useEffect(() => {
		Promise.all([axios.get("/admin/logs/access"), axios.get("/admin/logs/actions")])
			.then(([access, actions]) => setData({ access: access.data.logs, actions: actions.data.logs }))
			.catch(() => null);
	}, []);

	return (
		<div className='page-shell space-y-6'>
			<SectionHeader eyebrow='Administration' title='Journaux d’acces et d’actions' description='Traçabilite des connexions, consultations et operations de gestion.' />
			<div className='grid gap-6 xl:grid-cols-2'>
				<div className='panel p-6'>
					<h2 className='text-2xl font-semibold'>Access logs</h2>
					<div className='mt-4 space-y-3'>
						{data.access.map((log) => <div key={log._id} className='rounded-2xl border border-slate-700/40 bg-slate-900/50 p-4 text-sm text-slate-300'><p className='font-semibold text-slate-100'>{log.user?.firstName || "Systeme"} - {log.accessType}</p><p className='mt-1'>{log.route}</p><p className='mt-1 text-xs text-slate-400'>{formatDate(log.createdAt)}</p></div>)}
					</div>
				</div>
				<div className='panel p-6'>
					<h2 className='text-2xl font-semibold'>Action logs</h2>
					<div className='mt-4 space-y-3'>
						{data.actions.map((log) => <div key={log._id} className='rounded-2xl border border-slate-700/40 bg-slate-900/50 p-4 text-sm text-slate-300'><p className='font-semibold text-slate-100'>{log.user?.firstName || "Systeme"} - {log.actionType}</p><p className='mt-1'>{log.targetType}</p><p className='mt-1 text-xs text-slate-400'>{formatDate(log.createdAt)}</p></div>)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default LogsPage;
