import { useEffect, useState } from 'react';
import { Mail, Printer, ClipboardCopy, Check } from 'lucide-react';
import { buildEmailHref, buildQuoteText } from '@/lib/proposalText';
import type { ProposalData, SignatureRecord } from '@/lib/proposalText';

interface ExportActionsProps {
  proposal: ProposalData;
  signature: SignatureRecord | null;
  isAdmin?: boolean;
}

const actionClass =
  'inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm transition hover:border-brand-600 hover:text-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:hover:border-slate-200 disabled:hover:text-slate-400';

export default function ExportActions({ proposal, signature, isAdmin = false }: ExportActionsProps) {
  const [copied, setCopied] = useState(false);
  const isUnlocked = isAdmin || signature !== null;
  const hasEmail = proposal.email !== '';

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(buildQuoteText(proposal, signature));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900">Share &amp; Save</h2>
      {!isUnlocked && (
        <p className="mt-1 text-sm text-slate-600">Check the agreement and sign above to unlock these actions.</p>
      )}
      {isAdmin && !signature && (
        <p className="mt-1 text-sm text-brand-700">Admin preview — export actions are unlocked before client signature.</p>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        {isUnlocked && hasEmail ? (
          <a href={buildEmailHref(proposal, signature)} className={actionClass}>
            <Mail className="h-4 w-4" aria-hidden="true" />
            Send Email Proposal
          </a>
        ) : (
          <button type="button" disabled className={actionClass} title={hasEmail ? undefined : 'Add the client email in Admin Mode'}>
            <Mail className="h-4 w-4" aria-hidden="true" />
            Send Email Proposal
          </button>
        )}

        <button type="button" onClick={copyText} disabled={!isUnlocked} className={actionClass}>
          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <ClipboardCopy className="h-4 w-4" aria-hidden="true" />}
          {copied ? 'Copied to clipboard' : 'Copy Quote Text'}
        </button>

        <button type="button" onClick={() => window.print()} disabled={!isUnlocked} className={actionClass}>
          <Printer className="h-4 w-4" aria-hidden="true" />
          Print / Save PDF
        </button>
      </div>
      {isUnlocked && !hasEmail && (
        <p className="mt-3 text-sm text-amber-800">Add the client's email in Admin Mode to send the proposal by email.</p>
      )}
    </section>
  );
}
