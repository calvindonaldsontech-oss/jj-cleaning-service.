import { QUOTE_VALID_DAYS, formatCurrency, roundCents } from '@/lib/pricing';
import type { AddOn, QuoteResult, ServiceType } from '@/lib/pricing';
import { BUSINESS_NAME, CARD_PAYMENT_URL, TERMS, ZELLE_EMAIL, PDF_FOOTNOTE } from '@/lib/business';
import type { CustomerDetails } from '@/lib/customer';

export interface ProposalAddOn {
  label: string;
  quantity: number;
  perUnit: boolean;
  lineTotal: number;
}

export interface ProposalData {
  clientName: string;
  email: string;
  address: string;
  squareFeet: string;
  bedrooms: string;
  bathrooms: string;
  serviceLabel: string;
  isOverridden: boolean;
  baseAmount: number;
  formulaBreakdown: { label: string; amount: number }[];
  addOns: ProposalAddOn[];
  addOnsTotal: number;
  preDiscountSubtotal: number;
  discountPercent: number;
  discountAmount: number;
  subtotal: number;
  taxEnabled: boolean;
  tax: number;
  total: number;
  deposit: number;
  remainingBalance: number;
  quoteDate: Date;
  expirationDate: Date;
}

export type EstimateStatus = 'pending' | 'approved' | 'bounced';

export interface SignatureRecord {
  printedName: string;
  signedAt: Date;
  imageDataUrl: string;
}

interface ProposalInput {
  customer: CustomerDetails;
  squareFeet: string;
  bedrooms: string;
  bathrooms: string;
  service: ServiceType;
  addOns: AddOn[];
  addOnQuantities: Record<string, number>;
  quote: QuoteResult;
  taxEnabled: boolean;
  quoteDate: Date;
}

export function buildProposalData(input: ProposalInput): ProposalData {
  const { quote } = input;
  const addOns = input.addOns.flatMap((addOn) => {
    const quantity = input.addOnQuantities[addOn.id] ?? 0;
    if (quantity <= 0) return [];
    return [{ label: addOn.label, quantity, perUnit: addOn.perUnit, lineTotal: roundCents(addOn.price * quantity) }];
  });

  const expirationDate = new Date(input.quoteDate);
  expirationDate.setDate(expirationDate.getDate() + QUOTE_VALID_DAYS);

  return {
    clientName: input.customer.clientName.trim(),
    email: input.customer.email.trim(),
    address: input.customer.address.trim(),
    squareFeet: input.squareFeet.trim(),
    bedrooms: input.bedrooms.trim(),
    bathrooms: input.bathrooms.trim(),
    serviceLabel: input.service.label,
    isOverridden: quote.isOverridden,
    baseAmount: quote.baseAmount,
    formulaBreakdown: quote.formulaBreakdown,
    addOns,
    addOnsTotal: quote.addOnsTotal,
    preDiscountSubtotal: quote.preDiscountSubtotal,
    discountPercent: quote.discountPercent,
    discountAmount: quote.discountAmount,
    subtotal: quote.subtotal,
    taxEnabled: input.taxEnabled,
    tax: quote.tax,
    total: quote.total,
    deposit: quote.deposit,
    remainingBalance: quote.remainingBalance,
    quoteDate: input.quoteDate,
    expirationDate,
  };
}

const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' });
const dateTimeFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' });

export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

export function formatDateTime(date: Date): string {
  return dateTimeFormatter.format(date);
}

export function displayName(proposal: ProposalData, signature: SignatureRecord | null): string {
  return signature?.printedName.trim() || proposal.clientName || 'Client';
}

export function buildQuoteText(proposal: ProposalData, signature: SignatureRecord | null): string {
  const lines: string[] = [
    `${BUSINESS_NAME} - Cleaning Proposal`,
    '',
    `Client: ${proposal.clientName || 'Not provided'}`,
    `Address: ${proposal.address || 'Not provided'}`,
    `Quote date: ${formatDate(proposal.quoteDate)}`,
    `Valid until: ${formatDate(proposal.expirationDate)}`,
    '',
    `Service: ${proposal.serviceLabel}`,
  ];

  if (proposal.squareFeet || proposal.bedrooms || proposal.bathrooms) {
    const details: string[] = [];
    if (proposal.bedrooms) details.push(`${proposal.bedrooms} bed`);
    if (proposal.bathrooms) details.push(`${proposal.bathrooms} bath`);
    if (proposal.squareFeet) details.push(`${proposal.squareFeet} sq ft`);
    lines.push(`Property: ${details.join(', ')}`);
  }

  lines.push('', 'Base estimate breakdown:');
  for (const line of proposal.formulaBreakdown) {
    lines.push(`  ${line.label}: ${formatCurrency(line.amount)}`);
  }
  lines.push(`Base total: ${formatCurrency(proposal.baseAmount)}${proposal.isOverridden ? ' (flat rate)' : ''}`);

  if (proposal.addOns.length > 0) {
    lines.push('Add-ons:');
    for (const addOn of proposal.addOns) {
      const quantityText = addOn.perUnit ? ` x${addOn.quantity}` : '';
      lines.push(`  - ${addOn.label}${quantityText}: ${formatCurrency(addOn.lineTotal)}`);
    }
  }

  lines.push('');
  lines.push(`Subtotal: ${formatCurrency(proposal.preDiscountSubtotal)}`);
  if (proposal.discountAmount > 0) {
    lines.push(`Discounts (${proposal.discountPercent}% off): -${formatCurrency(proposal.discountAmount)}`);
    lines.push(`Discounted subtotal: ${formatCurrency(proposal.subtotal)}`);
  }
  if (proposal.taxEnabled) {
    lines.push(`Sales tax: ${formatCurrency(proposal.tax)}`);
  }
  lines.push(`TOTAL JOB ESTIMATE: ${formatCurrency(proposal.total)}`);
  lines.push(`50% retainer deposit: ${formatCurrency(proposal.deposit)}`);
  lines.push(`Remaining balance due upon completion: ${formatCurrency(proposal.remainingBalance)}`);
  lines.push('');
  const paymentMethods = [`Zelle ${ZELLE_EMAIL}`, CARD_PAYMENT_URL && `Card ${CARD_PAYMENT_URL}`].filter(Boolean);
  lines.push(`Pay deposit: ${paymentMethods.join(' | ')}`);

  if (signature) {
    lines.push('');
    lines.push(`Accepted and signed by ${displayName(proposal, signature)} on ${formatDateTime(signature.signedAt)}`);
  }

  lines.push('');
  lines.push(PDF_FOOTNOTE);

  return lines.join('\n');
}

export function buildEmailHref(proposal: ProposalData, signature: SignatureRecord | null): string {
  const greeting = proposal.clientName ? `Hello ${proposal.clientName},` : 'Hello,';
  const body = [
    greeting,
    '',
    'Thank you for choosing JJ Cleaning Services LLC. Your proposal details are below.',
    '',
    buildQuoteText(proposal, signature),
    '',
    'Terms & Cancellation Policy:',
    ...TERMS.map((term) => `- ${term}`),
    '',
    'Thank you,',
    BUSINESS_NAME,
  ].join('\n');

  const subject = `Your cleaning proposal from ${BUSINESS_NAME}`;
  return `mailto:${encodeURIComponent(proposal.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
