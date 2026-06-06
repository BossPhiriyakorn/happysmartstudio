'use client';

import { createContext, useContext } from 'react';
import type { EditPreviewDraft } from '@/lib/editPreview';

export const EditPreviewDraftContext = createContext<EditPreviewDraft | null>(null);
export const PreviewPathnameContext = createContext<string | null>(null);

export function usePreviewPathname(): string | null {
  return useContext(PreviewPathnameContext);
}
