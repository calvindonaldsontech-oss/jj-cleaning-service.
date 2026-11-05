import ModalShell from '@/components/ModalShell';
import { FULL_POLICY_CLAUSES } from '@/lib/business';

interface TermsPolicyModalProps {
  onClose: () => void;
}

export default function TermsPolicyModal({ onClose }: TermsPolicyModalProps) {
  return (
    <ModalShell
      title="Full Terms & Cancellation Policy"
      description="JJ Cleaning Services LLC - Complete 8-clause policy document"
      onClose={onClose}
    >
      <div className="max-h-[60vh] overflow-y-auto pr-1">
        <ol className="flex flex-col gap-4">
          {FULL_POLICY_CLAUSES.map((clause) => (
            <li key={clause.title}>
              <p className="text-sm font-semibold text-slate-900">{clause.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{clause.body}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
        >
          Close
        </button>
      </div>
    </ModalShell>
  );
}
