export interface CustomerDetails {
  clientName: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

export type RequiredCustomerField = 'email' | 'phone' | 'address';

export type CustomerErrors = Partial<Record<RequiredCustomerField, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_ALLOWED_PATTERN = /^\+?[\d\s().-]+$/;

export function validateCustomer(customer: CustomerDetails): CustomerErrors {
  const errors: CustomerErrors = {};

  const email = customer.email.trim();
  if (email === '') {
    errors.email = 'Email is required.';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  const phone = customer.phone.trim();
  const phoneDigits = phone.replace(/\D/g, '');
  if (phone === '') {
    errors.phone = 'Phone number is required.';
  } else if (!PHONE_ALLOWED_PATTERN.test(phone) || phoneDigits.length < 10 || phoneDigits.length > 15) {
    errors.phone = 'Enter a valid phone number with at least 10 digits.';
  }

  if (customer.address.trim() === '') {
    errors.address = 'Service address is required.';
  }

  return errors;
}

export function isCustomerComplete(customer: CustomerDetails): boolean {
  return Object.keys(validateCustomer(customer)).length === 0;
}
