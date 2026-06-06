'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Save } from 'lucide-react';
import { Room, PortfolioImage } from '@/types/content';
import PortfolioImageManager from '@/components/PortfolioImageManager';
import { portfolioImagesToRoomFields, roomToPortfolioImages } from '@/lib/roomImages';
import { useApp } from '@/components/AppContext';
import {
  getNextFeaturedRank,
  isValidFeaturedRank,
  MAX_FEATURED_PER_PAGE,
} from '@/lib/featuredRooms';

interface CardFormModalProps {
  open: boolean;
  editingCard: Room | null;
  defaultPageId: string;
  onClose: () => void;
  onSave: (data: Omit<Room, 'id'> & { id?: string }) => void;
}

export default function CardFormModal({
  open,
  editingCard,
  defaultPageId,
  onClose,
  onSave,
}: CardFormModalProps) {
  const { t, keywords, rooms } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [pageId, setPageId] = useState(defaultPageId);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [featuredRank, setFeaturedRank] = useState<number | ''>('');

  useEffect(() => {
    if (!open) return;
    if (editingCard) {
      setName(editingCard.name);
      setDescription(editingCard.description);
      setPrice(editingCard.price);
      setPageId(editingCard.pageId);
      setSelectedKeywords(editingCard.keywords ?? []);
      setImages(roomToPortfolioImages(editingCard));
      setFeaturedRank(isValidFeaturedRank(editingCard.featuredRank) ? editingCard.featuredRank : '');
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setPageId(defaultPageId);
      setSelectedKeywords([]);
      setImages([]);
      setFeaturedRank('');
    }
  }, [open, editingCard, defaultPageId]);

  const usedFeaturedRanks = rooms
    .filter(
      (room) =>
        room.pageId === pageId &&
        room.id !== editingCard?.id &&
        isValidFeaturedRank(room.featuredRank),
    )
    .map((room) => room.featuredRank as number);

  const availableRanks = Array.from({ length: MAX_FEATURED_PER_PAGE }, (_, i) => i + 1).filter(
    (rank) => !usedFeaturedRanks.includes(rank),
  );

  const toggleKeyword = (keywordName: string) => {
    setSelectedKeywords((prev) =>
      prev.includes(keywordName)
        ? prev.filter((k) => k !== keywordName)
        : [...prev, keywordName],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || images.length === 0) {
      alert(t('edit.cards.validation'));
      return;
    }
    const fields = portfolioImagesToRoomFields(images);
    onSave({
      ...fields,
      name: name.trim(),
      description,
      price: price || t('edit.cards.priceFallback'),
      pageId,
      keywords: selectedKeywords,
      featuredRank: featuredRank || undefined,
      ...(editingCard ? { id: editingCard.id } : {}),
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className="bg-white border border-gray-200 shadow-2xl relative z-10 w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="bg-black text-white px-6 py-4 flex justify-between items-center gap-4 shrink-0">
              <h3 className="font-semibold text-lg uppercase tracking-wider">
                {editingCard ? t('edit.cards.editTitle') : t('edit.cards.createTitle')}
              </h3>
              <button
                type="submit"
                form="card-form"
                className="shrink-0 bg-white text-black px-5 py-2.5 text-xs font-semibold uppercase tracking-widest flex items-center gap-2 hover:bg-gray-100 transition-colors"
              >
                <Save size={16} />
                {t('common.save')}
              </button>
            </div>

            <form
              id="card-form"
              onSubmit={handleSubmit}
              className="p-6 overflow-y-auto flex-1 space-y-6"
            >
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase font-bold text-gray-500">{t('edit.cards.keywords')}</label>
                <p className="text-[11px] text-gray-400">{t('edit.cards.keywordsHint')}</p>
                {keywords.length === 0 ? (
                  <p className="text-xs text-gray-400 border border-dashed border-gray-200 p-3">
                    {t('edit.cards.keywordsEmpty')}
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((kw) => {
                      const selected = selectedKeywords.includes(kw.name);
                      return (
                        <button
                          key={kw.id}
                          type="button"
                          onClick={() => toggleKeyword(kw.name)}
                          className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
                            selected
                              ? 'bg-black text-white border-black'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-black'
                          }`}
                        >
                          {kw.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase font-bold text-gray-500">{t('edit.cards.spaceName')}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border border-gray-200 p-3 text-sm focus:outline-none focus:border-black"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase font-bold text-gray-500">{t('edit.cards.priceLabel')}</label>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="border border-gray-200 p-3 text-sm focus:outline-none focus:border-black"
                    placeholder="350,000 THB"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase font-bold text-gray-500">การ์ดเด่น (ติดดาว)</label>
                <p className="text-[11px] text-gray-400">
                  แสดงบนสุดในเมนูนี้แบบรูปใหญ่ — ติดได้สูงสุด {MAX_FEATURED_PER_PAGE} การ์ดต่อเมนู
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (featuredRank) {
                        setFeaturedRank('');
                        return;
                      }
                      const nextRank = getNextFeaturedRank(rooms, pageId, editingCard?.id);
                      if (!nextRank) {
                        alert(`เมนูนี้ติดดาวครบ ${MAX_FEATURED_PER_PAGE} การ์ดแล้ว`);
                        return;
                      }
                      setFeaturedRank(nextRank);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
                      featuredRank
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-black'
                    }`}
                  >
                    {featuredRank ? `★ ติดดาวแล้ว (อันดับ ${featuredRank})` : '☆ ตั้งเป็นการ์ดเด่น'}
                  </button>
                  {featuredRank ? (
                    <select
                      value={featuredRank}
                      onChange={(e) => setFeaturedRank(Number(e.target.value))}
                      className="border border-gray-200 bg-white px-3 py-1.5 text-xs focus:outline-none focus:border-black"
                    >
                      {[featuredRank, ...availableRanks]
                        .filter((v, i, arr) => arr.indexOf(v) === i)
                        .sort((a, b) => a - b)
                        .map((rank) => (
                          <option key={rank} value={rank}>
                            อันดับดาว {rank}
                          </option>
                        ))}
                    </select>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase font-bold text-gray-500">{t('edit.cards.descriptionLabel')}</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="border border-gray-200 p-3 text-sm focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="text-xs uppercase font-bold text-gray-500 mb-3 block">{t('edit.cards.images')}</label>
                <PortfolioImageManager images={images} onChange={setImages} />
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
