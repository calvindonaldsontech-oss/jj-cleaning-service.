import { useState } from 'react';
import ProposalSummary from '@/components/ProposalSummary';
import SiteAssessment from '@/components/SiteAssessment';
import SignatureBlock from '@/components/SignatureBlock';
import ExportActions from '@/components/ExportActions';
import PrintInvoice from '@/components/PrintInvoice';
import type { ProposalData, SignatureRecord, EstimateStatus } from '@/lib/proposalText';
import type { SitePhoto } from '@/lib/sitePhotos';

interface ClientProposalViewProps {
  proposal: ProposalData;
  photos: SitePhoto[];
  isAdmin?: boolean;
}

export default function ClientProposalView({ proposal, photos, isAdmin = false }: ClientProposalViewProps) {
  const [agreed, setAgreed] = useState(false);
  const [printedName, setPrintedName] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [signedAt, setSignedAt] = useState<Date | null>(null);
  const [estimateStatus, setEstimateStatus] = useState<EstimateStatus>('pending');

  const signature: SignatureRecord | null =
    agreed && imageDataUrl && signedAt ? { printedName, signedAt, imageDataUrl } : null;

  const handleSigned = (dataUrl: string) => {
    setImageDataUrl(dataUrl);
    setSignedAt((prev) => prev ?? new Date());
  };

  const handleCleared = () => {
    setImageDataUrl(null);
    setSignedAt(null);
  };

  const handleApproveDeposit = () => {
    setEstimateStatus('approved');
  };

  return (
    <>
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 print:hidden">
        <ProposalSummary
          proposal={proposal}
          estimateStatus={estimateStatus}
          termsAgreed={agreed}
          onApproveDeposit={handleApproveDeposit}
        />
        {photos.length > 0 && <SiteAssessment photos={photos} />}
        <SignatureBlock
          agreed={agreed}
          onAgreedChange={setAgreed}
          printedName={printedName}
          onPrintedNameChange={setPrintedName}
          signedAt={signedAt}
          onSigned={handleSigned}
          onCleared={handleCleared}
        />
        <ExportActions proposal={proposal} signature={signature} isAdmin={isAdmin} />
      </main>
      {signature && <PrintInvoice proposal={proposal} signature={signature} photos={photos} />}
    </>
  );
}
