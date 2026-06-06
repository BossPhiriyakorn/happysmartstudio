const STORAGE_KEY = 'site_edit_activity_log';
const MAX_ENTRIES = 80;

export interface EditActivityEntry {
  id: string;
  at: string;
  action: string;
  detail?: string;
}

function readRaw(): EditActivityEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as EditActivityEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function loadEditActivityLog(): EditActivityEntry[] {
  return readRaw().sort((a, b) => (a.at < b.at ? 1 : -1));
}

export function appendEditActivity(action: string, detail?: string): void {
  if (typeof window === 'undefined') return;
  const entry: EditActivityEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    at: new Date().toISOString(),
    action,
    detail,
  };
  const next = [entry, ...readRaw()].slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // quota — drop oldest half and retry once
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, Math.floor(MAX_ENTRIES / 2))));
    } catch {
      /* ignore */
    }
  }
}

export function formatActivityTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('th-TH', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}
