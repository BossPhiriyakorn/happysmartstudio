import { ImageAspectRatio, PortfolioImage, Room, HomeSlide } from '@/types/content';
import { aspectRatioClass, SLIDE_DEFAULT_ASPECT_RATIO } from '@/lib/imageCrop';

export function roomToPortfolioImages(room: Partial<Room>): PortfolioImage[] {
  if (room.images && room.images.length > 0) {
    return room.images.map((img) => ({
      ...img,
      hotspots: img.hotspots || [],
      aspectRatio: img.aspectRatio || '4:3',
    }));
  }

  const urls =
    room.imageUrls && room.imageUrls.length > 0
      ? room.imageUrls
      : room.imageUrl
        ? [room.imageUrl]
        : [];

  return urls.map((url, index) => ({
    id: `img_${room.id || 'new'}_${index}`,
    url,
    aspectRatio: '4:3' as ImageAspectRatio,
    hotspots: [],
  }));
}

export function roomCoverAspectRatio(room: Partial<Room>): ImageAspectRatio {
  return roomToPortfolioImages(room)[0]?.aspectRatio || '4:3';
}

export type AspectShape = 'portrait' | 'landscape' | 'square';

export function aspectRatioShape(ratio: ImageAspectRatio): AspectShape {
  if (ratio === '1:1') return 'square';
  if (ratio === '9:16' || ratio === '3:4') return 'portrait';
  return 'landscape';
}

/** กรอบสไลด์หน้าแรก — ขนาดคงที่ 4:3 ทุกใบ */
export function slideFrameClass(): string {
  return `w-64 ${aspectRatioClass(SLIDE_DEFAULT_ASPECT_RATIO)} shrink-0`;
}

export function normalizeHomeSlide(slide: HomeSlide): HomeSlide {
  return { ...slide, aspectRatio: SLIDE_DEFAULT_ASPECT_RATIO };
}

export function portfolioImagesToRoomFields(images: PortfolioImage[]) {
  return {
    images,
    imageUrl: images[0]?.url || '',
    imageUrls: images.map((img) => img.url),
  };
}
