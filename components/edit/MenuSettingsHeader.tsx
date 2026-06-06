'use client';

export type MenuSelection =
  | 'home'
  | 'contact'
  | 'team'
  | 'add-page'
  | `style-${string}`;

/** @deprecated legacy values from older dropdown — mapped in edit page */
export type LegacyMenuSelection = `page-${string}` | `cards-${string}`;

export function parseStyleMenuId(selection: MenuSelection | LegacyMenuSelection): string | null {
  if (selection.startsWith('style-')) return selection.slice(6);
  if (selection.startsWith('page-')) return selection.slice(5);
  if (selection.startsWith('cards-')) return selection.slice(6);
  return null;
}

export function normalizeMenuSelection(selection: string): MenuSelection {
  if (selection.startsWith('page-') || selection.startsWith('cards-')) {
    return `style-${selection.split('-').slice(1).join('-')}` as MenuSelection;
  }
  return selection as MenuSelection;
}

interface MenuOption {
  value: MenuSelection;
  label: string;
}

interface MenuSettingsHeaderProps {
  selection: MenuSelection;
  onSelectionChange: (value: MenuSelection) => void;
  options: MenuOption[];
  title: string;
  description: string;
}

const selectClass =
  'border border-gray-200 bg-white focus:border-black p-3 text-sm focus:outline-none transition-colors w-full sm:w-auto sm:min-w-[220px]';

export default function MenuSettingsHeader({
  selection,
  onSelectionChange,
  options,
  title,
  description,
}: MenuSettingsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-black mb-1">{title}</h2>
        <p className="text-gray-500 text-xs leading-relaxed">{description}</p>
      </div>
      <div className="flex flex-col gap-1.5 sm:items-end shrink-0">
        <label htmlFor="menu-target-select" className="text-xs uppercase font-bold text-gray-500 tracking-wider">
          เลือกเมนู
        </label>
        <select
          id="menu-target-select"
          value={selection}
          onChange={(e) => onSelectionChange(normalizeMenuSelection(e.target.value))}
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
