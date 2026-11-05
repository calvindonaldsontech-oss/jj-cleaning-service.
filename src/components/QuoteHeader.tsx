import { Sparkles } from 'lucide-react';
import ModeToggle from '@/components/ModeToggle';
import type { ViewMode } from '@/components/ModeToggle';

interface QuoteHeaderProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export default function QuoteHeader({ mode, onModeChange }: QuoteHeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white print:hidden">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-6 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
            <Sparkles className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-semibold leading-tight text-slate-900 sm:text-2xl">
              JJ Cleaning Services LLC
            </h1>
            <p className="mt-1 text-sm leading-normal text-slate-600 sm:text-base">
              Quick Quote &amp; Deposit Estimator
            </p>
          </div>
        </div>
        <ModeToggle mode={mode} onChange={onModeChange} />
      </div>
    </header>
  );
}
