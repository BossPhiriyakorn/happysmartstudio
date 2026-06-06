'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { X, ArrowRight, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Room } from '@/types/content';
import Link from 'next/link';
import { useApp } from '@/components/AppContext';
import { aspectRatioClass } from '@/lib/imageCrop';
import { shouldBypassImageOptimizer } from '@/lib/imageDisplay';
import { aspectRatioShape, roomToPortfolioImages } from '@/lib/roomImages';
import HotspotOverlay from '@/components/HotspotOverlay';
import { trackCardView } from '@/lib/analytics/track';

interface ImageModalProps {
  room: Room | null;
  onClose: () => void;
}

const SWIPE_THRESHOLD = 48;
const TAP_THRESHOLD = 12;

export default function ImageModal({ room, onClose }: ImageModalProps) {
  const { t, stylePages } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const lightboxTouchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!room) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [room]);

  useEffect(() => {
    if (!room) return;
    const page = stylePages.find((p) => p.id === room.pageId);
    trackCardView(room.id, room.name, room.pageId, page?.name ?? room.pageId);
  }, [room, stylePages]);

  const portfolioImages = room ? roomToPortfolioImages(room) : [];
  const currentImage = portfolioImages[currentIndex];
  const aspectRatio = currentImage?.aspectRatio || '4:3';
  const isPortrait = aspectRatioShape(aspectRatio) === 'portrait';
  const imageAreaClass = isPortrait
    ? `h-[48dvh] sm:h-auto sm:max-h-[58vh] ${aspectRatioClass(aspectRatio)}`
    : `${aspectRatioClass(aspectRatio)} max-h-[40dvh] sm:max-h-[58vh]`;

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentIndex(0);
      setActiveHotspot(null);
      setLightboxOpen(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [room]);

  const handlePrev = useCallback(() => {
    if (portfolioImages.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + portfolioImages.length) % portfolioImages.length);
    setActiveHotspot(null);
  }, [portfolioImages.length]);

  const handleNext = useCallback(() => {
    if (portfolioImages.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % portfolioImages.length);
    setActiveHotspot(null);
  }, [portfolioImages.length]);

  const openLightbox = useCallback(() => {
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent, onTap?: () => void) => {
      const start = touchStartRef.current;
      touchStartRef.current = null;
      if (!start) return;

      const dx = e.changedTouches[0].clientX - start.x;
      const dy = e.changedTouches[0].clientY - start.y;

      if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) handleNext();
        else handlePrev();
        return;
      }

      if (Math.abs(dx) <= TAP_THRESHOLD && Math.abs(dy) <= TAP_THRESHOLD) {
        onTap?.();
      }
    },
    [handleNext, handlePrev]
  );

  const handleLightboxTouchStart = useCallback((e: React.TouchEvent) => {
    lightboxTouchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const handleLightboxTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const start = lightboxTouchStartRef.current;
      lightboxTouchStartRef.current = null;
      if (!start) return;

      const dx = e.changedTouches[0].clientX - start.x;
      const dy = e.changedTouches[0].clientY - start.y;

      if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) handleNext();
        else handlePrev();
      }
    },
    [handleNext, handlePrev]
  );

  useEffect(() => {
    if (!room) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxOpen) {
          e.preventDefault();
          closeLightbox();
        } else {
          onClose();
        }
        return;
      }

      if (portfolioImages.length <= 1) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [room, lightboxOpen, portfolioImages.length, handlePrev, handleNext, closeLightbox, onClose]);

  const slideControls =
    portfolioImages.length > 1 ? (
      <>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 bg-black/50 backdrop-blur-md hover:bg-black/70 active:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
          aria-label="Previous image"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 bg-black/50 backdrop-blur-md hover:bg-black/70 active:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
          aria-label="Next image"
        >
          <ChevronRight size={24} />
        </button>
      </>
    ) : null;

  const modal = (
    <>
      <AnimatePresence>
        {room && currentImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md px-0.5 py-1.5 sm:p-4 overflow-hidden sm:overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label={room.name}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-2xl max-h-[calc(100dvh-12px)] sm:max-h-[calc(100dvh-2rem)] rounded-md sm:rounded-2xl overflow-hidden flex flex-col relative sm:shadow-2xl min-h-0"
            >
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 z-50 w-10 h-10 bg-white hover:bg-gray-100 text-black shadow-lg border border-gray-200 rounded-full flex items-center justify-center hover:scale-105 transition-all duration-300"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>

              <div
                className={`relative w-full ${imageAreaClass} bg-gray-100 flex-shrink-0 select-none overflow-hidden touch-pan-y`}
                onTouchStart={handleTouchStart}
                onTouchEnd={(e) => handleTouchEnd(e, openLightbox)}
              >
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0.8 }}
                    transition={{ duration: 0.4 }}
                    onClick={openLightbox}
                    className="relative w-full h-full cursor-zoom-in overflow-hidden"
                    role="button"
                    tabIndex={0}
                    aria-label="View full image"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openLightbox();
                      }
                    }}
                  >
                    <Image
                      src={currentImage.url}
                      alt={`${room.name} image ${currentIndex + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 90vw"
                      priority
                      className="object-cover pointer-events-none"
                      unoptimized={shouldBypassImageOptimizer(currentImage.url)}
                      referrerPolicy="no-referrer"
                      draggable={false}
                    />
                    <HotspotOverlay
                      hotspots={currentImage.hotspots}
                      activeId={activeHotspot}
                      onSelect={setActiveHotspot}
                    />
                  </motion.div>
                </AnimatePresence>

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                {slideControls}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openLightbox();
                  }}
                  className="absolute top-4 left-4 z-30 w-9 h-9 sm:w-10 sm:h-10 bg-black/50 backdrop-blur-md hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                  aria-label="View full image"
                >
                  <ZoomIn size={18} />
                </button>

                <div className="absolute bottom-4 left-4 right-16 sm:bottom-6 sm:left-6 sm:right-20 text-white z-10 pointer-events-none">
                  <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest mb-2 sm:mb-3.5 inline-block">
                    {stylePages.find((p) => p.id === room.pageId)?.name || room.pageId}
                  </span>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight leading-tight">
                    {room.name}
                  </h2>
                </div>

                {portfolioImages.length > 1 && (
                  <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 bg-black/60 backdrop-blur-md px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-white text-xs font-mono font-medium z-10 select-none">
                    {currentIndex + 1} / {portfolioImages.length}
                  </div>
                )}
              </div>

              <div className="p-4 sm:p-6 md:p-8 flex flex-col flex-1 min-h-0 bg-white">
                <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-0.5">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex justify-between items-start mb-3 sm:mb-4"
                  >
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                        {t('modal.estimatedValue')}
                      </h3>
                      <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-black">{room.price}</p>
                    </div>
                  </motion.div>

                  {room.keywords.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="mb-4 sm:mb-6 flex flex-wrap gap-2"
                    >
                      {room.keywords.map((tag) => (
                        <span
                          key={tag}
                          className="bg-gray-100 text-gray-700 px-3 py-1 text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-4 sm:mb-6"
                  >
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                      {t('modal.conceptOverview')}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm md:text-base whitespace-pre-line">
                      {room.description}
                    </p>
                  </motion.div>
                </div>

                <div className="pt-3 sm:pt-4 border-t border-gray-100 shrink-0 bg-white">
                  <Link href="/contact" onClick={onClose} className="block w-full">
                    <motion.button
                      whileHover={{ scale: 0.98 }}
                      whileTap={{ scale: 0.96 }}
                      className="w-full bg-black text-white flex items-center justify-between px-5 py-3.5 sm:px-6 sm:py-4 text-sm font-semibold tracking-widest uppercase group"
                    >
                      {t('modal.consultNow')}
                      <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lightboxOpen && room && currentImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[210] bg-black/95 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label={`${room.name} full image`}
            onClick={closeLightbox}
            onTouchStart={handleLightboxTouchStart}
            onTouchEnd={handleLightboxTouchEnd}
          >
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute top-3 right-3 sm:top-5 sm:right-5 z-50 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
              aria-label="Close image view"
            >
              <X size={22} />
            </button>

            <div
              className="relative w-full h-full max-w-[min(100vw,1200px)] max-h-[calc(100dvh-1rem)]"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={currentImage.url}
                    alt={`${room.name} image ${currentIndex + 1}`}
                    fill
                    sizes="100vw"
                    priority
                    className="object-contain select-none"
                    unoptimized={shouldBypassImageOptimizer(currentImage.url)}
                    referrerPolicy="no-referrer"
                    draggable={false}
                  />
                </motion.div>
              </AnimatePresence>

              {slideControls}

              {portfolioImages.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-mono font-medium z-30 select-none">
                  {currentIndex + 1} / {portfolioImages.length}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  if (!mounted) return null;
  return createPortal(modal, document.body);
}
