import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import ModalShell from '@/components/ModalShell';

interface TokenExpiredModalProps {
  onSubmit: (newToken: string) => void;
  onClose: () => void;
}

export default function TokenExpiredModal({ onSubmit, onClose }: TokenExpiredModalProps) {
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (token.trim() === '') {
      setError('Please paste your refreshed API token to continue.');
      return;
    }
    setError(null);
    onSubmit(token.trim());
  };

  return (
    <ModalShell
      title="Session / API Token Expired"
      description="Your API token has expired or is no longer valid. Paste your refreshed token below to continue without losing any form data."
      onClose={onClose}
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
          <p className="text-sm font-medium text-amber-900">
            Session/API Token Expired. Please paste your refreshed token to continue.
          </p>
        </div>

        <div>
          <label htmlFor="refreshed-token" className="block text-sm font-medium text-slate-700">
            Refreshed API Token / Bearer Key
          </label>
          <textarea
            id="refreshed-token"
            rows={3}
            placeholder="Paste your new API key or bearer token here..."
            value={token}
            onChange={(e) => {
              setToken(e.target.value);
              if (error) setError(null);
            }}
            className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-mono text-sm text-slate-900 shadow-sm transition focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
          />
          {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
          >
            Update Token
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
