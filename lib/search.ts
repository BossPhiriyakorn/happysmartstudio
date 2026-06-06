import { Room } from '@/types/content';

export function normalizeSearchText(value: string): string {
  return value.normalize('NFC').toLowerCase().trim();
}

export interface RoomSearchOptions {
  /** ชื่อแท็กทั้งหมดในหน้านั้น — ใช้จำกัดการค้นเมื่อคำค้นหาเป็นส่วนหนึ่งของแท็ก */
  keywordCatalog?: string[];
}

/**
 * ค้นหาการ์ดจากชื่อ, แท็ก, ราคา และคำอธิบาย
 * - แท็ก: จับคำย่อยได้ (เช่น "นั่งเล่น" → "ห้องนั่งเล่น")
 * - ถ้าคำค้นหาตรงกับส่วนของแท็กในหน้านั้น จะไม่จับจากคำอธิบาย (ลดผลลัพธ์หลุด)
 */
export function roomMatchesSearch(room: Room, query: string, options?: RoomSearchOptions): boolean {
  const q = normalizeSearchText(query);
  if (!q) return true;

  const name = normalizeSearchText(room.name);
  if (name.includes(q)) return true;

  const keywords = (room.keywords ?? []).map(normalizeSearchText).filter(Boolean);
  if (keywords.some((kw) => kw.includes(q) || q.includes(kw))) return true;

  const price = normalizeSearchText(room.price);
  if (price.includes(q)) return true;

  const catalog = (options?.keywordCatalog ?? []).map(normalizeSearchText).filter(Boolean);
  const queryMatchesKnownTag = catalog.some((kw) => kw.includes(q) || q.includes(kw));
  if (queryMatchesKnownTag) return false;

  const description = normalizeSearchText(room.description);
  if (description.includes(q)) return true;

  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length > 1) {
    return tokens.every(
      (token) =>
        name.includes(token) ||
        keywords.some((kw) => kw.includes(token) || token.includes(kw)) ||
        description.includes(token),
    );
  }

  return false;
}

/** รวบรวมชื่อแท็กจากรายการการ์ด */
export function collectKeywordCatalog(rooms: Room[]): string[] {
  const names = new Set<string>();
  for (const room of rooms) {
    for (const kw of room.keywords ?? []) {
      const trimmed = kw.trim();
      if (trimmed) names.add(trimmed);
    }
  }
  return Array.from(names);
}
