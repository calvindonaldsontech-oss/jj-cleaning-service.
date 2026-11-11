import React, { useState } from 'react';

const N8N_WEBHOOK_URL = 'https://jj-cleaning-servive.app.n8n.cloud/webhook/jj-cleaning-quote';

export default function App() {
  const [step, setStep] = useState<'contact' | 'calculator'>('contact');

  const [clientData, setClientData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(2);
  const [sqft, setSqft] = useState(1200);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientData.name || !clientData.email || !clientData.phone || !clientData.address) {
      alert('Please fill out all contact and address fields.');
      return;
    }
    setStep('calculator');
  };

  const handleBookingSubmit = async () => {
    setSubmitting(true);
    const payload = {
      ...clientData,
      bedrooms,
      bathrooms,
      sqft
    };

    try {
      await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Error sending lead:', error);
      alert('Failed to submit quote request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05)', textAlign: 'center', maxWidth: '440px', width: '100%', border: '1px solid #e2e8f0' }}>
          <div style={{ width: '60px', height: '60px', background: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 20px' }}>✓</div>
          <h2 style={{ color: '#0f172a', fontSize: '22px', fontWeight: '700', marginBottom: '10px' }}>Request Received!</h2>
          <p style={{ color: '#475569', fontSize: '15px', lineHeight: '1.5' }}>Thank you, <b>{clientData.name}</b>. We have received your property details for <b>{clientData.address}</b> and JJ Cleaning Services will contact you shortly with your custom quote.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'inline-block', background: '#2563eb', color: 'white', width: '48px', height: '48px', borderRadius: '12px', lineHeight: '48px', fontSize: '22px', fontWeight: 'bold', marginBottom: '10px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}>
          JJ
        </div>
        <h1 style={{ color: '#0f172a', fontSize: '24px', fontWeight: '700', margin: '0 0 4px 0' }}>JJ Cleaning Services LLC</h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Professional Residential & Commercial Cleaning</p>
      </div>

      <div style={{ background: 'white', width: '100%', maxWidth: '440px', padding: '32px', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        
        {/* Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#2563eb' }}>
              {step === 'contact' ? 'Step 1 of 2' : 'Step 2 of 2'}
            </span>
            <h3 style={{ margin: '2px 0 0 0', fontSize: '16px', color: '#1e293b' }}>
              {step === 'contact' ? 'Contact Information' : 'Property Layout'}
            </h3>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ width: '28px', height: '6px', borderRadius: '3px', background: '#2563eb' }}></div>
            <div style={{ width: '28px', height: '6px', borderRadius: '3px', background: step === 'calculator' ? '#2563eb' : '#e2e8f0' }}></div>
          </div>
        </div>

        {step === 'contact' ? (
          <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#334155' }}>Full Name</label>
              <input 
                type="text" 
                required
                value={clientData.name} 
                onChange={e => setClientData({...clientData, name: e.target.value})}
                placeholder="John Doe"
                style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#334155' }}>Email Address</label>
              <input 
                type="email" 
                required
                value={clientData.email} 
                onChange={e => setClientData({...clientData, email: e.target.value})}
                placeholder="john@example.com"
                style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#334155' }}>Phone Number</label>
              <input 
                type="tel" 
                required
                value={clientData.phone} 
                onChange={e => setClientData({...clientData, phone: e.target.value})}
                placeholder="(555) 000-0000"
                style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#334155' }}>Service Address</label>
              <input 
                type="text" 
                required
                value={clientData.address} 
                onChange={e => setClientData({...clientData, address: e.target.value})}
                placeholder="123 Main St, City, State"
                style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>

            <button 
              type="submit" 
              style={{ background: '#2563eb', color: 'white', border: 'none', padding: '13px', borderRadius: '8px', fontWeight: '600', fontSize: '15px', cursor: 'pointer', marginTop: '8px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}
            >
              Next: Property Details →
            </button>
          </form>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '13px', color: '#475569' }}>Client: <b>{clientData.name}</b></span>
              <button 
                onClick={() => setStep('contact')} 
                style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '13px', fontWeight: '600', textDecoration: 'underline' }}
              >
                Edit
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Bedrooms</label>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#2563eb' }}>{bedrooms}</span>
                </div>
                <input 
                  type="range" min="1" max="10" value={bedrooms} 
                  onChange={e => setBedrooms(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#2563eb', cursor: 'pointer' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Bathrooms</label>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#2563eb' }}>{bathrooms}</span>
                </div>
                <input 
                  type="range" min="1" max="10" step="0.5" value={bathrooms} 
                  onChange={e => setBathrooms(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#2563eb', cursor: 'pointer' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#334155' }}>Approx. Square Footage</label>
                <input 
                  type="number" value={sqft} 
                  onChange={e => setSqft(parseInt(e.target.value) || 0)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>

              <button 
                onClick={handleBookingSubmit}
                disabled={submitting}
                style={{ background: '#16a34a', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: '600', fontSize: '16px', cursor: 'pointer', marginTop: '10px', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)' }}
              >
                {submitting ? 'Submitting Request...' : 'Submit Quote Request'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
