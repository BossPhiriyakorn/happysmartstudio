import type { Room } from '@/types/content';

export type GridBlock =
  | { type: 'single'; item: Room }
  | { type: 'grid-2'; items: Room[] };

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/** สลับลำดับแล้วจัดเป็นบล็อก single / grid-2 แบบสุ่ม */
export function generateGridBlocks(items: Room[]): GridBlock[] {
  const blocks: GridBlock[] = [];
  let i = 0;

  while (i < items.length) {
    const remaining = items.length - i;
    const choices: ('single' | 'grid-2')[] = ['single'];
    if (remaining >= 2) {
      choices.push('grid-2');
    }

    const choice = choices[Math.floor(Math.random() * choices.length)];
    if (choice === 'single') {
      blocks.push({ type: 'single', item: items[i] });
      i += 1;
    } else {
      blocks.push({ type: 'grid-2', items: [items[i], items[i + 1]] });
      i += 2;
    }
  }
  return blocks;
}

export function buildShuffledFeedBlocks(items: Room[], limit?: number): GridBlock[] {
  const shuffled = shuffleArray(items);
  const slice = limit != null ? shuffled.slice(0, limit) : shuffled;
  return generateGridBlocks(slice);
}
