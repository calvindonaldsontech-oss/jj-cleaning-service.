import { Download, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/pricing';
import { formatDateTime } from '@/lib/proposalText';
import { downloadLeadsCsv } from '@/lib/leads';
import type { Lead } from '@/lib/leads';

interface LeadHistoryProps {
  leads: Lead[];
}

const headerCellClass = 'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500';
const bodyCellClass = 'whitespace-nowrap px-4 py-3 text-sm text-slate-700';
const MAX_VISIBLE_THUMBNAILS = 3;

export default function LeadHistory({ leads }: LeadHistoryProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3">
          <Users className="mt-0.5 h-5 w-5 text-brand-700" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Lead History</h2>
            <p className="mt-1 text-sm text-slate-600">
              {leads.length === 0
                ? 'Saved quotes appear here. Leads are stored in this browser.'
                : `${leads.length} saved ${leads.length === 1 ? 'lead' : 'leads'} stored in this browser.`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => downloadLeadsCsv(leads)}
          disabled={leads.length === 0}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Export Leads (CSV)
        </button>
      </div>

      {leads.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className={headerCellClass}>Date</th>
                <th scope="col" className={headerCellClass}>Client</th>
                <th scope="col" className={headerCellClass}>Phone</th>
                <th scope="col" className={headerCellClass}>Email</th>
                <th scope="col" className={headerCellClass}>Service Address</th>
                <th scope="col" className={headerCellClass}>Photos</th>
                <th scope="col" className={`${headerCellClass} text-right`}>Sq Ft</th>
                <th scope="col" className={`${headerCellClass} text-right`}>Quote Total</th>
                <th scope="col" className={`${headerCellClass} text-right`}>Deposit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {leads.map((lead) => (
                <tr key={lead.id} className="transition hover:bg-slate-50">
                  <td className={bodyCellClass}>{formatDateTime(new Date(lead.savedAt))}</td>
                  <td className={`${bodyCellClass} font-medium text-slate-900`}>{lead.clientName || '-'}</td>
                  <td className={bodyCellClass}>{lead.phone}</td>
                  <td className={bodyCellClass}>{lead.email}</td>
                  <td className={`${bodyCellClass} max-w-xs truncate`}>{lead.address}</td>
                  <td className="px-4 py-3">
                    {lead.photos.length === 0 ? (
                      <span className="text-sm text-slate-400">None</span>
                    ) : (
                      <ul className="flex items-center gap-1.5">
                        {lead.photos.slice(0, MAX_VISIBLE_THUMBNAILS).map((photo) => (
                          <li key={photo.id}>
                            <img
                              src={photo.dataUrl}
                              alt={photo.name}
                              className="h-12 w-12 rounded-md border border-slate-200 object-cover"
                            />
                          </li>
                        ))}
                        {lead.photos.length > MAX_VISIBLE_THUMBNAILS && (
                          <li className="text-xs font-medium text-slate-500">
                            +{lead.photos.length - MAX_VISIBLE_THUMBNAILS}
                          </li>
                        )}
                      </ul>
                    )}
                  </td>
                  <td className={`${bodyCellClass} text-right tabular-nums`}>{lead.squareFeet || '-'}</td>
                  <td className={`${bodyCellClass} text-right tabular-nums`}>{formatCurrency(lead.quoteTotal)}</td>
                  <td className={`${bodyCellClass} text-right tabular-nums`}>{formatCurrency(lead.depositAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
