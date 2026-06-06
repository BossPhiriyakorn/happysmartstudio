'use client';

export type GeneralSelection = 'brand' | 'footer' | 'address' | 'intro' | 'channels' | 'audit';

interface GeneralOption {
  value: GeneralSelection;
  label: string;
}

interface GeneralSettingsHeaderProps {
  selection: GeneralSelection;
  onSelectionChange: (value: GeneralSelection) => void;
  options: GeneralOption[];
  title: string;
  description: string;
}

const selectClass =
  'border border-gray-200 bg-white focus:border-black p-3 text-sm focus:outline-none transition-colors w-full sm:w-auto sm:min-w-[220px]';

export default function GeneralSettingsHeader({
  selection,
  onSelectionChange,
  options,
  title,
  description,
}: GeneralSettingsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-black mb-1">{title}</h2>
        <p className="text-gray-500 text-xs leading-relaxed">{description}</p>
      </div>
      <div className="flex flex-col gap-1.5 sm:items-end shrink-0">
        <label htmlFor="general-target-select" className="text-xs uppercase font-bold text-gray-500 tracking-wider">
          เลือกหมวด
        </label>
        <select
          id="general-target-select"
          value={selection}
          onChange={(e) => onSelectionChange(e.target.value as GeneralSelection)}
          className={selectClass}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
