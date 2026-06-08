'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import type { ImageAspectRatio, PortfolioImage, Room } from '@/types/content';
import { aspectRatioClass } from '@/lib/imageCrop';
import { shouldBypassImageOptimizer } from '@/lib/imageDisplay';
import { roomCoverAspectRatio, roomToPortfolioImages } from '@/lib/roomImages';

type FeedSlide = Pick<PortfolioImage, 'url' | 'aspectRatio'>;

function FeedSlideshow({
  slides,
  name,
  sizes = '(max-width: 768px) 100vw, 80vw',
  overlay,
  lockAspectRatio,
}: {
  slides: FeedSlide[];
  name: string;
  sizes?: string;
  overlay: React.ReactNode;
  lockAspectRatio?: ImageAspectRatio;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const safeSlides = slides.length > 0 ? slides : [{ url: '', aspectRatio: '4:3' as ImageAspectRatio }];
  const currentSlide = safeSlides[currentIndex] ?? safeSlides[0];
  const currentAspect = lockAspectRatio ?? currentSlide.aspectRatio ?? '4:3';

  useEffect(() => {
    if (safeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % safeSlides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [safeSlides]);

  return (
    <motion.div
      className={`relative w-full overflow-hidden ${aspectRatioClass(currentAspect)}`}
      layout={!lockAspectRatio}
      transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          className="absolute inset-0"
        >
          <Image
            src={currentSlide.url}
            alt={`${name} slide ${currentIndex + 1}`}
            fill
            sizes={sizes}
            priority={currentIndex === 0}
            className="object-cover transition-transform duration-1000 group-hover:scale-[1.02]"
            unoptimized={shouldBypassImageOptimizer(currentSlide.url)}
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </AnimatePresence>

      {safeSlides.length > 1 && (
        <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-black/55 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full flex items-center z-20 select-none">
          <span className="text-[9px] md:text-[10px] text-white font-mono font-bold tracking-widest leading-none uppercase">
            {String(currentIndex + 1).padStart(2, '0')} — {String(safeSlides.length).padStart(2, '0')}
          </span>
        </div>
      )}

      {overlay}
    </motion.div>
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
      <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-black/50 via-black/15 to-transparent z-10 pointer-events-none" />
      <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20 max-w-[62%] text-right pointer-events-none">
        <div className="inline-block text-left px-2.5 py-1.5 md:px-3 md:py-2 bg-black/50 rounded-sm">
          <span className="block text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-white/85 mb-0.5">
            {category}
          </span>
          <h3 className={`${titleClass} font-semibold tracking-tight leading-tight text-white line-clamp-2`}>
            {room.name}
          </h3>
        </div>
      </div>
      {room.price ? (
        <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 z-20 pointer-events-none">
          <span
            className={`inline-block ${priceClass} font-bold tracking-tight text-white px-2.5 py-1 md:px-3.5 md:py-1.5 bg-black/55 rounded-sm`}
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
  /** บังคับอัตราส่วนกรอบ (ใช้กับรูปคู่ให้ทั้งสองใบเท่ากันทุก viewport) */
  lockAspectRatio?: ImageAspectRatio;
  /** การ์ดดาว (ติดดาว) — เต็มความกว้าง + กรอบทอง */
  featured?: boolean;
  className?: string;
}

export default function FeedRoomCard({
  room,
  category,
  onClick,
  variant = 'single',
  lockAspectRatio: lockAspectRatioProp,
  featured = false,
  className = '',
}: FeedRoomCardProps) {
  const portfolioImages = roomToPortfolioImages(room);
  const lockAspectRatio =
    lockAspectRatioProp ?? (variant === 'grid' ? roomCoverAspectRatio(room) : undefined);
  const isFullBleed = featured || variant === 'single';
  const featuredFrameClass = featured ? 'ring-2 ring-amber-400 ring-inset' : '';
  const gridFrameClass =
    !isFullBleed ? 'bg-gray-100 border border-gray-200 rounded-sm w-full' : 'w-full';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`relative max-w-full min-w-0 overflow-hidden group cursor-pointer ${gridFrameClass} ${className}`}
      onClick={onClick}
    >
      <div className={`relative w-full max-w-full min-w-0 overflow-hidden ${featuredFrameClass}`}>
        <FeedSlideshow
          slides={portfolioImages}
          name={room.name}
          lockAspectRatio={lockAspectRatio}
          sizes={
            variant === 'single'
              ? '(max-width: 768px) 100%, 80vw'
              : '(max-width: 768px) 50%, 40vw'
          }
          overlay={<FeedOverlay room={room} category={category} variant={variant} />}
        />
      </div>
    </motion.div>
  );
}
