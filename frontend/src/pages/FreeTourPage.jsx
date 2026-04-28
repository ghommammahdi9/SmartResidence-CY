import { Link } from "react-router-dom";
import SectionHeader from "../components/SectionHeader";
import StatusBadge from "../components/StatusBadge";
import SafeImage from "../components/SafeImage";
import campusPhoto from "../assets/photos/campus/campus-cy.png";
import studySpace from "../assets/photos/residence/study-space.avif";
import floorplan from "../assets/photos/residence/floorplan.jpg";

const steps = [
	"Module Information: annonces, zones, recherche publique, presentation des services.",
	"Module Visualisation: dashboard résident, progression, réservations et services.",
	"Module Gestion: actions réservées au personnel résidence pour piloter les équipements.",
	"Module Administration: validation des inscriptions, journaux, categories et rapports exportables.",
];

const highlights = [
	{ title: "Campus et residence", text: "Unifier la vie etudiante, l'information locale et le pilotage des zones dans une interface unique." },
	{ title: "Objets connectes", text: "Superviser la securite, l'energie, l'eau et l'acces depuis des tableaux de bord compréhensibles." },
	{ title: "Progression intelligente", text: "Distinguer résident, personnel résidence et administrateur avec des droits clairement séparés." },
];

const roles = ["visiteur", "simple", "complexe", "administrateur"];

const FreeTourPage = () => (
	<div className='page-shell space-y-6'>
		<div className='panel-strong bg-grid overflow-hidden p-8 sm:p-10'>
			<div className='grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center'>
				<div className='space-y-6'>
					<SectionHeader
						eyebrow='Visite Libre'
						title='Comprendre SmartResidence CY en moins de deux minutes'
						description="Cette visite libre donne une lecture claire du projet academique avant connexion: residence connectee, services, supervision et gouvernance."
					/>
					<div className='grid gap-4 sm:grid-cols-3'>
						{highlights.map((item) => (
							<div key={item.title} className='glass-card rounded-3xl p-4'>
								<p className='text-sm uppercase tracking-[0.25em] text-emerald-300'>{item.title}</p>
								<p className='mt-3 text-sm text-slate-300'>{item.text}</p>
							</div>
						))}
					</div>
				</div>
				<div className='grid gap-4 sm:grid-cols-2'>
					<div className='photo-frame image-shine sm:col-span-2'>
						<SafeImage alt='Campus CY et environnement universitaire' className='h-56 w-full object-cover' src={campusPhoto} />
					</div>
					<div className='photo-frame image-shine'>
						<SafeImage alt='Espace d etude de la residence' className='h-40 w-full object-cover' src={studySpace} />
					</div>
					<div className='photo-frame image-shine'>
						<SafeImage alt='Plan de zones de la residence connectee' className='h-40 w-full object-cover' src={floorplan} />
					</div>
				</div>
			</div>
		</div>
		<div className='panel p-6 sm:p-8'>
			<div className='grid gap-4 md:grid-cols-2'>
				{steps.map((step, index) => (
					<div key={step} className='glass-card rounded-3xl p-5'>
						<p className='text-sm uppercase tracking-[0.3em] text-emerald-300'>Etape {index + 1}</p>
						<p className='mt-3 text-slate-200'>{step}</p>
					</div>
				))}
			</div>
			<div className='mt-8 flex flex-wrap gap-3'>
				<Link className='btn-primary' to='/signup'>Creer un compte</Link>
				<Link className='btn-secondary' to='/public-search'>Lancer une recherche publique</Link>
			</div>
		</div>
		<div className='grid gap-6 xl:grid-cols-[1fr_1fr]'>
			<div className='panel p-6'>
				<SectionHeader eyebrow='Modules' title='Une architecture claire pour la soutenance' description='La visite libre rappelle explicitement les 4 modules imposes par le cahier des charges.' />
				<div className='grid gap-3 sm:grid-cols-2'>
					{["Information", "Visualisation", "Gestion", "Administration"].map((module) => (
						<div key={module} className='glass-card p-4'>
							<p className='text-lg font-semibold text-white'>{module}</p>
						</div>
					))}
				</div>
			</div>
			<div className='panel p-6'>
				<SectionHeader eyebrow='Roles' title='Utilisateurs immediatement identifiables' description='Le professeur comprend ici que la plateforme gere plusieurs niveaux d acces et de responsabilite.' />
				<div className='flex flex-wrap gap-3'>
					{roles.map((role) => (
						<StatusBadge key={role} value={role} />
					))}
				</div>
			</div>
		</div>
	</div>
);

export default FreeTourPage;
