import { formatCurrency } from '@/lib/pricing';
import type { AddOn, ServiceType } from '@/lib/pricing';
import { fieldInputClass, fieldLabelClass } from '@/components/formStyles';

interface PricingConfigPanelProps {
  services: ServiceType[];
  addOns: AddOn[];
  onRateChange: (serviceId: string, rate: number) => void;
  onPriceChange: (addOnId: string, price: number) => void;
  onReset: () => void;
}

function toAmount(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export default function PricingConfigPanel({
  services,
  addOns,
  onRateChange,
  onPriceChange,
  onReset,
}: PricingConfigPanelProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Rate Configuration</h2>
          <p className="mt-1 text-sm text-slate-600">Internal only. Clients never see these rates.</p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="shrink-0 cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-brand-700 transition hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
        >
          Reset defaults
        </button>
      </div>

      <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">Base rates per sq ft</h3>
      <ul className="mt-3 grid gap-4 sm:grid-cols-2">
        {services.map((service) => (
          <li key={service.id}>
            <label htmlFor={`rate-${service.id}`} className={fieldLabelClass}>
              {service.label}
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 mt-2 flex items-center pl-3 text-slate-500">
                $
              </span>
              <input
                id={`rate-${service.id}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={service.ratePerSqFt}
                onChange={(e) => onRateChange(service.id, toAmount(e.target.value))}
                className={`${fieldInputClass} pl-7`}
              />
            </div>
          </li>
        ))}
      </ul>

      <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">Add-on prices</h3>
      <ul className="mt-3 grid gap-4 sm:grid-cols-2">
        {addOns.map((addOn) => (
          <li key={addOn.id}>
            <label htmlFor={`price-${addOn.id}`} className={fieldLabelClass}>
              {addOn.label}
              {addOn.perUnit ? ' (each)' : ''}
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 mt-2 flex items-center pl-3 text-slate-500">
                $
              </span>
              <input
                id={`price-${addOn.id}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={addOn.price}
                onChange={(e) => onPriceChange(addOn.id, toAmount(e.target.value))}
                className={`${fieldInputClass} pl-7`}
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">Currently {formatCurrency(addOn.price)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
