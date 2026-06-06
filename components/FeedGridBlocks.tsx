'use client';

import type { ReactNode } from 'react';
import { AnimatePresence } from 'motion/react';
import type { Room } from '@/types/content';
import type { GridBlock } from '@/lib/feedLayout';
import { isValidFeaturedRank } from '@/lib/featuredRooms';
import { aspectRatioShape, roomCoverAspectRatio } from '@/lib/roomImages';
import FeedRoomCard from './FeedRoomCard';

function getImageShapeType(room: Room): 'square' | 'portrait' | 'landscape' {
  return aspectRatioShape(roomCoverAspectRatio(room));
}

interface FeedGridBlocksProps {
  blocks: GridBlock[];
  getCategory: (room: Room) => string;
  onSelectRoom: (room: Room) => void;
  emptyFallback?: ReactNode;
}

export default function FeedGridBlocks({
  blocks,
  getCategory,
  onSelectRoom,
  emptyFallback = null,
}: FeedGridBlocksProps) {
  if (blocks.length === 0) {
    return emptyFallback;
  }

  return (
    <div className="flex flex-col gap-8 w-full min-w-0 max-w-full">
      <AnimatePresence mode="popLayout">
        {blocks.map((block, idx) => {
        if (block.type === 'single') {
          const featured = isValidFeaturedRank(block.item.featuredRank);
          return (
            <FeedRoomCard
              key={`feed-single-${block.item.id}-${idx}`}
              room={block.item}
              category={getCategory(block.item)}
              variant="single"
              featured={featured}
              onClick={() => onSelectRoom(block.item)}
            />
          );
        }

        if (block.type === 'grid-2') {
          const [itemA, itemB] = block.items;
          const shapeA = getImageShapeType(itemA);
          const shapeB = getImageShapeType(itemB);
          const canPairOnMobile =
            shapeA === shapeB && (shapeA === 'square' || shapeA === 'portrait');
          const isForcedSingleOnMobile =
            (itemA.id.charCodeAt(0) + itemB.id.charCodeAt(0)) % 3 === 0;
          const shouldPairOnMobile = canPairOnMobile && !isForcedSingleOnMobile;

          return (
            <div
              key={`feed-grid-2-${idx}`}
              className={`grid gap-6 items-stretch w-full ${
                shouldPairOnMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2'
              }`}
            >
              {block.items.map((item, itemIdx) => {
                const featured = isValidFeaturedRank(item.featuredRank);
                const mobileSingleColumn = !shouldPairOnMobile;
                return (
                  <FeedRoomCard
                    key={`feed-grid-item-${item.id}-${itemIdx}`}
                    room={item}
                    category={getCategory(item)}
                    variant={mobileSingleColumn ? 'single' : 'grid'}
                    featured={featured}
                    className="w-full min-w-0"
                    onClick={() => onSelectRoom(item)}
                  />
                );
              })}
            </div>
          );
        }

        return null;
        })}
      </AnimatePresence>
    </div>
  );
}
