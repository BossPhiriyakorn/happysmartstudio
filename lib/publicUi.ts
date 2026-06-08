/** ข้อความ UI สาธารณะคงที่ — เนื้อหาหลักอยู่ใน branding / DB */
export const publicUi = {
  "common": {
    "close": "ปิด",
    "styles": "สไตล์"
  },
  "contact": {
    "chooseChannel": "ช่องทางติดต่อ"
  },
  "header": {
    "toggleMenu": "เปิด/ปิดเมนู"
  },
  "footer": {
    "coreStyles": "สไตล์หลัก",
    "getInTouch": "ติดต่อเรา",
    "copyright": "สงวนลิขสิทธิ์",
    "tagline": "แพลตฟอร์มให้คำปรึกษาระดับพรีเมียม"
  },
  "home": {
    "studioBadge": "สตูดิโอ 2026",
    "dailyInspiration": "แรงบันดาลใจประจำวัน",
    "stylesCount": "15 สไตล์",
    "noDesigns": "ยังไม่มีดีไซน์ในหมวดนี้",
    "noSearchResults": "ไม่พบผลงานที่ตรงกับคำค้นหา",
    "searchPlaceholder": "ค้นหา เช่น ห้องนอน, ครัว...",
    "tags": {
      "all": "ทั้งหมด"
    }
  },
  "modal": {
    "estimatedValue": "มูลค่าโดยประมาณ",
    "conceptOverview": "ภาพรวมคอนเซ็ปต์",
    "consultNow": "ปรึกษาตอนนี้",
    "share": "แชร์",
    "shareCopied": "คัดลอกลิงก์แล้ว",
    "shareShared": "แชร์แล้ว",
    "shareFailed": "ไม่สามารถแชร์ได้"
  },
  "stylePage": {
    "curatedDesigns": "ดีไซน์คัดสรร",
    "spaces": "พื้นที่"
  }
} as const;

export function publicUiLabel(key: string): string {
  const parts = key.split('.');
  let value: unknown = publicUi;
  for (const part of parts) {
    value = (value as Record<string, unknown>)?.[part];
  }
  return typeof value === 'string' ? value : key;
}
