import { appendLocalAnalyticsEvent } from '@/lib/analytics/storage';
import type { AnalyticsEvent } from '@/lib/analytics/types';

async function postAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event }),
    });
  } catch {
    // localStorage remains source of truth for same-browser stats
  }
}

export function trackPageView(path: string, label: string): void {
  const event: AnalyticsEvent = {
    type: 'page_view',
    path,
    label,
    at: new Date().toISOString(),
  };
  appendLocalAnalyticsEvent(event);
  void postAnalyticsEvent(event);
}

export function trackCardView(
  roomId: string,
  roomName: string,
  pageId: string,
  pageLabel: string,
): void {
  const event: AnalyticsEvent = {
    type: 'card_view',
    roomId,
    roomName,
    pageId,
    pageLabel,
    at: new Date().toISOString(),
  };
  appendLocalAnalyticsEvent(event);
  void postAnalyticsEvent(event);
}

export function pageLabelForPath(
  path: string,
  stylePages: { id: string; name: string }[],
  homeLabel = 'หน้าแรก',
): string {
  if (path === '/') return homeLabel;
  if (path === '/contact') return 'ติดต่อ';
  const slug = path.replace(/^\//, '');
  const page = stylePages.find((p) => p.id === slug);
  if (page) return page.name;
  return slug || path;
}
