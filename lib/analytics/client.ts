import type { AnalyticsSummary, CardViewStat, PageViewStat } from '@/lib/analytics/types';
import { getLocalAnalyticsSummary } from '@/lib/analytics/storage';

function mergePageStats(rows: PageViewStat[]): PageViewStat[] {
  const map = new Map<string, PageViewStat>();
  for (const row of rows) {
    const existing = map.get(row.path);
    if (existing) existing.count += row.count;
    else map.set(row.path, { ...row });
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

function mergeCardStats(rows: CardViewStat[]): CardViewStat[] {
  const map = new Map<string, CardViewStat>();
  for (const row of rows) {
    const existing = map.get(row.roomId);
    if (existing) existing.count += row.count;
    else map.set(row.roomId, { ...row });
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

function mergeSummaries(local: AnalyticsSummary, remote: AnalyticsSummary): AnalyticsSummary {
  const pageViews = mergePageStats([...local.pageViews, ...remote.pageViews]);
  const cardViews = mergeCardStats([...local.cardViews, ...remote.cardViews]);
  return {
    totalPageViews: pageViews.reduce((s, r) => s + r.count, 0),
    totalCardViews: cardViews.reduce((s, r) => s + r.count, 0),
    pageViews,
    cardViews,
    updatedAt: new Date().toISOString(),
  };
}

export async function loadAnalyticsSummary(): Promise<AnalyticsSummary> {
  const local = getLocalAnalyticsSummary();
  try {
    const res = await fetch('/api/analytics', { cache: 'no-store' });
    if (!res.ok) return local;
    const data = (await res.json()) as { summary?: AnalyticsSummary };
    if (!data.summary) return local;
    return mergeSummaries(local, data.summary);
  } catch {
    return local;
  }
}
