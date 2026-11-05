import { useEffect, useState } from 'react';
import { Check, Copy, CreditCard } from 'lucide-react';
import { CARD_PAYMENT_URL, ZELLE_EMAIL } from '@/lib/business';
import { formatCurrency } from '@/lib/pricing';

interface PaymentOptionsProps {
  deposit: number;
}

const buttonClass =
  'inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2';

export default function PaymentOptions({ deposit }: PaymentOptionsProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`Zelle ${ZELLE_EMAIL} - deposit ${formatCurrency(deposit)}`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section aria-label="Deposit payment options" className="mt-6 flex flex-col gap-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Pay Your Deposit</h3>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="font-semibold text-slate-900">Zelle</p>
          <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-800">Instant</span>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Send your {formatCurrency(deposit)} deposit to
        </p>
        <p className="mt-1 break-all text-base font-medium text-slate-900">{ZELLE_EMAIL}</p>
        <button type="button" onClick={handleCopy} className={`${buttonClass} mt-4`}>
          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copied ? 'Zelle Info Copied' : 'Copy Zelle Info'}
        </button>
      </div>

      {CARD_PAYMENT_URL ? (
        <a href={CARD_PAYMENT_URL} target="_blank" rel="noopener noreferrer" className={buttonClass}>
          <CreditCard className="h-4 w-4" aria-hidden="true" />
          Pay via Credit/Debit Card (Visa)
        </a>
      ) : (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled
            className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-600"
          >
            <CreditCard className="h-4 w-4" aria-hidden="true" />
            Credit/Debit Card (Visa) - Coming Soon
          </button>
          <p className="text-sm text-slate-600">Card payments are not available yet. Please pay your deposit by Zelle above.</p>
        </div>
      )}
    </section>
  );
}
