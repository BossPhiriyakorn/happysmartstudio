'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import type { ImageAspectRatio, Room } from '@/types/content';
import { aspectRatioClass } from '@/lib/imageCrop';
import { shouldBypassImageOptimizer } from '@/lib/imageDisplay';
import { roomCoverAspectRatio } from '@/lib/roomImages';

function FeedSlideshow({
  imageUrls,
  name,
  aspectRatio = '4:3',
  sizes = '(max-width: 768px) 100vw, 80vw',
}: {
  imageUrls: string[];
  name: string;
  aspectRatio?: ImageAspectRatio;
  sizes?: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (imageUrls.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % imageUrls.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [imageUrls]);

  const src = imageUrls[currentIndex] ?? imageUrls[0];

  return (
    <div className={`relative w-full overflow-hidden ${aspectRatioClass(aspectRatio)}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0.3 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <Image
            src={src}
            alt={`${name} slide ${currentIndex + 1}`}
            fill
            sizes={sizes}
            priority={currentIndex === 0}
            className="object-cover transition-transform duration-1000 group-hover:scale-[1.02]"
            unoptimized={shouldBypassImageOptimizer(src)}
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </AnimatePresence>
      {imageUrls.length > 1 && (
        <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-black/50 backdrop-blur-md px-2.5 py-1 md:px-3 md:py-1.5 rounded-full flex items-center z-20 border border-white/10 select-none">
          <span className="text-[9px] md:text-[10px] text-white font-mono font-bold tracking-widest leading-none uppercase">
            {String(currentIndex + 1).padStart(2, '0')} — {String(imageUrls.length).padStart(2, '0')}
          </span>
        </div>
      )}
    </div>
  );
}

function FeedOverlay({
  room,
  category,
  variant = 'single',
}: {
  room: Room;
  category: string;
  variant?: 'single' | 'grid';
}) {
  const titleClass = variant === 'single' ? 'text-sm md:text-xl' : 'text-xs md:text-base';
  const priceClass =
    variant === 'single' ? 'text-xs md:text-base lg:text-lg' : 'text-[10px] md:text-sm lg:text-base';

  return (
    <>
      <div className="absolute top-0 right-0 w-1/2 h-1/3 bg-gradient-to-bl from-black/35 via-black/10 to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/4 bg-gradient-to-tr from-black/35 via-black/10 to-transparent z-10 pointer-events-none" />
      <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20 max-w-[58%] text-right pointer-events-none">
        <span className="block text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-white/75 mb-0.5">
          {category}
        </span>
        <h3
          className={`${titleClass} font-semibold tracking-tight leading-tight text-white line-clamp-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]`}
        >
          {room.name}
        </h3>
      </div>
      {room.price ? (
        <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 z-20 pointer-events-none flex flex-col items-start gap-2">
          <span
            className={`inline-block ${priceClass} font-bold tracking-tight text-white px-2.5 py-1 md:px-3.5 md:py-1.5 bg-black/50 backdrop-blur-md rounded border border-white/10`}
          >
            {room.price}
          </span>
        </div>
      ) : null}
    </>
  );
}

interface FeedRoomCardProps {
  room: Room;
  category: string;
  onClick: () => void;
  variant?: 'single' | 'grid';
  /** การ์ดดาว (ติดดาว) — เต็มความกว้าง + กรอบทอง */
  featured?: boolean;
  className?: string;
}

export default function FeedRoomCard({
  room,
  category,
  onClick,
  variant = 'single',
  featured = false,
  className = '',
}: FeedRoomCardProps) {
  const coverAspect = roomCoverAspectRatio(room);
  const isFullBleed = featured || variant === 'single';
  const frameClass = aspectRatioClass(coverAspect);
  const featuredFrameClass = featured
    ? 'border-2 border-amber-400 shadow-[0_8px_24px_-12px_rgba(161,98,7,0.35)]'
    : '';
  const gridFrameClass =
    !isFullBleed ? 'bg-gray-100 border border-gray-200 rounded-sm w-full' : 'w-full';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`relative max-w-full min-w-0 overflow-hidden group cursor-pointer ${gridFrameClass} ${featuredFrameClass} ${className}`}
      onClick={onClick}
    >
      <div className={`relative w-full max-w-full min-w-0 overflow-hidden ${frameClass}`}>
        <FeedSlideshow
          imageUrls={room.imageUrls?.length ? room.imageUrls : [room.imageUrl]}
          name={room.name}
          aspectRatio={coverAspect}
          sizes={
            variant === 'single'
              ? '(max-width: 768px) 100%, 80vw'
              : '(max-width: 768px) 50%, 40vw'
          }
        />
        <FeedOverlay room={room} category={category} variant={variant} />
      </div>
    </motion.div>
  );
}
