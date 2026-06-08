import type { Room } from '@/types/content';

export const ROOM_CARD_QUERY_PARAM = 'card';

export function buildRoomSharePath(room: Pick<Room, 'id' | 'pageId'>): string {
  return `/${room.pageId}?${ROOM_CARD_QUERY_PARAM}=${encodeURIComponent(room.id)}`;
}

export function buildRoomShareUrl(room: Pick<Room, 'id' | 'pageId'>, origin?: string): string {
  const base = origin ?? (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}${buildRoomSharePath(room)}`;
}

export function readRoomCardIdFromLocation(search = ''): string | null {
  const raw = search.startsWith('?') ? search.slice(1) : search;
  const id = new URLSearchParams(raw).get(ROOM_CARD_QUERY_PARAM);
  return id?.trim() || null;
}

export type RoomShareResult = 'shared' | 'copied' | 'failed';

/** Web Share API on mobile; fallback to clipboard on desktop. */
export async function shareRoomCard(
  room: Pick<Room, 'id' | 'pageId' | 'name'>,
): Promise<RoomShareResult> {
  if (typeof window === 'undefined') return 'failed';

  const url = buildRoomShareUrl(room);

  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: room.name,
        text: room.name,
        url,
      });
      return 'shared';
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return 'failed';
      }
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    return 'copied';
  } catch {
    return 'failed';
  }
}
