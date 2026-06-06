'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import { Room } from '@/types/content';
import FeedRoomCard from './FeedRoomCard';
import FeedGridBlocks from './FeedGridBlocks';
import ImageModal from './ImageModal';
import { useApp } from './AppContext';
import { collectKeywordCatalog, roomMatchesSearch } from '@/lib/search';
import { getFeaturedRooms } from '@/lib/featuredRooms';
import { buildShuffledFeedBlocks } from '@/lib/feedLayout';
import { PAGE_BLEED, PAGE_BLEED_INSET, PAGE_HERO_PADDING_TOP, PAGE_SHELL } from '@/lib/pageLayout';

interface StylePageProps {
  title: string;
  description: string;
  pageId: string;
  rooms: Room[];
}

export default function StylePage({ title, description, pageId, rooms }: StylePageProps) {
  const { t } = useApp();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const pageRooms = useMemo(
    () => rooms.filter((room) => room.pageId === pageId),
    [rooms, pageId],
  );
  const keywordCatalog = useMemo(() => collectKeywordCatalog(pageRooms), [pageRooms]);
  const filteredRooms = useMemo(
    () =>
      pageRooms.filter((room) =>
        roomMatchesSearch(room, searchQuery, { keywordCatalog }),
      ),
    [pageRooms, searchQuery, keywordCatalog],
  );
  const featuredRooms = useMemo(
    () => getFeaturedRooms(filteredRooms, pageId),
    [filteredRooms, pageId],
  );
  const regularRooms = useMemo(() => {
    const featuredIds = new Set(featuredRooms.map((room) => room.id));
    return filteredRooms.filter((room) => !featuredIds.has(room.id));
  }, [filteredRooms, featuredRooms]);

  const gridBlocks = useMemo(() => {
    if (!mounted || regularRooms.length === 0) return [];
    return buildShuffledFeedBlocks(regularRooms);
  }, [mounted, regularRooms]);

  return (
    <div className={`flex flex-col pb-16 bg-white min-h-screen ${PAGE_SHELL}`}>
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`${PAGE_BLEED} ${PAGE_BLEED_INSET} ${PAGE_HERO_PADDING_TOP} pb-10 mb-10 bg-black text-white`}
      >
        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tighter mb-3 text-balance leading-none">
            {title}
          </h1>
          <p className="text-gray-400 leading-relaxed text-sm md:text-base">
            {description}
          </p>
        </div>
      </motion.section>

      {/* Grid Section */}
      <section className="pt-2 w-full">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-xl font-semibold tracking-tight">{t('stylePage.curatedDesigns')}</h2>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{filteredRooms.length} {t('stylePage.spaces')}</span>
        </div>

        <div className="mb-8">
          <label className="relative block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อผลงาน คำอธิบาย หรือแท็ก..."
              className="w-full border border-gray-200 bg-white py-3 pl-10 pr-3 text-sm focus:outline-none focus:border-black transition-colors"
            />
          </label>
        </div>

        {filteredRooms.length === 0 ? (
          <div className="border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">
            ไม่พบผลงานที่ตรงกับคำค้นหา
          </div>
        ) : (
          <div className="space-y-10 w-full min-w-0 max-w-full overflow-hidden">
            {featuredRooms.length > 0 && (
              <div className="space-y-5 w-full">
                {featuredRooms.map((room) => (
                  <FeedRoomCard
                    key={`featured-${room.id}`}
                    room={room}
                    category={title}
                    variant="single"
                    featured
                    onClick={() => setSelectedRoom(room)}
                  />
                ))}
              </div>
            )}

            {gridBlocks.length > 0 && (
              <FeedGridBlocks
                blocks={gridBlocks}
                getCategory={() => title}
                onSelectRoom={setSelectedRoom}
              />
            )}
          </div>
        )}
      </section>

      {/* Modal */}
      <ImageModal room={selectedRoom} onClose={() => setSelectedRoom(null)} />
    </div>
  );
}
