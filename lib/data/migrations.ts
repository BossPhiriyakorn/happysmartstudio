import { DEMO_ROOMS } from '@/data/demoData';
import { ENABLE_MOCK_DATA } from '@/lib/env';
import { roomToPortfolioImages } from '@/lib/roomImages';
import type { HomeSlide, Room, StylePage, TeamMember } from '@/types/content';
import { RESERVED_SLUGS, slugify } from '@/types/content';
import type { Branding } from '@/lib/data/types';
import { DEFAULT_BRANDING } from '@/lib/data/defaults';

const DEMO_ROOM_BY_ID = new Map(DEMO_ROOMS.map((r) => [r.id, r]));

/** ข้อความสั้นเก่าของการ์ดตัวอย่าง — แทนที่ด้วยรายละเอียดยาวใน demoData */
const LEGACY_DEMO_DESCRIPTIONS = new Set([
  'ครัวโ open plan ท็อปหินและตู้บิวท์อิน',
  'ครัวโอ open plan ท็อปหินและตู้บิวท์อิน',
]);

/** Unsplash removed assets — remap on load so stored images stop 404ing. */
const REMOVED_UNSPLASH_PHOTOS: Record<string, string> = {
  'photo-1588854337221-4cf1efa1c3fe': 'photo-1497366216548-37526070297c',
  'photo-1519087926938-39543a358456': 'photo-1472099645785-5658abf4ff4e',
};

export function fixRemovedUnsplashUrl(url: string): string {
  let fixed = url;
  for (const [removed, replacement] of Object.entries(REMOVED_UNSPLASH_PHOTOS)) {
    if (fixed.includes(removed)) {
      fixed = fixed.replace(removed, replacement);
    }
  }
  return fixed;
}

export function storedJsonNeedsUnsplashFix(raw: string | null): boolean {
  if (!raw) return false;
  return Object.keys(REMOVED_UNSPLASH_PHOTOS).some((id) => raw.includes(id));
}

export function migrateBranding(raw: Partial<Branding>): Branding {
  const merged = { ...DEFAULT_BRANDING, ...raw };
  if (merged.name === 'Tectony') {
    merged.name = DEFAULT_BRANDING.name;
    merged.shortName = DEFAULT_BRANDING.shortName;
  }
  // introTitle always mirrors studio name
  merged.introTitle = merged.name;
  if (!raw.teamSectionTitle?.trim()) {
    merged.teamSectionTitle = DEFAULT_BRANDING.teamSectionTitle;
  }
  if (!raw.teamSectionDescription?.trim()) {
    merged.teamSectionDescription = DEFAULT_BRANDING.teamSectionDescription;
  }
  if (!raw.homeLabel?.trim()) {
    merged.homeLabel = DEFAULT_BRANDING.homeLabel;
  }
  if (!raw.hqAddressLine1?.trim()) {
    merged.hqAddressLine1 = DEFAULT_BRANDING.hqAddressLine1;
  }
  if (!raw.hqAddressLine2?.trim()) {
    merged.hqAddressLine2 = DEFAULT_BRANDING.hqAddressLine2;
  }
  if (!raw.contactHeroTitle?.trim()) {
    merged.contactHeroTitle = DEFAULT_BRANDING.contactHeroTitle;
  }
  if (!raw.contactHeroDesc?.trim()) {
    merged.contactHeroDesc = DEFAULT_BRANDING.contactHeroDesc;
  }
  if (!raw.contactChannelsTitle?.trim()) {
    merged.contactChannelsTitle = DEFAULT_BRANDING.contactChannelsTitle;
  }
  if (!raw.contactChannelsDesc?.trim()) {
    merged.contactChannelsDesc = DEFAULT_BRANDING.contactChannelsDesc;
  }
  if (!raw.contactNoChannels?.trim()) {
    merged.contactNoChannels = DEFAULT_BRANDING.contactNoChannels;
  }
  if (!raw.contactHqLabel?.trim()) {
    merged.contactHqLabel = DEFAULT_BRANDING.contactHqLabel;
  }
  if (!raw.contactHoursTitle?.trim()) {
    merged.contactHoursTitle = DEFAULT_BRANDING.contactHoursTitle;
  }
  if (!raw.contactHoursDesc?.trim()) {
    merged.contactHoursDesc = DEFAULT_BRANDING.contactHoursDesc;
  }
  return merged;
}

export function migrateTeamMember(raw: TeamMember): TeamMember {
  return {
    ...raw,
    imageUrl: fixRemovedUnsplashUrl(raw.imageUrl),
  };
}

function migrateRoomKeywords(raw: Record<string, unknown>): string[] {
  if (Array.isArray(raw.keywords)) {
    return raw.keywords.filter((k): k is string => typeof k === 'string' && k.trim().length > 0);
  }
  const legacyTag = raw.tag as string | undefined;
  if (legacyTag?.trim()) return [legacyTag.trim()];
  return [];
}

export function migrateRoom(raw: Record<string, unknown>): Room {
  const pageId = (raw.pageId as string) || (raw.style as string) || 'moderne';
  const partial: Partial<Room> = {
    id: raw.id as string,
    name: raw.name as string,
    description: raw.description as string,
    price: raw.price as string,
    imageUrl: fixRemovedUnsplashUrl(raw.imageUrl as string),
    imageUrls: ((raw.imageUrls as string[]) || [raw.imageUrl as string]).map(fixRemovedUnsplashUrl),
    pageId,
    keywords: migrateRoomKeywords(raw),
    images: raw.images as Room['images'],
    featuredRank:
      typeof raw.featuredRank === 'number' && raw.featuredRank >= 1 && raw.featuredRank <= 3
        ? raw.featuredRank
        : undefined,
  };
  const images = roomToPortfolioImages(partial);
  return {
    ...partial,
    id: partial.id!,
    name: partial.name!,
    description: partial.description!,
    price: partial.price!,
    pageId,
    keywords: partial.keywords!,
    images,
    imageUrl: fixRemovedUnsplashUrl(images[0]?.url || partial.imageUrl || ''),
    imageUrls: images.map((i) => fixRemovedUnsplashUrl(i.url)),
    featuredRank: partial.featuredRank,
  };
}

export function migrateStylePage(raw: StylePage & { showInFilter?: boolean }): StylePage {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description ?? '',
  };
}

/** อัปเดตรายละเอียดการ์ด demo ที่ยังเป็นข้อความสั้นใน localStorage */
export function syncDemoRoomShowcaseContent(rooms: Room[]): { rooms: Room[]; changed: boolean } {
  if (!ENABLE_MOCK_DATA) return { rooms, changed: false };

  let changed = false;
  const next = rooms.map((room) => {
    const canonical = DEMO_ROOM_BY_ID.get(room.id);
    if (!canonical) return room;

    const trimmed = room.description.trim();
    const isLegacyShort =
      LEGACY_DEMO_DESCRIPTIONS.has(trimmed) ||
      (room.id === 'demo_mo2' && trimmed.length < 120);

    if (!isLegacyShort || trimmed === canonical.description.trim()) return room;

    changed = true;
    return { ...room, description: canonical.description };
  });

  return { rooms: next, changed };
}

export function uniqueSlug(base: string, existing: StylePage[]): string {
  let slug = slugify(base);
  if (RESERVED_SLUGS.has(slug)) slug = `${slug}-page`;
  const ids = new Set(existing.map((p) => p.id));
  let candidate = slug;
  let i = 2;
  while (ids.has(candidate)) {
    candidate = `${slug}-${i}`;
    i += 1;
  }
  return candidate;
}
