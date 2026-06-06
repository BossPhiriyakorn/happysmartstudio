'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { EditPreviewDraftContext } from '@/components/editPreviewContext';
import { mergeAppContextWithPreviewDraft } from '@/lib/editPreview';
import { DEMO_HOME_SLIDES, DEMO_ROOMS, DEMO_TEAM_MEMBERS } from '@/data/demoData';
import { isDeveloperMode, isProductMode } from '@/lib/config/appMode';
import {
  DEFAULT_BRANDING,
  DEFAULT_CONTACT_CHANNELS,
  DEFAULT_CONTACT_LABEL,
  MOCK_KEYWORDS,
  MOCK_STYLE_PAGES,
  buildHomeContactMenuLinks,
  emptySiteSnapshot,
  getBootstrapKeywords,
  getBootstrapStylePages,
} from '@/lib/data/defaults';
import { fixRemovedUnsplashUrl, migrateBranding, uniqueSlug } from '@/lib/data/migrations';
import { LocalStorageQuotaError } from '@/lib/data/localPersistence';
import {
  flushProductSnapshotSave,
  loadSiteSnapshot,
  persistLocalField,
  scheduleProductSnapshotSave,
} from '@/lib/data/persistence';
import { hydrateProductSnapshot, loadSiteFromLocalStorage } from '@/lib/data/siteLoader';
import type { Branding, SiteSnapshot } from '@/lib/data/types';
import { ENABLE_MOCK_DATA } from '@/lib/env';
import { editUiLabel } from '@/lib/editUi';
import { publicUiLabel } from '@/lib/publicUi';
import { normalizeContactChannels } from '@/lib/contactChannels';
import { removeAllStoredSiteData, removeStoredLocale, STORAGE_KEYS } from '@/lib/storageKeys';
import { buildNavLinks, ABOUT_MENU_HREF } from '@/lib/menu';
import { roomToPortfolioImages, normalizeHomeSlide } from '@/lib/roomImages';
import {
  Room,
  StylePage,
  HomeSlide,
  MenuLink,
  Keyword,
  TeamMember,
  ContactChannels,
} from '@/types/content';

export type { Room, StylePage, HomeSlide, MenuLink, Keyword, TeamMember, ContactChannels };
export type { Branding };

export interface AppContextType {
  t: (key: string) => string;
  branding: Branding;
  stylePages: StylePage[];
  menuLinks: MenuLink[];
  rooms: Room[];
  homeSlides: HomeSlide[];
  keywords: Keyword[];
  teamMembers: TeamMember[];
  contactChannels: ContactChannels;
  contactLabel: string;
  updateBranding: (newBranding: Partial<Branding>) => void;
  addStylePage: (name: string, description?: string) => StylePage | null;
  updateStylePage: (id: string, data: Partial<StylePage>) => void;
  deleteStylePage: (id: string) => void;
  updateHomeSlides: (slides: HomeSlide[]) => void;
  addRoom: (room: Omit<Room, 'id'>) => void;
  editRoom: (room: Room) => void;
  deleteRoom: (roomId: string) => void;
  addKeyword: (name: string) => Keyword | null;
  updateKeyword: (id: string, name: string) => void;
  deleteKeyword: (id: string) => void;
  addTeamMember: (member: Omit<TeamMember, 'id'>) => TeamMember | null;
  updateTeamMember: (id: string, data: Partial<Omit<TeamMember, 'id'>>) => void;
  deleteTeamMember: (id: string) => void;
  updateContactSettings: (channels: ContactChannels, label: string) => void;
  resetAll: () => void;
  /** Flush current snapshot to server (product) or no-op success (developer). */
  syncNow: () => Promise<boolean>;
}

function demoRooms(): Room[] {
  return DEMO_ROOMS.map((room) => ({ ...room }));
}

function demoHomeSlides(): HomeSlide[] {
  return DEMO_HOME_SLIDES.map((slide) => normalizeHomeSlide({ ...slide }));
}

