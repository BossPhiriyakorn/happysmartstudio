'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, MessageCircle, Phone, X } from 'lucide-react';
import type { ContactChannelOption } from '@/lib/contactChannels';
import { openContactChannel } from '@/lib/contactChannels';
import { useApp } from '@/components/AppContext';

const ICONS = {
  line: MessageCircle,
  phone: Phone,
  email: Mail,
} as const;

interface ContactChannelPickerProps {
  open: boolean;
  onClose: () => void;
  options: ContactChannelOption[];
}

export default function ContactChannelPicker({ open, onClose, options }: ContactChannelPickerProps) {
  const { t } = useApp();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const pick = (option: ContactChannelOption) => {
    openContactChannel(option);
    onClose();
  };

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 sm:p-6">
          <motion.button
            type="button"
            aria-label={t('common.close')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-picker-title"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            className="relative z-10 w-full max-w-sm bg-white border border-gray-200 shadow-2xl overflow-hidden rounded-sm sm:rounded-md"
          >
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
              <h2
                id="contact-picker-title"
                className="font-semibold tracking-tight text-black text-base leading-snug"
              >
                {t('contact.chooseChannel')}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-2 -mr-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
                aria-label={t('common.close')}
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-3 flex flex-col gap-2 max-h-[min(70dvh,420px)] overflow-y-auto">
              {options.map((option) => {
                const Icon = ICONS[option.key];
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => pick(option)}
                    className="flex items-center gap-4 w-full text-left px-4 py-4 border border-gray-200 hover:border-black hover:bg-gray-50 transition-colors group"
                  >
                    <span className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Icon size={20} />
                    </span>
                    <span className="min-w-0 flex flex-col justify-center gap-0.5">
                      <span className="block text-xs font-bold uppercase tracking-widest text-gray-400 leading-none">
                        {option.label}
                      </span>
                      <span className="block text-base text-gray-800 break-all leading-snug">
                        {option.value}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
