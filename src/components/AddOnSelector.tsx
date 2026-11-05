import { formatCurrency } from '@/lib/pricing';
import type { AddOn } from '@/lib/pricing';

interface AddOnSelectorProps {
  addOns: AddOn[];
  quantities: Record<string, number>;
  onToggle: (addOnId: string, checked: boolean) => void;
  onQuantityChange: (addOnId: string, quantity: number) => void;
}

export default function AddOnSelector({ addOns, quantities, onToggle, onQuantityChange }: AddOnSelectorProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900">Add-On Services</h2>
      <p className="mt-1 text-sm text-slate-600">Select any extras to include in this job.</p>

      <ul className="mt-5 divide-y divide-slate-100">
        {addOns.map((addOn) => {
          const quantity = quantities[addOn.id] ?? 0;
          const checked = quantity > 0;
          const checkboxId = `addon-${addOn.id}`;

          return (
            <li key={addOn.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <label htmlFor={checkboxId} className="flex cursor-pointer items-center gap-3">
                <input
                  id={checkboxId}
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => onToggle(addOn.id, e.target.checked)}
                  className="h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300 text-brand-600 focus:ring-brand-600"
                />
                <span className="text-sm font-medium text-slate-800 sm:text-base">{addOn.label}</span>
              </label>

              <div className="flex items-center justify-between gap-3 pl-8 sm:justify-end sm:pl-0">
                <span className="text-sm text-slate-600">
                  {formatCurrency(addOn.price)}
                  {addOn.perUnit ? ' each' : ''}
                </span>

                {addOn.perUnit && checked && (
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    Qty
                    <input
                      type="number"
                      min="1"
                      step="1"
                      inputMode="numeric"
                      aria-label={`${addOn.label} quantity`}
                      value={quantity}
                      onChange={(e) => {
                        const parsed = Math.floor(Number(e.target.value));
                        if (Number.isFinite(parsed) && parsed >= 1) onQuantityChange(addOn.id, parsed);
                      }}
                      className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center text-slate-900 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
                    />
                  </label>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
