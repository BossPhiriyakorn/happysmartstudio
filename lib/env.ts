import { isDeveloperMode } from '@/lib/config/appMode';

/** เปิด mock/demo data เมื่อ true — ใช้ได้ใน developer mode เท่านั้น */
export const ENABLE_MOCK_DATA =
  isDeveloperMode() && process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true';

export function isEmptyStoredJson(raw: string | null): boolean {
  if (!raw) return true;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) && parsed.length === 0;
  } catch {
    return true;
  }
}
