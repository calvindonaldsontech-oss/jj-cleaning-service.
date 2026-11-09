import React, { useState } from 'react';

const N8N_WEBHOOK_URL = 'https://jj-cleaning-servive.app.n8n.cloud/webhook/jj-cleaning-quote';

export default function App() {
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(2);
  const [sqft, setSqft] = useState(1200);
  const [customPriceOverride, setCustomPriceOverride] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const formulaTotal = (bedrooms * 45) + (bathrooms * 35) + (sqft * 0.45) + 180;
  const activeOverride = parseFloat(customPriceOverride);
  const finalTotal = (!isNaN(activeOverride) && activeOverride > 0)
    ? activeOverride
    : formulaTotal;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      bedrooms,
      bathrooms,
      sqft,
      customPriceOverride,
      finalTotal,
      timestamp: new Date().toISOString(),
      source: 'JJ Cleaning PWA',
    };

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Error submitting quote to n8n:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>JJ Cleaning Services - Instant Quote</h2>
      
      {submitted ? (
        <div style={{ padding: '20px', backgroundColor: '#e6fffa', border: '1px solid #38b2ac', borderRadius: '8px' }}>
          <h3>Quote Submitted Successfully!</h3>
          <p>Thank you! Your quote details have been logged and our team will follow up shortly via SMS.</p>
          <button onClick={() => setSubmitted(false)}>Submit Another Quote</button>
        </div>
      ) : (
        <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label>Bedrooms: </label>
            <input 
              type="number" 
              value={bedrooms} 
              onChange={(e) => setBedrooms(Number(e.target.value))} 
              min="1" 
            />
          </div>

          <div>
            <label>Bathrooms: </label>
            <input 
              type="number" 
              value={bathrooms} 
              onChange={(e) => setBathrooms(Number(e.target.value))} 
              min="1" 
            />
          </div>

          <div>
            <label>Square Footage: </label>
            <input 
              type="number" 
              value={sqft} 
              onChange={(e) => setSqft(Number(e.target.value))} 
              min="100" 
            />
          </div>

          <div>
            <label>Custom Price Override ($): </label>
            <input 
              type="number" 
              value={customPriceOverride} 
              onChange={(e) => setCustomPriceOverride(e.target.value)} 
              placeholder="Optional override" 
            />
          </div>

          <div style={{ fontSize: '1.2em', fontWeight: 'bold', margin: '10px 0' }}>
            Estimated Total: ${finalTotal.toFixed(2)}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ padding: '12px', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {loading ? 'Submitting...' : 'Request Booking & Lock Quote'}
          </button>
        </form>
      )}
    </div>
  );
}
