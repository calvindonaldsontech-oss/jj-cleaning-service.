import { useState } from 'react';
import CustomerInfoForm from '@/components/CustomerInfoForm';
import JobDetailsForm from '@/components/JobDetailsForm';
import AddOnSelector from '@/components/AddOnSelector';
import DiscountSelector from '@/components/DiscountSelector';
import EstimateSummary from '@/components/EstimateSummary';
import PricingConfigPanel from '@/components/PricingConfigPanel';
import PhotoUploader from '@/components/PhotoUploader';
import LeadHistory from '@/components/LeadHistory';
import PendingLeads from '@/components/PendingLeads';
import ChangePinDialog from '@/components/ChangePinDialog';
import SystemSettingsPanel from '@/components/SystemSettingsPanel';
import type { CustomerDetails, CustomerErrors } from '@/lib/customer';
import type { JobDetails } from '@/components/JobDetailsForm';
import type { AddOn, QuoteResult, ServiceType } from '@/lib/pricing';
import type { SitePhoto } from '@/lib/sitePhotos';
import type { Lead } from '@/lib/leads';
import type { QuoteRequest } from '@/lib/quoteRequests';
import type { SystemSettings } from '@/lib/settings';

type AdminTab = 'builder' | 'requests' | 'settings';

const TABS: { value: AdminTab; label: string }[] = [
  { value: 'builder', label: 'Proposal Builder' },
  { value: 'requests', label: 'Pending Leads / Quote Requests' },
  { value: 'settings', label: 'System & Email Settings' },
];

interface AdminWorkspaceProps {
  adminPin: string;
  customer: CustomerDetails;
  customerErrors: CustomerErrors;
  onCustomerChange: (changes: Partial<CustomerDetails>) => void;
  job: JobDetails;
  onJobChange: (changes: Partial<JobDetails>) => void;
  services: ServiceType[];
  addOns: AddOn[];
  onRateChange: (serviceId: string, rate: number) => void;
  onPriceChange: (addOnId: string, price: number) => void;
  onResetPricing: () => void;
  addOnQuantities: Record<string, number>;
  onAddOnToggle: (addOnId: string, checked: boolean) => void;
  onAddOnQuantity: (addOnId: string, quantity: number) => void;
  discountIds: string[];
  onDiscountToggle: (discountId: string, checked: boolean) => void;
  quote: QuoteResult;
  taxEnabled: boolean;
  onTaxToggle: (enabled: boolean) => void;
  photos: SitePhoto[];
  isProcessingPhotos: boolean;
  photoError: string | null;
  onAddPhotos: (files: File[]) => void;
  onRemovePhoto: (photoId: string) => void;
  leads: Lead[];
  onSaveLead: () => void;
  leadSaveError: string | null;
  onConvertRequest: (request: QuoteRequest) => void;
  onPreviewProposal: () => void;
  settings: SystemSettings;
  onSaveSettings: (settings: SystemSettings) => void;
}

export default function AdminWorkspace(props: AdminWorkspaceProps) {
  const isContactComplete = Object.keys(props.customerErrors).length === 0;
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('builder');

  const handleConvert = (request: QuoteRequest) => {
    props.onConvertRequest(request);
    setActiveTab('builder');
  };

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        <div role="tablist" aria-label="Admin sections" className="inline-flex max-w-full flex-wrap gap-1 rounded-2xl bg-slate-200/70 p-1">
          {TABS.map((tab) => {
            const selected = tab.value === activeTab;
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveTab(tab.value)}
                className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${
                  selected ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'builder' && (
        <>
          <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[1fr_400px] lg:gap-8 lg:px-8">
            <div className="flex flex-col gap-6">
              <CustomerInfoForm
                values={props.customer}
                errors={props.customerErrors}
                onChange={props.onCustomerChange}
              />
              <JobDetailsForm values={props.job} services={props.services} onChange={props.onJobChange} />
              <PhotoUploader
                photos={props.photos}
                isProcessing={props.isProcessingPhotos}
                error={props.photoError}
                onAdd={props.onAddPhotos}
                onRemove={props.onRemovePhoto}
              />
              <AddOnSelector
                addOns={props.addOns}
                quantities={props.addOnQuantities}
                onToggle={props.onAddOnToggle}
                onQuantityChange={props.onAddOnQuantity}
              />
              <DiscountSelector selectedIds={props.discountIds} onToggle={props.onDiscountToggle} />
              <PricingConfigPanel
                services={props.services}
                addOns={props.addOns}
                onRateChange={props.onRateChange}
                onPriceChange={props.onPriceChange}
                onReset={props.onResetPricing}
              />
            </div>

            <div className="flex flex-col gap-6 lg:sticky lg:top-8 lg:self-start">
              <EstimateSummary
                quote={props.quote}
                clientName={props.customer.clientName}
                isContactComplete={isContactComplete}
                taxEnabled={props.taxEnabled}
                onTaxToggle={props.onTaxToggle}
              />
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-semibold text-slate-900">Client Proposal</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Preview the proposal the client sees, including the signature block.
                </p>
                <button
                  type="button"
                  onClick={props.onPreviewProposal}
                  className="mt-4 inline-flex w-full cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-brand-600 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                >
                  Preview Client Proposal
                </button>
              </section>
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-semibold text-slate-900">Save Lead</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Store this client's profile and quote totals in this browser for follow-ups.
                </p>
                <button
                  type="button"
                  onClick={props.onSaveLead}
                  disabled={!isContactComplete}
                  className="mt-4 inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Save Lead to Database
                </button>
                {!isContactComplete && (
                  <p className="mt-3 text-sm text-amber-800">Complete the required customer contact details to save a lead.</p>
                )}
                {props.leadSaveError && (
                  <p role="alert" className="mt-3 text-sm text-red-700">
                    {props.leadSaveError}
                  </p>
                )}
              </section>
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-semibold text-slate-900">Admin Security</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Change the 4-digit PIN required to open Admin Mode.
                </p>
                <button
                  type="button"
                  onClick={() => setIsChangingPin(true)}
                  className="mt-4 inline-flex w-full cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-brand-600 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                >
                  Change Admin PIN
                </button>
              </section>
            </div>
          </main>

          <div className="mx-auto max-w-6xl px-4 pb-8 sm:px-6 lg:px-8">
            <LeadHistory leads={props.leads} />
          </div>
        </>
      )}

      {activeTab === 'requests' && (
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <PendingLeads adminPin={props.adminPin} onConvert={handleConvert} />
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <SystemSettingsPanel settings={props.settings} onSave={props.onSaveSettings} />
        </div>
      )}

      {isChangingPin && <ChangePinDialog onClose={() => setIsChangingPin(false)} />}
    </>
  );
}
