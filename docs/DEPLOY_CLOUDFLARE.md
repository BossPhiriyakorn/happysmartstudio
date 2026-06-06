# Deploy บน Cloudflare (D1 + R2)

คู่มือสำหรับทีม deploy — เชื่อมต่อ production หลัง dev ใช้ `APP_MODE=developer` + localStorage

## สิ่งที่ repo เตรียมไว้แล้ว

| ส่วน | ไฟล์ | หมายเหตุ |
|------|------|----------|
| Schema D1 | `schema.sql` | รันครั้งเดียวต่อ database |
| Wrangler config | `wrangler.toml` | แก้ `database_id`, bucket name, `R2_PUBLIC_URL` |
| Site API | `app/api/site/route.ts` | GET/PUT snapshot |
| Upload API | `app/api/upload/route.ts` | POST รูป → R2 + `media_assets` |
| D1 store | `lib/server/siteStore/d1.ts` | เปิดด้วย `SITE_STORE=d1` |
| R2 helper | `lib/server/r2/upload.ts` | ใช้ binding `MEDIA` |
| Bindings | `lib/server/cloudflare/bindings.ts` | อ่าน `DB` / `MEDIA` จาก Worker |
| Env template | `.env.example` | ตัวแปร production |

## สถาปัตยกรรม

```
Browser (product mode)
  ├─ GET/PUT /api/site  → D1SiteStore → D1 binding DB
  └─ POST /api/upload   → uploadToR2   → R2 binding MEDIA + media_assets ใน D1

Developer mode (local)
  └─ localStorage + data URL (ไม่ใช้ API)
```

## ขั้นตอน deploy (checklist)

### 1. สร้าง resources บน Cloudflare

1. **D1** — สร้าง database ชื่อ `architecture-tmv-db` (หรือตาม `wrangler.toml`)
2. **R2** — สร้าง bucket `architecture-tmv-media`
3. เปิด **public access** หรือผูก **custom domain** สำหรับรูป → ได้ URL ฐาน เช่น `https://media.yourdomain.com`
4. จด **D1 database ID** จาก Dashboard

### 2. แก้ `wrangler.toml`

```toml
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # จาก Dashboard
R2_PUBLIC_URL = "https://media.yourdomain.com"         # URL จริง
```

Binding names **ห้ามเปลี่ยน** (โค้ดอ้างอิงชื่อนี้):

- `DB` → D1
- `MEDIA` → R2

### 3. Migrate schema

```bash
npm install
npm run d1:migrate:local    # ทดสอบ local D1
npm run d1:migrate:remote   # production D1
```

### 4. ติดตั้ง OpenNext สำหรับ Cloudflare (ทีม deploy)

โปรเจคใช้ Next.js standalone — production บน Workers ต้อง build ด้วย `@opennextjs/cloudflare`:

```bash
npm install @opennextjs/cloudflare wrangler --save-dev
```

จากนั้นตั้งค่า `open-next.config.ts` และ script `build:cf` / `deploy` ตามเอกสาร OpenNext (ขั้นนี้ทำครั้งเดียวตอน setup CI)

> Bindings อ่านผ่าน `getCloudflareContext()` ใน `lib/server/cloudflare/bindings.ts`

### 5. ตั้ง environment (production)

| ตัวแปร | ค่า | หมายเหตุ |
|--------|-----|----------|
| `APP_MODE` | `product` | เปิด API ฝั่ง server |
| `NEXT_PUBLIC_APP_MODE` | `product` | client เรียก API — **ต้อง rebuild** |
| `NEXT_PUBLIC_ENABLE_MOCK_DATA` | `false` | ไม่ seed demo |
| `SITE_STORE` | `d1` | ใช้ D1SiteStore |
| `SITE_ID` | `default` | ตรง `schema.sql` |
| `R2_BUCKET_NAME` | ชื่อ bucket | บันทึกใน `media_assets` |
| `R2_PUBLIC_URL` | URL สาธารณะรูป | ใช้ใน upload + Next Image |

ตั้งใน Cloudflare Dashboard **หรือ** `wrangler.toml` `[vars]` — อย่า commit secrets

### 6. Deploy และ smoke test

```bash
# หลังตั้ง OpenNext build
npm run build:cf   # (เพิ่ม script ตาม OpenNext)
npx wrangler deploy
```

ทดสอบ:

- `GET /api/site` → `{ snapshot: { ... } }`
- แก้เนื้อหาใน `/edit` → refresh → ข้อมูลยังอยู่ (D1)
- อัปโหลดรูป → URL ชี้ `R2_PUBLIC_URL/...` (ไม่ใช่ data URL)

## โหมดทดสอบ product บนเครื่อง (ไม่มี D1)

```env
APP_MODE=product
NEXT_PUBLIC_APP_MODE=product
SITE_STORE=memory
```

- `/api/site` ทำงาน แต่ข้อมูลอยู่ใน RAM (restart แล้วหาย)
- `/api/upload` จะ 503 จนกว่าจะมี R2 binding

## Troubleshooting

| อาการ | สาเหตุที่พบบ่อย |
|--------|------------------|
| `/api/site` 403 | ยังเป็น `APP_MODE=developer` |
| `/api/upload` 503 | ไม่มี binding `MEDIA` หรือ `R2_PUBLIC_URL` |
| ข้อมูลหายหลัง deploy | `SITE_STORE=memory` แทน `d1` |
| รูปไม่โหลดใน Next Image | ไม่ได้ตั้ง `R2_PUBLIC_URL` หรือ remotePatterns |
| D1 error binding | `database_id` ผิด หรือยังไม่ migrate schema |

## ไฟล์อ้างอิงสำหรับทีม dev ต่อ

- `lib/server/siteStore/d1Mapper.ts` — mapping snapshot ↔ SQL
- `lib/server/siteStore/types.ts` — interface `SiteStore`
- `lib/data/imageStorage.ts` — product mode อัปโหลดจาก crop UI
