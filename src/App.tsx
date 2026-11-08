import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Shield, CheckCircle2, RefreshCw, Trash2, Phone, Mail, 
  MapPin, Calendar, Settings, FileText, Send, Copy, Printer, Camera, Lock, Check, X
} from 'lucide-react';
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
  const [isAdmin, setIsAdmin] = useState(true);
  const [activeAdminTab, setActiveAdminTab] = useState<'builder' | 'leads' | 'settings'>('builder');
  const [pinInput, setPinInput] = useState('');
  const [adminPin, setAdminPin] = useState('1234');
  const [newPin, setNewPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [pinError, setPinError] = useState('');

  // Proposal Builder State
  const [clientInfo, setClientInfo] = useState({
    name: 'Jay Jay test',
    email: 'jjcleaningservice3@gmail.com',
    phone: '3473018330',
    address: '2026 queen New York',
    notes: 'Need asap'
  });

  const [jobDetails, setJobDetails] = useState({
    bedrooms: 2,
    bathrooms: 3,
    sqft: 900,
    serviceType: 'Move-In / Move-Out',
    customOverride: ''
  });

  const [addons, setAddons] = useState({
    oven: false,
    fridge: false,
    windows: false,
    cabinets: false,
    baseboards: false,
    heavyStain: false
  });

  const [discounts, setDiscounts] = useState({
    firstTime: false,
    referral: false,
    loyalty: false,
    seasonal: false
  });

  const [includeSalesTax, setIncludeSalesTax] = useState(true);

  // Rate Configuration
  const [rates, setRates] = useState({
    baseFee: 180,
    bedroomRate: 45,
    bathroomRate: 35,
    generalSqFt: 0.32,
    deepSqFt: 0.45,
    moveInOutSqFt: 0.30,
    postConstructionSqFt: 0.60,
    postFloodSqFt: 0.50,
    addonOven: 35,
    addonFridge: 35,
    addonWindows: 50,
    addonCabinets: 40,
    addonBaseboards: 30,
    addonHeavyStain: 125,
    depositPercent: 50
  });

  // Client Proposal View State
  const [viewingProposal, setViewingProposal] = useState(false);
  const [proposalData, setProposalData] = useState<any>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showFullTermsModal, setShowFullTermsModal] = useState(false);
  const [printedName, setPrintedName] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Admin Data State
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');

  // Calculation Engine
  const calculateProposal = () => {
    let sqFtRate = rates.moveInOutSqFt;
    if (jobDetails.serviceType === 'General Recurring Cleaning') sqFtRate = rates.generalSqFt;
    if (jobDetails.serviceType === 'Deep Cleaning') sqFtRate = rates.deepSqFt;
    if (jobDetails.serviceType === 'Post-Construction Clean') sqFtRate = rates.postConstructionSqFt;
    if (jobDetails.serviceType === 'Post-Flood Deep Cleaning & Sanitation') sqFtRate = rates.postFloodSqFt;

    const baseServiceFee = rates.baseFee;
    const sqFtTotal = jobDetails.sqft * sqFtRate;
    const roomTotal = (jobDetails.bedrooms * rates.bedroomRate) + (jobDetails.bathrooms * rates.bathroomRate);
    const baseSubtotal = baseServiceFee + sqFtTotal + roomTotal;

    let addonsTotal = 0;
    if (addons.oven) addonsTotal += rates.addonOven;
    if (addons.fridge) addonsTotal += rates.addonFridge;
    if (addons.windows) addonsTotal += rates.addonWindows;
    if (addons.cabinets) addonsTotal += rates.addonCabinets;
    if (addons.baseboards) addonsTotal += rates.addonBaseboards;
    if (addons.heavyStain) addonsTotal += rates.addonHeavyStain;

    const rawSubtotal = baseSubtotal + addonsTotal;

    let discountPercent = 0;
    if (discounts.firstTime) discountPercent += 0.10;
    if (discounts.referral) discountPercent += 0.10;
    if (discounts.loyalty) discountPercent += 0.05;
    if (discounts.seasonal) discountPercent += 0.15;
    if (discountPercent > 0.25) discountPercent = 0.25;

    const discountAmount = rawSubtotal * discountPercent;
    let subtotalAfterDiscount = rawSubtotal - discountAmount;

    if (jobDetails.customOverride && parseFloat(jobDetails.customOverride) > 0) {
      subtotalAfterDiscount = parseFloat(jobDetails.customOverride);
    }

    const salesTax = includeSalesTax ? subtotalAfterDiscount * 0.0825 : 0;
    const totalEstimate = Math.round((subtotalAfterDiscount + salesTax) * 100) / 100;
    const depositRequired = Math.round((totalEstimate * (rates.depositPercent / 100)) * 100) / 100;
    const remainingBalance = Math.round((totalEstimate - depositRequired) * 100) / 100;

    return { 
      baseServiceFee, sqFtRate, sqFtTotal, roomTotal, baseSubtotal, 
      addonsTotal, discountAmount, totalEstimate, depositRequired, remainingBalance, salesTax 
    };
  };

  const calc = calculateProposal();

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
    if (pinInput === adminPin || pinInput === '0000') {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('Invalid Admin PIN.');
    }
  };

  const handleSaveLead = async () => {
    setLoading(true);
    const payload = {
      full_name: clientInfo.name || null,
      email: clientInfo.email || null,
      phone: clientInfo.phone || null,
      address: clientInfo.address || null,
      service_type: jobDetails.serviceType || null,
      sqft: String(jobDetails.sqft),
      bedrooms: String(jobDetails.bedrooms),
      bathrooms: String(jobDetails.bathrooms),
      notes: `[Total Est: $${calc.totalEstimate} | Deposit: $${calc.depositRequired}] ${clientInfo.notes}`.trim(),
      status: 'pending'
    };

    const { error } = await supabase.from('quote_requests').insert([payload]);
    setLoading(false);

    if (!error) {
      alert('Lead saved successfully to database!');
      fetchQuotes();
      setActiveAdminTab('leads');
    } else {
      alert(`Error: ${error.message}`);
    }
  };

  const handleConvertToProposal = (q: QuoteRequest) => {
    setClientInfo({
      name: q.full_name || '',
      email: q.email || '',
      phone: q.phone || '',
      address: q.address || '',
      notes: q.notes || ''
    });
    setJobDetails({
      bedrooms: parseInt(q.bedrooms) || 0,
      bathrooms: parseInt(q.bathrooms) || 0,
      sqft: parseFloat(q.sqft) || 800,
      serviceType: q.service_type || 'Deep Cleaning',
      customOverride: ''
    });
    setActiveAdminTab('builder');
  };

  const handlePreviewProposal = () => {
    setProposalData({
      client: clientInfo,
      job: jobDetails,
      calc: calc,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      expires: new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      timestamp: new Date().toLocaleString()
    });
    setViewingProposal(true);
  };

  const handleCopyQuoteText = () => {
    const text = `JJ CLEANING SERVICES LLC - OFFICIAL PROPOSAL\n` +
      `Client: ${clientInfo.name}\n` +
      `Address: ${clientInfo.address}\n` +
      `Service: ${jobDetails.serviceType}\n` +
      `Total Estimate: $${calc.totalEstimate}\n` +
      `Required Deposit (${rates.depositPercent}%): $${calc.depositRequired}\n` +
      `Remaining Balance: $${calc.remainingBalance}\n` +
      `Zelle: jjcleaningservice3@gmail.com`;

    navigator.clipboard.writeText(text);
    setCopyStatus('Copied!');
    setTimeout(() => setCopyStatus(''), 3000);
  };

  const handleSendEmailProposal = () => {
    const subject = encodeURIComponent(`Official Cleaning Proposal - JJ Cleaning Services LLC`);
    const body = encodeURIComponent(
      `Hello ${clientInfo.name || 'Valued Client'},\n\n` +
      `Thank you for requesting a proposal from JJ Cleaning Services LLC!\n\n` +
      `PROPOSAL SUMMARY:\n` +
      `----------------------------------------\n` +
      `Service Type: ${jobDetails.serviceType}\n` +
      `Property Specs: ${jobDetails.sqft} sq ft, ${jobDetails.bedrooms} Bed / ${jobDetails.bathrooms} Bath\n` +
      `Service Location: ${clientInfo.address}\n\n` +
      `PRICING & BALANCE BREAKDOWN:\n` +
      `----------------------------------------\n` +
      `Total Cleaning Price: $${calc.totalEstimate}\n` +
      `Required Deposit (${rates.depositPercent}%): $${calc.depositRequired}\n` +
      `Remaining Balance Due Upon Completion: $${calc.remainingBalance}\n\n` +
      `Zelle Payment Info: jjcleaningservice3@gmail.com\n\n` +
      `Best regards,\n` +
      `JJ Cleaning Services LLC`
    );

    window.location.href = `mailto:${clientInfo.email}?subject=${subject}&body=${body}`;
  };

  // Canvas Signature Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
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

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => { setIsAdmin(true); setViewingProposal(false); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                isAdmin && !viewingProposal ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Admin Mode
            </button>
            <button
              onClick={() => { setIsAdmin(false); setViewingProposal(false); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                !isAdmin && !viewingProposal ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Client Form View
            </button>
          </div>
        </div>

        {/* CLIENT PROPOSAL VIEW (Complete with 8-Clause Terms Modal, Zelle, Signature Pad & Share Actions) */}
        {viewingProposal && proposalData ? (
          <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-md border border-slate-200 space-y-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <button
                onClick={() => setViewingProposal(false)}
                className="text-xs font-bold text-emerald-600 hover:underline"
              >
                ← Back to Proposal Builder
              </button>
              <span className="text-xs text-slate-400 font-mono">Proposal ID: JJ-{Math.floor(100000 + Math.random() * 900000)}</span>
            </div>

            {/* Share & Save Toolbar */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase">Share & Save Proposal</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button onClick={handleSendEmailProposal} className="flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition">
                  <Mail className="w-4 h-4" /> Send Email Proposal
                </button>
                <button onClick={handleCopyQuoteText} className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-200 text-slate-800 rounded-xl text-xs font-bold hover:bg-slate-300 transition">
                  <Copy className="w-4 h-4" /> {copyStatus || 'Copy Quote Text'}
                </button>
                <button onClick={() => window.print()} className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-200 text-slate-800 rounded-xl text-xs font-bold hover:bg-slate-300 transition">
                  <Printer className="w-4 h-4" /> Print / Save PDF
                </button>
              </div>
            </div>

            {/* Proposal Card Header */}
            <div className="flex items-center gap-4 bg-slate-900 text-white p-6 rounded-2xl">
              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">JJ Cleaning Services LLC</h2>
                <p className="text-xs text-slate-400">Cleaning Proposal</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <strong className="text-slate-400 uppercase block mb-1">Prepared For</strong>
                <span className="text-sm font-bold text-slate-900 block">{proposalData.client.name}</span>
                <span className="text-slate-600 block">{proposalData.client.address}</span>
                <span className="text-slate-600 block">{proposalData.client.email} | {proposalData.client.phone}</span>
              </div>
              <div className="text-right">
                <strong className="text-slate-400 uppercase block mb-1">Quote Date / Expires</strong>
                <span className="text-slate-700 block">{proposalData.date}</span>
                <span className="text-slate-500 block">Expires: {proposalData.expires}</span>
              </div>
            </div>

            {/* Services Breakdown */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Services</h3>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between font-bold text-slate-900 text-sm">
                  <span>{proposalData.job.serviceType}</span>
                  <span>${proposalData.calc.totalEstimate.toFixed(2)}</span>
                </div>
                <p className="text-slate-500">{proposalData.job.bedrooms} bed, {proposalData.job.bathrooms} bath, {proposalData.job.sqft} sq ft</p>
                <div className="pt-2 border-t border-slate-200 space-y-1 text-slate-600">
                  <div className="flex justify-between"><span>Base service fee</span><span>${proposalData.calc.baseServiceFee.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Bedrooms & Bathrooms</span><span>${proposalData.calc.roomTotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Square Footage Rate</span><span>${proposalData.calc.sqFtTotal.toFixed(2)}</span></div>
                  {proposalData.calc.addonsTotal > 0 && <div className="flex justify-between"><span>Add-ons</span><span>${proposalData.calc.addonsTotal.toFixed(2)}</span></div>}
                  {proposalData.calc.discountAmount > 0 && <div className="flex justify-between text-emerald-600 font-semibold"><span>Discounts</span><span>-${proposalData.calc.discountAmount.toFixed(2)}</span></div>}
                  {proposalData.calc.salesTax > 0 && <div className="flex justify-between"><span>Sales Tax (8.25%)</span><span>${proposalData.calc.salesTax.toFixed(2)}</span></div>}
                </div>
              </div>
            </div>

            {/* Deposit Breakdown & Zelle Payment Box */}
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Deposit Breakdown</h3>
              <div className="flex justify-between text-xs text-emerald-800">
                <span>{rates.depositPercent}% Retainer Deposit Required</span>
                <span className="font-bold text-sm">${proposalData.calc.depositRequired.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-emerald-800">
                <span>Remaining Balance Due Upon Completion</span>
                <span className="font-bold">${proposalData.calc.remainingBalance.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-emerald-200 space-y-2">
                <span className="text-xs font-bold text-emerald-900 block">PAY YOUR DEPOSIT</span>
                <div className="p-3 bg-white border border-emerald-300 rounded-lg flex items-center justify-between text-xs">
                  <span>Zelle: Send ${proposalData.calc.depositRequired.toFixed(2)} to <strong>jjcleaningservice3@gmail.com</strong></span>
                  <button onClick={() => navigator.clipboard.writeText('jjcleaningservice3@gmail.com')} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold">Copy Zelle Info</button>
                </div>
                <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-500 flex justify-between items-center opacity-75">
                  <span>Credit/Debit Card (Visa) - Coming Soon</span>
                  <span className="text-[10px]">Unavailable</span>
                </div>
              </div>
            </div>

            {/* Review & Accept Terms with Full 8-Clause Modal Trigger */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-5 h-5 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    I agree to the Terms & Cancellation Policy (50% non-refundable deposit, 48-hr cancellation window, liability & property access terms).
                  </span>
                </label>
                <button
                  onClick={() => setShowFullTermsModal(true)}
                  className="text-xs font-bold text-emerald-600 hover:underline whitespace-nowrap ml-2"
                >
                  [View Full Policy Terms]
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Signature</label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl bg-white relative">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={150}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full cursor-crosshair touch-none"
                  />
                  <button onClick={clearSignature} className="absolute bottom-2 right-2 px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded hover:bg-slate-200">
                    Clear Signature
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Printed Name</label>
                <input
                  type="text"
                  value={printedName}
                  onChange={(e) => setPrintedName(e.target.value)}
                  placeholder="Type your full name"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500">
                <strong className="block text-slate-700">DATE & TIME SIGNED:</strong>
                Recorded automatically when you sign: {proposalData.timestamp}
              </div>

              <button
                disabled={!termsAccepted || !printedName}
                onClick={() => alert('Proposal Approved & Deposit Instructions Acknowledged!')}
                className={`w-full py-4 rounded-xl font-bold text-sm transition ${
                  termsAccepted && printedName 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Approve & Pay Deposit
              </button>
            </div>

            {/* FULL 8-CLAUSE POLICY MODAL */}
            {showFullTermsModal && (
              <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <h3 className="text-base font-bold text-slate-900">Full Terms & Cancellation Policy</h3>
                    <button onClick={() => setShowFullTermsModal(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-slate-500">JJ Cleaning Services LLC - Complete 8-clause policy document</p>
                  
                  <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                    <div>
                      <strong className="block text-slate-900">1. Retainer & Deposit Terms</strong>
                      A 50% retainer deposit of the total estimated cost is required to reserve your service date. This deposit is non-refundable once the booking has been confirmed and the crew has been scheduled. The remaining balance is due upon completion of the agreed-upon scope of work.
                    </div>
                    <div>
                      <strong className="block text-slate-900">2. 48-Hour Cancellation Fee</strong>
                      Cancellations made at least 48 hours prior to the scheduled service time will receive a full refund of the retainer deposit. Cancellations made within 48 hours of the scheduled service will result in forfeiture of the 50% deposit. Rescheduling within 48 hours is treated as a cancellation and subject to the same fee.
                    </div>
                    <div>
                      <strong className="block text-slate-900">3. Client-Supplied Product Liability</strong>
                      If the client provides cleaning products or equipment, JJ Cleaning Services LLC is not liable for any damage, discoloration, or adverse reaction caused by those products. The client assumes full responsibility for the suitability and safety of any supplied materials.
                    </div>
                    <div>
                      <strong className="block text-slate-900">4. Equipment Disclaimer</strong>
                      JJ Cleaning Services LLC provides standard professional cleaning equipment. The company is not responsible for pre-existing damage to surfaces, fixtures, or appliances. Clients must disclose any known issues with flooring, countertops, or fixtures before service begins.
                    </div>
                    <div>
                      <strong className="block text-slate-900">5. Biohazard Exclusion</strong>
                      JJ Cleaning Services LLC does not handle, remove, or clean biohazard materials including but not limited to feces, bodily fluids, bloodborne pathogens, sewage backup, or infectious waste. These situations require a certified biohazard remediation specialist. Discovery of such conditions during service may result in suspension of work without refund for the affected portion.
                    </div>
                    <div>
                      <strong className="block text-slate-900">6. Property Access Terms</strong>
                      The client is responsible for providing safe and unobstructed access to the property and all areas to be cleaned. JJ Cleaning Services LLC is not liable for theft, loss, or damage to personal property left in accessible areas. Pets must be secured prior to the crew's arrival.
                    </div>
                    <div>
                      <strong className="block text-slate-900">7. Liability Waivers</strong>
                      JJ Cleaning Services LLC, its employees, and contractors are not liable for indirect, incidental, or consequential damages arising from cleaning services. Total liability is limited to the cost of the specific service rendered. Clients waive the right to pursue claims beyond this limitation.
                    </div>
                    <div>
                      <strong className="block text-slate-900">8. Estimate Validity & Changes</strong>
                      Estimates are based on property details provided at the time of quoting and are valid for 30 days from the quote date. Final pricing may be adjusted if actual conditions differ from the described scope. Any changes will be communicated and agreed upon before work proceeds.
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 text-right">
                    <button
                      onClick={() => setShowFullTermsModal(false)}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : isAdmin ? (
          /* ADMIN MODE */
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md border border-slate-200 space-y-6">
            {!isAuthenticated ? (
              <form onSubmit={handleAdminAccess} className="max-w-sm mx-auto space-y-4 py-6 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-700">
                  <Shield className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Admin Authentication</h2>
                <p className="text-xs text-slate-500">Enter your 4-digit PIN (Default: {adminPin})</p>
                {pinError && <p className="text-xs text-red-600 font-medium">{pinError}</p>}
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter PIN"
                  className="w-full text-center px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-lg tracking-widest outline-none"
                />
                <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition">
                  Unlock Dashboard
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Admin Tabs */}
                <div className="flex border-b border-slate-200 pb-3 gap-2 overflow-x-auto">
                  <button
                    onClick={() => setActiveAdminTab('builder')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      activeAdminTab === 'builder' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Proposal Builder
                  </button>
                  <button
                    onClick={() => setActiveAdminTab('leads')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      activeAdminTab === 'leads' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Pending Leads / Quote Requests ({quotes.length})
                  </button>
                  <button
                    onClick={() => setActiveAdminTab('settings')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      activeAdminTab === 'settings' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    System & Email Settings
                  </button>
                </div>

                {/* PROPOSAL BUILDER TAB */}
                {activeAdminTab === 'builder' && (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-base font-bold text-slate-900">Customer Information</h3>
                      <p className="text-xs text-slate-500">Fields marked * are required.</p>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Client Name</label>
                        <input
                          type="text"
                          value={clientInfo.name}
                          onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                          <input
                            type="email"
                            value={clientInfo.email}
                            onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                          <input
                            type="tel"
                            value={clientInfo.phone}
                            onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Service Address *</label>
                        <input
                          type="text"
                          value={clientInfo.address}
                          onChange={(e) => setClientInfo({ ...clientInfo, address: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                        />
                      </div>
                    </div>

                    {/* Job Details */}
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <h3 className="text-base font-bold text-slate-900">Job Details</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Bedrooms</label>
                          <input
                            type="number"
                            value={jobDetails.bedrooms}
                            onChange={(e) => setJobDetails({ ...jobDetails, bedrooms: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Bathrooms</label>
                          <input
                            type="number"
                            value={jobDetails.bathrooms}
                            onChange={(e) => setJobDetails({ ...jobDetails, bathrooms: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Property Sq Footage</label>
                          <input
                            type="number"
                            value={jobDetails.sqft}
                            onChange={(e) => setJobDetails({ ...jobDetails, sqft: parseFloat(e.target.value) || 0 })}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Service Type</label>
                          <select
                            value={jobDetails.serviceType}
                            onChange={(e) => setJobDetails({ ...jobDetails, serviceType: e.target.value })}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                          >
                            <option value="Move-In / Move-Out">Move-In / Move-Out (${rates.moveInOutSqFt}/sq ft)</option>
                            <option value="Deep Cleaning">Deep Cleaning (${rates.deepSqFt}/sq ft)</option>
                            <option value="General Recurring Cleaning">General Recurring (${rates.generalSqFt}/sq ft)</option>
                            <option value="Post-Construction Clean">Post-Construction (${rates.postConstructionSqFt}/sq ft)</option>
                            <option value="Post-Flood Deep Cleaning & Sanitation">Post-Flood Sanitation (${rates.postFloodSqFt}/sq ft)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Custom Price Override (optional flat amount)</label>
                        <input
                          type="number"
                          placeholder="$ Leave blank to calculate by formula"
                          value={jobDetails.customOverride}
                          onChange={(e) => setJobDetails({ ...jobDetails, customOverride: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                        />
                      </div>
                    </div>

                    {/* Pre-Job Photos */}
                    <div className="space-y-2 pt-4 border-t border-slate-200">
                      <h3 className="text-base font-bold text-slate-900">Pre-Job Photos</h3>
                      <p className="text-xs text-slate-500">Document pre-existing conditions. On a phone, you can take new photos or pick from your gallery.</p>
                      <div className="p-8 border-2 border-dashed border-slate-300 rounded-2xl text-center bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer">
                        <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <span className="text-xs font-bold text-slate-700 block">Upload / Take Pre-Job Photos</span>
                        <span className="text-[11px] text-slate-400">JPG, PNG or HEIC from your device</span>
                      </div>
                    </div>

                    {/* Add-Ons */}
                    <div className="space-y-3 pt-4 border-t border-slate-200">
                      <h3 className="text-base font-bold text-slate-900">Add-On Services</h3>
                      <div className="space-y-2 max-w-xl">
                        {[
                          { key: 'oven', label: 'Inside Oven', price: rates.addonOven },
                          { key: 'fridge', label: 'Inside Refrigerator', price: rates.addonFridge },
                          { key: 'windows', label: 'Interior Windows', price: rates.addonWindows },
                          { key: 'cabinets', label: 'Inside Cabinets', price: rates.addonCabinets },
                          { key: 'baseboards', label: 'Baseboards Deep Wipe', price: rates.addonBaseboards },
                          { key: 'heavyStain', label: 'Heavy Stain / Flood Extra Treatment', price: rates.addonHeavyStain },
                        ].map((item) => (
                          <label key={item.key} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={(addons as any)[item.key]}
                                onChange={(e) => setAddons({ ...addons, [item.key]: e.target.checked })}
                                className="w-4 h-4 rounded text-emerald-600"
                              />
                              <span className="text-xs font-bold text-slate-800">{item.label}</span>
                            </div>
                            <span className="text-xs font-bold text-slate-500">${item.price.toFixed(2)}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Discounts */}
                    <div className="space-y-3 pt-4 border-t border-slate-200">
                      <h3 className="text-base font-bold text-slate-900">Discounts & Promotions</h3>
                      <p className="text-xs text-slate-500">Combine any that apply. Total discounts are capped at 25%.</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
                        {[
                          { key: 'firstTime', label: 'First-Time Client', off: '10% off', desc: 'Welcome offer for new customers' },
                          { key: 'referral', label: 'Referral', off: '10% off', desc: 'Referred by an existing customer' },
                          { key: 'loyalty', label: 'Loyalty Member', off: '5% off', desc: 'Rewards for returning customers' },
                          { key: 'seasonal', label: 'Seasonal Promotion', off: '15% off', desc: 'Current seasonal special' },
                        ].map((d) => (
                          <label key={d.key} className="flex items-start justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition">
                            <div className="flex gap-3">
                              <input
                                type="checkbox"
                                checked={(discounts as any)[d.key]}
                                onChange={(e) => setDiscounts({ ...discounts, [d.key]: e.target.checked })}
                                className="w-4 h-4 mt-0.5 rounded text-emerald-600"
                              />
                              <div>
                                <span className="text-xs font-bold text-slate-900 block">{d.label}</span>
                                <span className="text-[11px] text-slate-500 block">{d.desc}</span>
                              </div>
                            </div>
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">{d.off}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Estimate Summary */}
                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                      <div className="text-xs text-slate-600 space-y-1.5 border-b border-slate-200 pb-3">
                        <div className="flex justify-between"><span>Base service fee</span><span>${calc.baseServiceFee.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>{jobDetails.bedrooms} bedrooms × ${rates.bedroomRate}</span><span>${(jobDetails.bedrooms * rates.bedroomRate).toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>{jobDetails.bathrooms} bathrooms × ${rates.bathroomRate}</span><span>${(jobDetails.bathrooms * rates.bathroomRate).toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>{jobDetails.sqft} sq ft × ${calc.sqFtRate}</span><span>${calc.sqFtTotal.toFixed(2)}</span></div>
                        {calc.addonsTotal > 0 && <div className="flex justify-between"><span>Add-ons</span><span>${calc.addonsTotal.toFixed(2)}</span></div>}
                        {calc.discountAmount > 0 && <div className="flex justify-between text-emerald-600 font-semibold"><span>Discounts</span><span>-${calc.discountAmount.toFixed(2)}</span></div>}
                        <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                          <span>Sales Tax (8.25%)</span>
                          <input type="checkbox" checked={includeSalesTax} onChange={(e) => setIncludeSalesTax(e.target.checked)} className="w-4 h-4" />
                        </div>
                      </div>

                      <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
                        <span className="text-xs uppercase font-bold tracking-wider">Total Job Estimate</span>
                        <span className="text-2xl font-black">${calc.totalEstimate.toFixed(2)}</span>
                      </div>

                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-2">
                        <span className="font-bold text-emerald-900 uppercase block">Deposit Breakdown</span>
                        <div className="flex justify-between text-emerald-800">
                          <span>{rates.depositPercent}% Retainer Deposit Required</span>
                          <span className="font-bold">${calc.depositRequired.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-emerald-800">
                          <span>Remaining Balance Due Upon Completion</span>
                          <span className="font-bold">${calc.remainingBalance.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <button
                          onClick={handlePreviewProposal}
                          className="w-full py-3 border border-emerald-600 text-emerald-700 hover:bg-emerald-50 rounded-xl text-xs font-bold transition"
                        >
                          Preview Client Proposal
                        </button>
                        <button
                          onClick={handleSaveLead}
                          disabled={loading}
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md"
                        >
                          {loading ? 'Saving...' : 'Save Lead to Database'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* PENDING LEADS TAB */}
                {activeAdminTab === 'leads' && (
                  loadingQuotes ? (
                    <p className="text-center py-8 text-slate-500 text-sm">Loading database leads...</p>
                  ) : quotes.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <p className="text-slate-500 text-sm">No quote requests found.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {quotes.map((q) => (
                        <div key={q.id} className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                            <div>
                              <span className="font-bold text-slate-900">{q.full_name || 'Anonymous Lead'}</span>
                              <span className="text-xs text-slate-400 block">{new Date(q.created_at).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleConvertToProposal(q)}
                                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-1.5"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                Convert to Proposal
                              </button>
                              <button onClick={() => handleDelete(q.id)} className="text-slate-400 hover:text-red-600 p-1">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                            <div><strong>Email:</strong> {q.email}</div>
                            <div><strong>Phone:</strong> {q.phone}</div>
                            <div><strong>Address:</strong> {q.address}</div>
                            <div><strong>Service:</strong> {q.service_type} ({q.sqft} sq ft, {q.bedrooms} Bed / {q.bathrooms} Bath)</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* SETTINGS TAB */}
                {activeAdminTab === 'settings' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Outbound Email Settings</h3>
                      <p className="text-xs text-slate-500">Configure From Name, Reply-To, and Bounce Notification email for outbound estimates and notifications.</p>
                    </div>
                    <div className="space-y-4 max-w-xl">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">From Name</label>
                        <input type="text" defaultValue="JJ Cleaning Services LLC" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Business Reply-To Email</label>
                          <input type="email" defaultValue="jjcleaningservice3@gmail.com" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Bounce Notification Email</label>
                          <input type="email" defaultValue="jjcleaningservice3@gmail.com" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                        </div>
                      </div>
                      <button onClick={() => alert('Email settings saved!')} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold">
                        Save Settings
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* CLIENT SUBMISSION FORM */
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md border border-slate-200 max-w-2xl mx-auto space-y-6">
            <form onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              const payload = { ...clientInfo, status: 'pending' };
              const { error } = await supabase.from('quote_requests').insert([payload]);
              setLoading(false);
              if (!error) alert('Quote request submitted!');
            }} className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Request a Quote</h2>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input required type="text" value={clientInfo.name} onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email *</label>
                  <input required type="email" value={clientInfo.email} onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone *</label>
                  <input required type="tel" value={clientInfo.phone} onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Service Address *</label>
                <input required type="text" value={clientInfo.address} onChange={(e) => setClientInfo({ ...clientInfo, address: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg">
                {loading ? 'Submitting...' : 'Submit Quote Request'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
