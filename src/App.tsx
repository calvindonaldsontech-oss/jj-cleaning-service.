import React, { useState } from 'react';

export default function ProposalBuilder() {
  // State variables for form inputs and pricing
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(2);
  const [sqft, setSqft] = useState(1300);
  const [customPriceOverride, setCustomPriceOverride] = useState('');
  
  // Base calculated formula total
  const formulaTotal = (bedrooms * 45) + (bathrooms * 35) + (sqft * 0.45) + 180;
  
  // Dynamic price logic: use override if entered, otherwise fallback to formula
  const activeOverride = parseFloat(customPriceOverride);
  const finalTotal = (!isNaN(activeOverride) && activeOverride > 0) 
    ? activeOverride 
    : formulaTotal;

  // Deposit and balance splits derived directly from final total
  const depositAmount = Number((finalTotal * 0.5).toFixed(2));
  const remainingBalance = Number((finalTotal - depositAmount).toFixed(2));

  // Single function to handle database save & cache-busted redirect
  const handleSaveAndPreview = async () => {
    const payload = {
      bedrooms,
      bathrooms,
      sqft,
      customPriceOverride: !isNaN(activeOverride) && activeOverride > 0 ? activeOverride : null,
      totalJobEstimate: finalTotal,
      depositRequired: depositAmount,
      remainingBalance,
      updatedAt: new Date().toISOString()
    };

    try {
      // 1. Post lead data to API / database
      await fetch('/api/save-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // 2. Redirect with timestamp cache-buster parameter (&t=...)
      const cacheBuster = Date.now();
      window.location.href = `/?view=proposal&t=${cacheBuster}`;
    } catch (error) {
      console.error('Error saving lead:', error);
      alert('Failed to save lead. Please check network connection.');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">JJ Cleaning Services - Job Details</h2>
      
      {/* Job Details Inputs */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
          <input 
            type="number" 
            value={bedrooms} 
            onChange={(e) => setBedrooms(Number(e.target.value))}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
          <input 
            type="number" 
            value={bathrooms} 
            onChange={(e) => setBathrooms(Number(e.target.value))}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Property Sq Footage</label>
          <input 
            type="number" 
            value={sqft} 
            onChange={(e) => setSqft(Number(e.target.value))}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
          />
        </div>
      </div>

      {/* Flat Rate Override Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Custom Price Override (optional flat amount)
        </label>
        <input 
          type="number" 
          step="0.01"
          placeholder="e.g. 1840.25"
          value={customPriceOverride} 
          onChange={(e) => setCustomPriceOverride(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-lg font-semibold text-blue-900" 
        />
      </div>

      {/* Real-Time Total Display */}
      <div className="bg-slate-900 text-white p-6 rounded-lg text-right">
        <span className="text-sm uppercase tracking-wider block text-gray-400">Total Job Estimate</span>
        <span className="text-4xl font-bold">${finalTotal.toFixed(2)}</span>
      </div>

      {/* Deposit Breakdown */}
      <div className="border-t pt-4 space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>50% Retainer Deposit Required:</span>
          <span className="font-semibold">${depositAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Remaining Balance Due Upon Completion:</span>
          <span className="font-semibold">${remainingBalance.toFixed(2)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <button 
          onClick={handleSaveAndPreview}
          className="flex-1 bg-teal-800 hover:bg-teal-900 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Save Lead & Generate Proposal
        </button>
      </div>
    </div>
  );
}
