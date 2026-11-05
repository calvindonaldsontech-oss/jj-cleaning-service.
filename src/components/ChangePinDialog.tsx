import { useState } from 'react';
import type { FormEvent } from 'react';
import ModalShell from '@/components/ModalShell';
import PinField from '@/components/PinField';
import {
  PIN_CHECK_ERROR_MESSAGE,
  PIN_LOCKED_MESSAGE,
  PIN_PATTERN,
  changeAdminPin,
} from '@/lib/adminPin';

interface ChangePinDialogProps {
  onClose: () => void;
}

interface FormMessage {
  tone: 'error' | 'success';
  text: string;
}

export default function ChangePinDialog({ onClose }: ChangePinDialogProps) {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [message, setMessage] = useState<FormMessage | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!PIN_PATTERN.test(currentPin)) {
      setMessage({ tone: 'error', text: 'Enter your current 4-digit PIN.' });
      return;
    }
    if (!PIN_PATTERN.test(newPin)) {
      setMessage({ tone: 'error', text: 'The new PIN must be exactly 4 digits.' });
      return;
    }
    if (newPin !== confirmPin) {
      setMessage({ tone: 'error', text: 'The new PIN entries do not match.' });
      return;
    }

    setIsSaving(true);
    setMessage(null);
    try {
      const status = await changeAdminPin(currentPin, newPin);
      if (status === 'ok') {
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
        setMessage({ tone: 'success', text: 'Your Admin PIN has been changed.' });
      } else if (status === 'locked') {
        setMessage({ tone: 'error', text: PIN_LOCKED_MESSAGE });
      } else {
        setMessage({ tone: 'error', text: 'The current PIN is incorrect.' });
      }
    } catch {
      setMessage({ tone: 'error', text: PIN_CHECK_ERROR_MESSAGE });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ModalShell
      title="Change Admin PIN"
      description="Enter the current PIN, then choose a new 4-digit PIN."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <PinField id="current-pin" label="Current PIN" value={currentPin} onChange={setCurrentPin} autoFocus />
        <PinField id="new-pin" label="New PIN" value={newPin} onChange={setNewPin} />
        <PinField id="confirm-pin" label="Confirm new PIN" value={confirmPin} onChange={setConfirmPin} />

        {message && (
          <p role="alert" className={`text-sm ${message.tone === 'error' ? 'text-red-700' : 'text-brand-700'}`}>
            {message.text}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
          >
            Close
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSaving ? 'Saving...' : 'Save New PIN'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
