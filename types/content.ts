export type ImageAspectRatio = '1:1' | '4:3' | '16:9' | '9:16' | '3:4';

export interface ImageHotspot {
  id: string;
  /** 0–100 percent from left */
  x: number;
  /** 0–100 percent from top */
  y: number;
  name: string;
  description?: string;
  price: string;
}

export interface PortfolioImage {
  id: string;
  url: string;
  aspectRatio: ImageAspectRatio;
  hotspots: ImageHotspot[];
}

export interface Room {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  imageUrls: string[];
  /** Rich image data with crop ratio + product pins */
  images?: PortfolioImage[];
  pageId: string;
  /** แท็กที่ติดบนการ์ด — ใช้ค้นหาและแสดงบนการ์ดสาธารณะ */
  keywords: string[];
  /** การ์ดเด่นในเมนู (1–3 ต่อหน้า) — แสดงรูปใหญ่ด้านบน */
  featuredRank?: number;
}

export interface Keyword {
  id: string;
  name: string;
}

export interface StylePage {
  id: string;
  name: string;
  description: string;
}

export interface HomeSlide {
  id: string;
  imageUrl: string;
  title: string;
  pageId: string;
  /** คงที่ 4:3 — เก็บเพื่อ backward compat */
  aspectRatio?: ImageAspectRatio;
}

export interface MenuLink {
  name: string;
  href: string;
  pageId?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
}

export interface ContactChannels {
  line?: string;
  phone?: string;
  email?: string;
}

export const RESERVED_SLUGS = new Set(['edit', 'contact', 'api', '_next']);

export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\u0E00-\u0E7F\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40) || `page-${Date.now()}`;
}
