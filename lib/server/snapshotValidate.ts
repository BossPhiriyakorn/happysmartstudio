import type { SiteSnapshot } from '@/lib/data/types';

export function isValidSiteSnapshot(value: unknown): value is SiteSnapshot {
  if (!value || typeof value !== 'object') return false;
  const s = value as SiteSnapshot;
  return (
    !!s.branding &&
    Array.isArray(s.stylePages) &&
    Array.isArray(s.menuLinks) &&
    Array.isArray(s.rooms) &&
    Array.isArray(s.homeSlides) &&
    Array.isArray(s.keywords) &&
    Array.isArray(s.teamMembers) &&
    !!s.contactChannels &&
    typeof s.contactLabel === 'string'
  );
}
