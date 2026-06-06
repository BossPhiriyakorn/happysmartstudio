import type { Room } from '@/types/content';

export const MAX_FEATURED_PER_PAGE = 3;

export function isValidFeaturedRank(rank: unknown): rank is number {
  return typeof rank === 'number' && rank >= 1 && rank <= MAX_FEATURED_PER_PAGE;
}

export function getFeaturedRooms(rooms: Room[], pageId?: string): Room[] {
  return rooms
    .filter(
      (r) =>
        isValidFeaturedRank(r.featuredRank) &&
        (pageId === undefined || r.pageId === pageId),
    )
    .sort((a, b) => (a.featuredRank ?? 99) - (b.featuredRank ?? 99));
}

export function partitionFeaturedRooms(rooms: Room[]): {
  featured: Room[];
  regular: Room[];
} {
  const featuredIds = new Set(getFeaturedRooms(rooms).map((r) => r.id));
  const featured = getFeaturedRooms(rooms);
  const regular = rooms.filter((r) => !featuredIds.has(r.id));
  return { featured, regular };
}

export function countFeaturedOnPage(
  rooms: Room[],
  pageId: string,
  excludeRoomId?: string,
): number {
  return rooms.filter(
    (r) =>
      r.pageId === pageId &&
      r.id !== excludeRoomId &&
      isValidFeaturedRank(r.featuredRank),
  ).length;
}

export function getNextFeaturedRank(
  rooms: Room[],
  pageId: string,
  excludeRoomId?: string,
): number | null {
  const used = new Set(
    rooms
      .filter(
        (r) =>
          r.pageId === pageId &&
          r.id !== excludeRoomId &&
          isValidFeaturedRank(r.featuredRank),
      )
      .map((r) => r.featuredRank as number),
  );
  for (let rank = 1; rank <= MAX_FEATURED_PER_PAGE; rank++) {
    if (!used.has(rank)) return rank;
  }
  return null;
}

export function clearFeaturedOnPage(rooms: Room[], pageId: string, roomId: string): Room[] {
  return rooms.map((r) =>
    r.id === roomId && r.pageId === pageId ? { ...r, featuredRank: undefined } : r,
  );
}
