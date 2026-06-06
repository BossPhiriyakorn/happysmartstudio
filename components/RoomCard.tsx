'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import { Room } from '@/types/content';
import { aspectRatioClass } from '@/lib/imageCrop';
import { shouldBypassImageOptimizer } from '@/lib/imageDisplay';
import { roomCoverAspectRatio } from '@/lib/roomImages';

interface RoomCardProps {
  room: Room;
  index: number;
  onClick: () => void;
}

export default function RoomCard({ room, index, onClick }: RoomCardProps) {
  const coverAspect = roomCoverAspectRatio(room);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex flex-col gap-2 cursor-pointer group"
      onClick={onClick}
    >
      <motion.div
        className={`relative overflow-hidden bg-gray-100 mt-2 ${aspectRatioClass(coverAspect)}`}
        whileHover={{ scale: 0.96 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <Image
          src={room.imageUrl}
          alt={room.name}
          fill
          sizes="(max-width: 600px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          unoptimized={shouldBypassImageOptimizer(room.imageUrl)}
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </motion.div>
      <div className="flex flex-col pt-1">
        <h3 className="text-sm font-semibold tracking-tight leading-tight line-clamp-1">{room.name}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{room.price}</p>
        {room.keywords.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {room.keywords.map((tag) => (
              <span
                key={tag}
                className="bg-gray-100 text-gray-600 px-2 py-0.5 text-[9px] font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
