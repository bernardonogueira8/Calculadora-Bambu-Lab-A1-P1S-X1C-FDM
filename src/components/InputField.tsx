import React, { useState, useEffect } from 'react';

interface InputFieldProps {
  label: string;
  value: number | string;
  onChange: (value: any) => void;
  type?: 'text' | 'number';
  suffix?: string;
  prefix?: string;
  min?: number;
  max?: number;
  step?: number | string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  type = 'number',
  suffix,
  prefix,
  min = 0,
  max,
  step = 'any',
  placeholder,
  disabled = false,
  className = '',
  id,
}) => {
  const inputId = id || `input-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  // Internal string state allows the user to completely delete/clear the input while typing
  const [localVal, setLocalVal] = useState<string>(
    value !== undefined && value !== null ? String(value) : ''
  );
  const [isFocused, setIsFocused] = useState(false);

  // Sync with parent state when not currently focused
  useEffect(() => {
    if (!isFocused) {
      setLocalVal(value !== undefined && value !== null ? String(value) : '');
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLocalVal(raw);

    if (type === 'number') {
      if (raw === '' || raw === '-') {
        // Allows the input to be completely empty without snapping back to 0
        onChange(0);
      } else {
        const parsed = parseFloat(raw);
        if (!isNaN(parsed)) {
          onChange(parsed);
        }
      }
    } else {
      onChange(raw);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    // Auto-select text on click/tab so typing immediately replaces old number
    e.target.select();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (type === 'number') {
      if (localVal === '' || isNaN(parseFloat(localVal))) {
        setLocalVal('0');
        onChange(0);
      } else {
        const parsed = parseFloat(localVal);
        setLocalVal(String(parsed));
        onChange(parsed);
      }
    }
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={inputId} className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-xs font-semibold text-slate-400 select-none">
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          type={type}
          value={localVal}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          min={type === 'number' ? min : undefined}
          max={type === 'number' ? max : undefined}
          step={step}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 transition-all duration-150 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none ${
            prefix ? 'pl-8' : ''
          } ${suffix ? 'pr-12' : ''} ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : ''}`}
        />
        {suffix && (
          <span className="absolute right-3 text-xs font-medium text-slate-400 select-none pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
};
