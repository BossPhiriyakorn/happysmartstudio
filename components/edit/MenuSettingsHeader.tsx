'use client';

import { Plus } from 'lucide-react';

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
  addMenuLabel?: string;
  onAddMenu?: () => void;
}

const selectClass =
  'border border-gray-200 bg-white focus:border-black p-3 text-sm focus:outline-none transition-colors w-full sm:w-auto sm:min-w-[220px]';

export default function MenuSettingsHeader({
  selection,
  onSelectionChange,
  options,
  title,
  description,
  addMenuLabel,
  onAddMenu,
}: MenuSettingsHeaderProps) {
  const selectValue = selection === 'add-page' ? '' : selection;

  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-1">
          <h2 className="text-xl font-bold tracking-tight text-black">{title}</h2>
          {addMenuLabel && onAddMenu && (
            <button
              type="button"
              onClick={onAddMenu}
              aria-pressed={selection === 'add-page'}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest transition-colors ${
                selection === 'add-page'
                  ? 'bg-black text-white'
                  : 'border border-gray-200 bg-white text-black hover:border-black'
              }`}
            >
              <Plus size={14} strokeWidth={2} />
              {addMenuLabel}
            </button>
          )}
        </div>
        <p className="text-gray-500 text-xs leading-relaxed">{description}</p>
      </div>
      <div className="flex flex-col gap-1.5 sm:items-end shrink-0">
        <label htmlFor="menu-target-select" className="text-xs uppercase font-bold text-gray-500 tracking-wider">
          เลือกเมนู
        </label>
        <select
          id="menu-target-select"
          value={selectValue}
          onChange={(e) => onSelectionChange(normalizeMenuSelection(e.target.value))}
          className={selectClass}
        >
          {selection === 'add-page' && (
            <option value="" disabled>
              เลือกเมนู...
            </option>
          )}
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
