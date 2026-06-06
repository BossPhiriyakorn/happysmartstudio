import { MenuLink, StylePage } from '@/types/content';

export const ABOUT_MENU_HREF = '/contact';

export function buildNavLinks(
  stylePages: StylePage[],
  aboutName = 'เกี่ยวกับเรา',
  homeName = 'หน้าแรก',
): MenuLink[] {
  return [
    { name: homeName, href: '/' },
    ...stylePages.map((page) => ({
      name: page.name,
      href: `/${page.id}`,
      pageId: page.id,
    })),
    { name: aboutName, href: ABOUT_MENU_HREF },
  ];
}
