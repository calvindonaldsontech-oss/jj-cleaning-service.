import { TAX_RATE, formatCurrency } from '@/lib/pricing';
import type { QuoteResult } from '@/lib/pricing';

interface EstimateSummaryProps {
  quote: QuoteResult;
  clientName: string;
  isContactComplete: boolean;
  taxEnabled: boolean;
  onTaxToggle: (enabled: boolean) => void;
}

function SummaryRow({ label, value, negative = false }: { label: string; value: string; negative?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-slate-600">
      <dt className="text-sm sm:text-base">{label}</dt>
      <dd className={`tabular-nums ${negative ? 'text-brand-700' : ''}`}>{value}</dd>
    </div>
  );
}

export default function EstimateSummary({
  quote,
  clientName,
  isContactComplete,
  taxEnabled,
  onTaxToggle,
}: EstimateSummaryProps) {
  const taxPercent = (TAX_RATE * 100).toFixed(2);
  const hasDiscount = quote.discountAmount > 0;

  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Estimate</h2>
        <p className="mt-1 truncate text-sm text-slate-600">
          {clientName.trim() ? `Prepared for ${clientName.trim()}` : 'Enter a client name to personalize this quote'}
        </p>
      </div>

      <dl className="flex flex-col gap-3">
        <div className="rounded-xl bg-slate-50 px-4 py-3">
          <p className="text-sm font-medium text-slate-800">
            {quote.isOverridden ? 'Custom flat price' : 'Base estimate formula'}
          </p>
          <dl className="mt-2 flex flex-col gap-1.5">
            {quote.formulaBreakdown.map((line) => (
              <div key={line.label} className="flex items-baseline justify-between gap-4 text-sm text-slate-600">
                <dt>{line.label}</dt>
                <dd className="tabular-nums">{formatCurrency(line.amount)}</dd>
              </div>
            ))}
            <div className="mt-1 flex items-baseline justify-between gap-4 border-t border-slate-200 pt-1.5 font-semibold text-slate-900">
              <dt>{quote.isOverridden ? 'Flat total' : 'Base subtotal'}</dt>
              <dd className="tabular-nums">{formatCurrency(quote.baseAmount)}</dd>
            </div>
          </dl>
        </div>
        <SummaryRow label="Add-ons" value={formatCurrency(quote.addOnsTotal)} />
        {hasDiscount && (
          <SummaryRow
            label={`Discounts (${quote.discountPercent}% off)`}
            value={`-${formatCurrency(quote.discountAmount)}`}
            negative
          />
        )}
        <div className="border-t border-slate-200 pt-3">
          <div className="flex items-baseline justify-between gap-4 font-semibold text-slate-900">
            <dt>Subtotal</dt>
            <dd className="tabular-nums">{formatCurrency(quote.subtotal)}</dd>
          </div>
        </div>
      </dl>

      <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
        <div>
          <p id="tax-toggle-label" className="text-sm font-medium text-slate-800">
            Sales tax ({taxPercent}%)
          </p>
          <p className="text-sm text-slate-600 tabular-nums">{formatCurrency(quote.tax)}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={taxEnabled}
          aria-labelledby="tax-toggle-label"
          onClick={() => onTaxToggle(!taxEnabled)}
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 ${
            taxEnabled ? 'bg-brand-600' : 'bg-slate-300'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
              taxEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="rounded-xl bg-slate-900 px-5 py-5 text-white">
        <p className="text-sm font-medium text-slate-300">Total Job Estimate</p>
        <p className="mt-1 text-4xl font-semibold tabular-nums">{formatCurrency(quote.total)}</p>
      </div>

      <div className="rounded-xl border border-brand-200 bg-brand-50 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-800">Deposit Breakdown</h3>
        <dl className="mt-4 flex flex-col gap-4">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="font-medium text-slate-800">50% Retainer Deposit Required</dt>
            <dd className="text-xl font-semibold tabular-nums text-brand-900">{formatCurrency(quote.deposit)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 border-t border-brand-200 pt-4">
            <dt className="font-medium text-slate-800">Remaining Balance Due Upon Completion</dt>
            <dd className="text-xl font-semibold tabular-nums text-brand-900">{formatCurrency(quote.remainingBalance)}</dd>
          </div>
        </dl>
      </div>

      {!isContactComplete && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Add the customer's email, phone number, and service address to finalize this quote.
        </p>
      )}
    </section>
  );
}
