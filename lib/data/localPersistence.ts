import { readStoredItem, STORAGE_KEYS } from '@/lib/storageKeys';

type StorageKey = keyof typeof STORAGE_KEYS;

/** Read one persisted JSON blob from localStorage (developer mode). */
export function readLocalJson(key: StorageKey): string | null {
  return readStoredItem(key);
}

export class LocalStorageQuotaError extends Error {
  constructor(key: StorageKey) {
    super(`localStorage quota exceeded for "${STORAGE_KEYS[key]}"`);
    this.name = 'LocalStorageQuotaError';
  }
}

/** Write one persisted blob to localStorage (developer mode). */
export function writeLocalJson(key: StorageKey, data: unknown): void {
  if (typeof window === 'undefined') return;
  const payload = typeof data === 'string' ? data : JSON.stringify(data);
  try {
    localStorage.setItem(STORAGE_KEYS[key], payload);
  } catch (error) {
    if (
      error instanceof DOMException &&
      (error.name === 'QuotaExceededError' || error.code === 22)
    ) {
      throw new LocalStorageQuotaError(key);
    }
    throw error;
  }
}
