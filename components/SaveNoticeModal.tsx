'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, Check, Loader2 } from 'lucide-react';

const AUTO_DISMISS_MS = 8000;

export type SaveNoticeStatus = 'syncing' | 'success' | 'error';

interface SaveNoticeModalProps {
  open: boolean;
  status: SaveNoticeStatus;
  message: string;
  detail?: string;
  confirmLabel: string;
  onClose: () => void;
}

export default function SaveNoticeModal({
  open,
  status,
  message,
  detail,
  confirmLabel,
  onClose,
}: SaveNoticeModalProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open || status === 'syncing') {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setTimeout(() => {
      onClose();
      timerRef.current = null;
    }, AUTO_DISMISS_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [open, status, onClose]);

  if (typeof document === 'undefined') return null;

  const icon =
    status === 'syncing' ? (
      <Loader2 size={24} className="text-gray-600 animate-spin" />
    ) : status === 'error' ? (
      <AlertCircle size={24} className="text-red-600" />
    ) : (
      <Check size={24} className="text-green-600" />
    );

  const iconBg =
    status === 'syncing'
      ? 'bg-gray-100'
      : status === 'error'
        ? 'bg-red-50'
        : 'bg-green-50';

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[250] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="save-notice-title"
        >
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            aria-label="Close"
            onClick={status === 'syncing' ? undefined : onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            className="relative z-10 bg-white w-full max-w-sm shadow-2xl border border-gray-200 p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center ${iconBg}`}>
              {icon}
            </div>
            <h2 id="save-notice-title" className="text-base font-semibold text-black mb-2">
              {message}
            </h2>
            {detail && <p className="text-xs text-gray-500 mb-4 leading-relaxed">{detail}</p>}
            {status !== 'syncing' && (
              <>
                <p className="text-xs text-gray-400 mb-6">ปิดอัตโนมัติใน 8 วินาที หากไม่กดปุ่ม</p>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full bg-black text-white py-3 text-xs font-semibold uppercase tracking-widest hover:bg-neutral-800 transition-colors"
                >
                  {confirmLabel}
                </button>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
