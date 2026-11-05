import { Sparkles } from 'lucide-react';
import { BUSINESS_NAME, CARD_PAYMENT_URL, TERMS, ZELLE_EMAIL, PDF_FOOTNOTE } from '@/lib/business';
import { formatCurrency } from '@/lib/pricing';
import { displayName, formatDate, formatDateTime } from '@/lib/proposalText';
import type { ProposalData, SignatureRecord } from '@/lib/proposalText';
import type { SitePhoto } from '@/lib/sitePhotos';

interface PrintInvoiceProps {
  proposal: ProposalData;
  signature: SignatureRecord;
  photos: SitePhoto[];
}

function Row({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 py-1.5 ${bold ? 'border-t border-black pt-2 font-bold' : ''}`}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

export default function PrintInvoice({ proposal, signature, photos }: PrintInvoiceProps) {
  const propertyDetails: string[] = [];
  if (proposal.bedrooms) propertyDetails.push(`${proposal.bedrooms} bed`);
  if (proposal.bathrooms) propertyDetails.push(`${proposal.bathrooms} bath`);
  if (proposal.squareFeet) propertyDetails.push(`${proposal.squareFeet} sq ft`);

  return (
    <div className="hidden bg-white p-10 text-[13px] text-black print:block">
      <div className="flex items-center justify-between border-b-2 border-black pb-4">
        <div className="flex items-center gap-3">
          <Sparkles className="h-8 w-8" aria-hidden="true" />
          <div>
            <p className="text-xl font-bold">{BUSINESS_NAME}</p>
            <p>Cleaning Proposal &amp; Service Agreement</p>
          </div>
        </div>
        <div className="text-right">
          <p>Quote date: {formatDate(proposal.quoteDate)}</p>
          <p>Valid until: {formatDate(proposal.expirationDate)}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6">
        <div>
          <p className="font-bold">Prepared for</p>
          <p>{proposal.clientName || 'Not provided'}</p>
          <p>{proposal.address || 'Not provided'}</p>
          <p>{proposal.email}</p>
        </div>
        <div>
          <p className="font-bold">Service</p>
          <p>{proposal.serviceLabel}</p>
          {propertyDetails.length > 0 && <p>{propertyDetails.join(', ')}</p>}
          {proposal.isOverridden && <p>Flat-rate price</p>}
        </div>
      </div>

      <div className="mt-6">
        <p className="font-bold">Base Estimate Breakdown</p>
        {proposal.formulaBreakdown.map((line) => (
          <Row key={line.label} label={line.label} value={formatCurrency(line.amount)} />
        ))}
        <Row label="Base Total" value={formatCurrency(proposal.baseAmount)} bold />

        {proposal.addOns.length > 0 && (
          <>
            <p className="mt-4 font-bold">Add-ons</p>
            {proposal.addOns.map((addOn) => (
              <Row
                key={addOn.label}
                label={`${addOn.label}${addOn.perUnit ? ` x ${addOn.quantity}` : ''}`}
                value={formatCurrency(addOn.lineTotal)}
              />
            ))}
          </>
        )}

        <Row label="Subtotal" value={formatCurrency(proposal.preDiscountSubtotal)} />
        {proposal.discountAmount > 0 && (
          <Row label={`Discounts (${proposal.discountPercent}% off)`} value={`-${formatCurrency(proposal.discountAmount)}`} />
        )}
        {proposal.taxEnabled && <Row label="Sales tax" value={formatCurrency(proposal.tax)} />}
        <Row label="Total Job Estimate" value={formatCurrency(proposal.total)} bold />
        <Row label="50% Retainer Deposit Required" value={formatCurrency(proposal.deposit)} />
        <Row label="Remaining Balance Due Upon Completion" value={formatCurrency(proposal.remainingBalance)} />
      </div>

      <div className="mt-6">
        <p className="font-bold">Payment options</p>
        <p>Zelle: {ZELLE_EMAIL}</p>
        {CARD_PAYMENT_URL && <p>Credit/Debit Card (Visa): {CARD_PAYMENT_URL}</p>}
      </div>

      <div className="mt-6">
        <p className="font-bold">Terms &amp; Cancellation Policy</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          {TERMS.map((term) => (
            <li key={term}>{term}</li>
          ))}
        </ol>
      </div>

      <p className="mt-4 border-t border-black pt-3 text-[11px] italic">{PDF_FOOTNOTE}</p>

      {photos.length > 0 && (
        <div className="mt-6">
          <p className="font-bold">Site Assessment &amp; Pre-Existing Conditions</p>
          <div className="mt-2 grid grid-cols-3 gap-3">
            {photos.map((photo) => (
              <img
                key={photo.id}
                src={photo.dataUrl}
                alt={photo.name}
                className="aspect-square w-full break-inside-avoid rounded border border-black object-cover"
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-2 items-end gap-6 break-inside-avoid">
        <div>
          <img src={signature.imageDataUrl} alt="Client signature" className="h-24 border-b border-black object-contain" />
          <p className="mt-1">Signature of {displayName(proposal, signature)}</p>
        </div>
        <div>
          <p>Signed on: {formatDateTime(signature.signedAt)}</p>
          <p>Printed name: {signature.printedName.trim() || proposal.clientName || 'Not provided'}</p>
        </div>
      </div>
    </div>
  );
}
