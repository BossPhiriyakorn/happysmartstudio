'use client';

import React from 'react';
import {
  EditPreviewDraftContext,
  PreviewPathnameContext,
} from '@/components/editPreviewContext';
import type { EditPreviewDraft, PreviewPageId } from '@/lib/editPreview';
import { previewPathForPage } from '@/lib/editPreview';

export function EditPreviewProvider({
  draft,
  previewPage,
  children,
}: {
  draft: EditPreviewDraft | null;
  previewPage: PreviewPageId;
  children: React.ReactNode;
}) {
  const previewPathname = draft ? previewPathForPage(previewPage) : null;

  return (
    <EditPreviewDraftContext.Provider value={draft}>
      <PreviewPathnameContext.Provider value={previewPathname}>
        {children}
      </PreviewPathnameContext.Provider>
    </EditPreviewDraftContext.Provider>
  );
}
