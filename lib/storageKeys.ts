/** Brand-agnostic localStorage keys — ไม่ผูกชื่อแบรนด์ */
export const STORAGE_KEYS = {
  branding: 'site_branding',
  stylePages: 'site_style_pages',
  menuLinks: 'site_menu_links',
  rooms: 'site_rooms',
  homeSlides: 'site_home_slides',
  keywords: 'site_keywords',
  teamMembers: 'site_team_members',
  contactChannels: 'site_contact_channels',
  contactLabel: 'site_contact_label',
  contactLink: 'site_contact_link',
  contactPlatform: 'site_contact_platform',
  locale: 'site_locale',
  tags: 'site_tags',
} as const;

type StorageKey = keyof typeof STORAGE_KEYS;

const LEGACY_KEYS: Partial<Record<StorageKey, string>> = {
  branding: 'tectony_branding',
  stylePages: 'tectony_style_pages',
  menuLinks: 'tectony_menu_links',
  rooms: 'tectony_rooms',
  homeSlides: 'tectony_home_slides',
  keywords: 'tectony_keywords',
  teamMembers: 'tectony_team_members',
  contactChannels: 'tectony_contact_channels',
  contactLabel: 'tectony_contact_label',
  contactLink: 'tectony_contact_link',
  contactPlatform: 'tectony_contact_platform',
  locale: 'tectony_locale',
  tags: 'tectony_tags',
};

export const ALL_STORAGE_KEYS = Object.values(STORAGE_KEYS);
export const ALL_LEGACY_STORAGE_KEYS = Object.values(LEGACY_KEYS).filter(Boolean) as string[];

/** Read from new key; migrate from legacy `tectony_*` once if needed. */
export function readStoredItem(key: StorageKey): string | null {
  if (typeof window === 'undefined') return null;

  const current = localStorage.getItem(STORAGE_KEYS[key]);
  if (current !== null) return current;

  const legacyKey = LEGACY_KEYS[key];
  if (!legacyKey) return null;

  const legacyValue = localStorage.getItem(legacyKey);
  if (legacyValue === null) return null;

  localStorage.setItem(STORAGE_KEYS[key], legacyValue);
  localStorage.removeItem(legacyKey);
  return legacyValue;
}

export function removeStoredLocale(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.locale);
  const legacy = LEGACY_KEYS.locale;
  if (legacy) localStorage.removeItem(legacy);
}

export function removeAllStoredSiteData(): void {
  if (typeof window === 'undefined') return;
  [...ALL_STORAGE_KEYS, ...ALL_LEGACY_STORAGE_KEYS].forEach((key) => {
    localStorage.removeItem(key);
  });
}
