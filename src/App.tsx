import React, { useState, useEffect } from 'react';
import { Sparkles, Shield, CheckCircle2, RefreshCw, Trash2, Phone, Mail, MapPin, Calendar } from 'lucide-react';
import { supabase } from './lib/supabase';

interface QuoteRequest {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  service_type: string;
  sqft: string;
  bedrooms: string;
  bathrooms: string;
  preferred_date: string;
  notes: string;
  status: string;
}

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    serviceType: 'Deep Clean',
    sqft: '',
    bedrooms: '2',
    bathrooms: '2',
    preferredDate: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Admin Data State
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);

  const fetchQuotes = async () => {
    setLoadingQuotes(true);
    const { data, error } = await supabase
      .from('quote_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setQuotes(data as QuoteRequest[]);
    }
    setLoadingQuotes(false);
  };

  useEffect(() => {
    if (isAdmin && isAuthenticated) {
      fetchQuotes();
    }
  }, [isAdmin, isAuthenticated]);

  const handleAdminAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1234' || pinInput === '0000') {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('Invalid Admin PIN. Try 1234');
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('quote_requests')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      fetchQuotes();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this quote request?')) {
      const { error } = await supabase
        .from('quote_requests')
        .delete()
        .eq('id', id);

      if (!error) {
        fetchQuotes();
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

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
      setErrorMessage(`Error: ${error.message}`);
    } else {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header & Branding */}
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">JJ Cleaning Services LLC</h1>
              <p className="text-sm font-medium text-slate-500">Quick Quote & Deposit Estimator</p>
            </div>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setIsAdmin(false)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                !isAdmin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Client Proposal View
            </button>
            <button
              onClick={() => setIsAdmin(true)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                isAdmin ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Admin Mode
            </button>
          </div>
        </div>

        {/* View Switcher: Admin vs Client */}
        {isAdmin ? (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md border border-slate-200 space-y-6">
            {!isAuthenticated ? (
              <form onSubmit={handleAdminAccess} className="max-w-sm mx-auto space-y-4 py-6 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-700">
                  <Shield className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Admin Authentication</h2>
                <p className="text-xs text-slate-500">Enter your PIN to access backend leads (Default: 1234)</p>
                {pinError && <p className="text-xs text-red-600 font-medium">{pinError}</p>}
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter PIN"
                  className="w-full text-center px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-lg tracking-widest focus:ring-2 focus:ring-slate-900 outline-none"
                />
                <button
                  type="submit"
                  className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition"
                >
                  Unlock Admin Dashboard
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-emerald-600" />
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Backend Lead Management</h2>
                      <p className="text-xs text-slate-500">Live submissions from Supabase quote_requests table</p>
                    </div>
                  </div>
                  <button
                    onClick={fetchQuotes}
                    disabled={loadingQuotes}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingQuotes ? 'animate-spin' : ''}`} />
                    Refresh Leads
                  </button>
                </div>

                {loadingQuotes ? (
                  <p className="text-center py-8 text-slate-500 text-sm">Loading backend leads...</p>
                ) : quotes.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-slate-500 text-sm">No quote requests found in backend database.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {quotes.map((q) => (
                      <div key={q.id} className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                          <div>
                            <span className="text-base font-bold text-slate-900">{q.full_name || 'Anonymous Lead'}</span>
                            <span className="text-xs text-slate-400 block sm:inline sm:ml-3">
                              Submitted: {new Date(q.created_at).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={q.status || 'pending'}
                              onChange={(e) => handleStatusChange(q.id, e.target.value)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                            >
                              <option value="pending">Pending</option>
                              <option value="contacted">Contacted</option>
                              <option value="scheduled">Scheduled</option>
                              <option value="completed">Completed</option>
                            </select>
                            <button
                              onClick={() => handleDelete(q.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition"
                              title="Delete Lead"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-slate-600">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <a href={`mailto:${q.email}`} className="hover:underline font-medium text-slate-800">{q.email || 'N/A'}</a>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <a href={`tel:${q.phone}`} className="hover:underline font-medium text-slate-800">{q.phone || 'N/A'}</a>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span>{q.address || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>Pref Date: {q.preferred_date || 'Flexible'}</span>
                          </div>
                          <div><strong className="text-slate-800">Service:</strong> {q.service_type || 'Standard'}</div>
                          <div><strong className="text-slate-800">Specs:</strong> {q.sqft ? `${q.sqft} sq ft | ` : ''}{q.bedrooms} Bed / {q.bathrooms} Bath</div>
                        </div>

                        {q.notes && (
                          <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-700">
                            <strong className="block text-slate-900 mb-0.5">Notes / Special Instructions:</strong>
                            {q.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md border border-slate-200 max-w-2xl mx-auto">
            {submitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Request Received!</h2>
                <p className="text-slate-600 max-w-md mx-auto">
                  Thank you! We have logged your property details and will reach out shortly with your estimate.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition"
                >
                  Submit Another Quote
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Request a Quote</h2>
                  <p className="text-sm text-slate-500">Tell us about your property and we will prepare a custom proposal.</p>
                </div>

                {errorMessage && (
                  <div className="p-4 text-sm bg-red-50 text-red-700 border border-red-200 rounded-xl">
                    {errorMessage}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Full Name *</label>
                    <input
                      required
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Calvin Donaldson"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Email Address *</label>
                      <input
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="name@example.com"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Phone Number *</label>
                      <input
                        required
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="(555) 000-0000"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Service Address *</label>
                    <input
                      required
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="123 Street Name, City, State"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Service Type</label>
                      <select
                        name="serviceType"
                        value={formData.serviceType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                      >
                        <option value="Deep Clean">Deep Clean</option>
                        <option value="Standard Clean">Standard Clean</option>
                        <option value="Move In/Out">Move In/Out</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Property Sq Ft</label>
                      <input
                        type="text"
                        name="sqft"
                        value={formData.sqft}
                        onChange={handleChange}
                        placeholder="e.g. 1500"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Bedrooms *</label>
                      <input
                        required
                        type="text"
                        name="bedrooms"
                        value={formData.bedrooms}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Bathrooms *</label>
                      <input
                        required
                        type="text"
                        name="bathrooms"
                        value={formData.bathrooms}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Preferred Service Date</label>
                    <input
                      type="date"
                      name="preferredDate"
                      value={formData.preferredDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Notes / Special Instructions</label>
                    <textarea
                      name="notes"
                      rows={3}
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Add any specific details about the job..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                    ></textarea>
                  </div>
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-600/25 transition duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? 'Saving Request...' : 'Submit Quote Request'}
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
