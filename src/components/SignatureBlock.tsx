import { useState } from 'react';
import SignaturePad from '@/components/SignaturePad';
import TermsPolicyModal from '@/components/TermsPolicyModal';
import { AGREEMENT_TEXT } from '@/lib/business';
import { formatDateTime } from '@/lib/proposalText';

interface SignatureBlockProps {
  agreed: boolean;
  onAgreedChange: (agreed: boolean) => void;
  printedName: string;
  onPrintedNameChange: (name: string) => void;
  signedAt: Date | null;
  onSigned: (imageDataUrl: string) => void;
  onCleared: () => void;
}

export default function SignatureBlock({
  agreed,
  onAgreedChange,
  printedName,
  onPrintedNameChange,
  signedAt,
  onSigned,
  onCleared,
}: SignatureBlockProps) {
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <h2 className="text-lg font-semibold text-slate-900">Review & Accept Terms</h2>

      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-slate-300">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => onAgreedChange(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300 text-brand-600 focus:ring-brand-600"
        />
        <span className="text-sm leading-normal text-slate-800 sm:text-base">
          {AGREEMENT_TEXT}{' '}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setIsPolicyOpen(true);
            }}
            className="inline cursor-pointer font-medium text-brand-700 underline underline-offset-2 transition hover:text-brand-800"
          >
            [View Full Policy Terms]
          </button>
        </span>
      </label>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_220px]">
        <div>
          <p className="text-sm font-medium text-slate-700">Signature</p>
          <div className="mt-2">
            <SignaturePad onSigned={onSigned} onCleared={onCleared} />
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <label htmlFor="printed-name" className="block text-sm font-medium text-slate-700">
              Printed Name
            </label>
            <input
              id="printed-name"
              type="text"
              autoComplete="name"
              placeholder="Type your full name"
              value={printedName}
              onChange={(e) => onPrintedNameChange(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm placeholder:text-slate-400 transition focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
            />
          </div>

          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Date &amp; Time Signed</p>
            <p className="mt-1 text-sm text-slate-900">
              {signedAt ? formatDateTime(signedAt) : 'Recorded automatically when you sign'}
            </p>
          </div>
        </div>
      </div>

      {isPolicyOpen && <TermsPolicyModal onClose={() => setIsPolicyOpen(false)} />}
    </section>
  );
}
