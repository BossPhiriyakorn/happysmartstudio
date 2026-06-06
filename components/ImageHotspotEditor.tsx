'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Trash2 } from 'lucide-react';
import { ImageHotspot, PortfolioImage } from '@/types/content';
import { aspectRatioClass } from '@/lib/imageCrop';
import { shouldBypassImageOptimizer } from '@/lib/imageDisplay';
import HotspotOverlay from '@/components/HotspotOverlay';
import { useApp } from '@/components/AppContext';

interface ImageHotspotEditorProps {
  image: PortfolioImage;
  open: boolean;
  onClose: () => void;
  onSave: (image: PortfolioImage) => void;
}

export default function ImageHotspotEditor({ image, open, onClose, onSave }: ImageHotspotEditorProps) {
  const { t } = useApp();
  const [draft, setDraft] = useState<PortfolioImage>(image);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(image);
      setActiveId(null);
    }
  }, [open, image]);

  const active = draft.hotspots.find((h) => h.id === activeId);

  const handleAddAt = (x: number, y: number) => {
    const spot: ImageHotspot = {
      id: `spot_${Date.now()}`,
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      name: '',
      description: '',
      price: '',
    };
    setDraft((prev) => ({ ...prev, hotspots: [...prev.hotspots, spot] }));
    setActiveId(spot.id);
  };

  const updateActive = (data: Partial<ImageHotspot>) => {
    if (!activeId) return;
    setDraft((prev) => ({
      ...prev,
      hotspots: prev.hotspots.map((h) => (h.id === activeId ? { ...h, ...data } : h)),
    }));
  };

  const removeHotspot = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      hotspots: prev.hotspots.filter((h) => h.id !== id),
    }));
    if (activeId === id) setActiveId(null);
  };

  const handleSave = () => {
    onSave({
      ...draft,
      hotspots: draft.hotspots.filter((h) => h.name.trim() && h.price.trim()),
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            className="relative z-10 bg-white w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-sm uppercase tracking-widest">{t('edit.hotspot.title')}</h3>
                <p className="text-xs text-gray-400 mt-1">{t('edit.hotspot.clickToPin')}</p>
              </div>
              <button type="button" onClick={onClose} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={`relative w-full ${aspectRatioClass(draft.aspectRatio)} bg-gray-100 overflow-hidden`}>
                <Image
                  src={draft.url}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  unoptimized={shouldBypassImageOptimizer(draft.url)}
                  referrerPolicy="no-referrer"
                />
                <HotspotOverlay
                  hotspots={draft.hotspots}
                  activeId={activeId}
                  onSelect={setActiveId}
                  editable
                  onAddAt={handleAddAt}
                />
              </div>

              <div className="space-y-4">
                {active ? (
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs uppercase font-bold text-gray-500">{t('edit.hotspot.name')}</label>
                      <input
                        type="text"
                        value={active.name}
                        onChange={(e) => updateActive({ name: e.target.value })}
                        className="border border-gray-200 p-3 text-sm focus:outline-none focus:border-black"
                        placeholder={t('edit.hotspot.namePlaceholder')}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs uppercase font-bold text-gray-500">{t('edit.hotspot.price')}</label>
                      <input
                        type="text"
                        value={active.price}
                        onChange={(e) => updateActive({ price: e.target.value })}
                        className="border border-gray-200 p-3 text-sm focus:outline-none focus:border-black"
                        placeholder="590 บาท"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs uppercase font-bold text-gray-500">{t('edit.hotspot.description')}</label>
                      <textarea
                        value={active.description || ''}
                        onChange={(e) => updateActive({ description: e.target.value })}
                        rows={3}
                        className="border border-gray-200 p-3 text-sm focus:outline-none focus:border-black"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => activeId && removeHotspot(activeId)}
                      className="text-red-500 text-xs font-semibold uppercase tracking-widest flex items-center gap-1"
                    >
                      <Trash2 size={14} /> {t('edit.hotspot.remove')}
                    </button>
                  </>
                ) : (
                  <p className="text-sm text-gray-400">{t('edit.hotspot.selectOrClick')}</p>
                )}

                {draft.hotspots.length > 0 && (
                  <div className="border-t border-gray-100 pt-4 space-y-2">
                    <p className="text-[10px] uppercase font-bold text-gray-400">{t('edit.hotspot.list')}</p>
                    {draft.hotspots.map((spot) => (
                      <div
                        key={spot.id}
                        className={`flex items-center gap-1 border ${
                          activeId === spot.id ? 'border-black bg-gray-50' : 'border-gray-200'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setActiveId(spot.id)}
                          className="flex-1 text-left px-3 py-2 text-sm min-w-0 truncate"
                        >
                          {spot.name || t('edit.hotspot.unnamed')}
                          {spot.price && ` · ${spot.price}`}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeHotspot(spot.id)}
                          className="shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          aria-label={t('edit.hotspot.remove')}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-semibold uppercase tracking-widest border border-gray-200"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2.5 text-xs font-semibold uppercase tracking-widest bg-black text-white flex items-center gap-2"
              >
                <Save size={14} /> {t('common.save')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
