import { formatCurrency } from '@/lib/pricing';
import type { ServiceType } from '@/lib/pricing';
import { fieldInputClass, fieldLabelClass } from '@/components/formStyles';

export interface JobDetails {
  squareFeet: string;
  bedrooms: string;
  bathrooms: string;
  serviceId: string;
  overrideAmount: string;
}

interface JobDetailsFormProps {
  values: JobDetails;
  services: ServiceType[];
  onChange: (changes: Partial<JobDetails>) => void;
}

export default function JobDetailsForm({ values, services, onChange }: JobDetailsFormProps) {
  const hasOverride = values.overrideAmount.trim() !== '';

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900">Job Details</h2>
      <p className="mt-1 text-sm text-slate-600">
        Base estimate: $180 + $45/bedroom + $35/bathroom + $0.30/sq ft + add-ons.
      </p>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="bedrooms" className={fieldLabelClass}>
            Bedrooms
          </label>
          <input
            id="bedrooms"
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            placeholder="e.g. 3"
            value={values.bedrooms}
            onChange={(e) => onChange({ bedrooms: e.target.value })}
            className={fieldInputClass}
          />
        </div>

        <div>
          <label htmlFor="bathrooms" className={fieldLabelClass}>
            Bathrooms
          </label>
          <input
            id="bathrooms"
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            placeholder="e.g. 2"
            value={values.bathrooms}
            onChange={(e) => onChange({ bathrooms: e.target.value })}
            className={fieldInputClass}
          />
        </div>

        <div>
          <label htmlFor="square-feet" className={fieldLabelClass}>
            Property Square Footage
          </label>
          <input
            id="square-feet"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            placeholder="e.g. 1800"
            value={values.squareFeet}
            onChange={(e) => onChange({ squareFeet: e.target.value })}
            className={fieldInputClass}
          />
        </div>

        <div>
          <label htmlFor="service-type" className={fieldLabelClass}>
            Service Type
          </label>
          <select
            id="service-type"
            value={values.serviceId}
            onChange={(e) => onChange({ serviceId: e.target.value })}
            className={`${fieldInputClass} pr-8`}
          >
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.label} ({formatCurrency(service.ratePerSqFt)}/sq ft)
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="price-override" className={fieldLabelClass}>
            Custom Price Override <span className="font-normal text-slate-500">(optional flat amount)</span>
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 mt-2 flex items-center pl-3 text-slate-500">
              $
            </span>
            <input
              id="price-override"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="Leave blank to calculate by formula"
              value={values.overrideAmount}
              onChange={(e) => onChange({ overrideAmount: e.target.value })}
              className={`${fieldInputClass} pl-7`}
            />
          </div>
          {hasOverride && (
            <p className="mt-2 text-sm text-brand-700">
              The flat amount replaces the formula calculation. Add-ons and discounts still apply.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
