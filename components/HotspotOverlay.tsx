'use client';

import { ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageHotspot } from '@/types/content';

interface HotspotOverlayProps {
  hotspots: ImageHotspot[];
  activeId?: string | null;
  onSelect?: (id: string | null) => void;
  editable?: boolean;
  onAddAt?: (x: number, y: number) => void;
}

export default function HotspotOverlay({
  hotspots,
  activeId,
  onSelect,
  editable = false,
  onAddAt,
}: HotspotOverlayProps) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!editable || !onAddAt) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onAddAt(x, y);
  };

  return (
    <div
      className={`absolute inset-0 ${editable ? 'cursor-crosshair' : ''}`}
      onClick={handleClick}
    >
      {hotspots.map((spot) => {
        const isActive = activeId === spot.id;
        return (
          <motion.div
            key={spot.id}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(isActive ? null : spot.id);
            }}
          >
            <div
              className={`w-5 h-5 rounded-full border-2 border-white/90 bg-black/40 shadow-lg transition-transform flex items-center justify-center ${
                isActive ? 'scale-125 ring-2 ring-white/60' : 'hover:scale-110'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-white/90" />
            </div>

            {isActive && !editable && (
              <div className="absolute left-6 top-1/2 -translate-y-1/2 w-56 bg-white shadow-xl border border-gray-100 p-4 pointer-events-none z-20">
                <p className="font-bold text-sm uppercase tracking-tight">{spot.name}</p>
                {spot.description && (
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{spot.description}</p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold">{spot.price}</span>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
