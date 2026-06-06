"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { Search } from "lucide-react";
import { Room } from "@/types/content";
import { useApp } from "./AppContext";
import { HEADER_ISLAND_OFFSET } from "./Header";
import ImageModal from "./ImageModal";
import FeedRoomCard from "./FeedRoomCard";
import FeedGridBlocks from "./FeedGridBlocks";
import { collectKeywordCatalog, roomMatchesSearch } from "@/lib/search";
import { getFeaturedRooms } from "@/lib/featuredRooms";
import { buildShuffledFeedBlocks, type GridBlock } from "@/lib/feedLayout";
import { shouldBypassImageOptimizer } from "@/lib/imageDisplay";
import { slideFrameClass } from "@/lib/roomImages";
import { PAGE_BLEED } from "@/lib/pageLayout";

export default function DesignFeed() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [activeTag, setActiveTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const { rooms, homeSlides, stylePages, branding, t } = useApp();

  const pageName = (pageId: string) =>
    stylePages.find((p) => p.id === pageId)?.name || pageId;

  const resolvedActiveTag =
    activeTag !== 'all' && !stylePages.some((p) => p.id === activeTag) ? 'all' : activeTag;

  const filterTags = [
    { id: 'all', name: t('home.tags.all') },
    ...stylePages.map((p) => ({ id: p.id, name: p.name })),
  ];

  const keywordCatalog = useMemo(() => collectKeywordCatalog(rooms), [rooms]);
  const featuredRooms = useMemo(() => {
    if (resolvedActiveTag === 'all') return [];
    const filteredByPage = rooms.filter((room) => room.pageId === resolvedActiveTag);
    if (!searchQuery.trim()) {
      return getFeaturedRooms(filteredByPage, resolvedActiveTag);
    }
    const searched = filteredByPage.filter((room) =>
      roomMatchesSearch(room, searchQuery, { keywordCatalog }),
    );
    return getFeaturedRooms(searched, resolvedActiveTag);
  }, [resolvedActiveTag, rooms, searchQuery, keywordCatalog]);

  const gridBlocks = useMemo((): GridBlock[] => {
    if (!mounted || rooms.length === 0) return [];

    let filtered = rooms;
    if (resolvedActiveTag !== 'all') {
      filtered = filtered.filter((r) => r.pageId === resolvedActiveTag);
    }
    if (searchQuery.trim()) {
      filtered = filtered.filter((r) =>
        roomMatchesSearch(r, searchQuery, { keywordCatalog }),
      );
    }
    if (featuredRooms.length > 0) {
      const featuredIds = new Set(featuredRooms.map((room) => room.id));
      filtered = filtered.filter((room) => !featuredIds.has(room.id));
    }

    const limit = resolvedActiveTag === 'all' && !searchQuery.trim() ? 20 : 15;
    return buildShuffledFeedBlocks(filtered, limit);
  }, [mounted, resolvedActiveTag, searchQuery, rooms, keywordCatalog, featuredRooms]);

  if (!mounted) {
    return (
      <div className="pb-12 flex flex-col gap-4 animate-pulse">
        <div className="w-full h-8 bg-gray-200 rounded"></div>
        <div className="w-full aspect-[4/5] bg-gray-200 mt-4"></div>
      </div>
    );
  }

  const duplicatedSliderItems = homeSlides.length > 0 ? [...homeSlides, ...homeSlides] : [];

  return (
    <>
      <div className="flex flex-col gap-6">
        
        {/* Dynamic Autoplay slider section at top */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-xl font-semibold tracking-tight uppercase">{branding.feedSectionTitle}</h2>
            <span className="text-xs font-mono text-gray-400">{stylePages.length} {t('common.styles')}</span>
          </div>

          <div className={`${PAGE_BLEED} overflow-hidden relative py-2 bg-gray-50 border-y border-gray-100`}>
            <motion.div
              className="flex gap-4 px-6 lg:px-8 w-max"
              animate={{
                x: [0, `calc(-50% - 8px)`],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 22,
                  ease: "linear",
                },
              }}
            >
              {duplicatedSliderItems.map((slide, idx) => (
                <motion.div
                  key={`${slide.id}-slider-${idx}`}
                  className={`relative bg-gray-100 overflow-hidden group cursor-pointer ${slideFrameClass()}`}
                  onClick={() => {
                    const roomId = slide.id.replace('slide_', '');
                    const matchedRoom = rooms.find((r) => r.id === roomId);
                    if (matchedRoom) setSelectedRoom(matchedRoom);
                  }}
                >
                  <Image
                    src={slide.imageUrl}
                    alt={slide.title}
                    fill
                    sizes="256px"
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    unoptimized={shouldBypassImageOptimizer(slide.imageUrl)}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-65 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-white/80 text-[10px] uppercase tracking-widest font-bold mb-1 block">
                      {pageName(slide.pageId)}
                    </span>
                    <h3 className="text-base font-semibold tracking-tight leading-tight">
                      {slide.title}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Category filter tab bar — กึ่งกลางเมื่อไม่เต็มจอ, เลื่อนได้เมื่อล้น */}
        <section
          className="sticky z-10 border-b border-gray-100 bg-white/95 backdrop-blur-sm shadow-sm/50 overflow-x-auto scrollbar-none"
          style={{ top: HEADER_ISLAND_OFFSET }}
        >
          <div className="flex w-full justify-center items-center gap-6 md:gap-12 py-2">
          {filterTags.map((tag) => {
            const isActive = resolvedActiveTag === tag.id;
            return (
              <button
                key={tag.id}
                onClick={() => setActiveTag(tag.id)}
                className={`relative py-2 text-sm font-semibold tracking-tight transition-colors whitespace-nowrap focus:outline-none`}
              >
                <span className={isActive ? "text-black" : "text-gray-400 hover:text-black"}>
                  {tag.name}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-black"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
          </div>
        </section>

        {/* Search */}
        <div className="pt-4 w-full">
          <div className="relative w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('home.searchPlaceholder')}
              className="w-full border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-black bg-white"
            />
          </div>
        </div>

        {/* Dynamic Image Feed (Alternating grid-2 and single column based on selected Tag) */}
        <section className="pb-12 flex flex-col gap-8 min-h-[400px] w-full min-w-0 max-w-full overflow-hidden">
          {featuredRooms.length > 0 && (
            <div className="space-y-6 w-full">
              {featuredRooms.map((room) => (
                <FeedRoomCard
                  key={`home-featured-${room.id}`}
                  room={room}
                  category={pageName(room.pageId)}
                  variant="single"
                  featured
                  onClick={() => setSelectedRoom(room)}
                />
              ))}
            </div>
          )}

          {gridBlocks.length > 0 ? (
            <FeedGridBlocks
              blocks={gridBlocks}
              getCategory={(room) => pageName(room.pageId)}
              onSelectRoom={setSelectedRoom}
            />
          ) : featuredRooms.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center text-gray-400 font-medium"
            >
              {searchQuery.trim() ? t('home.noSearchResults') : t('home.noDesigns')}
            </motion.div>
          ) : null}
        </section>
      </div>

      <ImageModal room={selectedRoom} onClose={() => setSelectedRoom(null)} />
    </>
  );
}
