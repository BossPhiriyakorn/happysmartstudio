export type AnalyticsEventType = 'page_view' | 'card_view';

export interface AnalyticsPageViewEvent {
  type: 'page_view';
  path: string;
  label: string;
  at: string;
}

export interface AnalyticsCardViewEvent {
  type: 'card_view';
  roomId: string;
  roomName: string;
  pageId: string;
  pageLabel: string;
  at: string;
}

export type AnalyticsEvent = AnalyticsPageViewEvent | AnalyticsCardViewEvent;

export interface PageViewStat {
  path: string;
  label: string;
  count: number;
}

export interface CardViewStat {
  roomId: string;
  roomName: string;
  pageId: string;
  pageLabel: string;
  count: number;
}

export interface AnalyticsSummary {
  totalPageViews: number;
  totalCardViews: number;
  pageViews: PageViewStat[];
  cardViews: CardViewStat[];
  updatedAt: string;
}
