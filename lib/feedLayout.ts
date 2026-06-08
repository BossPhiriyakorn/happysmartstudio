import type { Room } from '@/types/content';
import { roomCoverAspectRatio } from '@/lib/roomImages';

export type GridBlock =
  | { type: 'single'; item: Room }
  | { type: 'grid-2'; items: [Room, Room]; aspectRatio: ReturnType<typeof roomCoverAspectRatio> };

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function roomsShareCoverAspect(a: Room, b: Room): boolean {
  return roomCoverAspectRatio(a) === roomCoverAspectRatio(b);
}

function findPairPartner(items: Room[], anchor: Room, startIndex: number): number {
  const targetAspect = roomCoverAspectRatio(anchor);
  for (let j = startIndex; j < items.length; j++) {
    if (roomCoverAspectRatio(items[j]) === targetAspect) {
      return j;
    }
  }
  return -1;
}

/**
 * สลับลำดับแล้วจัดเป็นบล็อก single / grid-2
 * รูปคู่ต้องมีอัตราส่วนปกเท่ากัน — ใช้กฎเดียวกันทุก viewport (มือถือ / แท็บเลต / PC)
 */
export function generateGridBlocks(items: Room[]): GridBlock[] {
  const blocks: GridBlock[] = [];
  const remaining = [...items];

  while (remaining.length > 0) {
    const current = remaining.shift()!;
    const partnerIndex = findPairPartner(remaining, current, 0);
    const canPair = partnerIndex >= 0;
    const preferPair = canPair && Math.random() < 0.5;

    if (preferPair) {
      const partner = remaining.splice(partnerIndex, 1)[0];
      blocks.push({
        type: 'grid-2',
        items: [current, partner],
        aspectRatio: roomCoverAspectRatio(current),
      });
      continue;
    }

    blocks.push({ type: 'single', item: current });
  }

  return blocks;
}

export function buildShuffledFeedBlocks(items: Room[], limit?: number): GridBlock[] {
  const shuffled = shuffleArray(items);
  const slice = limit != null ? shuffled.slice(0, limit) : shuffled;
  return generateGridBlocks(slice);
}
