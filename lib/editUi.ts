/** ข้อความ UI หน้าแก้ไข (/edit) — ไม่เก็บใน DB */
export const editUi = {
  "common": {
    "all": "ทั้งหมด",
    "save": "บันทึก",
    "cancel": "ยกเลิก",
    "edit": "แก้ไข",
    "delete": "ลบ",
    "add": "เพิ่ม",
    "close": "ปิด",
    "confirm": "ยืนยัน",
    "styles": "สไตล์"
  },
  "edit": {
    "controlCenter": "ศูนย์ควบคุม",
    "title": "ตัวปรับแต่งไดนามิก",
    "subtitle": "แก้ไขทุกส่วนของเว็บไซต์ได้ทันที การเปลี่ยนแปลงจะบันทึกในเบราว์เซอร์ของคุณ",
    "resetDefaults": "รีเซ็ตค่าเริ่มต้น",
    "showPreview": "แสดงตัวอย่าง",
    "backToEdit": "กลับไปแก้ไข",
    "livePreview": "ตัวอย่างสด",
    "previewDraftHint": "แสดงการแก้ไขที่ยังไม่กดบันทึก — สลับหน้าได้ด้านล่าง",
    "previewGoToEditing": "ไปหน้าที่กำลังแก้",
    "group": {
      "settings": "ตั้งค่าเว็บ",
      "home": "หน้าแรก",
      "menus": "เมนู",
      "keywords": "แท็ก",
      "general": "ตั้งค่าทั่วไป",
      "analytics": "Analytics"
    },
    "analytics": {
      "title": "สถิติการเข้าชม",
      "desc": "ดูยอดเข้าชมเว็บ หน้ายอดนิยม และการ์ดที่ถูกเปิดดูมากที่สุด",
      "refresh": "รีเฟรช",
      "hint": "รวมข้อมูลจากเบราว์เซอร์นี้และเซิร์ฟเวอร์ — ยังไม่รวมทุกอุปกรณ์จนกว่าจะเชื่อมฐานข้อมูล",
      "totalPageViews": "เข้าชมหน้า",
      "totalCardViews": "เปิดการ์ด",
      "topPages": "หน้ายอดนิยม",
      "topCards": "การ์ดยอดนิยมต่อหน้า",
      "emptyPages": "ยังไม่มีข้อมูลการเข้าชมหน้า",
      "emptyCards": "ยังไม่มีข้อมูลการเปิดการ์ด"
    },
    "general": {
      "title": "ตั้งค่าทั่วไป",
      "desc": "แบรนด์ ส่วนกลางของเว็บ ช่องทางติดต่อ และบันทึกการแก้ไข",
      "brand": "แบรนด์",
      "footer": "Footer",
      "address": "ที่อยู่สตูดิโอ",
      "saveBrand": "บันทึกแบรนด์",
      "saveFooter": "บันทึก Footer",
      "saveAddress": "บันทึกที่อยู่",
      "intro": "อินโทรเปิดเว็บ",
      "channels": "ช่องทางติดต่อ",
      "audit": "บันทึกการแก้ไข",
      "introKicker": "ข้อความบรรทัดบน (คำบรรยาย)",
      "introSynced": "หัวข้อใหญ่ในอินโทรมาจากชื่อสตูดิโอ",
      "saveIntro": "บันทึกอินโทร",
      "saveChannels": "บันทึกช่องทางติดต่อ",
      "auditEmpty": "ยังไม่มีบันทึก — จะแสดงเมื่อมีการบันทึกจากหน้านี้",
      "auditHint": "เก็บในเบราว์เซอร์ชั่วคราว — เมื่อเชื่อม D1 จะดึงจาก content_audit_log"
    },
    "menu": {
      "title": "จัดการเมนู & หน้า",
      "desc": "เลือกเมนูจากรายการ — ตั้งชื่อเมนูและการ์ดในหน้าเดียวกัน",
      "targetHome": "หน้าแรก",
      "saveHomePage": "บันทึกหน้าแรก",
      "targetContact": "เมนูติดต่อ & หน้าติดต่อ",
      "targetTeam": "ทีมงาน",
      "targetStyle": "{name}",
      "homeLabel": "ชื่อเมนูหน้าแรก",
      "homeHint": "แสดงในแถบนำทาง — ลิงก์ไปหน้าแรก",
      "contactLabel": "ข้อความปุ่มติดต่อ",
      "contactHint": "แสดงบนปุ่มใน header/footer — เปิด popup เลือกช่องทางติดต่อ",
      "saveContact": "บันทึกเมนูติดต่อ"
    },
    "tab": {
      "homeSlides": "สไลด์",
      "cards": "การ์ดผลงาน",
      "pageSettings": "ตั้งค่าหน้า",
      "manageKeywords": "เพิ่มแท็ก",
      "addPage": "เพิ่มเมนู"
    },
    "saveNotice": {
      "message": "ดำเนินการบันทึกเรียบร้อย",
      "confirm": "ตกลง",
      "syncing": "กำลังบันทึก…",
      "localOk": "บันทึกในเครื่องแล้ว",
      "localDetail": "ข้อมูลอยู่ในเบราว์เซอร์ของคุณ — โหมดพัฒนา",
      "serverOk": "ซิงค์กับเซิร์ฟเวอร์แล้ว",
      "serverError": "ซิงค์ไม่สำเร็จ",
      "serverErrorDetail": "บันทึกในเบราว์เซอร์แล้ว แต่ส่งขึ้นเซิร์ฟเวอร์ไม่ได้ — ลองใหม่อีกครั้ง"
    },
    "toast": {
      "brandingSaved": "บันทึกการตั้งค่าแบรนด์แล้ว",
      "contactSaved": "บันทึกช่องทางติดต่อแล้ว",
      "pageAdded": "เพิ่มเมนูใหม่แล้ว",
      "pageSaved": "บันทึกการตั้งค่าหน้าแล้ว",
      "keywordAdded": "เพิ่มแท็กแล้ว",
      "keywordSaved": "บันทึกแท็กแล้ว",
      "keywordDeleted": "ลบแท็กแล้ว",
      "teamMemberAdded": "เพิ่มสมาชิกทีมแล้ว",
      "teamMemberSaved": "บันทึกข้อมูลทีมแล้ว",
      "teamMemberDeleted": "ลบสมาชิกทีมแล้ว",
      "cardUpdated": "อัปเดตการ์ดแล้ว",
      "cardCreated": "สร้างการ์ดใหม่แล้ว",
      "slidesSaved": "บันทึกสไลด์หน้าแรกแล้ว",
      "resetDone": "รีเซ็ตข้อมูลเป็นค่าเริ่มต้นแล้ว"
    },
    "branding": {
      "title": "แบรนด์ & หน้าแรก",
      "desc": "ชื่อสตูดิโอ Hero หน้าแรก และ Footer",
      "firmName": "ชื่อสตูดิโอ",
      "logoShort": "ตัวย่อโลโก้",
      "introSection": "อินโทรเปิดเว็บ",
      "introSectionDesc": "ข้อความแอนิเมชันตอนเปิดเว็บ (แสดงครั้งเดียวต่อ session)",
      "introKicker": "ข้อความบรรทัดบน (คำบรรยาย)",
      "introTitleSynced": "หัวข้อใหญ่ (ซิงค์) มาจากชื่อสตูดิโอ:",
      "heroSection": "Hero หน้าแรก",
      "heroTitle": "หัวข้อ Hero (ใช้ \\n ขึ้นบรรทัดใหม่)",
      "heroDesc": "คำอธิบาย Hero",
      "studioBadge": "ป้ายสตูดิโอ (เช่น สตูดิโอ 2026)",
      "feedSection": "ส่วนฟีด & แท็ก",
      "feedSectionTitle": "หัวข้อฟีด / แท็ก",
      "teamSection": "ส่วนทีมงาน",
      "teamSectionDesc": "หัวข้อและคำอธิบายด้านบนส่วนทีม (แสดงก่อน Footer และหน้าติดต่อ)",
      "teamSectionTitle": "หัวข้อส่วนทีมงาน",
      "teamSectionDescription": "คำอธิบายส่วนทีม",
      "footerSection": "Footer",
      "footerTitle": "หัวข้อ Footer (ใช้ \\n ขึ้นบรรทัดใหม่)",
      "footerDesc": "คำอธิบาย Footer",
      "save": "บันทึกการตั้งค่าแบรนด์"
    },
    "pageSettings": {
      "title": "ตั้งค่าหน้า",
      "desc": "แก้ไขชื่อเมนูและคำอธิบายหน้า (แสดงใน Header และ Hero)",
      "menuName": "ชื่อเมนู",
      "description": "คำอธิบายหน้า"
    },
    "team": {
      "title": "ทีมงาน",
      "desc": "แสดงบนหน้าติดต่อ — รูป ชื่อ และตำแหน่งของสมาชิกทีม",
      "addMember": "เพิ่มสมาชิก",
      "nameLabel": "ชื่อ",
      "namePlaceholder": "เช่น สมชาย ใจดี",
      "roleLabel": "ตำแหน่ง",
      "rolePlaceholder": "เช่น สถาปนิกอาวุโส",
      "uploadPhoto": "อัปโหลดรูป",
      "changePhoto": "เปลี่ยนรูป",
      "empty": "ยังไม่มีสมาชิกทีม — เพิ่มรายชื่อด้านบน",
      "deleteConfirm": "ลบ \"{name}\" ออกจากทีม?",
      "validation": "กรุณากรอกชื่อและอัปโหลดรูป"
    },
    "contactSettings": {
      "title": "ติดต่อ & ปุ่ม CTA",
      "desc": "ตั้งค่าช่องทางติดต่อและปุ่มใน header, footer และหน้าติดต่อ",
      "buttonLabel": "ข้อความปุ่มติดต่อ",
      "lineLabel": "Line",
      "linePlaceholder": "https://line.me/... หรือ @username",
      "phoneLabel": "โทรศัพท์",
      "phonePlaceholder": "02-123-4567",
      "phoneHint": "ใส่เบอร์ตามปกติ ไม่เกิน 10 หลัก — ระบบทำให้กดโทรได้อัตโนมัติ",
      "emailLabel": "อีเมล",
      "emailPlaceholder": "hello@example.com",
      "previewTitle": "ตัวอย่างปุ่ม",
      "previewHint": "ปุ่มนี้แสดงบน header/footer — กดแล้วเปิด popup เลือกช่องทางติดต่อ",
      "noChannels": "ยังไม่ได้ตั้งค่าช่องทาง",
      "save": "บันทึกการตั้งค่าติดต่อ"
    },
    "addPage": {
      "title": "เพิ่มเมนูใหม่",
      "desc": "สร้างหน้าใหม่โครงสร้างเหมือนโมเดิร์น/ลอฟท์/มินิมอล — แก้ไขการ์ดได้ใน sidebar"
    },
    "keywords": {
      "title": "จัดการแท็ก",
      "desc": "แท็กใช้กรองและค้นหาผลงาน — แสดงบนการ์ดและใช้ในช่องค้นหา",
      "addKeyword": "เพิ่มแท็ก",
      "nameLabel": "ชื่อแท็ก",
      "namePlaceholder": "เช่น ห้องนอน, ครัว, ห้องนั่งเล่น",
      "usage": "ใช้งานใน",
      "empty": "ยังไม่มีแท็ก — เพิ่มแท็กแรกด้านบน",
      "cardHint": "เลือกแท็กได้จากหน้าแก้ไขการ์ดผลงานในแต่ละเมนู",
      "deleteConfirm": "ลบแท็ก \"{name}\"?"
    },
    "homeSlides": {
      "title": "สไลด์รูปภาพหน้าแรก",
      "desc": "หัวข้อส่วนฟีดและตัวอย่างสไลด์ — ระบบสุ่มจากการ์ดผลงานทุกเมนู สูงสุด 10 ใบ ชุดเดียวกันตลอดวัน",
      "feedTitleSection": "หัวข้อส่วนฟีด",
      "feedTitleHint": "หัวข้อเหนือแถบสไลด์/การ์ดบนหน้าแรก",
      "addSlide": "เพิ่มสไลด์",
      "slideTitle": "ชื่อสไลด์",
      "uploadImage": "อัปโหลดรูปสไลด์",
      "sizeGuideTitle": "คำแนะนำขนาดรูป",
      "cropExplain": "สไลด์ทุกใบใช้ขนาดเดียวกัน (4:3) — ส่วนในกรอบ crop คือส่วนที่แสดงบนหน้าแรก",
      "previewFrameLabel": "พื้นที่แสดงผลบนหน้าแรก",
      "cropHint": "ลากมุมกรอบเพื่อเลือกส่วนที่ต้องการแสดง"
    },
    "cards": {
      "title": "จัดการการ์ดผลงาน",
      "desc": "เพิ่ม แก้ไข หรือลบการ์ดพื้นที่และราคา",
      "addCard": "เพิ่มการ์ด",
      "page": "หน้า",
      "keywords": "แท็ก",
      "keywordsHint": "เลือกแท็กที่สร้างไว้ — จะแสดงบนการ์ดและใช้ค้นหาได้",
      "keywordsEmpty": "เพิ่มแท็กจากเมนู «แท็ก» ใน sidebar ก่อน",
      "images": "รูปภาพ",
      "spaceName": "ชื่อพื้นที่",
      "priceLabel": "ราคา",
      "descriptionLabel": "คำอธิบาย",
      "createTitle": "เพิ่มการ์ดใหม่",
      "editTitle": "แก้ไขการ์ด",
      "validation": "กรุณากรอกชื่อและอัปโหลดรูปภาพอย่างน้อย 1 รูป",
      "priceFallback": "ติดต่อสอบถามราคา"
    },
    "image": {
      "upload": "อัปโหลดรูป",
      "uploadHint": "รองรับ JPG, PNG, WebP, GIF, AVIF, HEIC และรูปแบบอื่นๆ (สูงสุด 20MB) · บันทึกเป็น WebP",
      "cropTitle": "ครอบตัดรูปภาพ",
      "applyCrop": "ใช้รูปนี้",
      "cover": "ภาพหลัก",
      "setCover": "ตั้งเป็นภาพหลัก",
      "fileTooLarge": "ไฟล์ใหญ่เกิน 20MB",
      "largeWarning": "ไฟล์ใหญ่กว่า 500KB อาจทำให้ localStorage เต็มได้",
      "invalidType": "รูปแบบไฟล์ไม่รองรับ — ใช้ไฟล์รูปภาพทั่วไป (ไม่รวม SVG)",
      "svgNotSupported": "ไม่รองรับ SVG — ใช้ JPG, PNG, WebP หรือรูปแบบอื่น",
      "loadFailed": "เปิดไฟล์รูปไม่ได้ — ลองบันทึกเป็น JPG/PNG หรือใช้ไฟล์ที่เล็กลง",
      "uploadFailed": "อัปโหลดรูปไม่สำเร็จ — ตรวจสอบการเชื่อม R2 หรือลองใหม่"
    },
    "hotspot": {
      "title": "ปักจุดสินค้าในภาพ",
      "edit": "ปักจุด",
      "clickToPin": "คลิกบนรูปเพื่อปักจุดใหม่",
      "selectOrClick": "เลือกจุดจากรายการ หรือคลิกบนรูป",
      "name": "ชื่อสินค้า / เฟอร์นิเจอร์",
      "namePlaceholder": "เช่น KUNGSFORS",
      "price": "ราคา",
      "description": "รายละเอียด",
      "remove": "ลบจุดนี้",
      "list": "รายการจุด",
      "unnamed": "ยังไม่ตั้งชื่อ"
    }
  }
} as const;

export function editUiLabel(key: string): string {
  const parts = key.split('.');
  let value: unknown = editUi;
  for (const part of parts) {
    value = (value as Record<string, unknown>)?.[part];
  }
  return typeof value === 'string' ? value : key;
}
