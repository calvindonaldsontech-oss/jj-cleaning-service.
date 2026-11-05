import { useState } from 'react';
import { Mail, Save, ShieldCheck, KeyRound } from 'lucide-react';
import { fieldInputClass, fieldLabelClass } from '@/components/formStyles';
import { isValidEmail } from '@/lib/settings';
import type { SystemSettings } from '@/lib/settings';

interface SystemSettingsPanelProps {
  settings: SystemSettings;
  onSave: (settings: SystemSettings) => void;
}

export default function SystemSettingsPanel({ settings, onSave }: SystemSettingsPanelProps) {
  const [apiToken, setApiToken] = useState(settings.apiToken);
  const [fromName, setFromName] = useState(settings.email.fromName);
  const [replyToEmail, setReplyToEmail] = useState(settings.email.replyToEmail);
  const [bounceEmail, setBounceEmail] = useState(settings.email.bounceEmail);
  const [showToken, setShowToken] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<{ replyTo?: string; bounce?: string }>({});

  const handleSave = () => {
    const nextErrors: { replyTo?: string; bounce?: string } = {};
    if (!isValidEmail(replyToEmail)) nextErrors.replyTo = 'Enter a valid email address.';
    if (!isValidEmail(bounceEmail)) nextErrors.bounce = 'Enter a valid email address.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setSaved(false);
      return;
    }

    onSave({
      apiToken: apiToken.trim(),
      email: {
        fromName: fromName.trim() || 'JJ Cleaning Services LLC',
        replyToEmail: replyToEmail.trim(),
        bounceEmail: bounceEmail.trim(),
      },
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <KeyRound className="mt-0.5 h-5 w-5 text-brand-700" aria-hidden="true" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-900">API Key / Bearer Token</h2>
            <p className="mt-1 text-sm text-slate-600">
              Used for third-party service authentication. Stored locally in this browser.
            </p>

            <div className="mt-4">
              <label htmlFor="api-token" className={fieldLabelClass}>
                API Token / Bearer Key
              </label>
              <div className="relative">
                <input
                  id="api-token"
                  type={showToken ? 'text' : 'password'}
                  placeholder="Paste your API key or bearer token"
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  className={`${fieldInputClass} pr-20 font-mono text-sm`}
                />
                <button
                  type="button"
                  onClick={() => setShowToken((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-xs font-medium text-slate-500 transition hover:text-brand-700"
                >
                  {showToken ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <Mail className="mt-0.5 h-5 w-5 text-brand-700" aria-hidden="true" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-900">Outbound Email Settings</h2>
            <p className="mt-1 text-sm text-slate-600">
              Configure From Name, Reply-To, and Bounce Notification email for outbound estimates and notifications.
            </p>

            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="from-name" className={fieldLabelClass}>
                  From Name
                </label>
                <input
                  id="from-name"
                  type="text"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  className={fieldInputClass}
                />
              </div>

              <div>
                <label htmlFor="reply-to-email" className={fieldLabelClass}>
                  Business Reply-To Email
                </label>
                <input
                  id="reply-to-email"
                  type="email"
                  value={replyToEmail}
                  onChange={(e) => {
                    setReplyToEmail(e.target.value);
                    if (errors.replyTo) setErrors((prev) => ({ ...prev, replyTo: undefined }));
                  }}
                  className={`${fieldInputClass} ${errors.replyTo ? 'border-red-500 focus:border-red-600 focus:ring-red-600/20' : ''}`}
                />
                {errors.replyTo && <p className="mt-1 text-sm text-red-700">{errors.replyTo}</p>}
              </div>

              <div>
                <label htmlFor="bounce-email" className={fieldLabelClass}>
                  Bounce Notification Email
                </label>
                <input
                  id="bounce-email"
                  type="email"
                  value={bounceEmail}
                  onChange={(e) => {
                    setBounceEmail(e.target.value);
                    if (errors.bounce) setErrors((prev) => ({ ...prev, bounce: undefined }));
                  }}
                  className={`${fieldInputClass} ${errors.bounce ? 'border-red-500 focus:border-red-600 focus:ring-red-600/20' : ''}`}
                />
                {errors.bounce && <p className="mt-1 text-sm text-red-700">{errors.bounce}</p>}
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">
                Outbound emails include standard Return-Path and Reply-To headers for bounce tracking.
                Bounced emails are automatically flagged with a "Delivery Failed / Bounced" status.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          Save Settings
        </button>
        {saved && (
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Settings saved.
          </p>
        )}
      </div>
    </div>
  );
}
