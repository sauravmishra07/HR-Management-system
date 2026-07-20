import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader, Tabs } from '@/components/ui';
import CandidatesTab from './CandidatesTab';
import OpeningsTab from './OpeningsTab';
import StructuresTab from './StructuresTab';
import OffersTab from './OffersTab';
import OfferBuilderModal from './OfferBuilderModal';
import OfferLetterModal from './OfferLetterModal';

export default function RecruitmentPage() {
  const { can } = useAuth();
  const [tab, setTab] = useState('candidates');
  const [offerCandidate, setOfferCandidate] = useState(null); // candidate → offer builder
  const [viewingOffer, setViewingOffer] = useState(null); // offer → letter preview

  const tabs = [
    { key: 'candidates', label: 'Candidates' },
    { key: 'openings', label: 'Openings' },
    ...(can('salaryStructure') ? [{ key: 'structures', label: 'Salary Structures' }] : []),
    ...(can('offer') ? [{ key: 'offers', label: 'Offers' }] : []),
  ];

  return (
    <>
      <PageHeader
        title="Recruitment"
        hint="Openings, candidate pipeline, salary structures and offer letters — all in one place."
      />

      <Tabs tabs={tabs} value={tab} onChange={setTab} />

      <div style={{ marginTop: 16 }}>
        {tab === 'candidates' && <CandidatesTab onMakeOffer={setOfferCandidate} />}
        {tab === 'openings' && <OpeningsTab />}
        {tab === 'structures' && can('salaryStructure') && <StructuresTab />}
        {tab === 'offers' && can('offer') && <OffersTab onView={setViewingOffer} />}
      </div>

      <OfferBuilderModal
        candidate={offerCandidate}
        onClose={() => setOfferCandidate(null)}
        onGenerated={(offer) => { setOfferCandidate(null); setViewingOffer(offer); }}
      />
      <OfferLetterModal offer={viewingOffer} onClose={() => setViewingOffer(null)} />
    </>
  );
}
