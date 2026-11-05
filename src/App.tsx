import { useState } from 'react';
import QuoteHeader from '@/components/QuoteHeader';
import QuoteCalculator from '@/components/QuoteCalculator';
import PinDialog from '@/components/PinDialog';
import type { ViewMode } from '@/components/ModeToggle';

function App() {
  const [adminPin, setAdminPin] = useState<string | null>(null);
  const [isPinPromptOpen, setIsPinPromptOpen] = useState(false);
  const mode: ViewMode = adminPin === null ? 'client' : 'admin';

  const handleModeChange = (nextMode: ViewMode) => {
    if (nextMode === 'admin') {
      if (mode === 'admin') return;
      setIsPinPromptOpen(true);
      return;
    }
    setAdminPin(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
      <QuoteHeader mode={mode} onModeChange={handleModeChange} />
      <QuoteCalculator adminPin={adminPin} onSwitchToClient={() => setAdminPin(null)} />
      {isPinPromptOpen && (
        <PinDialog
          onUnlock={(pin) => {
            setIsPinPromptOpen(false);
            setAdminPin(pin);
          }}
          onCancel={() => setIsPinPromptOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
