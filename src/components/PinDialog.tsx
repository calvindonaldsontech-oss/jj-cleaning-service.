import { useState } from 'react';
import type { FormEvent } from 'react';
import { Lock } from 'lucide-react';
import ModalShell from '@/components/ModalShell';
import PinField from '@/components/PinField';
import {
  PIN_CHECK_ERROR_MESSAGE,
  PIN_LOCKED_MESSAGE,
  PIN_PATTERN,
  verifyAdminPin,
} from '@/lib/adminPin';

interface PinDialogProps {
  onUnlock: (pin: string) => void;
  onCancel: () => void;
}

export default function PinDialog({ onUnlock, onCancel }: PinDialogProps) {
  const [pin, setPin] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!PIN_PATTERN.test(pin)) {
      setMessage('Enter your 4-digit PIN.');
      return;
    }

    setIsChecking(true);
    setMessage(null);
    try {
      const status = await verifyAdminPin(pin);
      if (status === 'ok') {
        onUnlock(pin);
        return;
      }
      setPin('');
      setMessage(status === 'locked' ? PIN_LOCKED_MESSAGE : 'Incorrect PIN. Please try again.');
    } catch {
      setMessage(PIN_CHECK_ERROR_MESSAGE);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <ModalShell
      title="Enter Admin PIN"
      description="Admin Mode is protected. Enter your 4-digit PIN to open rates, square footage, and leads."
      onClose={onCancel}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <PinField id="admin-pin" label="PIN" value={pin} onChange={setPin} autoFocus />

        {message && (
          <p role="alert" className="text-sm text-red-700">
            {message}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isChecking}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Lock className="h-4 w-4" aria-hidden="true" />
            {isChecking ? 'Checking...' : 'Unlock Admin Mode'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
