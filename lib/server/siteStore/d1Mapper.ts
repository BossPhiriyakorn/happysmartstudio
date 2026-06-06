import { buildHomeContactMenuLinks } from '@/lib/data/defaults';
import type { Branding, SiteSnapshot } from '@/lib/data/types';
import type {
  HomeSlide,
  ImageAspectRatio,
  ImageHotspot,
  MenuLink,
  PortfolioImage,
  Room,
  StylePage,
  TeamMember,
} from '@/types/content';
import { roomToPortfolioImages } from '@/lib/roomImages';

type D1Row = Record<string, unknown>;

function str(row: D1Row, key: string, fallback = ''): string {
  const v = row[key];
  return typeof v === 'string' ? v : fallback;
}

function num(row: D1Row, key: string): number | undefined {
  const v = row[key];
  return typeof v === 'number' ? v : undefined;
}

function aspectRatio(value: string | null | undefined): ImageAspectRatio {
  const allowed: ImageAspectRatio[] = ['1:1', '4:3', '16:9', '9:16', '3:4'];
  return allowed.includes(value as ImageAspectRatio) ? (value as ImageAspectRatio) : '4:3';
}

function rowToBranding(row: D1Row): Branding {
  return {
    name: str(row, 'name'),
    homeLabel: str(row, 'home_label'),
    shortName: str(row, 'short_name'),
    introKicker: str(row, 'intro_kicker'),
    introTitle: str(row, 'intro_title'),
    heroTitle: str(row, 'hero_title'),
    heroDescription: str(row, 'hero_description'),
    studioBadge: str(row, 'studio_badge'),
    feedSectionTitle: str(row, 'feed_section_title'),
    teamSectionTitle: str(row, 'team_section_title'),
    teamSectionDescription: str(row, 'team_section_description'),
    hqAddressLine1: str(row, 'hq_address_line1'),
    hqAddressLine2: str(row, 'hq_address_line2'),
    footerTitle: str(row, 'footer_title'),
    footerDescription: str(row, 'footer_description'),
    contactHeroTitle: str(row, 'contact_hero_title'),
    contactHeroDesc: str(row, 'contact_hero_desc'),
    contactChannelsTitle: str(row, 'contact_channels_title'),
    contactChannelsDesc: str(row, 'contact_channels_desc'),
    contactNoChannels: str(row, 'contact_no_channels'),
    contactHqLabel: str(row, 'contact_hq_label'),
    contactHoursTitle: str(row, 'contact_hours_title'),
    contactHoursDesc: str(row, 'contact_hours_desc'),
  };
}

