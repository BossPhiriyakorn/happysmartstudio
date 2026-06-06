'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { BarChart3, Eye, LayoutGrid, RefreshCw } from 'lucide-react';
import { useApp } from '@/components/AppContext';
import { loadAnalyticsSummary } from '@/lib/analytics/client';
import type { AnalyticsSummary, CardViewStat } from '@/lib/analytics/types';

function StatCard({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
  return (
    <div className="border border-gray-200 bg-gray-50/50 p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-gray-500">
        {icon}
        <span className="text-[10px] uppercase font-bold tracking-widest">{label}</span>
      </div>
      <p className="text-3xl font-semibold tracking-tight text-black">{value.toLocaleString('th-TH')}</p>
    </div>
  );
}

function groupCardsByPage(cards: CardViewStat[]): Map<string, CardViewStat[]> {
  const map = new Map<string, CardViewStat[]>();
  for (const card of cards) {
    const list = map.get(card.pageId) ?? [];
    list.push(card);
    map.set(card.pageId, list);
  }
  return map;
}

export default function EditAnalyticsPanel() {
  const { t, stylePages } = useApp();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await loadAnalyticsSummary();
    setSummary(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const cardsByPage = useMemo(
    () => (summary ? groupCardsByPage(summary.cardViews) : new Map<string, CardViewStat[]>()),
    [summary],
  );

  const pageOrder = useMemo(() => {
    const ids = new Set<string>();
    for (const page of summary?.pageViews ?? []) {
      const slug = page.path.replace(/^\//, '');
      if (slug && slug !== 'contact') ids.add(slug);
    }
    for (const id of cardsByPage.keys()) ids.add(id);
    return [...ids];
  }, [summary, cardsByPage]);

  const pageName = (pageId: string) =>
    stylePages.find((p) => p.id === pageId)?.name ?? pageId;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-black mb-1">{t('edit.analytics.title')}</h2>
          <p className="text-gray-500 text-xs leading-relaxed max-w-xl">{t('edit.analytics.desc')}</p>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-widest hover:border-black transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {t('edit.analytics.refresh')}
        </button>
      </div>

      <p className="text-[11px] text-gray-400">{t('edit.analytics.hint')}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          label={t('edit.analytics.totalPageViews')}
          value={summary?.totalPageViews ?? 0}
          icon={<Eye size={14} />}
        />
        <StatCard
          label={t('edit.analytics.totalCardViews')}
          value={summary?.totalCardViews ?? 0}
          icon={<LayoutGrid size={14} />}
        />
      </div>

      <div className="border border-gray-200">
        <div className="border-b border-gray-200 bg-white px-4 py-3 flex items-center gap-2">
          <BarChart3 size={16} className="text-gray-500" />
          <p className="text-sm font-bold text-black">{t('edit.analytics.topPages')}</p>
        </div>
        {!summary || summary.pageViews.length === 0 ? (
          <p className="text-sm text-gray-400 p-6 text-center">{t('edit.analytics.emptyPages')}</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {summary.pageViews.map((row, index) => (
              <li key={row.path} className="px-4 py-3 flex items-center justify-between gap-4 text-sm">
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-gray-400 mr-2">#{index + 1}</span>
                  <span className="font-medium text-black">{row.label}</span>
                  <span className="text-[10px] text-gray-400 ml-2 font-mono">{row.path}</span>
                </div>
                <span className="shrink-0 text-xs font-semibold tabular-nums bg-gray-100 px-2 py-1">
                  {row.count.toLocaleString('th-TH')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border border-gray-200">
        <div className="border-b border-gray-200 bg-white px-4 py-3">
          <p className="text-sm font-bold text-black">{t('edit.analytics.topCards')}</p>
        </div>
        {!summary || summary.cardViews.length === 0 ? (
          <p className="text-sm text-gray-400 p-6 text-center">{t('edit.analytics.emptyCards')}</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {pageOrder.map((pageId) => {
              const cards = cardsByPage.get(pageId);
              if (!cards?.length) return null;
              return (
                <div key={pageId} className="px-4 py-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
                    {pageName(pageId)}
                  </p>
                  <ul className="space-y-2">
                    {cards.map((card, index) => (
                      <li
                        key={card.roomId}
                        className="flex items-center justify-between gap-4 text-sm border border-gray-100 bg-gray-50/40 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <span className="text-[10px] font-mono text-gray-400 mr-2">#{index + 1}</span>
                          <span className="font-medium text-black truncate">{card.roomName}</span>
                        </div>
                        <span className="shrink-0 text-xs font-semibold tabular-nums">
                          {card.count.toLocaleString('th-TH')}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
