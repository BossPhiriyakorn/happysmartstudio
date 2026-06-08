import { DEMO_HOME_SLIDES, DEMO_ROOMS, DEMO_ROOMS_PER_PAGE, DEMO_STYLE_PAGE_IDS } from '@/data/demoData';
import { ENABLE_MOCK_DATA } from '@/lib/env';
import { roomToPortfolioImages } from '@/lib/roomImages';
import { ABOUT_MENU_HREF } from '@/lib/menu';
import type { HomeSlide, MenuLink, Room, StylePage, TeamMember } from '@/types/content';
import { RESERVED_SLUGS, slugify } from '@/types/content';
import type { Branding } from '@/lib/data/types';
import { DEFAULT_ABOUT_LABEL, DEFAULT_BRANDING, DEFAULT_CONTACT_LABEL } from '@/lib/data/defaults';

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
  // Invalid / removed IDs previously used in demoData mock seed
  'photo-1616486338812-3ada6874e4b0': 'photo-1618221195710-dd6b41faaea6',
  'photo-1615874952477-0d0c4e2d0b0e': 'photo-1586023492125-27b2c045efd7',
  'photo-1616136216624-2e6b0c0b0b0e': 'photo-1615529328331-f8917597711f',
  'photo-1618220179428-22790a81fe7e': 'photo-1583847268964-b28dc8f51f92',
  'photo-1615874694520-474823129e83': 'photo-1600585154340-be6161a56a0c',
  'photo-1616485669229-2f6c0d0b0b0e': 'photo-1502672260266-1c1ef2d93688',
  'photo-1600566753190-17f95baa1063': 'photo-1522708323590-d24dbb6b0267',
  'photo-1600573472591-4b0b0b0b0b0e': 'photo-1484154218962-a197022b5858',
  'photo-1600607687939-26a4b2e2b2b2': 'photo-1512917774080-9991f1c4c750',
  'photo-1600047509807-ba8f88d2a0b0': 'photo-1600607687644-c7171b42498f',
  'photo-1600210492496-724fe5c67fb1': 'photo-1600585154526-990dced4db0d',
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
  if (raw.iconMode !== 'text' && raw.iconMode !== 'logo') {
    merged.iconMode = DEFAULT_BRANDING.iconMode;
  }
  if (typeof raw.logoUrl !== 'string') {
    merged.logoUrl = DEFAULT_BRANDING.logoUrl;
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
  if (typeof raw.hqAddressMapUrl !== 'string') {
    merged.hqAddressMapUrl = DEFAULT_BRANDING.hqAddressMapUrl;
  }
  if (typeof raw.hqAddress2Enabled !== 'boolean') {
    merged.hqAddress2Enabled = DEFAULT_BRANDING.hqAddress2Enabled;
  }
  if (typeof raw.hqAddress2Line1 !== 'string') {
    merged.hqAddress2Line1 = DEFAULT_BRANDING.hqAddress2Line1;
  }
  if (typeof raw.hqAddress2Line2 !== 'string') {
    merged.hqAddress2Line2 = DEFAULT_BRANDING.hqAddress2Line2;
  }
  if (typeof raw.hqAddress2MapUrl !== 'string') {
    merged.hqAddress2MapUrl = DEFAULT_BRANDING.hqAddress2MapUrl;
  }
  if (!raw.contactHqLabel?.trim() || raw.contactHqLabel === 'สตูดิโอสำนักงานใหญ่') {
    merged.contactHqLabel = DEFAULT_BRANDING.contactHqLabel;
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

/** แยกเมนู «เกี่ยวกับเรา» ออกจากปุ่มติดต่อ — ลิงก์ไป /contact แต่ไม่ใช้ชื่อปุ่ม CTA */
export function migrateMenuLinks(
  links: MenuLink[],
  contactLabel = DEFAULT_CONTACT_LABEL,
): MenuLink[] {
  return links.map((link) => {
    const isAboutNav =
      link.href === '/contact' || link.href === '/#team' || link.href === ABOUT_MENU_HREF;
    if (!isAboutNav) return link;

    const duplicateContactNav =
      link.name === DEFAULT_CONTACT_LABEL || link.name === contactLabel;

    return {
      ...link,
      href: ABOUT_MENU_HREF,
      name: duplicateContactNav ? DEFAULT_ABOUT_LABEL : link.name,
    };
  });
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

function demoRoomNeedsRefresh(stored: Room, canonical: Room): boolean {
  return (
    stored.pageId !== canonical.pageId ||
    stored.imageUrl !== canonical.imageUrl ||
    JSON.stringify(stored.imageUrls) !== JSON.stringify(canonical.imageUrls) ||
    JSON.stringify(stored.images) !== JSON.stringify(canonical.images)
  );
}

/** เติม/อัปเดตการ์ด mock ให้ครบ DEMO_ROOMS_PER_PAGE ต่อเมนู — แก้ localStorage เก่าที่มีแค่ 2–6 ใบ */
export function syncDemoRoomCatalog(rooms: Room[]): { rooms: Room[]; changed: boolean } {
  if (!ENABLE_MOCK_DATA) return { rooms, changed: false };

  const nonDemo = rooms.filter((room) => !room.id.startsWith('demo_'));
  const storedDemoById = new Map(
    rooms.filter((room) => room.id.startsWith('demo_')).map((room) => [room.id, room]),
  );

  let changed = storedDemoById.size !== DEMO_ROOMS.length;
  const nextDemo = DEMO_ROOMS.map((canonical) => {
    const stored = storedDemoById.get(canonical.id);
    if (!stored) {
      changed = true;
      return { ...canonical };
    }
    if (demoRoomNeedsRefresh(stored, canonical)) {
      changed = true;
      return { ...canonical };
    }
    return stored;
  });

  for (const id of storedDemoById.keys()) {
    if (!DEMO_ROOM_BY_ID.has(id)) {
      changed = true;
    }
  }

  const perPage = DEMO_STYLE_PAGE_IDS.map(
    (pageId) => nextDemo.filter((room) => room.pageId === pageId).length,
  );
  if (perPage.some((count) => count !== DEMO_ROOMS_PER_PAGE)) {
    changed = true;
  }

  return { rooms: [...nonDemo, ...nextDemo], changed };
}

/** เติมสไลด์หน้าแรกจาก mock ที่ยังไม่มีใน localStorage */
export function syncDemoHomeSlides(homeSlides: HomeSlide[]): {
  homeSlides: HomeSlide[];
  changed: boolean;
} {
  if (!ENABLE_MOCK_DATA) return { homeSlides, changed: false };

  const nonDemo = homeSlides.filter((slide) => !slide.id.startsWith('slide_demo_'));
  const storedById = new Map(homeSlides.map((slide) => [slide.id, slide]));
  let changed = false;

  const nextDemo = DEMO_HOME_SLIDES.map((canonical) => {
    const stored = storedById.get(canonical.id);
    if (!stored || stored.imageUrl !== canonical.imageUrl) {
      changed = true;
      return { ...canonical };
    }
    return stored;
  });

  if (storedById.size !== nextDemo.length + nonDemo.length) {
    changed = true;
  }

  return { homeSlides: [...nonDemo, ...nextDemo], changed };
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
