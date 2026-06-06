import { aggregateAnalyticsEvents } from '@/lib/analytics/aggregate';
import type { AnalyticsEvent, AnalyticsSummary } from '@/lib/analytics/types';

const MAX_EVENTS = 10000;
let events: AnalyticsEvent[] = [];

export function recordAnalyticsEvent(event: AnalyticsEvent): void {
  events.push(event);
  if (events.length > MAX_EVENTS) {
    events = events.slice(-MAX_EVENTS);
  }
}

export function getAnalyticsSummary(): AnalyticsSummary {
  return aggregateAnalyticsEvents(events);
}

export function resetAnalyticsForTests(): void {
  events = [];
}
