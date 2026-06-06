'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useApp } from '@/components/AppContext';
import { pageLabelForPath, trackPageView } from '@/lib/analytics/track';

/** Records public page views — skips /edit. */
export default function AnalyticsTracker() {
  const pathname = usePathname();
  const { branding, stylePages } = useApp();
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname === '/edit' || pathname.startsWith('/edit/')) return;
    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;
    const label = pageLabelForPath(pathname, stylePages, branding.homeLabel);
    trackPageView(pathname, label);
  }, [pathname, stylePages, branding.homeLabel]);

  return null;
}
