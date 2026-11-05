import { useState } from 'react';
import type { FormEvent } from 'react';
import { AlertTriangle, CheckCircle2, Send } from 'lucide-react';
import { DEFAULT_SERVICE_TYPES } from '@/lib/pricing';
import { submitQuoteRequest } from '@/lib/quoteRequests';
import type { QuoteRequestInput } from '@/lib/quoteRequests';
import { fieldInputClass, fieldLabelClass } from '@/components/formStyles';

const EMPTY_FORM: QuoteRequestInput = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  serviceType: '',
  squareFeet: '',
  bedrooms: '',
  bathrooms: '',
  preferredDate: '',
  notes: '',
};

type RequiredField = 'fullName' | 'email' | 'phone' | 'address' | 'bedrooms' | 'bathrooms';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Banner =
  | { kind: 'success'; message: string }
  | { kind: 'warning'; message: string }
  | { kind: 'error'; message: string };

const SUCCESS_MESSAGE =
  'Thank you! Your quote request has been sent to JJ Cleaning Services LLC. We will review your details and follow up shortly.';
const EMAIL_FAILED_MESSAGE =
  'Your request was saved, but the email alert to JJ Cleaning Services LLC could not be sent. We will still review your request.';

function findRequiredErrors(form: QuoteRequestInput): Set<RequiredField> {
  const errors = new Set<RequiredField>();
  if (form.fullName.trim() === '') errors.add('fullName');
  if (!EMAIL_PATTERN.test(form.email.trim())) errors.add('email');
  const phoneDigits = form.phone.replace(/\D/g, '');
  if (phoneDigits.length < 10 || phoneDigits.length > 15) errors.add('phone');
  if (form.address.trim() === '') errors.add('address');
  const bedrooms = Number(form.bedrooms);
  if (form.bedrooms.trim() === '' || !Number.isFinite(bedrooms) || bedrooms < 0) errors.add('bedrooms');
  const bathrooms = Number(form.bathrooms);
  if (form.bathrooms.trim() === '' || !Number.isFinite(bathrooms) || bathrooms < 0) errors.add('bathrooms');
  return errors;
}

const errorInputClass = 'border-red-500 focus:border-red-600 focus:ring-red-600/20';

