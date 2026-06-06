import { NextResponse } from 'next/server';
import type { AnalyticsEvent } from '@/lib/analytics/types';
import {
  getAnalyticsSummary,
  recordAnalyticsEvent,
} from '@/lib/server/analytics/memoryStore';

function isAnalyticsEvent(value: unknown): value is AnalyticsEvent {
  if (!value || typeof value !== 'object') return false;
  const e = value as AnalyticsEvent;
  if (e.type === 'page_view') {
    return typeof e.path === 'string' && typeof e.label === 'string';
  }
  if (e.type === 'card_view') {
    return (
      typeof e.roomId === 'string' &&
      typeof e.roomName === 'string' &&
      typeof e.pageId === 'string' &&
      typeof e.pageLabel === 'string'
    );
  }
  return false;
}

/** Record a public page/card view (no auth — aggregate counts only). */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { event?: unknown };
    if (!isAnalyticsEvent(body.event)) {
      return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
    }
    recordAnalyticsEvent({
      ...body.event,
      at: body.event.at || new Date().toISOString(),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/analytics] POST', err);
    return NextResponse.json({ error: 'Failed to record event' }, { status: 500 });
  }
}

/** Summary for edit dashboard — merges server-side counts. */
export async function GET() {
  try {
    return NextResponse.json({ summary: getAnalyticsSummary() });
  } catch (err) {
    console.error('[api/analytics] GET', err);
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 });
  }
}
