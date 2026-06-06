import { aggregateAnalyticsEvents } from '@/lib/analytics/aggregate';
import type { AnalyticsEvent, AnalyticsSummary } from '@/lib/analytics/types';

const STORAGE_KEY = 'site_analytics_events';
const MAX_EVENTS = 5000;

function readEvents(): AnalyticsEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AnalyticsEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeEvents(events: AnalyticsEvent[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
  } catch {
    // quota — trim oldest half
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-Math.floor(MAX_EVENTS / 2))));
    } catch {
      /* ignore */
    }
  }
}

export function appendLocalAnalyticsEvent(event: AnalyticsEvent): void {
  const next = [...readEvents(), event];
  writeEvents(next);
}

export function getLocalAnalyticsSummary(): AnalyticsSummary {
  return aggregateAnalyticsEvents(readEvents());
}

export function clearLocalAnalytics(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