function menuLinkId(link: MenuLink, index: number): string {
  if (link.pageId) return `ml_${link.pageId}`;
  const slug = link.href.replace(/^\//, '').replace(/[^a-z0-9]+/gi, '_').slice(0, 40);
  return `ml_${slug || index}`;
}

function isExternalMenuLink(link: MenuLink): number {
  if (link.pageId) return 0;
  return /^https?:\/\//i.test(link.href) ? 1 : 0;
}

/** Load a full SiteSnapshot from normalized D1 tables. */
export async function loadSnapshotFromD1(db: D1Database, siteId: string): Promise<SiteSnapshot | null> {
  const brandingRow = await db
    .prepare('SELECT * FROM site_branding WHERE site_id = ?')
    .bind(siteId)
    .first<D1Row>();

  if (!brandingRow) return null;

  const stylePageRows = await db
    .prepare(
      'SELECT id, name, description FROM style_pages WHERE site_id = ? ORDER BY sort_order ASC, id ASC',
    )
    .bind(siteId)
    .all<D1Row>();

  const menuRows = await db
    .prepare(
      'SELECT id, name, href, page_id FROM menu_links WHERE site_id = ? ORDER BY sort_order ASC, id ASC',
    )
    .bind(siteId)
    .all<D1Row>();

  const keywordRows = await db
    .prepare('SELECT id, name FROM keywords WHERE site_id = ? ORDER BY sort_order ASC, id ASC')
    .bind(siteId)
    .all<D1Row>();

  const roomRows = await db
    .prepare(
      `SELECT id, page_id, name, description, price, legacy_image_url, featured_rank
       FROM rooms WHERE site_id = ? ORDER BY sort_order ASC, id ASC`,
    )
    .bind(siteId)
    .all<D1Row>();

  const tagRows = await db
    .prepare(
      'SELECT room_id, keyword_name FROM room_keyword_tags WHERE site_id = ? ORDER BY sort_order ASC',
    )
    .bind(siteId)
    .all<D1Row>();

  const portfolioRows = await db
    .prepare(
      `SELECT id, room_id, url, aspect_ratio, sort_order
       FROM portfolio_images WHERE site_id = ? ORDER BY sort_order ASC, id ASC`,
    )
    .bind(siteId)
    .all<D1Row>();

  const hotspotRows = await db
    .prepare(
      `SELECT id, portfolio_image_id, x_percent, y_percent, name, description, price, sort_order
       FROM image_hotspots WHERE site_id = ? ORDER BY sort_order ASC, id ASC`,
    )
    .bind(siteId)
    .all<D1Row>();

  const slideRows = await db
    .prepare(
      `SELECT id, image_url, title, page_id, aspect_ratio
       FROM home_slides WHERE site_id = ? ORDER BY sort_order ASC, id ASC`,
    )
    .bind(siteId)
    .all<D1Row>();

  const teamRows = await db
    .prepare(
      'SELECT id, name, role, image_url FROM team_members WHERE site_id = ? ORDER BY sort_order ASC, id ASC',
    )
    .bind(siteId)
    .all<D1Row>();

  const contactRow = await db
    .prepare('SELECT label, line_url, phone, email FROM contact_settings WHERE site_id = ?')
    .bind(siteId)
    .first<D1Row>();

  const stylePages: StylePage[] = (stylePageRows.results ?? []).map((row) => ({
    id: str(row, 'id'),
    name: str(row, 'name'),
    description: str(row, 'description'),
  }));

  const menuLinks: MenuLink[] = (menuRows.results ?? []).map((row) => ({
    name: str(row, 'name'),
    href: str(row, 'href'),
    pageId: str(row, 'page_id') || undefined,
  }));

  const keywords = (keywordRows.results ?? []).map((row) => ({
    id: str(row, 'id'),
    name: str(row, 'name'),
  }));

  const tagsByRoom = new Map<string, string[]>();
  for (const row of tagRows.results ?? []) {
    const roomId = str(row, 'room_id');
    const list = tagsByRoom.get(roomId) ?? [];
    list.push(str(row, 'keyword_name'));
    tagsByRoom.set(roomId, list);
  }

  const hotspotsByImage = new Map<string, ImageHotspot[]>();
  for (const row of hotspotRows.results ?? []) {
    const imageId = str(row, 'portfolio_image_id');
    const list = hotspotsByImage.get(imageId) ?? [];
    list.push({
      id: str(row, 'id'),
      x: num(row, 'x_percent') ?? 0,
      y: num(row, 'y_percent') ?? 0,
      name: str(row, 'name'),
      description: str(row, 'description') || undefined,
      price: str(row, 'price'),
    });
    hotspotsByImage.set(imageId, list);
  }

  const imagesByRoom = new Map<string, PortfolioImage[]>();
  for (const row of portfolioRows.results ?? []) {
    const roomId = str(row, 'room_id');
    const imageId = str(row, 'id');
    const list = imagesByRoom.get(roomId) ?? [];
    list.push({
      id: imageId,
      url: str(row, 'url'),
      aspectRatio: aspectRatio(str(row, 'aspect_ratio')),
      hotspots: hotspotsByImage.get(imageId) ?? [],
    });
    imagesByRoom.set(roomId, list);
  }

  const rooms: Room[] = (roomRows.results ?? []).map((row) => {
    const id = str(row, 'id');
    const partial: Partial<Room> = {
      id,
      pageId: str(row, 'page_id'),
      name: str(row, 'name'),
      description: str(row, 'description'),
      price: str(row, 'price'),
      imageUrl: str(row, 'legacy_image_url'),
      keywords: tagsByRoom.get(id) ?? [],
      featuredRank: num(row, 'featured_rank'),
      images: imagesByRoom.get(id),
    };
    const images = roomToPortfolioImages(partial);
    return {
      id,
      pageId: str(row, 'page_id'),
      name: str(row, 'name'),
      description: str(row, 'description'),
      price: str(row, 'price'),
      imageUrl: images[0]?.url ?? str(row, 'legacy_image_url'),
      imageUrls: images.map((img) => img.url),
      images,
      keywords: tagsByRoom.get(id) ?? [],
      featuredRank: num(row, 'featured_rank'),
    };
  });

  const homeSlides: HomeSlide[] = (slideRows.results ?? []).map((row) => ({
    id: str(row, 'id'),
    imageUrl: str(row, 'image_url'),
    title: str(row, 'title'),
    pageId: str(row, 'page_id'),
    aspectRatio: aspectRatio(str(row, 'aspect_ratio')),
  }));

  const teamMembers: TeamMember[] = (teamRows.results ?? []).map((row) => ({
    id: str(row, 'id'),
    name: str(row, 'name'),
    role: str(row, 'role'),
    imageUrl: str(row, 'image_url'),
  }));

  const contactLabel = str(contactRow ?? {}, 'label', 'ติดต่อ');

  return {
    branding: rowToBranding(brandingRow),
    stylePages,
    menuLinks:
      menuLinks.length > 0
        ? menuLinks
        : buildHomeContactMenuLinks(stylePages, contactLabel, rowToBranding(brandingRow).homeLabel),
    rooms,
    homeSlides,
    keywords,
    teamMembers,
    contactChannels: {
      line: str(contactRow ?? {}, 'line_url') || undefined,
      phone: str(contactRow ?? {}, 'phone') || undefined,
      email: str(contactRow ?? {}, 'email') || undefined,
    },
    contactLabel,
  };
}

/** Replace site content tables from a SiteSnapshot (single-tenant batch). */
export function buildSaveSnapshotBatch(
  db: D1Database,
  snapshot: SiteSnapshot,
  siteId: string,
): D1PreparedStatement[] {
  const stmts: D1PreparedStatement[] = [];
  const b = siteId;

  const deletes = [
    'DELETE FROM image_hotspots WHERE site_id = ?',
    'DELETE FROM portfolio_images WHERE site_id = ?',
    'DELETE FROM room_keyword_tags WHERE site_id = ?',
    'DELETE FROM rooms WHERE site_id = ?',
    'DELETE FROM home_slides WHERE site_id = ?',
    'DELETE FROM team_members WHERE site_id = ?',
    'DELETE FROM menu_links WHERE site_id = ?',
    'DELETE FROM keywords WHERE site_id = ?',
    'DELETE FROM style_pages WHERE site_id = ?',
  ];
  for (const sql of deletes) {
    stmts.push(db.prepare(sql).bind(b));
  }

  const branding = snapshot.branding;
  stmts.push(
    db
      .prepare(
        `INSERT INTO site_branding (
          site_id, name, home_label, short_name, intro_kicker, intro_title,
          hero_title, hero_description, studio_badge,
          feed_section_title, team_section_title, team_section_description,
          hq_address_line1, hq_address_line2,
          footer_title, footer_description,
          contact_hero_title, contact_hero_desc,
          contact_channels_title, contact_channels_desc, contact_no_channels,
          contact_hq_label, contact_hours_title, contact_hours_desc
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(site_id) DO UPDATE SET
          name=excluded.name, home_label=excluded.home_label, short_name=excluded.short_name,
          intro_kicker=excluded.intro_kicker, intro_title=excluded.intro_title,
          hero_title=excluded.hero_title, hero_description=excluded.hero_description,
          studio_badge=excluded.studio_badge,
          feed_section_title=excluded.feed_section_title,
          team_section_title=excluded.team_section_title,
          team_section_description=excluded.team_section_description,
          hq_address_line1=excluded.hq_address_line1, hq_address_line2=excluded.hq_address_line2,
          footer_title=excluded.footer_title, footer_description=excluded.footer_description,
          contact_hero_title=excluded.contact_hero_title, contact_hero_desc=excluded.contact_hero_desc,
          contact_channels_title=excluded.contact_channels_title,
          contact_channels_desc=excluded.contact_channels_desc,
          contact_no_channels=excluded.contact_no_channels,
          contact_hq_label=excluded.contact_hq_label,
          contact_hours_title=excluded.contact_hours_title,
          contact_hours_desc=excluded.contact_hours_desc,
          updated_at=strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`,
      )
      .bind(
        b,
        branding.name,
        branding.homeLabel,
        branding.shortName,
        branding.introKicker,
        branding.introTitle,
        branding.heroTitle,
        branding.heroDescription,
        branding.studioBadge,
        branding.feedSectionTitle,
        branding.teamSectionTitle,
        branding.teamSectionDescription,
        branding.hqAddressLine1,
        branding.hqAddressLine2,
        branding.footerTitle,
        branding.footerDescription,
        branding.contactHeroTitle,
        branding.contactHeroDesc,
        branding.contactChannelsTitle,
        branding.contactChannelsDesc,
        branding.contactNoChannels,
        branding.contactHqLabel,
        branding.contactHoursTitle,
        branding.contactHoursDesc,
      ),
  );

  snapshot.stylePages.forEach((page, index) => {
    stmts.push(
      db
        .prepare(
          `INSERT INTO style_pages (site_id, id, name, description, sort_order)
           VALUES (?, ?, ?, ?, ?)`,
        )
        .bind(b, page.id, page.name, page.description ?? '', index),
    );
  });

  snapshot.keywords.forEach((kw, index) => {
    stmts.push(
      db
        .prepare('INSERT INTO keywords (site_id, id, name, sort_order) VALUES (?, ?, ?, ?)')
        .bind(b, kw.id, kw.name, index),
    );
  });

  snapshot.menuLinks.forEach((link, index) => {
    stmts.push(
      db
        .prepare(
          `INSERT INTO menu_links (id, site_id, name, href, page_id, sort_order, is_external)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          menuLinkId(link, index),
          b,
          link.name,
          link.href,
          link.pageId ?? null,
          index,
          isExternalMenuLink(link),
        ),
    );
  });

  snapshot.rooms.forEach((room, roomIndex) => {
    const images = roomToPortfolioImages(room);
    const coverUrl = images[0]?.url ?? room.imageUrl ?? '';

    stmts.push(
      db
        .prepare(
          `INSERT INTO rooms (
            site_id, id, page_id, name, description, price, legacy_image_url, sort_order, featured_rank
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          b,
          room.id,
          room.pageId,
          room.name,
          room.description ?? '',
          room.price ?? '',
          coverUrl,
          roomIndex,
          room.featuredRank ?? null,
        ),
    );

    room.keywords.forEach((tag, tagIndex) => {
      stmts.push(
        db
          .prepare(
            'INSERT INTO room_keyword_tags (site_id, room_id, keyword_name, sort_order) VALUES (?, ?, ?, ?)',
          )
          .bind(b, room.id, tag, tagIndex),
      );
    });

    images.forEach((img, imgIndex) => {
      stmts.push(
        db
          .prepare(
            `INSERT INTO portfolio_images (site_id, id, room_id, url, aspect_ratio, sort_order)
             VALUES (?, ?, ?, ?, ?, ?)`,
          )
          .bind(b, img.id, room.id, img.url, img.aspectRatio, imgIndex),
      );

      (img.hotspots ?? []).forEach((spot, spotIndex) => {
        stmts.push(
          db
            .prepare(
              `INSERT INTO image_hotspots (
                site_id, id, portfolio_image_id, x_percent, y_percent, name, description, price, sort_order
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            )
            .bind(
              b,
              spot.id,
              img.id,
              spot.x,
              spot.y,
              spot.name,
              spot.description ?? null,
              spot.price ?? '',
              spotIndex,
            ),
        );
      });
    });
  });

  snapshot.homeSlides.forEach((slide, index) => {
    stmts.push(
      db
        .prepare(
          `INSERT INTO home_slides (site_id, id, image_url, title, page_id, aspect_ratio, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          b,
          slide.id,
          slide.imageUrl,
          slide.title ?? '',
          slide.pageId,
          slide.aspectRatio ?? '4:3',
          index,
        ),
    );
  });

  snapshot.teamMembers.forEach((member, index) => {
    stmts.push(
      db
        .prepare(
          `INSERT INTO team_members (site_id, id, name, role, image_url, sort_order)
           VALUES (?, ?, ?, ?, ?, ?)`,
        )
        .bind(b, member.id, member.name, member.role ?? '', member.imageUrl ?? '', index),
    );
  });

  const channels = snapshot.contactChannels;
  stmts.push(
    db
      .prepare(
        `INSERT INTO contact_settings (site_id, label, line_url, phone, email)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(site_id) DO UPDATE SET
           label=excluded.label,
           line_url=excluded.line_url,
           phone=excluded.phone,
           email=excluded.email,
           updated_at=strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`,
      )
      .bind(
        b,
        snapshot.contactLabel ?? 'ติดต่อ',
        channels.line ?? null,
        channels.phone ?? null,
        channels.email ?? null,
      ),
  );

  return stmts;
}
