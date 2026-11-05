import { useState } from 'react';
import type { CustomerDetails, CustomerErrors, RequiredCustomerField } from '@/lib/customer';
import { fieldErrorInputClass, fieldInputClass, fieldLabelClass } from '@/components/formStyles';

interface CustomerInfoFormProps {
  values: CustomerDetails;
  errors: CustomerErrors;
  onChange: (changes: Partial<CustomerDetails>) => void;
}

const requiredMark = <span className="text-red-600"> *</span>;

export default function CustomerInfoForm({ values, errors, onChange }: CustomerInfoFormProps) {
  const [touched, setTouched] = useState<Partial<Record<RequiredCustomerField, boolean>>>({});

  const markTouched = (field: RequiredCustomerField) => setTouched((prev) => ({ ...prev, [field]: true }));
  const visibleError = (field: RequiredCustomerField) => (touched[field] ? errors[field] : undefined);

  const inputFor = (field: RequiredCustomerField) =>
    visibleError(field) ? fieldErrorInputClass : fieldInputClass;

  const errorText = (field: RequiredCustomerField) => {
    const message = visibleError(field);
    return message ? (
      <p id={`${field}-error`} className="mt-2 text-sm text-red-600">
        {message}
      </p>
    ) : null;
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900">Customer Information</h2>
      <p className="mt-1 text-sm text-slate-600">
        Fields marked <span className="text-red-600">*</span> are required.
      </p>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="client-name" className={fieldLabelClass}>
            Client Name
          </label>
          <input
            id="client-name"
            type="text"
            autoComplete="name"
            placeholder="e.g. Jordan Smith"
            value={values.clientName}
            onChange={(e) => onChange({ clientName: e.target.value })}
            className={fieldInputClass}
          />
        </div>

        <div>
          <label htmlFor="client-email" className={fieldLabelClass}>
            Email{requiredMark}
          </label>
          <input
            id="client-email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            value={values.email}
            aria-invalid={Boolean(visibleError('email'))}
            aria-describedby={visibleError('email') ? 'email-error' : undefined}
            onChange={(e) => onChange({ email: e.target.value })}
            onBlur={() => markTouched('email')}
            className={inputFor('email')}
          />
          {errorText('email')}
        </div>

        <div>
          <label htmlFor="client-phone" className={fieldLabelClass}>
            Phone Number{requiredMark}
          </label>
          <input
            id="client-phone"
            type="tel"
            autoComplete="tel"
            placeholder="(555) 123-4567"
            value={values.phone}
            aria-invalid={Boolean(visibleError('phone'))}
            aria-describedby={visibleError('phone') ? 'phone-error' : undefined}
            onChange={(e) => onChange({ phone: e.target.value })}
            onBlur={() => markTouched('phone')}
            className={inputFor('phone')}
          />
          {errorText('phone')}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="client-address" className={fieldLabelClass}>
            Service Address{requiredMark}
          </label>
          <input
            id="client-address"
            type="text"
            autoComplete="street-address"
            placeholder="123 Main St, City, State ZIP"
            value={values.address}
            aria-invalid={Boolean(visibleError('address'))}
            aria-describedby={visibleError('address') ? 'address-error' : undefined}
            onChange={(e) => onChange({ address: e.target.value })}
            onBlur={() => markTouched('address')}
            className={inputFor('address')}
          />
          {errorText('address')}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="client-notes" className={fieldLabelClass}>
            Notes / Comments <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <textarea
            id="client-notes"
            rows={3}
            placeholder="Access instructions, pets, preferred days, special requests..."
            value={values.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            className={`${fieldInputClass} resize-y`}
          />
        </div>
      </div>
    </section>
  );
}
