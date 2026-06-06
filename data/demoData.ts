import { HomeSlide, Room, TeamMember } from '@/types/content';

const IMG = (id: string, w = 800, h = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export const DEMO_ROOMS: Room[] = [
  {
    id: 'demo_m1',
    name: 'Minimalist Living',
    description: 'พื้นที่อยู่อาศัยเรียบง่าย เน้นแสงธรรมชาติ',
    price: '350,000 THB',
    imageUrl: IMG('photo-1600210492486-724fe5c67fb0'),
    imageUrls: [IMG('photo-1600210492486-724fe5c67fb0'), IMG('photo-1598928506311-c55ded91a20c')],
    pageId: 'minimalist',
    keywords: ['ห้องนั่งเล่น'],
  },
  {
    id: 'demo_m2',
    name: 'Zen Bedroom',
    description: 'ห้องนอนสงบ โทนขาว-ไม้อ่อน',
    price: '250,000 THB',
    imageUrl: IMG('photo-1598928506311-c55ded91a20c'),
    imageUrls: [IMG('photo-1598928506311-c55ded91a20c')],
    pageId: 'minimalist',
    keywords: ['ห้องนอน', 'นอน'],
  },
  {
    id: 'demo_mo1',
    name: 'Modern Lounge',
    description: 'พื้นที่พักผ่อนโมเดิร์น โทนดำ-ขาว',
    price: '500,000 THB',
    imageUrl: IMG('photo-1600607687920-4e2a09cf159d'),
    imageUrls: [IMG('photo-1600607687920-4e2a09cf159d'), IMG('photo-1579656592043-a20e25a4aa4b')],
    pageId: 'moderne',
    keywords: ['ห้องนั่งเล่น'],
    featuredRank: 1,
  },
  {
    id: 'demo_mo2',
    name: 'Urban Kitchen',
    description: `ครัวโอเพ่นแพลนท็อปหินและตู้บิวท์อิน — ออกแบบให้เชื่อมต่อกับพื้นที่นั่งเล่นและรับประทานอาหารอย่างต่อเนื่อง

แนวคิดหลักคือ “ครัวเป็นหัวใจของบ้าน” โดยจัดโซนทำอาหาร ล้างจาน และเตรียมวัตถุดิบให้เดินสะดวกตามลำดับงานจริง ไม่ต้องถอยหลังหรือเดินข้ามทางเดินหลัก

วัสดุที่เลือกใช้:
• ท็อปหิน engineered stone ทนความร้อนและรอยขีดข่วน
• ตู้บิวท์อินสีเทาเข้ม ผิว matte ลดรอยนิ้วมือ
• กระจก backsplash สะท้อนแสง ช่วยให้พื้นที่ดูโปร่ง

ระบบแสงสว่างแบ่งเป็น 3 ชั้น — ไฟทั่วไปในเพดาน ไฟใต้ตู้เพื่อเน้นพื้นผิวท็อป และไฟ accent ที่ชั้นวางของตกแต่ง ทำให้มุมทำอาหองดูมีมิติทั้งตอนกลางวันและมื้อค่ำ

การระบายอากาศใช้เครื่องดูดควันชนิดฝังในตู้บน ไม่บดบังเส้นสายตาแนวนอนของครัว ลูกค้าสามารถปรับแผงบังตกแต่งให้เข้ากับ moodboard โมเดิร์นได้

งบประมาณรวมอุปกรณ์และติดตั้งอยู่ที่ประมาณ 420,000 บาท (ยังไม่รวมเครื่องใช้ไฟฟ้า built-in รายการเสริม) — ทีมงานยินดีปรับสเปกตามพื้นที่จริงหลังสำรวจหน้างาน`,
    price: '420,000 THB',
    imageUrl: IMG('photo-1579656592043-a20e25a4aa4b'),
    imageUrls: [IMG('photo-1579656592043-a20e25a4aa4b')],
    pageId: 'moderne',
    keywords: ['ครัว'],
  },
  {
    id: 'demo_l1',
    name: 'Industrial Loft',
    description: 'ลอฟท์โทนอิฐและเหล็ก เปิดโล่งสูง',
    price: '380,000 THB',
    imageUrl: IMG('photo-1554995207-c18c203602cb'),
    imageUrls: [IMG('photo-1554995207-c18c203602cb'), IMG('photo-1497366216548-37526070297c')],
    pageId: 'loft',
    keywords: ['ห้องนั่งเล่น'],
  },
  {
    id: 'demo_l2',
    name: 'Creative Studio',
    description: 'สตูดิโอทำงานในโรงงานรีโนเวท',
    price: '290,000 THB',
    imageUrl: IMG('photo-1497366216548-37526070297c'),
    imageUrls: [IMG('photo-1497366216548-37526070297c')],
    pageId: 'loft',
    keywords: ['สำนักงาน'],
  },
];

export const DEMO_HOME_SLIDES: HomeSlide[] = DEMO_ROOMS.slice(0, 4).map((room) => ({
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
