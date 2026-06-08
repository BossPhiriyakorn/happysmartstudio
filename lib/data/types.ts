import type {
  ContactChannels,
  HomeSlide,
  Keyword,
  MenuLink,
  Room,
  StylePage,
  TeamMember,
} from '@/types/content';

export type BrandIconMode = 'text' | 'logo';

/** Site identity / copy — maps to `site_branding` */
export interface Branding {
  name: string;
  homeLabel: string;
  /** Header/footer square icon: text initials or uploaded logo */
  iconMode: BrandIconMode;
  /** Cropped logo image when iconMode is 'logo' */
  logoUrl: string;
  shortName: string;
  introKicker: string;
  introTitle: string;
  heroTitle: string;
  heroDescription: string;
  studioBadge: string;
  feedSectionTitle: string;
  teamSectionTitle: string;
  teamSectionDescription: string;
  hqAddressLine1: string;
  hqAddressLine2: string;
  /** Google Maps / share link for address 1 */
  hqAddressMapUrl: string;
  hqAddress2Enabled: boolean;
  hqAddress2Line1: string;
  hqAddress2Line2: string;
  hqAddress2MapUrl: string;
  footerTitle: string;
  footerDescription: string;
  /** หน้าติดต่อ — เก็บใน DB แก้ไขได้ */
  contactHeroTitle: string;
  contactHeroDesc: string;
  contactChannelsTitle: string;
  contactChannelsDesc: string;
  contactNoChannels: string;
  contactHqLabel: string;
  contactHoursTitle: string;
  contactHoursDesc: string;
}

/** Full site state exchanged with API / persistence layer */
export interface SiteSnapshot {
  branding: Branding;
  stylePages: StylePage[];
  menuLinks: MenuLink[];
  rooms: Room[];
  homeSlides: HomeSlide[];
  keywords: Keyword[];
  teamMembers: TeamMember[];
  contactChannels: ContactChannels;
  contactLabel: string;
}

export type SiteSnapshotKey = keyof SiteSnapshot;
