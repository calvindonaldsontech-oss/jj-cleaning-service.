import { useState } from 'react';
import AdminWorkspace from '@/components/AdminWorkspace';
import ClientProposalView from '@/components/ClientProposalView';
import QuoteRequestForm from '@/components/QuoteRequestForm';
import TokenExpiredModal from '@/components/TokenExpiredModal';
import {
  DEFAULT_ADD_ONS,
  DEFAULT_SERVICE_TYPES,
  calculateQuote,
} from '@/lib/pricing';
import type { AddOn, ServiceType } from '@/lib/pricing';
import { buildProposalData } from '@/lib/proposalText';
import { validateCustomer } from '@/lib/customer';
import type { CustomerDetails } from '@/lib/customer';
import { createSitePhoto } from '@/lib/sitePhotos';
import type { SitePhoto } from '@/lib/sitePhotos';
import { loadLeads, saveLeads } from '@/lib/leads';
import type { Lead } from '@/lib/leads';
import type { QuoteRequest } from '@/lib/quoteRequests';
import { loadSettings, saveSettings } from '@/lib/settings';
import type { SystemSettings } from '@/lib/settings';
import type { JobDetails } from '@/components/JobDetailsForm';

const EMPTY_CUSTOMER: CustomerDetails = {
  clientName: '',
  email: '',
  phone: '',
  address: '',
  notes: '',
};

type ClientView = 'intake' | 'proposal';

interface QuoteCalculatorProps {
  adminPin: string | null;
  onSwitchToClient: () => void;
}

