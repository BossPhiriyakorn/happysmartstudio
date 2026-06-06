'use client';

import type { ReactNode } from 'react';
import { BarChart3, Image as ImageIcon, List, Settings, Tag } from 'lucide-react';
import { useApp } from '@/components/AppContext';

export type ActiveTab = 'home-slides' | 'menus' | 'keywords' | 'general' | 'analytics';

interface EditSidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  hidden?: boolean;
}

export default function EditSidebar({ activeTab, setActiveTab, hidden }: EditSidebarProps) {
  const { t } = useApp();

  if (hidden) return null;

  const tabBtn = (tab: ActiveTab, label: string, icon: ReactNode) => {
    const isActive = activeTab === tab;
    return (
      <button
        key={tab}
        type="button"
        onClick={() => setActiveTab(tab)}
        aria-current={isActive ? 'page' : undefined}
        className={`group relative flex w-full items-center gap-3 rounded-sm px-2 py-2.5 text-left text-sm font-medium transition-colors ${
          isActive
            ? 'bg-black text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-50 hover:text-black'
        }`}
      >
        {isActive && (
          <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-white/90" aria-hidden />
        )}
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border transition-colors ${
            isActive
              ? 'border-white/20 bg-white/10 text-white'
              : 'border-gray-200 bg-white text-gray-500 group-hover:border-gray-300 group-hover:text-black'
          }`}
        >
          {icon}
        </span>
        <span className="flex-1 truncate leading-snug">{label}</span>
      </button>
    );
  };

  const iconSize = 15;

  return (
    <nav
      className="lg:col-span-3 sticky top-24 z-10 w-full border border-gray-200 bg-white shadow-sm"
      aria-label={t('edit.controlCenter')}
    >
      <div className="border-b border-gray-100 px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
          {t('edit.controlCenter')}
        </p>
      </div>

      <div className="flex flex-col gap-0.5 p-2">
        {tabBtn('home-slides', t('edit.tab.homeSlides'), <ImageIcon size={iconSize} strokeWidth={1.75} />)}
        {tabBtn('menus', t('edit.group.menus'), <List size={iconSize} strokeWidth={1.75} />)}
        {tabBtn('keywords', t('edit.group.keywords'), <Tag size={iconSize} strokeWidth={1.75} />)}
      </div>

      <div className="mx-3 border-t border-gray-100" />

      <div className="flex flex-col gap-0.5 p-2 pt-1.5">
        {tabBtn('general', t('edit.group.general'), <Settings size={iconSize} strokeWidth={1.75} />)}
        {tabBtn('analytics', t('edit.group.analytics'), <BarChart3 size={iconSize} strokeWidth={1.75} />)}
      </div>
    </nav>
  );
}