function demoTeamMembers(): TeamMember[] {
  return DEMO_TEAM_MEMBERS.map((member) => ({ ...member }));
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = useState<Branding>(DEFAULT_BRANDING);
  const [stylePages, setStylePages] = useState<StylePage[]>(() => getBootstrapStylePages());
  const [menuLinks, setMenuLinks] = useState<MenuLink[]>(() =>
    buildHomeContactMenuLinks(getBootstrapStylePages(), DEFAULT_CONTACT_LABEL, DEFAULT_BRANDING.homeLabel),
  );
  const [rooms, setRooms] = useState<Room[]>([]);
  const [homeSlides, setHomeSlides] = useState<HomeSlide[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>(() => getBootstrapKeywords());
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [contactChannels, setContactChannels] = useState<ContactChannels>(DEFAULT_CONTACT_CHANNELS);
  const [contactLabel, setContactLabel] = useState(DEFAULT_CONTACT_LABEL);
  const [initialized, setInitialized] = useState(false);
  const skipProductSync = useRef(true);

  const t = useCallback((key: string) => {
    if (key.startsWith('edit.') || key.startsWith('common.')) {
      return editUiLabel(key);
    }
    return publicUiLabel(key);
  }, []);

  const buildSnapshot = useCallback(
    (): SiteSnapshot => ({
      branding,
      stylePages,
      menuLinks,
      rooms,
      homeSlides,
      keywords,
      teamMembers,
      contactChannels,
      contactLabel,
    }),
    [
      branding,
      stylePages,
      menuLinks,
      rooms,
      homeSlides,
      keywords,
      teamMembers,
      contactChannels,
      contactLabel,
    ],
  );

  const saveToStorage = (key: keyof typeof STORAGE_KEYS, data: unknown) => {
    try {
      persistLocalField(key, data);
    } catch (error) {
      if (error instanceof LocalStorageQuotaError) {
        alert(
          'พื้นที่เก็บข้อมูลในเบราว์เซอร์เต็มแล้ว (โหมด mock) กรุณาลบการ์ด/รูปเก่า หรือใช้รูปที่เล็กลง แล้วลองใหม่',
        );
      }
      // Do not rethrow — state in memory must still update so the UI reflects edits immediately.
    }
  };

  const applySnapshot = useCallback((snap: SiteSnapshot) => {
    setBranding(snap.branding);
    setStylePages(snap.stylePages);
    setMenuLinks(snap.menuLinks);
    setRooms(snap.rooms);
    setHomeSlides(snap.homeSlides);
    setKeywords(snap.keywords);
    setTeamMembers(snap.teamMembers);
    setContactChannels(snap.contactChannels);
    setContactLabel(snap.contactLabel);
  }, []);

  const applyMenuLinks = (
    pages: StylePage[],
    prevLinks: MenuLink[],
    homeLabel: string,
    keepHomeLabel = true,
  ) => {
    const links = buildNavLinks(pages, undefined, homeLabel);
    if (keepHomeLabel) {
      const homePrev = prevLinks.find((l) => l.href === '/');
      const homeNew = links.find((l) => l.href === '/');
      if (homePrev && homeNew) homeNew.name = homePrev.name;
    }
    const aboutPrev = prevLinks.find(
      (l) => l.href === ABOUT_MENU_HREF || l.href === '/contact' || l.href === '/#team',
    );
    const aboutNew = links.find((l) => l.href === ABOUT_MENU_HREF);
    if (aboutPrev && aboutNew && aboutPrev.name !== 'ติดต่อ') aboutNew.name = aboutPrev.name;
    return links;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let cancelled = false;

    async function init() {
      document.documentElement.lang = 'th';
      removeStoredLocale();

      if (isProductMode()) {
        const raw = await loadSiteSnapshot();
        const snap = raw ? hydrateProductSnapshot(raw) : emptySiteSnapshot();
        if (!cancelled) applySnapshot(snap);
      } else {
        const snap = loadSiteFromLocalStorage();
        if (!cancelled) applySnapshot(snap);
      }

      if (!cancelled) {
        skipProductSync.current = true;
        setInitialized(true);
        requestAnimationFrame(() => {
          skipProductSync.current = false;
        });
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [applySnapshot]);

  useEffect(() => {
    if (!initialized || !isProductMode() || skipProductSync.current) return;
    scheduleProductSnapshotSave(buildSnapshot());
  }, [initialized, buildSnapshot]);

  const syncNow = useCallback(async (): Promise<boolean> => {
    if (!isProductMode()) return true;
    return flushProductSnapshotSave(buildSnapshot());
  }, [buildSnapshot]);

  const updateBranding = (newBranding: Partial<Branding>) => {
    setBranding((prev) => {
      const name = newBranding.name ?? prev.name;
      const updated = migrateBranding({ ...prev, ...newBranding, name, introTitle: name });
      saveToStorage('branding', updated);
      setMenuLinks((ml) => {
        const links = applyMenuLinks(stylePages, ml, updated.homeLabel, false);
        saveToStorage('menuLinks', links);
        return links;
      });
      return updated;
    });
  };

  const addStylePage = (name: string, description = '') => {
    const id = uniqueSlug(name, stylePages);
    const page: StylePage = { id, name, description };
    setStylePages((prev) => {
      const updated = [...prev, page];
      saveToStorage('stylePages', updated);
      setMenuLinks((ml) => {
        const links = applyMenuLinks(updated, ml, branding.homeLabel);
        saveToStorage('menuLinks', links);
        return links;
      });
      return updated;
    });
    return page;
  };

  const updateStylePage = (id: string, data: Partial<StylePage>) => {
    setStylePages((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...data } : p));
      saveToStorage('stylePages', updated);
      setMenuLinks((ml) => {
        const links = applyMenuLinks(updated, ml, branding.homeLabel);
        saveToStorage('menuLinks', links);
        return links;
      });
      return updated;
    });
  };

  const deleteStylePage = (id: string) => {
    setStylePages((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      saveToStorage('stylePages', updated);
      setMenuLinks((ml) => {
        const links = applyMenuLinks(updated, ml, branding.homeLabel);
        saveToStorage('menuLinks', links);
        return links;
      });
      return updated;
    });
    setRooms((prev) => {
      const updated = prev.filter((r) => r.pageId !== id);
      saveToStorage('rooms', updated);
      return updated;
    });
  };

  const updateHomeSlides = (slides: HomeSlide[]) => {
    const normalized = slides.map(normalizeHomeSlide);
    setHomeSlides(normalized);
    saveToStorage('homeSlides', normalized);
  };

  const addRoom = (roomData: Omit<Room, 'id'>) => {
    setRooms((prev) => {
      const images = roomData.images?.length
        ? roomData.images
        : roomToPortfolioImages(roomData);
      const newRoom: Room = {
        ...roomData,
        images,
        imageUrl: images[0]?.url || roomData.imageUrl,
        imageUrls: images.map((i) => i.url),
        id: `room_${Date.now()}`,
      };
      const updated = [newRoom, ...prev];
      saveToStorage('rooms', updated);
      return updated;
    });
  };

  const editRoom = (updatedRoom: Room) => {
    setRooms((prev) => {
      const images = updatedRoom.images?.length
        ? updatedRoom.images
        : roomToPortfolioImages(updatedRoom);
      const normalized = {
        ...updatedRoom,
        images,
        imageUrl: images[0]?.url || updatedRoom.imageUrl,
        imageUrls: images.map((i) => i.url),
      };
      const updated = prev.map((r) => (r.id === normalized.id ? normalized : r));
      saveToStorage('rooms', updated);
      return updated;
    });
  };

  const deleteRoom = (roomId: string) => {
    setRooms((prev) => {
      const updated = prev.filter((r) => r.id !== roomId);
      saveToStorage('rooms', updated);
      return updated;
    });
  };

  const addKeyword = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    let created: Keyword | null = null;
    setKeywords((prev) => {
      if (prev.some((k) => k.name.toLowerCase() === trimmed.toLowerCase())) return prev;
      created = { id: `kw_${Date.now()}`, name: trimmed };
      const updated = [...prev, created];
      saveToStorage('keywords', updated);
      return updated;
    });
    return created;
  };

  const updateKeyword = (id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setKeywords((prev) => {
      const target = prev.find((k) => k.id === id);
      if (!target || target.name === trimmed) return prev;
      if (prev.some((k) => k.id !== id && k.name.toLowerCase() === trimmed.toLowerCase())) return prev;
      const updated = prev.map((k) => (k.id === id ? { ...k, name: trimmed } : k));
      saveToStorage('keywords', updated);
      setRooms((roomPrev) => {
        const roomUpdated = roomPrev.map((r) => ({
          ...r,
          keywords: r.keywords.map((kw) => (kw === target.name ? trimmed : kw)),
        }));
        saveToStorage('rooms', roomUpdated);
        return roomUpdated;
      });
      return updated;
    });
  };

  const deleteKeyword = (id: string) => {
    setKeywords((prev) => {
      const target = prev.find((k) => k.id === id);
      if (!target) return prev;
      const updated = prev.filter((k) => k.id !== id);
      saveToStorage('keywords', updated);
      setRooms((roomPrev) => {
        const roomUpdated = roomPrev.map((r) => ({
          ...r,
          keywords: r.keywords.filter((kw) => kw !== target.name),
        }));
        saveToStorage('rooms', roomUpdated);
        return roomUpdated;
      });
      return updated;
    });
  };

  const addTeamMember = (member: Omit<TeamMember, 'id'>) => {
    const name = member.name.trim();
    const role = member.role.trim();
    if (!name || !member.imageUrl) return null;
    let created: TeamMember | null = null;
    setTeamMembers((prev) => {
      created = {
        id: `team_${Date.now()}`,
        name,
        role,
        imageUrl: fixRemovedUnsplashUrl(member.imageUrl),
      };
      const updated = [...prev, created];
      saveToStorage('teamMembers', updated);
      return updated;
    });
    return created;
  };

  const updateTeamMember = (id: string, data: Partial<Omit<TeamMember, 'id'>>) => {
    setTeamMembers((prev) => {
      const target = prev.find((m) => m.id === id);
      if (!target) return prev;
      const updated = prev.map((m) =>
        m.id === id
          ? {
              ...m,
              ...(data.name !== undefined ? { name: data.name.trim() } : {}),
              ...(data.role !== undefined ? { role: data.role.trim() } : {}),
              ...(data.imageUrl !== undefined
                ? { imageUrl: fixRemovedUnsplashUrl(data.imageUrl) }
                : {}),
            }
          : m,
      );
      saveToStorage('teamMembers', updated);
      return updated;
    });
  };

  const deleteTeamMember = (id: string) => {
    setTeamMembers((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      saveToStorage('teamMembers', updated);
      return updated;
    });
  };

  const updateContactSettings = (channels: ContactChannels, label: string) => {
    const normalized = normalizeContactChannels(channels);
    setContactChannels(normalized);
    setContactLabel(label.trim() || DEFAULT_CONTACT_LABEL);
    saveToStorage('contactChannels', normalized);
    saveToStorage('contactLabel', label.trim() || DEFAULT_CONTACT_LABEL);
  };

  const resetAll = () => {
    const nextRooms = ENABLE_MOCK_DATA ? demoRooms() : [];
    const nextSlides = ENABLE_MOCK_DATA ? demoHomeSlides() : [];
    const nextTeam = ENABLE_MOCK_DATA ? demoTeamMembers() : [];

    const resetPages = ENABLE_MOCK_DATA ? [...MOCK_STYLE_PAGES] : [];
    const resetKeywords = ENABLE_MOCK_DATA ? [...MOCK_KEYWORDS] : [];
    setBranding(DEFAULT_BRANDING);
    setStylePages(resetPages);
    setMenuLinks(buildHomeContactMenuLinks(resetPages, DEFAULT_CONTACT_LABEL, DEFAULT_BRANDING.homeLabel));
    setRooms(nextRooms);
    setHomeSlides(nextSlides);
    setKeywords(resetKeywords);
    setTeamMembers(nextTeam);
    setContactChannels(DEFAULT_CONTACT_CHANNELS);
    setContactLabel(DEFAULT_CONTACT_LABEL);

    if (isDeveloperMode() && typeof window !== 'undefined') {
      removeAllStoredSiteData();
      saveToStorage('stylePages', resetPages);
      saveToStorage(
        'menuLinks',
        buildHomeContactMenuLinks(resetPages, DEFAULT_CONTACT_LABEL, DEFAULT_BRANDING.homeLabel),
      );
      saveToStorage('branding', DEFAULT_BRANDING);
      saveToStorage('keywords', resetKeywords);
      saveToStorage('contactChannels', DEFAULT_CONTACT_CHANNELS);
      saveToStorage('contactLabel', DEFAULT_CONTACT_LABEL);
      if (ENABLE_MOCK_DATA) {
        saveToStorage('rooms', nextRooms);
        saveToStorage('homeSlides', nextSlides);
        saveToStorage('teamMembers', nextTeam);
      }
    }

    if (isProductMode()) {
      skipProductSync.current = true;
      scheduleProductSnapshotSave({
        branding: DEFAULT_BRANDING,
        stylePages: resetPages,
        menuLinks: buildHomeContactMenuLinks(resetPages, DEFAULT_CONTACT_LABEL, DEFAULT_BRANDING.homeLabel),
        rooms: nextRooms,
        homeSlides: nextSlides,
        keywords: resetKeywords,
        teamMembers: nextTeam,
        contactChannels: DEFAULT_CONTACT_CHANNELS,
        contactLabel: DEFAULT_CONTACT_LABEL,
      });
      requestAnimationFrame(() => {
        skipProductSync.current = false;
      });
    }
  };

  return (
    <AppContext.Provider
      value={{
        t,
        branding,
        stylePages: initialized ? stylePages : getBootstrapStylePages(),
        menuLinks: initialized
          ? menuLinks
          : buildHomeContactMenuLinks(getBootstrapStylePages(), DEFAULT_CONTACT_LABEL, DEFAULT_BRANDING.homeLabel),
        rooms: initialized ? rooms : ENABLE_MOCK_DATA ? demoRooms() : [],
        homeSlides: initialized ? homeSlides : ENABLE_MOCK_DATA ? demoHomeSlides() : [],
        keywords: initialized ? keywords : getBootstrapKeywords(),
        teamMembers: initialized ? teamMembers : ENABLE_MOCK_DATA ? demoTeamMembers() : [],
        contactChannels: initialized ? contactChannels : DEFAULT_CONTACT_CHANNELS,
        contactLabel,
        updateBranding,
        addStylePage,
        updateStylePage,
        deleteStylePage,
        updateHomeSlides,
        addRoom,
        editRoom,
        deleteRoom,
        addKeyword,
        updateKeyword,
        deleteKeyword,
        addTeamMember,
        updateTeamMember,
        deleteTeamMember,
        updateContactSettings,
        resetAll,
        syncNow,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  const previewDraft = useContext(EditPreviewDraftContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return useMemo(
    () => mergeAppContextWithPreviewDraft(context, previewDraft),
    [context, previewDraft],
  );
}
