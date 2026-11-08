import { supabase } from './supabase';

export async function submitQuoteRequest(formData: any) {
  const payload = {
    address: formData.address || '',
    service_type: formData.serviceType || formData.service_type || '',
    sqft: formData.squareFeet || formData.sqft ? String(formData.squareFeet || formData.sqft) : '',
    bedrooms: formData.bedrooms ? String(formData.bedrooms) : '',
    bathrooms: formData.bathrooms ? String(formData.bathrooms) : '',
    preferred_date: formData.preferredDate || formData.preferred_date || null,
    notes: formData.notes || ''
  };

  const { data, error } = await supabase
    .from('quote_requests')
    .insert([payload]);

  if (error) {
    console.error('Supabase submit error:', error);
    throw error;
  }

  return data;
}
