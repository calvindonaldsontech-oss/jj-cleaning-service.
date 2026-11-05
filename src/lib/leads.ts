import type { SitePhoto } from '@/lib/sitePhotos';

export interface Lead {
  id: string;
  savedAt: string;
  clientName: string;
  phone: string;
  email: string;
  address: string;
  squareFeet: string;
  quoteTotal: number;
  depositAmount: number;
  photos: SitePhoto[];
}

const STORAGE_KEY = 'jj-cleaning-leads';

const LEAD_HEADERS = [
  'Saved At',
  'Client Name',
  'Phone',
  'Email',
  'Service Address',
  'Square Feet',
  'Quote Total',
  'Deposit Amount',
];

function isSitePhoto(value: unknown): value is SitePhoto {
  if (typeof value !== 'object' || value === null) return false;
  const photo = value as Record<string, unknown>;
  return (
    typeof photo.id === 'string' &&
    typeof photo.name === 'string' &&
    typeof photo.dataUrl === 'string' &&
    photo.dataUrl.startsWith('data:image/')
  );
}

function toLead(value: unknown): Lead | null {
  if (typeof value !== 'object' || value === null) return null;
  const lead = value as Record<string, unknown>;
  if (
    typeof lead.id !== 'string' ||
    typeof lead.savedAt !== 'string' ||
    typeof lead.clientName !== 'string' ||
    typeof lead.phone !== 'string' ||
    typeof lead.email !== 'string' ||
    typeof lead.address !== 'string' ||
    typeof lead.squareFeet !== 'string' ||
    typeof lead.quoteTotal !== 'number' ||
    typeof lead.depositAmount !== 'number'
  ) {
    return null;
  }

  return {
    id: lead.id,
    savedAt: lead.savedAt,
    clientName: lead.clientName,
    phone: lead.phone,
    email: lead.email,
    address: lead.address,
    squareFeet: lead.squareFeet,
    quoteTotal: lead.quoteTotal,
    depositAmount: lead.depositAmount,
    photos: Array.isArray(lead.photos) ? lead.photos.filter(isSitePhoto) : [],
  };
}

export function loadLeads(): Lead[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      const lead = toLead(item);
      return lead ? [lead] : [];
    });
  } catch {
    return [];
  }
}

export function saveLeads(leads: Lead[]): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    return true;
  } catch {
    return false;
  }
}

function escapeCsvCell(value: string | number): string {
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function buildLeadsCsv(leads: Lead[]): string {
  const rows = leads.map((lead) =>
    [
      lead.savedAt,
      lead.clientName,
      lead.phone,
      lead.email,
      lead.address,
      lead.squareFeet,
      lead.quoteTotal.toFixed(2),
      lead.depositAmount.toFixed(2),
    ]
      .map(escapeCsvCell)
      .join(',')
  );
  return '\uFEFF' + [LEAD_HEADERS.map(escapeCsvCell).join(','), ...rows].join('\r\n');
}

export function downloadLeadsCsv(leads: Lead[]): void {
  const blob = new Blob([buildLeadsCsv(leads)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `jj-cleaning-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
