'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Room } from '@/types/content';
import { readRoomCardIdFromLocation, ROOM_CARD_QUERY_PARAM } from '@/lib/roomShare';

type Options = {
  rooms: Room[];
  setSelectedRoom: (room: Room | null) => void;
  /** เมื่ออยู่หน้าเมนูสไตล์ — ใช้ path `/{pageId}` */
  pageId?: string;
  /** เรียกเมื่อเปิดการ์ดจาก deep link (เช่น สลับแท็บฟีด) */
  onDeepLinkRoom?: (room: Room) => void;
};

function basePath(pageId?: string) {
  return pageId ? `/${pageId}` : '/';
}

function pathWithCard(pageId: string | undefined, roomId: string) {
  return `${basePath(pageId)}?${ROOM_CARD_QUERY_PARAM}=${encodeURIComponent(roomId)}`;
}

export function useRoomCardDeepLink({
  rooms,
  setSelectedRoom,
  pageId,
  onDeepLinkRoom,
}: Options) {
  const router = useRouter();
  const deepLinkHandled = useRef(false);

  useEffect(() => {
    if (deepLinkHandled.current || rooms.length === 0) return;
    if (typeof window === 'undefined') return;

    const cardId = readRoomCardIdFromLocation(window.location.search);
    if (!cardId) return;

    const room = rooms.find((r) => r.id === cardId);
    if (!room) return;

    if (pageId && room.pageId !== pageId) {
      router.replace(pathWithCard(room.pageId, room.id), { scroll: false });
      return;
    }

    deepLinkHandled.current = true;
    setSelectedRoom(room);
    onDeepLinkRoom?.(room);
  }, [rooms, pageId, router, setSelectedRoom, onDeepLinkRoom]);

  const openRoom = useCallback(
    (room: Room) => {
      setSelectedRoom(room);
      router.replace(pathWithCard(pageId, room.id), { scroll: false });
    },
    [pageId, router, setSelectedRoom],
  );

  const closeRoom = useCallback(() => {
    setSelectedRoom(null);
    router.replace(basePath(pageId), { scroll: false });
  }, [pageId, router, setSelectedRoom]);

  return { openRoom, closeRoom };
}
