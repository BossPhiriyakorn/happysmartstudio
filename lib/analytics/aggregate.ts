import type { AnalyticsEvent, AnalyticsSummary, CardViewStat, PageViewStat } from '@/lib/analytics/types';

export function aggregateAnalyticsEvents(events: AnalyticsEvent[]): AnalyticsSummary {
  const pageMap = new Map<string, PageViewStat>();
  const cardMap = new Map<string, CardViewStat>();

  for (const event of events) {
    if (event.type === 'page_view') {
      const existing = pageMap.get(event.path);
      if (existing) {
        existing.count += 1;
      } else {
        pageMap.set(event.path, { path: event.path, label: event.label, count: 1 });
      }
    } else {
      const key = event.roomId;
      const existing = cardMap.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        cardMap.set(key, {
          roomId: event.roomId,
          roomName: event.roomName,
          pageId: event.pageId,
          pageLabel: event.pageLabel,
          count: 1,
        });
      }
    }
  }

  const pageViews = [...pageMap.values()].sort((a, b) => b.count - a.count);
  const cardViews = [...cardMap.values()].sort((a, b) => b.count - a.count);

  return {
    totalPageViews: pageViews.reduce((sum, row) => sum + row.count, 0),
    totalCardViews: cardViews.reduce((sum, row) => sum + row.count, 0),
    pageViews,
    cardViews,
    updatedAt: new Date().toISOString(),
  };
}
