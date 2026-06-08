import type { HomeSlide, Room } from '@/types/content';
import { normalizeHomeSlide, normalizeSlideImageUrl } from '@/lib/roomImages';

export const MAX_INSPIRATION_SLIDES = 10;

/** seed จากวันที่ท้องถิ่น — ชุดสไลด์คงที่ตลอดวัน เปลี่ยนเมื่อขึ้นวันใหม่ */
export function inspirationDaySeed(date = new Date()): number {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return y * 10_000 + m * 100 + d;
}

export function shuffleArraySeeded<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  let state = seed >>> 0;

  const next = () => {
    state = (Math.imul(1_664_525, state) + 1_013_904_223) >>> 0;
    return state / 0x1_0000_0000;
  };

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(next() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

export function roomToInspirationSlide(room: Room): HomeSlide {
  return normalizeHomeSlide({
    id: `slide_${room.id}`,
    imageUrl: normalizeSlideImageUrl(room.imageUrl),
    title: room.name,
    pageId: room.pageId,
  });
}

/**
 * สไลด์ «แรงบันดาลใจประจำวัน» — สุ่มจากการ์ดทุกเมนู สูงสุด 10 ใบ
 * ชุดเดียวกันตลอดวัน (ตามวันที่เครื่องผู้ใช้) ไม่บังคับการ์ดปักหมุด
 */
export function buildInspirationSlides(rooms: Room[], date = new Date()): HomeSlide[] {
  if (rooms.length === 0) return [];

  const seed = inspirationDaySeed(date);
  const picked = shuffleArraySeeded(rooms, seed).slice(0, MAX_INSPIRATION_SLIDES);

  return picked.map(roomToInspirationSlide);
}
