'use client';

import type { ReactNode } from 'react';
import { AnimatePresence } from 'motion/react';
import type { ImageAspectRatio, Room } from '@/types/content';
import type { GridBlock } from '@/lib/feedLayout';
import { roomsShareCoverAspect } from '@/lib/feedLayout';
import { isValidFeaturedRank } from '@/lib/featuredRooms';
import { aspectRatioShape } from '@/lib/roomImages';
import FeedRoomCard from './FeedRoomCard';

interface FeedGridBlocksProps {
  blocks: GridBlock[];
  getCategory: (room: Room) => string;
  onSelectRoom: (room: Room) => void;
  emptyFallback?: ReactNode;
}

function renderSingleCard(
  room: Room,
  idx: number,
  getCategory: (room: Room) => string,
  onSelectRoom: (room: Room) => void,
  keyPrefix: string,
) {
  const featured = isValidFeaturedRank(room.featuredRank);
  return (
    <FeedRoomCard
      key={`${keyPrefix}-${room.id}-${idx}`}
      room={room}
      category={getCategory(room)}
      variant="single"
      featured={featured}
      onClick={() => onSelectRoom(room)}
    />
  );
}

function renderGridPair(
  items: Room[],
  idx: number,
  sharedAspect: ImageAspectRatio,
  getCategory: (room: Room) => string,
  onSelectRoom: (room: Room) => void,
  className: string,
) {
  return (
    <div className={className}>
      {items.map((item, itemIdx) => {
        const featured = isValidFeaturedRank(item.featuredRank);
        return (
          <FeedRoomCard
            key={`feed-grid-item-${item.id}-${itemIdx}`}
            room={item}
            category={getCategory(item)}
            variant="grid"
            lockAspectRatio={sharedAspect}
            featured={featured}
            className="w-full min-w-0 h-full"
            onClick={() => onSelectRoom(item)}
          />
        );
      })}
    </div>
  );
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
            return renderSingleCard(block.item, idx, getCategory, onSelectRoom, 'feed-single');
          }

          if (block.type === 'grid-2') {
            const [itemA, itemB] = block.items;

            if (!roomsShareCoverAspect(itemA, itemB)) {
              return (
                <div key={`feed-grid-fallback-${idx}`} className="flex flex-col gap-8 w-full">
                  {renderSingleCard(itemA, idx, getCategory, onSelectRoom, 'feed-single-a')}
                  {renderSingleCard(itemB, idx, getCategory, onSelectRoom, 'feed-single-b')}
                </div>
              );
            }

            const sharedAspect = block.aspectRatio;
            const isLandscapePair = aspectRatioShape(sharedAspect) === 'landscape';

            if (isLandscapePair) {
              return (
                <div key={`feed-grid-2-${idx}`} className="w-full">
                  <div className="flex flex-col gap-8 md:hidden">
                    {renderSingleCard(itemA, idx, getCategory, onSelectRoom, 'feed-mobile-a')}
                    {renderSingleCard(itemB, idx, getCategory, onSelectRoom, 'feed-mobile-b')}
                  </div>
                  {renderGridPair(
                    block.items,
                    idx,
                    sharedAspect,
                    getCategory,
                    onSelectRoom,
                    'hidden md:grid md:grid-cols-2 md:gap-6 lg:gap-8 items-stretch w-full',
                  )}
                </div>
              );
            }

            return (
              <div key={`feed-grid-2-${idx}`}>
                {renderGridPair(
                  block.items,
                  idx,
                  sharedAspect,
                  getCategory,
                  onSelectRoom,
                  'grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 items-stretch w-full',
                )}
              </div>
            );
          }

          return null;
        })}
      </AnimatePresence>
    </div>
  );
}
