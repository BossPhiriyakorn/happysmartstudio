import { isProductMode } from '@/lib/config/appMode';
import { ENABLE_MOCK_DATA } from '@/lib/env';
import { buildNavLinks } from '@/lib/menu';
import type { ContactChannels, Keyword, StylePage } from '@/types/content';
import type { Branding, SiteSnapshot } from '@/lib/data/types';

export const DEFAULT_SITE_ID = 'default';

export const DEFAULT_BRANDING: Branding = {
  name: 'HappySmart Studio',
  homeLabel: 'หน้าแรก',
  shortName: 'HS.',
  introKicker: 'Architecture Studio',
  introTitle: 'HappySmart Studio',
  heroTitle: 'ค้นพบ\nพื้นที่ที่\nใช่สำหรับคุณ',
  heroDescription: 'ผสานรูปแบบ หน้าที่ และความเรียบง่ายในแบบโมเดิร์น',
  studioBadge: 'สตูดิโอ 2026',
  feedSectionTitle: 'แรงบันดาลใจประจำวัน',
  teamSectionTitle: 'ทีมงาน',
  teamSectionDescription: 'ทีมดีไซน์และสถาปนิกที่พร้อมดูแลโปรเจกต์ของคุณ',
  hqAddressLine1: '128 Design Avenue',
  hqAddressLine2: 'Creative District, BKK 10110',
  footerTitle: 'สร้างอนาคต\nออกแบบปัจจุบัน',
  footerDescription: 'สตูดิโอสถาปัตยกรรมชั้นนำด้านคอนเซ็ปต์โมเดิร์น ลอฟท์ และมินิมอล',
  contactHeroTitle: 'มาร่วมสร้าง\nไปด้วยกัน',
  contactHeroDesc: 'เริ่มการปรึกษาหรือทักทายเรา ทีมดีไซน์พร้อมรับฟัง',
  contactChannelsTitle: 'ช่องทางติดต่อ',
  contactChannelsDesc: 'เลือกช่องทางที่สะดวก — กดปุ่มด้านล่างเพื่อติดต่อเรา',
  contactNoChannels: 'ยังไม่ได้ตั้งค่าช่องทางติดต่อ',
  contactHqLabel: 'สตูดิโอสำนักงานใหญ่',
  contactHoursTitle: 'เวลาให้คำปรึกษา',
  contactHoursDesc: 'จันทร์–ศุกร์: 9:00 – 18:00\nเสาร์ (นัดหมาย): 10:00 – 16:00',
};

/** เมนูตัวอย่าง — ใช้เฉพาะโหมด mock */
export const MOCK_STYLE_PAGES: StylePage[] = [
  { id: 'moderne', name: 'โมเดิร์น', description: 'ศิลปะร่วมสมัยผสานพื้นที่ใช้สอย' },
  { id: 'loft', name: 'ลอฟท์', description: 'Industrial raw และพื้นที่สร้างสรรค์' },
  { id: 'minimalist', name: 'มินิมอล', description: 'เรียบง่าย สงบ และใช้งานได้จริง' },
];

/** @deprecated ใช้ getBootstrapStylePages() แทน */
export const DEFAULT_STYLE_PAGES = MOCK_STYLE_PAGES;

export const MOCK_KEYWORDS: Keyword[] = [
  { id: 'kw_bedroom', name: 'ห้องนอน' },
  { id: 'kw_kitchen', name: 'ครัว' },
  { id: 'kw_living', name: 'ห้องนั่งเล่น' },
  { id: 'kw_office', name: 'สำนักงาน' },
];

export const DEFAULT_CONTACT_CHANNELS: ContactChannels = {
  line: 'https://line.me',
  phone: '02-123-4567',
  email: 'hello@happysmart.studio',
};

export const DEFAULT_CONTACT_LABEL = 'ติดต่อ';

export const DEFAULT_ABOUT_LABEL = 'เกี่ยวกับเรา';

export const DEFAULT_KEYWORDS = MOCK_KEYWORDS;

/** เมนูเริ่มต้น: mock = 3 หน้าตัวอย่าง, product/ไม่ mock = ว่าง (เหลือแค่หน้าแรก+ติดต่อ) */
export function getBootstrapStylePages(): StylePage[] {
  if (isProductMode()) return [];
  if (ENABLE_MOCK_DATA) return [...MOCK_STYLE_PAGES];
  return [];
}

export function getBootstrapKeywords(): Keyword[] {
  if (isProductMode()) return [];
  if (ENABLE_MOCK_DATA) return [...MOCK_KEYWORDS];
  return [];
}

export function buildHomeContactMenuLinks(
  stylePages: StylePage[],
  _contactLabel = DEFAULT_CONTACT_LABEL,
  homeLabel = DEFAULT_BRANDING.homeLabel,
  aboutLabel = DEFAULT_ABOUT_LABEL,
) {
  return buildNavLinks(stylePages, aboutLabel, homeLabel);
}

/** โหมด product / ไม่มี mock — เริ่มจากหน้าแรก + เกี่ยวกับเรา เท่านั้น */
export function productEmptySiteSnapshot(): SiteSnapshot {
  const branding = { ...DEFAULT_BRANDING };
  return {
    branding,
    stylePages: [],
    menuLinks: buildHomeContactMenuLinks([], DEFAULT_CONTACT_LABEL, branding.homeLabel),
    rooms: [],
    homeSlides: [],
    keywords: [],
    teamMembers: [],
    contactChannels: {},
    contactLabel: DEFAULT_CONTACT_LABEL,
  };
}

export function emptySiteSnapshot(): SiteSnapshot {
  if (isProductMode()) return productEmptySiteSnapshot();
  const stylePages = getBootstrapStylePages();
  const branding = { ...DEFAULT_BRANDING };
  return {
    branding,
    stylePages,
    menuLinks: buildHomeContactMenuLinks(stylePages, DEFAULT_CONTACT_LABEL, branding.homeLabel),
    rooms: [],
    homeSlides: [],
    keywords: getBootstrapKeywords(),
    teamMembers: [],
    contactChannels: { ...DEFAULT_CONTACT_CHANNELS },
    contactLabel: DEFAULT_CONTACT_LABEL,
  };
}
