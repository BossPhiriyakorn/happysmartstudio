import { DEMO_HOME_SLIDES, DEMO_ROOMS, DEMO_TEAM_MEMBERS } from '@/data/demoData';
import { ENABLE_MOCK_DATA, isEmptyStoredJson } from '@/lib/env';
import { migrateLegacyContact, normalizeContactChannels } from '@/lib/contactChannels';
import { normalizeHomeSlide } from '@/lib/roomImages';
import { STORAGE_KEYS } from '@/lib/storageKeys';
import {
  DEFAULT_BRANDING,
  DEFAULT_CONTACT_CHANNELS,
  DEFAULT_CONTACT_LABEL,
  getBootstrapKeywords,
  getBootstrapStylePages,
  buildHomeContactMenuLinks,
} from '@/lib/data/defaults';
import { readLocalJson } from '@/lib/data/localPersistence';
import {
  fixRemovedUnsplashUrl,
  migrateBranding,
  migrateRoom,
  migrateStylePage,
  migrateMenuLinks,
  migrateTeamMember,
  storedJsonNeedsUnsplashFix,
  syncDemoRoomShowcaseContent,
  syncDemoRoomCatalog,
  syncDemoHomeSlides,
} from '@/lib/data/migrations';
import type { SiteSnapshot } from '@/lib/data/types';
import type { HomeSlide, Room, TeamMember } from '@/types/content';

function demoRooms(): Room[] {
  return DEMO_ROOMS.map((room) => ({ ...room }));
}

function demoHomeSlides(): HomeSlide[] {
  return DEMO_HOME_SLIDES.map((slide) => normalizeHomeSlide({ ...slide }));
}

function demoTeamMembers(): TeamMember[] {
  return DEMO_TEAM_MEMBERS.map((member) => ({ ...member }));
}

/**
 * Load site from localStorage (developer mode).
 * Returns hydrated snapshot + flags for what was auto-seeded with mock data.
 */
