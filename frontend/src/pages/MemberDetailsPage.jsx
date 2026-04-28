import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../lib/axios";
import SectionHeader from "../components/SectionHeader";
import StatePanel from "../components/StatePanel";
import StatusBadge from "../components/StatusBadge";
import { getLevelLabel, getMemberTypeLabel, getUserTypeLabel } from "../utils/access";

const MemberDetailsPage = () => {
	const { id } = useParams();
	const [member, setMember] = useState(null);
	const [status, setStatus] = useState({ loading: true, error: "" });

	useEffect(() => {
		axios
			.get(`/members/${id}`)
			.then((res) => {
				setMember(res.data.member);
				setStatus({ loading: false, error: "" });
			})
			.catch((error) => setStatus({ loading: false, error: error.response?.data?.message || "Profil introuvable." }));
	}, [id]);

	return (
		<div className='page-shell space-y-6'>
			<SectionHeader eyebrow='Visualisation' title='Profil public resident' description='Consultation detaillee d’un membre approuve de la residence.' />
			{status.loading && <StatePanel message='Chargement du profil...' />}
			{status.error && <StatePanel tone='error' title='Profil indisponible' message={status.error} />}
			{member && (
				<div className='grid gap-6 lg:grid-cols-[0.8fr_1.2fr] panel-grid-safe'>
					<div className='panel card-safe p-6'>
						<h2 className='safe-text text-3xl font-semibold'>{member.username}</h2>
						<div className='mt-4 flex flex-wrap gap-2 text-sm text-slate-300'>
							<StatusBadge value={member.userType} />
							<StatusBadge value={member.level} />
							<span className='badge-nowrap bg-slate-900 px-3 py-1' title={getMemberTypeLabel(member.memberType)}>{getMemberTypeLabel(member.memberType)}</span>
							<span className='badge-nowrap bg-slate-900 px-3 py-1'>{member.age ?? "n/a"} ans</span>
						</div>
						<p className='safe-text mt-5 text-sm text-slate-400'>
							Profil: {getUserTypeLabel(member.userType)} · Niveau: {getLevelLabel(member.level)}
						</p>
					</div>
					<div className='panel card-safe p-6'>
						<h3 className='text-2xl font-semibold'>Bio et centres d&apos;interet</h3>
						<p className='safe-text mt-4 leading-relaxed text-slate-300'>{member.publicProfile?.bio || "Aucune bio publique."}</p>
						<div className='mt-4 flex flex-wrap gap-2 text-sm text-slate-300'>
							{member.publicProfile?.interests?.length
								? member.publicProfile.interests.map((interest) => <span key={interest} className='badge-nowrap bg-slate-900 px-3 py-1'>{interest}</span>)
								: <span className='badge-nowrap bg-slate-900 px-3 py-1'>Aucun centre d&apos;interet renseigne</span>}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default MemberDetailsPage;
