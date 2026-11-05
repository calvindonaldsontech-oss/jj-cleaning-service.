import { Sparkles, AlertTriangle } from 'lucide-react';
import PaymentOptions from '@/components/PaymentOptions';
import { formatCurrency, TAX_RATE } from '@/lib/pricing';
import { BUSINESS_NAME, TERMS, PDF_FOOTNOTE } from '@/lib/business';
import { formatDate } from '@/lib/proposalText';
import type { ProposalData, EstimateStatus } from '@/lib/proposalText';

interface ProposalSummaryProps {
  proposal: ProposalData;
  estimateStatus: EstimateStatus;
  termsAgreed: boolean;
  onApproveDeposit: () => void;
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900 sm:text-base">{value}</dd>
    </div>
  );
}

function AmountRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 ${highlight ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
      <dt className="text-sm sm:text-base">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

export default function ProposalSummary({ proposal, estimateStatus, termsAgreed, onApproveDeposit }: ProposalSummaryProps) {
  const taxPercent = (TAX_RATE * 100).toFixed(2);

  const propertyDetails: string[] = [];
  if (proposal.bedrooms) propertyDetails.push(`${proposal.bedrooms} bed`);
  if (proposal.bathrooms) propertyDetails.push(`${proposal.bathrooms} bath`);
  if (proposal.squareFeet) propertyDetails.push(`${proposal.squareFeet} sq ft`);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center gap-4 border-b border-slate-200 bg-slate-900 px-5 py-6 text-white sm:px-8">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white">
          <Sparkles className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <p className="text-lg font-semibold leading-tight sm:text-xl">{BUSINESS_NAME}</p>
          <p className="mt-1 text-sm text-slate-300">Cleaning Proposal</p>
        </div>
      </header>

      <div className="flex flex-col gap-8 p-5 sm:p-8">
        {estimateStatus === 'bounced' && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900"
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold">Delivery Failed / Bounced</p>
              <p className="mt-1 text-sm">
                The email containing this estimate could not be delivered. Please verify the client's email address
                and resend, or contact them directly.
              </p>
            </div>
          </div>
        )}

        <dl className="grid gap-5 sm:grid-cols-2">
          <DetailItem label="Prepared for" value={proposal.clientName || 'Not provided'} />
          <DetailItem label="Service address" value={proposal.address || 'Not provided'} />
          <DetailItem label="Quote date" value={formatDate(proposal.quoteDate)} />
          <DetailItem label="Expires" value={formatDate(proposal.expirationDate)} />
        </dl>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700">Services</h2>
          <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3">
            <p className="font-medium text-slate-900">{proposal.serviceLabel}</p>
            {propertyDetails.length > 0 && <p className="text-sm text-slate-600">{propertyDetails.join(', ')}</p>}
            {proposal.isOverridden && <p className="text-sm text-slate-600">Flat-rate price</p>}

            <dl className="mt-3 flex flex-col gap-1.5 border-t border-slate-200 pt-3">
              {proposal.formulaBreakdown.map((line) => (
                <div key={line.label} className="flex items-baseline justify-between gap-4 text-sm text-slate-600">
                  <dt>{line.label}</dt>
                  <dd className="tabular-nums">{formatCurrency(line.amount)}</dd>
                </div>
              ))}
            </dl>
          </div>

          <h3 className="mt-6 text-sm font-semibold text-slate-900">Add-ons</h3>
          {proposal.addOns.length > 0 ? (
            <ul className="mt-2 divide-y divide-slate-100">
              {proposal.addOns.map((addOn) => (
                <li key={addOn.label} className="flex items-baseline justify-between gap-4 py-2.5 text-sm sm:text-base">
                  <span className="text-slate-700">
                    {addOn.label}
                    {addOn.perUnit && <span className="text-slate-500"> x {addOn.quantity}</span>}
                  </span>
                  <span className="tabular-nums text-slate-900">{formatCurrency(addOn.lineTotal)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-500">No add-ons selected.</p>
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700">Estimate</h2>
          <dl className="mt-4 flex flex-col gap-3">
            <AmountRow label="Subtotal" value={formatCurrency(proposal.preDiscountSubtotal)} />
            {proposal.discountAmount > 0 && (
              <div className="flex items-baseline justify-between gap-4 text-brand-700">
                <dt className="text-sm sm:text-base">Discounts ({proposal.discountPercent}% off)</dt>
                <dd className="tabular-nums">-{formatCurrency(proposal.discountAmount)}</dd>
              </div>
            )}
            {proposal.taxEnabled && (
              <AmountRow label={`Sales tax (${taxPercent}%)`} value={formatCurrency(proposal.tax)} />
            )}
          </dl>

          <div className="mt-5 rounded-xl bg-slate-900 px-5 py-5 text-white">
            <p className="text-sm font-medium text-slate-300">Total Job Estimate</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums sm:text-4xl">{formatCurrency(proposal.total)}</p>
          </div>

          <div className="mt-5 rounded-xl border border-brand-200 bg-brand-50 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-800">Deposit Breakdown</h3>
            <dl className="mt-4 flex flex-col gap-4">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="font-medium text-slate-800">50% Retainer Deposit Required</dt>
                <dd className="text-xl font-semibold tabular-nums text-brand-900">{formatCurrency(proposal.deposit)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-t border-brand-200 pt-4">
                <dt className="font-medium text-slate-800">Remaining Balance Due Upon Completion</dt>
                <dd className="text-xl font-semibold tabular-nums text-brand-900">
                  {formatCurrency(proposal.remainingBalance)}
                </dd>
              </div>
            </dl>
          </div>

          <PaymentOptions deposit={proposal.deposit} />

          <button
            type="button"
            onClick={onApproveDeposit}
            disabled={!termsAgreed}
            className="mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {estimateStatus === 'approved' ? 'Deposit Approved' : 'Approve & Pay Deposit'}
          </button>
          {!termsAgreed && (
            <p className="mt-3 text-center text-sm text-slate-500">
              Check the terms agreement above to enable the deposit button.
            </p>
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700">Terms &amp; Cancellation Policy</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-normal text-slate-700 marker:text-slate-400 sm:text-base">
            {TERMS.map((term) => (
              <li key={term}>{term}</li>
            ))}
          </ol>
          <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-xs italic leading-relaxed text-slate-500">
            {PDF_FOOTNOTE}
          </p>
        </section>
      </div>
    </article>
  );
}