export default function QuoteCalculator({ adminPin, onSwitchToClient }: QuoteCalculatorProps) {
  const [clientView, setClientView] = useState<ClientView>('intake');
  const [customer, setCustomer] = useState<CustomerDetails>(EMPTY_CUSTOMER);
  const [job, setJob] = useState<JobDetails>({
    squareFeet: '',
    bedrooms: '',
    bathrooms: '',
    serviceId: DEFAULT_SERVICE_TYPES[0].id,
    overrideAmount: '',
  });
  const [services, setServices] = useState<ServiceType[]>(DEFAULT_SERVICE_TYPES);
  const [addOns, setAddOns] = useState<AddOn[]>(DEFAULT_ADD_ONS);
  const [addOnQuantities, setAddOnQuantities] = useState<Record<string, number>>({});
  const [discountIds, setDiscountIds] = useState<string[]>([]);
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [quoteDate] = useState(() => new Date());
  const [photos, setPhotos] = useState<SitePhoto[]>([]);
  const [isProcessingPhotos, setIsProcessingPhotos] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>(loadLeads);
  const [leadSaveError, setLeadSaveError] = useState<string | null>(null);
  const [settings, setSettings] = useState<SystemSettings>(loadSettings);
  const [isTokenExpired, setIsTokenExpired] = useState(false);

  const selectedService = services.find((service) => service.id === job.serviceId) ?? services[0];

  const quote = calculateQuote({
    squareFeet: job.squareFeet,
    bedrooms: job.bedrooms,
    bathrooms: job.bathrooms,
    service: selectedService,
    overrideAmount: job.overrideAmount,
    addOns,
    addOnQuantities,
    discountIds,
    taxEnabled,
  });

  const handleAddOnToggle = (addOnId: string, checked: boolean) => {
    setAddOnQuantities((prev) => ({ ...prev, [addOnId]: checked ? 1 : 0 }));
  };

  const handleAddOnQuantity = (addOnId: string, quantity: number) => {
    setAddOnQuantities((prev) => ({ ...prev, [addOnId]: quantity }));
  };

  const handleDiscountToggle = (discountId: string, checked: boolean) => {
    setDiscountIds((prev) => (checked ? [...prev, discountId] : prev.filter((id) => id !== discountId)));
  };

  const handleRateChange = (serviceId: string, rate: number) => {
    setServices((prev) =>
      prev.map((service) => (service.id === serviceId ? { ...service, ratePerSqFt: rate } : service))
    );
  };

  const handlePriceChange = (addOnId: string, price: number) => {
    setAddOns((prev) => prev.map((addOn) => (addOn.id === addOnId ? { ...addOn, price } : addOn)));
  };

  const handleResetPricing = () => {
    setServices(DEFAULT_SERVICE_TYPES);
    setAddOns(DEFAULT_ADD_ONS);
  };

  const handleAddPhotos = async (files: File[]) => {
    setIsProcessingPhotos(true);
    setPhotoError(null);
    const results = await Promise.allSettled(files.map(createSitePhoto));
    const added = results.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []));
    const failedCount = results.length - added.length;

    if (added.length > 0) setPhotos((prev) => [...prev, ...added]);
    if (failedCount > 0) {
      setPhotoError(
        `${failedCount} ${failedCount === 1 ? 'photo' : 'photos'} could not be processed. Try JPG or PNG files.`
      );
    }
    setIsProcessingPhotos(false);
  };

  const handleRemovePhoto = (photoId: string) => {
    setPhotos((prev) => prev.filter((item) => item.id !== photoId));
  };

  const handleSaveLead = () => {
    const lead: Lead = {
      id: crypto.randomUUID(),
      savedAt: new Date().toISOString(),
      clientName: customer.clientName.trim(),
      phone: customer.phone.trim(),
      email: customer.email.trim(),
      address: customer.address.trim(),
      squareFeet: job.squareFeet.trim(),
      quoteTotal: quote.total,
      depositAmount: quote.deposit,
      photos,
    };
    const next = [lead, ...leads];
    if (saveLeads(next)) {
      setLeads(next);
      setLeadSaveError(null);
    } else {
      setLeadSaveError(
        'This lead could not be saved. Browser storage may be full, so try removing some photos or saving fewer leads.'
      );
    }
  };

  const handleConvertRequest = (request: QuoteRequest) => {
    const matchedService = services.find((service) => service.label === request.serviceType);
    setCustomer((prev) => ({
      ...prev,
      clientName: request.fullName,
      email: request.email,
      phone: request.phone,
      address: request.address,
      notes: request.notes,
    }));
    setJob((prev) => ({
      ...prev,
      squareFeet: request.squareFeet,
      bedrooms: request.bedrooms,
      bathrooms: request.bathrooms,
      serviceId: matchedService ? matchedService.id : prev.serviceId,
    }));
  };

  const handlePreviewProposal = () => {
    setClientView('proposal');
    onSwitchToClient();
  };

  const handleSaveSettings = (next: SystemSettings) => {
    if (saveSettings(next)) {
      setSettings(next);
      setIsTokenExpired(false);
    }
  };

  if (adminPin !== null) {
    return (
      <>
        <AdminWorkspace
          adminPin={adminPin}
          customer={customer}
          customerErrors={validateCustomer(customer)}
          onCustomerChange={(changes) => setCustomer((prev) => ({ ...prev, ...changes }))}
          job={job}
          onJobChange={(changes) => setJob((prev) => ({ ...prev, ...changes }))}
          services={services}
          addOns={addOns}
          onRateChange={handleRateChange}
          onPriceChange={handlePriceChange}
          onResetPricing={handleResetPricing}
          addOnQuantities={addOnQuantities}
          onAddOnToggle={handleAddOnToggle}
          onAddOnQuantity={handleAddOnQuantity}
          discountIds={discountIds}
          onDiscountToggle={handleDiscountToggle}
          quote={quote}
          taxEnabled={taxEnabled}
          onTaxToggle={setTaxEnabled}
          photos={photos}
          isProcessingPhotos={isProcessingPhotos}
          photoError={photoError}
          onAddPhotos={handleAddPhotos}
          onRemovePhoto={handleRemovePhoto}
          leads={leads}
          onSaveLead={handleSaveLead}
          leadSaveError={leadSaveError}
          onConvertRequest={handleConvertRequest}
          onPreviewProposal={handlePreviewProposal}
          settings={settings}
          onSaveSettings={handleSaveSettings}
        />
        {isTokenExpired && (
          <TokenExpiredModal
            onSubmit={(newToken) => {
              setSettings((prev) => {
                const next = { ...prev, apiToken: newToken };
                saveSettings(next);
                return next;
              });
              setIsTokenExpired(false);
            }}
            onClose={() => setIsTokenExpired(false)}
          />
        )}
      </>
    );
  }

  if (clientView === 'intake') {
    return <QuoteRequestForm />;
  }

  const proposal = buildProposalData({
    customer,
    squareFeet: job.squareFeet,
    bedrooms: job.bedrooms,
    bathrooms: job.bathrooms,
    service: selectedService,
    addOns,
    addOnQuantities,
    quote,
    taxEnabled,
    quoteDate,
  });

  const proposalKey = `${JSON.stringify(proposal)}|${photos.map((photo) => photo.id).join(',')}`;

  return (
    <>
      <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6 sm:pt-8 print:hidden">
        <button
          type="button"
          onClick={() => setClientView('intake')}
          className="cursor-pointer text-sm font-medium text-brand-700 transition hover:text-brand-800"
        >
          ← Back to Quote Request Form
        </button>
      </div>
      <ClientProposalView key={proposalKey} proposal={proposal} photos={photos} isAdmin={adminPin !== null} />
    </>
  );
}
