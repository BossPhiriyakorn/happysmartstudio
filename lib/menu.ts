import { MenuLink, StylePage } from '@/types/content';

export function buildNavLinks(
  stylePages: StylePage[],
  contactName = 'ติดต่อ',
  homeName = 'หน้าแรก',
): MenuLink[] {
  return [
    { name: homeName, href: '/' },
    ...stylePages.map((page) => ({
      name: page.name,
      href: `/${page.id}`,
      pageId: page.id,
    })),
    { name: contactName, href: '/contact' },
  ];
}
