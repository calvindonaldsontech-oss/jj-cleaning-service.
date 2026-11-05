import { supabase } from '@/lib/supabase';

const PIN_STATUSES = ['ok', 'invalid', 'locked', 'invalid_new'] as const;

export type PinStatus = (typeof PIN_STATUSES)[number];

export const PIN_PATTERN = /^\d{4}$/;

export const PIN_LOCKED_MESSAGE =
  'Too many incorrect attempts. Admin Mode is locked for 15 minutes.';

export const PIN_CHECK_ERROR_MESSAGE =
  'The PIN could not be checked. Check your connection and try again.';

function parseStatus(data: unknown): PinStatus {
  const status = PIN_STATUSES.find((candidate) => candidate === data);
  if (!status) throw new Error('Unexpected response from server.');
  return status;
}

export async function verifyAdminPin(pin: string): Promise<PinStatus> {
  const { data, error } = await supabase.rpc('verify_admin_pin', { p_pin: pin });
  if (error) throw new Error(error.message);
  return parseStatus(data);
}

export async function changeAdminPin(currentPin: string, newPin: string): Promise<PinStatus> {
  const { data, error } = await supabase.rpc('change_admin_pin', {
    p_current: currentPin,
    p_new: newPin,
  });
  if (error) throw new Error(error.message);
  return parseStatus(data);
}
