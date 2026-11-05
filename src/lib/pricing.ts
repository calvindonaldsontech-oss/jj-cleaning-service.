export const TAX_RATE = 0.0825;
export const MAX_DISCOUNT_PERCENT = 25;
export const QUOTE_VALID_DAYS = 30;

export const BASE_FLAT_FEE = 180;
export const PER_BEDROOM_RATE = 45;
export const PER_BATHROOM_RATE = 35;
export const PER_SQFT_RATE = 0.3;

export interface ServiceType {
  id: string;
  label: string;
  ratePerSqFt: number;
}

export interface AddOn {
  id: string;
  label: string;
  price: number;
  perUnit: boolean;
}

export interface Discount {
  id: string;
  label: string;
  description: string;
  percent: number;
}

export const DEFAULT_SERVICE_TYPES: ServiceType[] = [
  { id: 'general-recurring', label: 'General Recurring Cleaning', ratePerSqFt: 0.32 },
  { id: 'deep', label: 'Deep Cleaning', ratePerSqFt: 0.45 },
  { id: 'move-in-out', label: 'Move-In / Move-Out', ratePerSqFt: 0.5 },
  { id: 'post-construction', label: 'Post-Construction Clean', ratePerSqFt: 0.6 },
  { id: 'post-flood', label: 'Post-Flood Deep Cleaning & Sanitation', ratePerSqFt: 0.5 },
];

export const DEFAULT_ADD_ONS: AddOn[] = [
  { id: 'inside-oven', label: 'Inside Oven', price: 35, perUnit: false },
  { id: 'inside-refrigerator', label: 'Inside Refrigerator', price: 35, perUnit: false },
  { id: 'interior-windows', label: 'Interior Windows', price: 50, perUnit: false },
  { id: 'inside-cabinets', label: 'Inside Cabinets', price: 40, perUnit: false },
  { id: 'baseboards-deep-wipe', label: 'Baseboards Deep Wipe', price: 30, perUnit: false },
  { id: 'heavy-stain-flood', label: 'Heavy Stain / Flood Extra Treatment', price: 125, perUnit: false },
];

export const DISCOUNTS: Discount[] = [
  { id: 'first-time', label: 'First-Time Client', description: 'Welcome offer for new customers', percent: 10 },
  { id: 'referral', label: 'Referral', description: 'Referred by an existing customer', percent: 10 },
  { id: 'loyalty', label: 'Loyalty Member', description: 'Rewards for returning customers', percent: 5 },
  { id: 'seasonal', label: 'Seasonal Promotion', description: 'Current seasonal special', percent: 15 },
];

export interface QuoteInput {
  squareFeet: string;
  bedrooms: string;
  bathrooms: string;
  service: ServiceType;
  overrideAmount: string;
  addOns: AddOn[];
  addOnQuantities: Record<string, number>;
  discountIds: string[];
  taxEnabled: boolean;
}

export interface QuoteResult {
  baseAmount: number;
  isOverridden: boolean;
  formulaBreakdown: { label: string; amount: number }[];
  addOnsTotal: number;
  preDiscountSubtotal: number;
  discountPercent: number;
  discountAmount: number;
  subtotal: number;
  tax: number;
  total: number;
  deposit: number;
  remainingBalance: number;
}

export function roundCents(value: number): number {
  return Math.round(value * 100) / 100;
}

function parsePositive(value: string): number | null {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function calculateQuote(input: QuoteInput): QuoteResult {
  const squareFeet = parsePositive(input.squareFeet) ?? 0;
  const bedrooms = parsePositive(input.bedrooms) ?? 0;
  const bathrooms = parsePositive(input.bathrooms) ?? 0;
  const override = parsePositive(input.overrideAmount);

  const isOverridden = override !== null;

  let baseAmount: number;
  let formulaBreakdown: { label: string; amount: number }[];

  if (isOverridden) {
    baseAmount = roundCents(override);
    formulaBreakdown = [{ label: 'Custom flat price', amount: baseAmount }];
  } else {
    const flatFee = roundCents(BASE_FLAT_FEE);
    const bedroomCost = roundCents(PER_BEDROOM_RATE * bedrooms);
    const bathroomCost = roundCents(PER_BATHROOM_RATE * bathrooms);
    const sqftCost = roundCents(PER_SQFT_RATE * squareFeet);
    baseAmount = roundCents(flatFee + bedroomCost + bathroomCost + sqftCost);
    formulaBreakdown = [
      { label: 'Base service fee', amount: flatFee },
      ...(bedrooms > 0 ? [{ label: `${bedrooms} bedroom${bedrooms > 1 ? 's' : ''} × ${formatCurrency(PER_BEDROOM_RATE)}`, amount: bedroomCost }] : []),
      ...(bathrooms > 0 ? [{ label: `${bathrooms} bathroom${bathrooms > 1 ? 's' : ''} × ${formatCurrency(PER_BATHROOM_RATE)}`, amount: bathroomCost }] : []),
      ...(squareFeet > 0 ? [{ label: `${squareFeet} sq ft × ${formatCurrency(PER_SQFT_RATE)}`, amount: sqftCost }] : []),
    ];
  }

  const addOnsTotal = roundCents(
    input.addOns.reduce((sum, addOn) => {
      const quantity = input.addOnQuantities[addOn.id] ?? 0;
      return sum + addOn.price * quantity;
    }, 0)
  );

  const preDiscountSubtotal = roundCents(baseAmount + addOnsTotal);
  const discountPercent = Math.min(
    MAX_DISCOUNT_PERCENT,
    DISCOUNTS.filter((discount) => input.discountIds.includes(discount.id)).reduce(
      (sum, discount) => sum + discount.percent,
      0
    )
  );
  const discountAmount = roundCents(preDiscountSubtotal * (discountPercent / 100));
  const subtotal = roundCents(preDiscountSubtotal - discountAmount);
  const tax = input.taxEnabled ? roundCents(subtotal * TAX_RATE) : 0;
  const total = roundCents(subtotal + tax);
  const deposit = roundCents(total / 2);
  const remainingBalance = roundCents(total - deposit);

  return {
    baseAmount,
    isOverridden,
    formulaBreakdown,
    addOnsTotal,
    preDiscountSubtotal,
    discountPercent,
    discountAmount,
    subtotal,
    tax,
    total,
    deposit,
    remainingBalance,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}
