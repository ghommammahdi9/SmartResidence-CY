const SectionHeader = ({ eyebrow, title, description }) => (
	<div className='mb-6 min-w-0'>
		{eyebrow && <p className='safe-text text-xs uppercase tracking-[0.28em] text-emerald-300 sm:tracking-[0.38em]'>{eyebrow}</p>}
		<h1 className='safe-text mt-3 text-3xl font-bold text-white sm:text-4xl'>{title}</h1>
		{description && <p className='safe-text mt-3 max-w-3xl text-base leading-7 text-slate-300'>{description}</p>}
	</div>
);

export default SectionHeader;
