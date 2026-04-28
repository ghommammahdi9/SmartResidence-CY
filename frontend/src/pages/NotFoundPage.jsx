import { Link } from "react-router-dom";

const NotFoundPage = () => (
	<div className='page-shell'>
		<div className='mx-auto max-w-2xl panel-strong p-10 text-center'>
			<h1 className='text-5xl font-bold'>404</h1>
			<p className='mt-4 text-slate-300'>La page demandee n&apos;existe pas dans SmartResidence CY.</p>
			<div className='mt-8 flex justify-center gap-3'>
				<Link className='btn-primary' to='/'>Retour accueil</Link>
				<Link className='btn-secondary' to='/dashboard'>Tableau de bord</Link>
			</div>
		</div>
	</div>
);

export default NotFoundPage;
