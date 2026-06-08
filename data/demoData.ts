import type { HomeSlide, ImageAspectRatio, Room, TeamMember } from '@/types/content';

const IMG = (id: string, w = 800, h = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

const INTERIOR_PHOTOS = [
  'photo-1600210492486-724fe5c67fb0',
  'photo-1598928506311-c55ded91a20c',
  'photo-1600607687920-4e2a09cf159d',
  'photo-1579656592043-a20e25a4aa4b',
  'photo-1554995207-c18c203602cb',
  'photo-1497366216548-37526070297c',
  'photo-1618221195710-dd6b41faaea6',
  'photo-1586023492125-27b2c045efd7',
  'photo-1615529328331-f8917597711f',
  'photo-1583847268964-b28dc8f51f92',
  'photo-1600585154340-be6161a56a0c',
  'photo-1502672260266-1c1ef2d93688',
  'photo-1522708323590-d24dbb6b0267',
  'photo-1484154218962-a197022b5858',
  'photo-1512917774080-9991f1c4c750',
  'photo-1600607687644-c7171b42498f',
  'photo-1600585154526-990dced4db0d',
  'photo-1600566753086-00f18fb6b3ea',
  'photo-1631679706909-1844bbd07221',
  'photo-1620626011761-996317b8d101',
  'photo-1560185008-b033106af5c3',
  'photo-1560185009-5bf9f2849488',
  'photo-1560448075-bb485b067938',
  'photo-1560448204-603b3fc33ddc',
  'photo-1556909114-f6e7ad7d3136',
  'photo-1505693416388-ac5ce068fe85',
  'photo-1505691723518-36a5ac3be353',
  'photo-1540518614846-7eded433c457',
] as const;

const KEYWORD_ROTATION = [
  ['ห้องนั่งเล่น'],
  ['ห้องนอน', 'นอน'],
  ['ครัว'],
  ['สำนักงาน'],
  ['ห้องน้ำ'],
  ['ห้องรับประทานอาหาร'],
];

type DemoPageSpec = {
  pageId: string;
  prefix: string;
  names: string[];
};

const DEMO_PAGES: DemoPageSpec[] = [
  {
    pageId: 'moderne',
    prefix: 'mo',
    names: [
      'Modern Lounge',
      'Urban Kitchen',
      'Glass Atrium',
      'Monochrome Suite',
      'City Penthouse',
      'Linear Workspace',
      'Marble Entry',
      'Skyline Living',
      'Sculptural Stair',
      'Night Bar Nook',
    ],
  },
  {
    pageId: 'loft',
    prefix: 'l',
    names: [
      'Industrial Loft',
      'Creative Studio',
      'Brick Gallery',
      'Steel Frame Den',
      'Factory Kitchen',
      'Open Mezzanine',
      'Concrete Bedroom',
      'Vintage Workshop',
      'Exposed Duct Hall',
      'Rooftop Lounge',
    ],
  },
  {
    pageId: 'minimalist',
    prefix: 'm',
    names: [
      'Minimalist Living',
      'Zen Bedroom',
      'Calm Dining',
      'Soft Light Bath',
      'Quiet Study',
      'Neutral Entry',
      'Open Shelf Kitchen',
      'Serene Guest Room',
      'Daybed Corner',
      'Hidden Storage Wall',
    ],
  },
];

/** สลับแนวตั้ง (3:4) / แนวนอน (16:9) เท่ากัน — 5 ใบต่อแบบต่อเมนู */
const ASPECT_PATTERN: ImageAspectRatio[] = [
  '3:4',
  '16:9',
  '3:4',
  '16:9',
  '3:4',
  '16:9',
  '3:4',
  '16:9',
  '3:4',
  '16:9',
];

/** รายการที่ 4, 7, 9 ของแต่ละเมนู — สไลด์หลายรูปที่อัตราส่วนต่างกัน */
const MIXED_SLIDESHOW_INDICES = new Set([3, 6, 8]);

const MIXED_SLIDE_ASPECTS: ImageAspectRatio[] = ['3:4', '16:9', '1:1', '9:16'];

const LONG_DEMO_MO2_DESCRIPTION = `ครัวโอเพ่นแพลนท็อปหินและตู้บิวท์อิน — ออกแบบให้เชื่อมต่อกับพื้นที่นั่งเล่นและรับประทานอาหารอย่างต่อเนื่อง

แนวคิดหลักคือ “ครัวเป็นหัวใจของบ้าน” โดยจัดโซนทำอาหาร ล้างจาน และเตรียมวัตถุดิบให้เดินสะดวกตามลำดับงานจริง ไม่ต้องถอยหลังหรือเดินข้ามทางเดินหลัก

วัสดุที่เลือกใช้:
• ท็อปหิน engineered stone ทนความร้อนและรอยขีดข่วน
• ตู้บิวท์อินสีเทาเข้ม ผิว matte ลดรอยนิ้วมือ
• กระจก backsplash สะท้อนแสง ช่วยให้พื้นที่ดูโปร่ง

ระบบแสงสว่างแบ่งเป็น 3 ชั้น — ไฟทั่วไปในเพดาน ไฟใต้ตู้เพื่อเน้นพื้นผิวท็อป และไฟ accent ที่ชั้นวางของตกแต่ง ทำให้มุมทำอาหองดูมีมิติทั้งตอนกลางวันและมื้อค่ำ

การระบายอากาศใช้เครื่องดูดควันชนิดฝังในตู้บน ไม่บดบังเส้นสายตาแนวนอนของครัว ลูกค้าสามารถปรับแผงบังตกแต่งให้เข้ากับ moodboard โมเดิร์นได้

งบประมาณรวมอุปกรณ์และติดตั้งอยู่ที่ประมาณ 420,000 บาท (ยังไม่รวมเครื่องใช้ไฟฟ้า built-in รายการเสริม) — ทีมงานยินดีปรับสเปกตามพื้นที่จริงหลังสำรวจหน้างาน`;

function portraitDims() {
  return { w: 720, h: 960 };
}

function landscapeDims() {
  return { w: 1280, h: 720 };
}

function dimsForAspect(ratio: ImageAspectRatio) {
  switch (ratio) {
    case '3:4':
      return portraitDims();
    case '9:16':
      return { w: 720, h: 1280 };
    case '16:9':
      return landscapeDims();
    case '1:1':
      return { w: 800, h: 800 };
    case '4:3':
      return { w: 1200, h: 900 };
    default:
      return landscapeDims();
  }
}

function buildMixedSlideshowImages(
  roomId: string,
  photoOffset: number,
): { images: Room['images']; imageUrl: string; imageUrls: string[] } {
  const images = MIXED_SLIDE_ASPECTS.map((aspectRatio, slideIndex) => {
    const { w, h } = dimsForAspect(aspectRatio);
    const photoId =
      INTERIOR_PHOTOS[(photoOffset + slideIndex * 5) % INTERIOR_PHOTOS.length];
    const url = IMG(photoId, w, h);
    return {
      id: `img_${roomId}_${slideIndex}`,
      url,
      aspectRatio,
      hotspots: [],
    };
  });

  return {
    images,
    imageUrl: images[0].url,
    imageUrls: images.map((img) => img.url),
  };
}

function buildDemoRoom(
  page: DemoPageSpec,
  index: number,
  photoOffset: number,
): Room {
  const aspectRatio = ASPECT_PATTERN[index];
  const isPortrait = aspectRatio === '3:4' || aspectRatio === '9:16';
  const { w, h } = isPortrait ? portraitDims() : landscapeDims();
  const photoId = INTERIOR_PHOTOS[(photoOffset + index) % INTERIOR_PHOTOS.length];
  const id = `demo_${page.prefix}${index + 1}`;
  const name = page.names[index];
  const url = IMG(photoId, w, h);
  const keywords = KEYWORD_ROTATION[index % KEYWORD_ROTATION.length];
  const priceBase = 220 + index * 35 + (page.pageId === 'moderne' ? 80 : page.pageId === 'loft' ? 40 : 0);

  const isUrbanKitchen = page.pageId === 'moderne' && index === 1;
  const isMixedSlideshow = MIXED_SLIDESHOW_INDICES.has(index);
  const description = isUrbanKitchen
    ? LONG_DEMO_MO2_DESCRIPTION
    : isMixedSlideshow
      ? `${name} — สไลด์โชว์ 4 รูป (แนวตั้ง · แนวนอน · จัตุรัส · 9:16) กรอบการ์ดจะเปลี่ยนตามแต่ละรูป`
      : `${name} — ตัวอย่างดีไซน์${isPortrait ? 'แนวตั้ง' : 'แนวนอน'} สำหรับทดสอบการแสดงผลฟีด`;

  const mixedMedia = isMixedSlideshow
    ? buildMixedSlideshowImages(id, photoOffset + index * 7)
    : null;

  const room: Room = {
    id,
    name,
    description,
    price: `${priceBase.toLocaleString('en-US')},000 THB`,
    imageUrl: mixedMedia?.imageUrl ?? url,
    imageUrls: mixedMedia?.imageUrls ?? [url],
    pageId: page.pageId,
    keywords,
    images: mixedMedia?.images ?? [
      {
        id: `img_${id}_0`,
        url,
        aspectRatio,
        hotspots: [],
      },
    ],
  };

  if (index < 3) {
    room.featuredRank = (index + 1) as 1 | 2 | 3;
  }

  return room;
}

function buildDemoRooms(): Room[] {
  const rooms: Room[] = [];
  let photoOffset = 0;

  for (const page of DEMO_PAGES) {
    for (let i = 0; i < 10; i += 1) {
      rooms.push(buildDemoRoom(page, i, photoOffset));
    }
    photoOffset += 10;
  }

  return rooms;
}

export const DEMO_ROOMS: Room[] = buildDemoRooms();

/** จำนวนการ์ด mock ต่อเมนู (โมเดิร์น / ลอฟท์ / มินิมอล) */
export const DEMO_ROOMS_PER_PAGE = 10;

export const DEMO_STYLE_PAGE_IDS = ['moderne', 'loft', 'minimalist'] as const;

export const DEMO_HOME_SLIDES: HomeSlide[] = DEMO_ROOMS.filter((_, i) => i % 3 === 0)
  .slice(0, 12)
  .map((room) => ({
    id: `slide_${room.id}`,
    imageUrl: room.imageUrl,
    title: room.name,
    pageId: room.pageId,
  }));

export const DEMO_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'team_1',
    name: 'คุณสมชาย วิริยะ',
    role: 'สถาปนิกออกแบบ',
    imageUrl: IMG('photo-1560250097-0b93528c311a', 480, 480),
  },
  {
    id: 'team_2',
    name: 'คุณพิมพ์ใจ ดีไซน์',
    role: 'Interior Director',
    imageUrl: IMG('photo-1573496359142-b8d87734a5a2', 480, 480),
  },
  {
    id: 'team_3',
    name: 'คุณกฤติน สุขสม',
    role: 'Project Manager',
    imageUrl: IMG('photo-1472099645785-5658abf4ff4e', 480, 480),
  },
];
