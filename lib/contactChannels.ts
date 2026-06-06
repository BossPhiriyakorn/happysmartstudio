import type { ContactChannels } from '@/types/content';

export type ContactChannelKey = 'line' | 'phone' | 'email';

export interface ContactChannelOption {
  key: ContactChannelKey;
  label: string;
  value: string;
  href: string;
}

const CHANNEL_ORDER: ContactChannelKey[] = ['line', 'phone', 'email'];

function trim(value?: string): string | undefined {
  const v = value?.trim();
  return v || undefined;
}

export function normalizeContactChannels(raw: Partial<ContactChannels>): ContactChannels {
  return {
    line: trim(raw.line),
    phone: trim(raw.phone),
    email: trim(raw.email),
  };
}

export function buildChannelHref(key: ContactChannelKey, value: string): string {
  switch (key) {
    case 'line':
      if (/^https?:\/\//i.test(value) || value.startsWith('line://')) return value;
      if (value.startsWith('@')) return `https://line.me/R/ti/p/${value.slice(1)}`;
      return `https://line.me/R/ti/p/${value}`;
    case 'phone':
      return `tel:${value.replace(/[^\d+]/g, '')}`;
    case 'email':
      return value.startsWith('mailto:') ? value : `mailto:${value}`;
  }
}

export function getContactChannelOptions(
  channels: ContactChannels,
  labels: Record<ContactChannelKey, string>,
): ContactChannelOption[] {
  const normalized = normalizeContactChannels(channels);
  return CHANNEL_ORDER.flatMap((key) => {
    const value = normalized[key];
    if (!value) return [];
    return [{ key, label: labels[key], value, href: buildChannelHref(key, value) }];
  });
}

export function openContactChannel(option: ContactChannelOption): void {
  if (option.key === 'line') {
    window.open(option.href, '_blank', 'noopener,noreferrer');
    return;
  }
  window.location.href = option.href;
}

export function migrateLegacyContact(link: string, platform: string): ContactChannels {
  const trimmedLink = link.trim();
  if (!trimmedLink) return {};

  const platformLower = platform.trim().toLowerCase();
  if (platformLower.includes('line')) return { line: trimmedLink };
  if (platformLower.includes('phone') || platformLower.includes('tel') || platformLower.includes('โทร')) {
    return { phone: trimmedLink.replace(/^tel:/i, '') };
  }
  if (platformLower.includes('mail') || platformLower.includes('email') || platformLower.includes('อีเมล')) {
    return { email: trimmedLink.replace(/^mailto:/i, '') };
  }
  if (trimmedLink.startsWith('mailto:')) return { email: trimmedLink.replace(/^mailto:/i, '') };
  if (trimmedLink.startsWith('tel:')) return { phone: trimmedLink.replace(/^tel:/i, '') };
  if (/^https?:\/\//i.test(trimmedLink)) return { line: trimmedLink };
  return { line: trimmedLink };
}
