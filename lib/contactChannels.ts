import type { ContactChannels } from '@/types/content';

export type ContactChannelKey = 'line' | 'phone' | 'email';

export interface ContactChannelOption {
  key: ContactChannelKey;
  label: string;
  value: string;
  href: string;
}

const CHANNEL_ORDER: ContactChannelKey[] = ['line', 'phone', 'email'];

/** จำนวนหลักสูงสุด (เบอร์ไทยแบบ 0xx — ไม่นับขีด/เว้นวรรค) */
export const PHONE_MAX_DIGITS = 10;

function trim(value?: string): string | undefined {
  const v = value?.trim();
  return v || undefined;
}

/** จำกัด input ไม่เกิน 10 หลัก — อนุญาตตัวเลข ขีด และเว้นวรรค */
export function sanitizePhoneInput(raw: string): string {
  let digits = 0;
  let out = '';

  for (const ch of raw.replace(/^tel:/i, '')) {
    if (/\d/.test(ch)) {
      if (digits >= PHONE_MAX_DIGITS) continue;
      digits += 1;
      out += ch;
    } else if (/[-\s]/.test(ch) && digits > 0 && digits < PHONE_MAX_DIGITS) {
      out += ch;
    }
  }

  return out;
}

/** เก็บเบอร์แบบที่ผู้ใช้พิมพ์ (เช่น 02-123-4567) — ตัดเฉพาะ tel: นำหน้า */
export function normalizePhoneDisplay(raw?: string): string | undefined {
  const v = raw?.trim().replace(/^tel:/i, '').trim();
  if (!v) return undefined;
  const sanitized = sanitizePhoneInput(v);
  return sanitized || undefined;
}

/** แปลงเบอร์ที่แสดงเป็น tel: สำหรับกดโทร (0xx ไทย → +66 อัตโนมัติ) */
export function buildPhoneTelHref(display: string): string {
  const stripped = display.trim().replace(/^tel:/i, '').trim();
  const hasPlus = stripped.startsWith('+');
  const digits = stripped.replace(/\D/g, '');
  if (!digits) return 'tel:';

  if (hasPlus) return `tel:+${digits}`;
  if (digits.startsWith('66') && digits.length >= 10) return `tel:+${digits}`;
  if (digits.startsWith('0')) return `tel:+66${digits.slice(1)}`;

  return `tel:${digits}`;
}

export function normalizeContactChannels(raw: Partial<ContactChannels>): ContactChannels {
  return {
    line: trim(raw.line),
    phone: normalizePhoneDisplay(raw.phone),
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
      return buildPhoneTelHref(value);
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
