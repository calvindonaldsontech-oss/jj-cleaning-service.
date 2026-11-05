export type ViewMode = 'admin' | 'client';

interface ModeToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const OPTIONS: { value: ViewMode; label: string }[] = [
  { value: 'admin', label: 'Admin Mode' },
  { value: 'client', label: 'Client Proposal View' },
];

export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div role="group" aria-label="View mode" className="inline-flex rounded-full bg-slate-100 p-1">
      {OPTIONS.map((option) => {
        const active = option.value === mode;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 sm:px-4 ${
              active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
