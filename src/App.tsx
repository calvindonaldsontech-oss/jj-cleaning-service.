import React, { useState } from 'react';

export default function App() {
  // Step state: 'contact' or 'calculator'
  const [step, setStep] = useState<'contact' | 'calculator'>('contact');

  // Client info state
  const [clientData, setClientData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  // Property details state (no automated pricing shown)
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
      // Replace with your active n8n webhook URL
      const webhookUrl = 'YOUR_N8N_WEBHOOK_URL_HERE';
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Error sending lead:', error);
      alert('Failed to submit booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0fdf4', padding: '20px', fontFamily: 'sans-serif' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '400px' }}>
          <h2 style={{ color: '#16a34a', marginBottom: '10px' }}>Request Received!</h2>
          <p style={{ color: '#4b5563' }}>Thank you, {clientData.name}. We have received your property details for {clientData.address} and JJ Cleaning Services will contact you shortly with your custom quote.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '20px', fontFamily: 'sans-serif', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: 'white', width: '100%', maxWidth: '500px', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        
        <h2 style={{ color: '#1e293b', textAlign: 'center', marginBottom: '5px' }}>JJ Cleaning Services LLC</h2>
        
        {step === 'contact' ? (
          <div>
            <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '20px' }}>Please enter your details to request a custom cleaning quote.</p>
            <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px', color: '#334155' }}>Full Name</label>
                <input 
                  type="text" 
                  required
                  value={clientData.name} 
                  onChange={e => setClientData({...clientData, name: e.target.value})}
                  placeholder="John Doe"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px', color: '#334155' }}>Email Address</label>
                <input 
                  type="email" 
                  required
                  value={clientData.email} 
                  onChange={e => setClientData({...clientData, email: e.target.value})}
                  placeholder="john@example.com"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px', color: '#334155' }}>Phone Number</label>
                <input 
                  type="tel" 
                  required
                  value={clientData.phone} 
                  onChange={e => setClientData({...clientData, phone: e.target.value})}
                  placeholder="(555) 000-0000"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px', color: '#334155' }}>Service Address</label>
                <input 
                  type="text" 
                  required
                  value={clientData.address} 
                  onChange={e => setClientData({...clientData, address: e.target.value})}
                  placeholder="123 Main St, City, State"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <button 
                type="submit" 
                style={{ background: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}
              >
                Next: Property Details
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Welcome, <b>{clientData.name}</b></p>
              <button 
                onClick={() => setStep('contact')} 
                style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}
              >
                Edit Info
              </button>
            </div>

            <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '20px' }}>Select your property layout for your custom quote request.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px', color: '#334155' }}>Bedrooms: {bedrooms}</label>
                <input 
                  type="range" min="1" max="10" value={bedrooms} 
                  onChange={e => setBedrooms(parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px', color: '#334155' }}>Bathrooms: {bathrooms}</label>
                <input 
                  type="range" min="1" max="10" step="0.5" value={bathrooms} 
                  onChange={e => setBathrooms(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px', color: '#334155' }}>Square Footage: {sqft} sq ft</label>
                <input 
                  type="number" value={sqft} 
                  onChange={e => setSqft(parseInt(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <button 
                onClick={handleBookingSubmit}
                disabled={submitting}
                style={{ background: '#16a34a', color: 'white', border: 'none', padding: '14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', marginTop: '15px' }}
              >
                {submitting ? 'Submitting...' : 'Submit Quote Request'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
