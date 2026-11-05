import { supabase } from '@/lib/supabase';
import type { PinStatus } from '@/lib/adminPin';

const WEB3FORMS_URL = 'https://api.web3forms.com/submit';
const WEB3FORMS_ACCESS_KEY = '4f26ba33-e117-44ef-b6f6-e4c1921b62f8';
const EMAIL_SUBJECT = 'New Quote Request - JJ Cleaning Services LLC';

export interface QuoteRequestInput {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  serviceType: string;
  squareFeet: string;
  bedrooms: string;
  bathrooms: string;
  preferredDate: string;
  notes: string;
}

export interface QuoteRequest {
  id: string;
  createdAt: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  serviceType: string;
  squareFeet: string;
  bedrooms: string;
  bathrooms: string;
  preferredDate: string;
  notes: string;
}

export type FetchQuoteRequestsResult =
  | { status: 'ok'; requests: QuoteRequest[] }
  | { status: Exclude<PinStatus, 'ok'> };

async function sendEmailAlert(input: QuoteRequestInput): Promise<boolean> {
  try {
    const response = await fetch(WEB3FORMS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: EMAIL_SUBJECT,
        from_name: 'JJ Cleaning Services Website',
        name: input.fullName,
        email: input.email,
        phone: input.phone,
        address: input.address,
        service_type: input.serviceType,
        sqft: input.squareFeet,
        bedrooms: input.bedrooms,
        bathrooms: input.bathrooms,
        preferred_date: input.preferredDate,
        notes: input.notes,
      }),
    });
    if (!response.ok) return false;
    const data: unknown = await response.json();
    return typeof data === 'object' && data !== null && (data as { success?: unknown }).success === true;
  } catch {
    return false;
  }
}

export async function submitQuoteRequest(input: QuoteRequestInput): Promise<{ emailSent: boolean }> {
  const { error } = await supabase.from('quote_requests').insert({
    full_name: input.fullName,
    email: input.email,
    phone: input.phone,
    address: input.address,
    service_type: input.serviceType || null,
    square_feet: input.squareFeet ? Number(input.squareFeet) : null,
    bedrooms: input.bedrooms ? Number(input.bedrooms) : 0,
    bathrooms: input.bathrooms ? Number(input.bathrooms) : 0,
    preferred_date: input.preferredDate || null,
    notes: input.notes || null,
  });
  if (error) throw new Error('Your request could not be saved. Please try again.');

  const emailSent = await sendEmailAlert(input);
  return { emailSent };
}

function optionalText(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function parseQuoteRequest(value: unknown): QuoteRequest | null {
  if (typeof value !== 'object' || value === null) return null;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== 'string' || typeof row.full_name !== 'string') return null;
  return {
    id: row.id,
    createdAt: optionalText(row.created_at),
    fullName: row.full_name,
    email: optionalText(row.email),
    phone: optionalText(row.phone),
    address: optionalText(row.address),
    serviceType: optionalText(row.service_type),
    squareFeet: row.square_feet == null ? '' : String(row.square_feet),
    bedrooms: row.bedrooms == null ? '' : String(row.bedrooms),
    bathrooms: row.bathrooms == null ? '' : String(row.bathrooms),
    preferredDate: optionalText(row.preferred_date),
    notes: optionalText(row.notes),
  };
}

export async function fetchQuoteRequests(pin: string): Promise<FetchQuoteRequestsResult> {
  const { data, error } = await supabase.rpc('list_quote_requests', { p_pin: pin });
  if (error) throw new Error(error.message);
  if (typeof data !== 'object' || data === null) throw new Error('Unexpected response from server.');

  const payload = data as { status?: unknown; requests?: unknown };
  if (payload.status !== 'ok') {
    if (payload.status === 'invalid' || payload.status === 'locked') {
      return { status: payload.status };
    }
    throw new Error('Unexpected response from server.');
  }
  if (!Array.isArray(payload.requests)) throw new Error('Unexpected response from server.');

  return {
    status: 'ok',
    requests: payload.requests.flatMap((item) => {
      const request = parseQuoteRequest(item);
      return request ? [request] : [];
    }),
  };
}

export async function deleteQuoteRequest(pin: string, id: string): Promise<PinStatus> {
  const { data, error } = await supabase.rpc('delete_quote_request', { p_pin: pin, p_id: id });
  if (error) throw new Error(error.message);
  if (data !== 'ok' && data !== 'invalid' && data !== 'locked') {
    throw new Error('Unexpected response from server.');
  }
  return data;
}
