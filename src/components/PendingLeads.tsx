import { useCallback, useEffect, useState } from 'react';
import { Calendar, FileText, Inbox, Mail, MapPin, Phone, RefreshCw, Trash2 } from 'lucide-react';
import { PIN_CHECK_ERROR_MESSAGE, PIN_LOCKED_MESSAGE } from '@/lib/adminPin';
import { deleteQuoteRequest, fetchQuoteRequests } from '@/lib/quoteRequests';
import type { QuoteRequest } from '@/lib/quoteRequests';
import { formatDateTime } from '@/lib/proposalText';

const PIN_REJECTED_MESSAGE =
  'Admin Mode could not verify your PIN. Switch to Client Proposal View and back to Admin Mode to re-enter it.';

interface PendingLeadsProps {
  adminPin: string;
  onConvert: (request: QuoteRequest) => void;
}

type LoadState =
  | { phase: 'loading' }
  | { phase: 'ready'; requests: QuoteRequest[] }
  | { phase: 'error'; message: string };

export default function PendingLeads({ adminPin, onConvert }: PendingLeadsProps) {
  const [state, setState] = useState<LoadState>({ phase: 'loading' });
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState({ phase: 'loading' });
    try {
      const result = await fetchQuoteRequests(adminPin);
      if (result.status === 'ok') {
        setState({ phase: 'ready', requests: result.requests });
      } else {
        setState({ phase: 'error', message: result.status === 'locked' ? PIN_LOCKED_MESSAGE : PIN_REJECTED_MESSAGE });
      }
    } catch {
      setState({ phase: 'error', message: PIN_CHECK_ERROR_MESSAGE });
    }
  }, [adminPin]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleRemove = async (request: QuoteRequest) => {
    if (!window.confirm(`Remove the quote request from ${request.fullName}? This cannot be undone.`)) return;
    setActionError(null);
    try {
      const status = await deleteQuoteRequest(adminPin, request.id);
      if (status !== 'ok') {
        setActionError(status === 'locked' ? PIN_LOCKED_MESSAGE : PIN_REJECTED_MESSAGE);
        return;
      }
      await load();
    } catch {
      setActionError(PIN_CHECK_ERROR_MESSAGE);
    }
  };

  const requests = state.phase === 'ready' ? state.requests : [];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3">
          <Inbox className="mt-0.5 h-5 w-5 text-brand-700" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Pending Leads / Quote Requests</h2>
            <p className="mt-1 text-sm text-slate-600">
              {state.phase === 'loading' && 'Loading quote requests...'}
              {state.phase === 'ready' &&
                (requests.length === 0
                  ? 'No pending quote requests. New requests from the website appear here.'
                  : `${requests.length} pending ${requests.length === 1 ? 'request' : 'requests'} awaiting a proposal.`)}
              {state.phase === 'error' && 'Quote requests could not be loaded.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={state.phase === 'loading'}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-brand-600 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 disabled:cursor-not-allowed disabled:text-slate-400"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Refresh
        </button>
      </div>

      {state.phase === 'error' && (
        <p role="alert" className="px-5 py-4 text-sm text-red-700 sm:px-6">
          {state.message}
        </p>
      )}

      {actionError && (
        <p role="alert" className="px-5 pt-4 text-sm text-red-700 sm:px-6">
          {actionError}
        </p>
      )}

      {requests.length > 0 && (
        <ul className="divide-y divide-slate-100">
          {requests.map((request) => (
            <li key={request.id} className="p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-900">{request.fullName}</h3>
                    {request.createdAt && (
                      <span className="text-xs text-slate-400">
                        {formatDateTime(new Date(request.createdAt))}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                      {request.phone}
                    </span>
                    {request.email && (
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                        {request.email}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                      {request.address}
                    </span>
                    {request.preferredDate && (
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                        {request.preferredDate}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
                    <span>
                      Service:{' '}
                      <span className="font-medium text-slate-700">{request.serviceType || 'Not specified'}</span>
                    </span>
                    {request.squareFeet && (
                      <span>
                        Sq Ft: <span className="font-medium text-slate-700">{request.squareFeet}</span>
                      </span>
                    )}
                    {request.bedrooms && (
                      <span>
                        Bedrooms: <span className="font-medium text-slate-700">{request.bedrooms}</span>
                      </span>
                    )}
                    {request.bathrooms && (
                      <span>
                        Bathrooms: <span className="font-medium text-slate-700">{request.bathrooms}</span>
                      </span>
                    )}
                  </div>

                  {request.notes && (
                    <p className="text-sm text-slate-600">
                      <span className="font-medium text-slate-700">Notes:</span> {request.notes}
                    </p>
                  )}
                </div>

                <div className="flex flex-row gap-2 sm:flex-col">
                  <button
                    type="button"
                    onClick={() => onConvert(request)}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                  >
                    <FileText className="h-4 w-4" aria-hidden="true" />
                    Convert to Proposal
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleRemove(request)}
                    aria-label={`Remove ${request.fullName}'s request`}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-red-400 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
