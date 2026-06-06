'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Trash2, MapPin, Star } from 'lucide-react';
import { ImageAspectRatio, PortfolioImage } from '@/types/content';
import { aspectRatioClass } from '@/lib/imageCrop';
import { shouldBypassImageOptimizer } from '@/lib/imageDisplay';
import ImageUploadCrop from '@/components/ImageUploadCrop';
import ImageHotspotEditor from '@/components/ImageHotspotEditor';
import { useApp } from '@/components/AppContext';

interface PortfolioImageManagerProps {
  images: PortfolioImage[];
  onChange: (images: PortfolioImage[]) => void;
  defaultAspectRatio?: ImageAspectRatio;
}

export default function PortfolioImageManager({
  images,
  onChange,
  defaultAspectRatio = '4:3',
}: PortfolioImageManagerProps) {
  const { t } = useApp();
  const [cropOpen, setCropOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<PortfolioImage | null>(null);

  const handleAdd = (result: { url: string; aspectRatio: ImageAspectRatio }) => {
    onChange([
      ...images,
      {
        id: `img_${Date.now()}`,
        url: result.url,
        aspectRatio: result.aspectRatio,
        hotspots: [],
      },
    ]);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((img, index) => (
          <div key={img.id} className="border border-gray-200">
            <div className={`relative ${aspectRatioClass(img.aspectRatio)} bg-gray-100`}>
              <Image
                src={img.url}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover"
                unoptimized={shouldBypassImageOptimizer(img.url)}
                referrerPolicy="no-referrer"
              />
              {index === 0 && (
                <span className="absolute top-2 left-2 bg-black text-white text-[9px] uppercase tracking-widest px-2 py-0.5 font-bold">
                  {t('edit.image.cover')}
                </span>
              )}
              {img.hotspots.length > 0 && (
                <span className="absolute top-2 right-2 bg-white/90 text-black text-[9px] px-2 py-0.5 font-bold flex items-center gap-1">
                  <MapPin size={10} /> {img.hotspots.length}
                </span>
              )}
            </div>
            <div className="p-2 flex gap-1">
              <button
                type="button"
                onClick={() => setEditingImage(img)}
                className="flex-1 text-[10px] uppercase font-bold tracking-wider bg-gray-100 hover:bg-gray-200 py-2"
              >
                {t('edit.hotspot.edit')}
              </button>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const next = [...images];
                    const [item] = next.splice(index, 1);
                    next.unshift(item);
                    onChange(next);
                  }}
                  className="p-2 bg-gray-100 hover:bg-gray-200"
                  title={t('edit.image.setCover')}
                >
                  <Star size={12} />
                </button>
              )}
              <button
                type="button"
                onClick={() => onChange(images.filter((i) => i.id !== img.id))}
                className="p-2 bg-gray-100 hover:bg-red-50 text-red-500"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setCropOpen(true)}
          className={`border-2 border-dashed border-gray-300 hover:border-black flex flex-col items-center justify-center gap-2 min-h-[120px] ${aspectRatioClass(defaultAspectRatio)}`}
        >
          <Plus size={20} className="text-gray-400" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">{t('edit.image.upload')}</span>
        </button>
      </div>

      <ImageUploadCrop open={cropOpen} onClose={() => setCropOpen(false)} onComplete={handleAdd} defaultAspectRatio={defaultAspectRatio} />

      {editingImage && (
        <ImageHotspotEditor
          image={editingImage}
          open
          onClose={() => setEditingImage(null)}
          onSave={(updated) => {
            onChange(images.map((img) => (img.id === updated.id ? updated : img)));
            setEditingImage(null);
          }}
        />
      )}
    </div>
  );
}
