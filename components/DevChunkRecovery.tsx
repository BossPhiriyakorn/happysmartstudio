'use client';

import { useEffect } from 'react';

const RELOAD_KEY = '__dev_chunk_reload';

function isChunkLoadFailure(reason: unknown): boolean {
  if (!reason) return false;
  if (typeof reason === 'string') {
    return reason.includes('ChunkLoadError') || reason.includes('Loading chunk');
  }
  const err = reason as { name?: string; message?: string };
  const message = err.message ?? '';
  return err.name === 'ChunkLoadError' || message.includes('Loading chunk');
}

/** Dev-only: auto-reload once when stale webpack chunks fail through tunnel/HMR. */
export default function DevChunkRecovery() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return undefined;

    const reloadOnce = () => {
      if (sessionStorage.getItem(RELOAD_KEY)) return;
      sessionStorage.setItem(RELOAD_KEY, '1');
      window.location.reload();
    };

    const onError = (event: ErrorEvent) => {
      if (isChunkLoadFailure(event.message)) reloadOnce();
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      if (isChunkLoadFailure(event.reason)) reloadOnce();
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);

    sessionStorage.removeItem(RELOAD_KEY);

    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  return null;
}