export function loadSiteFromLocalStorage(): SiteSnapshot {
  const storedBranding = readLocalJson('branding');
  const storedStylePages = readLocalJson('stylePages');
  const storedMenuLinks = readLocalJson('menuLinks');
  const storedRooms = readLocalJson('rooms');
  const storedHomeSlides = readLocalJson('homeSlides');
  const storedKeywords = readLocalJson('keywords');
  const storedTeamMembers = readLocalJson('teamMembers');
  const storedContactChannels = readLocalJson('contactChannels');
  const storedContactLink = readLocalJson('contactLink');
  const storedContactLabel = readLocalJson('contactLabel');
  const storedContactPlatform = readLocalJson('contactPlatform');

  const branding = storedBranding
    ? migrateBranding(JSON.parse(storedBranding))
    : { ...DEFAULT_BRANDING };

  const loadedPages = (storedStylePages ? JSON.parse(storedStylePages) : getBootstrapStylePages()).map(
    migrateStylePage,
  );

  const contactLabel = storedContactLabel || DEFAULT_CONTACT_LABEL;

  const rawMenuLinks = storedMenuLinks
    ? JSON.parse(storedMenuLinks)
    : buildHomeContactMenuLinks(loadedPages, DEFAULT_CONTACT_LABEL, branding.homeLabel);
  const menuLinks = migrateMenuLinks(rawMenuLinks, contactLabel);

  if (
    storedMenuLinks &&
    typeof window !== 'undefined' &&
    JSON.stringify(menuLinks) !== storedMenuLinks
  ) {
    localStorage.setItem(STORAGE_KEYS.menuLinks, JSON.stringify(menuLinks));
  }

  let rooms: Room[] = storedRooms
    ? JSON.parse(storedRooms).map((r: Record<string, unknown>) => migrateRoom(r))
    : [];

  let homeSlides: HomeSlide[] = storedHomeSlides
    ? JSON.parse(storedHomeSlides).map((s: Record<string, unknown>) =>
        normalizeHomeSlide({
          id: s.id as string,
          imageUrl: fixRemovedUnsplashUrl(s.imageUrl as string),
          title: s.title as string,
          pageId: (s.pageId as string) || (s.style as string) || loadedPages[0]?.id || 'moderne',
          aspectRatio: s.aspectRatio as HomeSlide['aspectRatio'],
        }),
      )
    : [];

  if (ENABLE_MOCK_DATA) {
    if (isEmptyStoredJson(storedRooms)) {
      rooms = demoRooms();
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.rooms, JSON.stringify(rooms));
      }
    }
    if (isEmptyStoredJson(storedHomeSlides)) {
      homeSlides = demoHomeSlides();
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.homeSlides, JSON.stringify(homeSlides));
      }
    }
  }

  if (ENABLE_MOCK_DATA && rooms.length > 0) {
    const catalog = syncDemoRoomCatalog(rooms);
    if (catalog.changed) {
      rooms = catalog.rooms;
    }
    const synced = syncDemoRoomShowcaseContent(rooms);
    if (synced.changed) {
      rooms = synced.rooms;
    }
    if ((catalog.changed || synced.changed) && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.rooms, JSON.stringify(rooms));
    }
  }

  if (ENABLE_MOCK_DATA && homeSlides.length >= 0) {
    const slideSync = syncDemoHomeSlides(homeSlides);
    if (slideSync.changed) {
      homeSlides = slideSync.homeSlides;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.homeSlides, JSON.stringify(homeSlides));
      }
    }
  }

  if (storedJsonNeedsUnsplashFix(storedRooms) && typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.rooms, JSON.stringify(rooms));
  }
  if (storedJsonNeedsUnsplashFix(storedHomeSlides) && typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.homeSlides, JSON.stringify(homeSlides));
  }

  let keywords = storedKeywords ? JSON.parse(storedKeywords) : [...getBootstrapKeywords()];
  if (!storedKeywords && ENABLE_MOCK_DATA && typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.keywords, JSON.stringify(getBootstrapKeywords()));
  }

  let teamMembers: TeamMember[] = storedTeamMembers
    ? JSON.parse(storedTeamMembers).map((m: TeamMember) => migrateTeamMember(m))
    : [];

  if (ENABLE_MOCK_DATA && isEmptyStoredJson(storedTeamMembers)) {
    teamMembers = demoTeamMembers();
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.teamMembers, JSON.stringify(teamMembers));
    }
  }

  if (storedJsonNeedsUnsplashFix(storedTeamMembers) && typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.teamMembers, JSON.stringify(teamMembers));
  }

  let contactChannels = { ...DEFAULT_CONTACT_CHANNELS };
  if (storedContactChannels) {
    contactChannels = normalizeContactChannels(JSON.parse(storedContactChannels));
  } else {
    const legacy = migrateLegacyContact(
      storedContactLink || DEFAULT_CONTACT_CHANNELS.line || '',
      storedContactPlatform || 'Line',
    );
    contactChannels = normalizeContactChannels({ ...DEFAULT_CONTACT_CHANNELS, ...legacy });
  }

  return {
    branding,
    stylePages: loadedPages,
    menuLinks,
    rooms,
    homeSlides,
    keywords,
    teamMembers,
    contactChannels,
    contactLabel,
  };
}

/** Apply API snapshot with migrations (product mode). */
export function hydrateProductSnapshot(raw: SiteSnapshot): SiteSnapshot {
  const stylePages = raw.stylePages.map(migrateStylePage);
  const branding = migrateBranding(raw.branding);
  const contactLabel = raw.contactLabel || DEFAULT_CONTACT_LABEL;
  return {
    branding,
    stylePages,
    menuLinks: migrateMenuLinks(
      raw.menuLinks.length
        ? raw.menuLinks
        : buildHomeContactMenuLinks(stylePages, contactLabel, branding.homeLabel),
      contactLabel,
    ),
    rooms: raw.rooms.map((r) => migrateRoom(r as unknown as Record<string, unknown>)),
    homeSlides: raw.homeSlides.map((s) =>
      normalizeHomeSlide({
        ...s,
        imageUrl: fixRemovedUnsplashUrl(s.imageUrl),
      }),
    ),
    keywords: raw.keywords,
    teamMembers: raw.teamMembers.map(migrateTeamMember),
    contactChannels: normalizeContactChannels(raw.contactChannels),
    contactLabel,
  };
}
