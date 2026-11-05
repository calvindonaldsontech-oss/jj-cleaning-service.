import { fieldInputClass, fieldLabelClass } from '@/components/formStyles';

interface PinFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}

export default function PinField({ id, label, value, onChange, autoFocus = false }: PinFieldProps) {
  return (
    <div>
      <label htmlFor={id} className={fieldLabelClass}>
        {label}
      </label>
      <input
        id={id}
        type="password"
        inputMode="numeric"
        autoComplete="off"
        maxLength={4}
        value={value}
        autoFocus={autoFocus}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, '').slice(0, 4))}
        className={`${fieldInputClass} text-center text-lg tracking-[0.5em]`}
      />
    </div>
  );
}
