const LoadingSpinner = () => (
	<div className='flex min-h-screen items-center justify-center'>
		<div className='panel flex items-center gap-3 px-6 py-4 text-slate-200'>
			<div className='h-10 w-10 animate-spin rounded-full border-2 border-emerald-300/20 border-t-emerald-300' />
			<p>Chargement de SmartResidence CY...</p>
		</div>
	</div>
);

export default LoadingSpinner;