export default function QuoteRequestForm() {
  const [form, setForm] = useState<QuoteRequestInput>(EMPTY_FORM);
  const [errors, setErrors] = useState<Set<RequiredField>>(new Set());
  const [banner, setBanner] = useState<Banner | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = <K extends keyof QuoteRequestInput>(field: K, value: QuoteRequestInput[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'fullName' || field === 'email' || field === 'phone' || field === 'address' || field === 'bedrooms' || field === 'bathrooms') {
      setErrors((prev) => {
        const next = new Set(prev);
        next.delete(field);
        return next;
      });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const requiredErrors = findRequiredErrors(form);
    setErrors(requiredErrors);
    if (requiredErrors.size > 0) {
      setBanner(null);
      return;
    }

    setIsSubmitting(true);
    setBanner(null);
    const payload: QuoteRequestInput = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      serviceType: form.serviceType,
      squareFeet: form.squareFeet.trim(),
      bedrooms: form.bedrooms.trim(),
      bathrooms: form.bathrooms.trim(),
      preferredDate: form.preferredDate,
      notes: form.notes.trim(),
    };

    try {
      const { emailSent } = await submitQuoteRequest(payload);
      setBanner(emailSent ? { kind: 'success', message: SUCCESS_MESSAGE } : { kind: 'warning', message: EMAIL_FAILED_MESSAGE });
      setForm(EMPTY_FORM);
    } catch (error) {
      setBanner({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Your request could not be sent. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      {banner && banner.kind === 'success' && (
        <div
          role="status"
          className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-900 shadow-sm"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
          <p className="text-sm font-medium">{banner.message}</p>
        </div>
      )}

      {banner && banner.kind === 'warning' && (
        <div role="status" className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-sm">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
          <p className="text-sm font-medium">{banner.message}</p>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Request a Quote</h2>
        <p className="mt-2 text-sm text-slate-600">
          Tell us about your property and we will prepare a quote for JJ Cleaning Services LLC.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5" noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="full-name" className={fieldLabelClass}>
                Full Name <span className="text-red-600">*</span>
              </label>
              <input
                id="full-name"
                type="text"
                autoComplete="name"
                value={form.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                className={`${fieldInputClass} ${errors.has('fullName') ? errorInputClass : ''}`}
              />
              {errors.has('fullName') && <p className="mt-1 text-sm text-red-700">Full name is required.</p>}
            </div>

            <div>
              <label htmlFor="email" className={fieldLabelClass}>
                Email Address <span className="text-red-600">*</span>
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                className={`${fieldInputClass} ${errors.has('email') ? errorInputClass : ''}`}
              />
              {errors.has('email') && <p className="mt-1 text-sm text-red-700">Enter a valid email address.</p>}
            </div>

            <div>
              <label htmlFor="phone" className={fieldLabelClass}>
                Phone Number <span className="text-red-600">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className={`${fieldInputClass} ${errors.has('phone') ? errorInputClass : ''}`}
              />
              {errors.has('phone') && (
                <p className="mt-1 text-sm text-red-700">Enter a valid phone number with at least 10 digits.</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="address" className={fieldLabelClass}>
              Service Address <span className="text-red-600">*</span>
            </label>
            <input
              id="address"
              type="text"
              autoComplete="street-address"
              value={form.address}
              onChange={(e) => updateField('address', e.target.value)}
              className={`${fieldInputClass} ${errors.has('address') ? errorInputClass : ''}`}
            />
            {errors.has('address') && <p className="mt-1 text-sm text-red-700">Service address is required.</p>}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="service-type" className={fieldLabelClass}>
                Service Type <span className="font-normal text-slate-500">(optional)</span>
              </label>
              <select
                id="service-type"
                value={form.serviceType}
                onChange={(e) => updateField('serviceType', e.target.value)}
                className={`${fieldInputClass} pr-8`}
              >
                <option value="">Not sure yet</option>
                {DEFAULT_SERVICE_TYPES.map((service) => (
                  <option key={service.id} value={service.label}>
                    {service.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="square-feet" className={fieldLabelClass}>
                Property Sq Ft <span className="font-normal text-slate-500">(optional)</span>
              </label>
              <input
                id="square-feet"
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                placeholder="e.g. 1800"
                value={form.squareFeet}
                onChange={(e) => updateField('squareFeet', e.target.value)}
                className={fieldInputClass}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="bedrooms" className={fieldLabelClass}>
                Bedrooms <span className="text-red-600">*</span>
              </label>
              <input
                id="bedrooms"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                placeholder="e.g. 3"
                value={form.bedrooms}
                onChange={(e) => updateField('bedrooms', e.target.value)}
                className={`${fieldInputClass} ${errors.has('bedrooms') ? errorInputClass : ''}`}
              />
              {errors.has('bedrooms') && <p className="mt-1 text-sm text-red-700">Enter the number of bedrooms.</p>}
            </div>

            <div>
              <label htmlFor="bathrooms" className={fieldLabelClass}>
                Bathrooms <span className="text-red-600">*</span>
              </label>
              <input
                id="bathrooms"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                placeholder="e.g. 2"
                value={form.bathrooms}
                onChange={(e) => updateField('bathrooms', e.target.value)}
                className={`${fieldInputClass} ${errors.has('bathrooms') ? errorInputClass : ''}`}
              />
              {errors.has('bathrooms') && <p className="mt-1 text-sm text-red-700">Enter the number of bathrooms.</p>}
            </div>
          </div>

          <div>
            <label htmlFor="preferred-date" className={fieldLabelClass}>
              Preferred Date <span className="font-normal text-slate-500">(optional)</span>
            </label>
            <input
              id="preferred-date"
              type="date"
              value={form.preferredDate}
              onChange={(e) => updateField('preferredDate', e.target.value)}
              className={`${fieldInputClass} sm:max-w-xs`}
            />
          </div>

          <div>
            <label htmlFor="notes" className={fieldLabelClass}>
              Notes / Comments <span className="font-normal text-slate-500">(optional)</span>
            </label>
            <textarea
              id="notes"
              rows={4}
              placeholder="Special requests, pets, entry instructions..."
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              className={fieldInputClass}
            />
          </div>

          {banner && banner.kind === 'error' && (
            <p role="alert" className="text-sm text-red-700">
              {banner.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            {isSubmitting ? 'Submitting...' : 'Submit Quote Request'}
          </button>
        </form>
      </div>
    </main>
  );
}
