import { DISCOUNTS, MAX_DISCOUNT_PERCENT } from '@/lib/pricing';

interface DiscountSelectorProps {
  selectedIds: string[];
  onToggle: (discountId: string, checked: boolean) => void;
}

export default function DiscountSelector({ selectedIds, onToggle }: DiscountSelectorProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900">Discounts &amp; Promotions</h2>
      <p className="mt-1 text-sm text-slate-600">
        Combine any that apply. Total discounts are capped at {MAX_DISCOUNT_PERCENT}%.
      </p>

      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {DISCOUNTS.map((discount) => {
          const checked = selectedIds.includes(discount.id);
          const checkboxId = `discount-${discount.id}`;

          return (
            <li key={discount.id}>
              <label
                htmlFor={checkboxId}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                  checked ? 'border-brand-600 bg-brand-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <input
                  id={checkboxId}
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => onToggle(discount.id, e.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300 text-brand-600 focus:ring-brand-600"
                />
                <span className="flex-1">
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-slate-900 sm:text-base">{discount.label}</span>
                    <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-800">
                      {discount.percent}% off
                    </span>
                  </span>
                  <span className="mt-1 block text-sm text-slate-600">{discount.description}</span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
