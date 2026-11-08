import React, { useState } from 'react';
import { supabase } from './lib/supabase';

export default function App() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    serviceType: '',
    sqft: '',
    bedrooms: '',
    bathrooms: '',
    preferredDate: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const payload = {
      full_name: formData.fullName || null,
      email: formData.email || null,
      phone: formData.phone || null,
      address: formData.address || null,
      service_type: formData.serviceType || null,
      sqft: formData.sqft ? String(formData.sqft) : null,
      bedrooms: formData.bedrooms ? String(formData.bedrooms) : null,
      bathrooms: formData.bathrooms ? String(formData.bathrooms) : null,
      preferred_date: formData.preferredDate || null,
      notes: formData.notes || null,
      status: 'pending'
    };

    const { error } = await supabase
      .from('quote_requests')
      .insert([payload]);

    setLoading(false);

    if (error) {
      console.error('Supabase error:', error);
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('Quote request submitted successfully!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">JJ Cleaning Services LLC | Quote Calculator</h1>
        {message && <div className="p-3 mb-4 text-sm rounded bg-blue-100 text-blue-800">{message}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Full Name *</label>
            <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Email *</label>
              <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium">Phone *</label>
              <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Service Address *</label>
            <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Service Type</label>
              <select name="serviceType" value={formData.serviceType} onChange={handleChange} className="w-full border p-2 rounded">
                <option value="">Not sure yet</option>
                <option value="Deep Clean">Deep Clean</option>
                <option value="Standard Clean">Standard Clean</option>
                <option value="Move In/Out">Move In/Out</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Property Sq Ft</label>
              <input type="text" name="sqft" value={formData.sqft} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Bedrooms *</label>
              <input required type="text" name="bedrooms" value={formData.bedrooms} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium">Bathrooms *</label>
              <input required type="text" name="bathrooms" value={formData.bathrooms} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Preferred Date</label>
            <input type="date" name="preferredDate" value={formData.preferredDate} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Notes / Comments</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} className="w-full border p-2 rounded"></textarea>
          </div>
          <button disabled={loading} type="submit" className="w-full bg-emerald-600 text-white p-3 rounded font-medium hover:bg-emerald-700">
            {loading ? 'Submitting...' : 'Submit Quote Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
