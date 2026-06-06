'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { useApp } from '@/components/AppContext';
import { usePreviewPathname } from '@/components/editPreviewContext';
import ContactCtaButton from '@/components/ContactCtaButton';

/** island ลอย + margin บน — ใช้กับ sticky ด้านล่าง header ตอน scroll */
export const HEADER_ISLAND_OFFSET = '5.5rem';

/** ระยะบน <main> ให้เนื้อหาไม่ทับ fixed header (py-4/5 + แถวโลโก้) */
export const MAIN_HEADER_OFFSET_CLASS = 'pt-20 md:pt-[5.75rem]';

const ISLAND_MAX_WIDTH = 1280;
const SCROLL_THRESHOLD = 16;

function subscribeViewport(onChange: () => void) {
  window.addEventListener('resize', onChange, { passive: true });
  return () => window.removeEventListener('resize', onChange);
}

function getViewportWidth() {
  return window.innerWidth;
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const viewportWidth = useSyncExternalStore(
    subscribeViewport,
    getViewportWidth,
    () => ISLAND_MAX_WIDTH,
  );
  const pathname = usePathname();
  const previewPathname = usePreviewPathname();
  const inEditPreview = previewPathname != null;
  const effectivePathname = previewPathname ?? pathname;
  const { branding, menuLinks, contactLabel, t } = useApp();

  const blockPreviewNavigation = (e: React.MouseEvent) => {
    if (inEditPreview) e.preventDefault();
  };

  const closeMenu = () => setIsOpen(false);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const floated = scrolled;
  const compact = floated && !isOpen;
  const islandWidth = Math.min(ISLAND_MAX_WIDTH, viewportWidth - 16);
  const barMaxWidth = floated ? islandWidth : viewportWidth;
  const barRadius = floated ? (isOpen ? 28 : 9999) : 0;

  return (
    <div
      className="fixed inset-x-0 top-0 z-50 flex justify-center pointer-events-none transition-[padding] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
      style={{
        paddingTop: floated ? 12 : 0,
        paddingLeft: floated ? 8 : 0,
        paddingRight: floated ? 8 : 0,
      }}
    >
      <div
        className="pointer-events-auto w-full overflow-hidden backdrop-blur-xl transition-[max-width,border-radius,background-color,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{
          maxWidth: barMaxWidth,
          borderRadius: barRadius,
          backgroundColor: floated ? 'rgba(255,255,255,0.94)' : 'rgba(255,255,255,0.9)',
          boxShadow: floated
            ? '0 12px 40px -8px rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.04)'
            : 'none',
          borderTopWidth: floated ? 1 : 0,
          borderRightWidth: floated ? 1 : 0,
          borderBottomWidth: 1,
          borderLeftWidth: floated ? 1 : 0,
          borderStyle: 'solid',
          borderColor: 'rgba(0,0,0,0.06)',
        }}
      >
        <div
          className={`mx-auto w-full flex items-center justify-between gap-3 transition-[padding] duration-300 ease-out ${
            floated
              ? compact
                ? 'px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 max-w-7xl'
                : 'px-5 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-3 max-w-7xl'
              : 'max-w-7xl px-6 py-4 md:py-5 lg:px-8'
          }`}
        >
          <Link
            href="/"
            onClick={(e) => {
              blockPreviewNavigation(e);
              closeMenu();
            }}
            className="flex items-center gap-2 min-w-0"
          >
            <motion.div
              className={`bg-black text-white flex items-center justify-center font-bold tracking-tighter leading-none shrink-0 ${
                floated ? 'w-8 h-8 sm:w-9 sm:h-9 text-base sm:text-lg' : 'w-8 h-8 text-lg'
              }`}
              animate={{ scale: compact ? 0.92 : 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            >
              {branding.shortName}
            </motion.div>
            <span
              className={`font-semibold tracking-tight truncate transition-all duration-300 ease-out ${
                floated
                  ? compact
                    ? 'max-w-0 opacity-0 md:max-w-[16rem] md:opacity-100 md:text-xl'
                    : 'max-w-[10rem] sm:max-w-xs opacity-100 text-base sm:text-lg md:text-xl'
                  : 'max-w-none opacity-100 text-lg md:text-xl'
              }`}
            >
              {branding.name}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-5 lg:gap-8 font-medium ml-auto shrink-0">
            {menuLinks.map((link) => {
              const active = effectivePathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={blockPreviewNavigation}
                  className={`text-sm tracking-tight transition-colors hover:text-black whitespace-nowrap ${
                    active
                      ? floated
                        ? 'text-black font-semibold'
                        : 'text-black font-semibold border-b border-black pb-1 -mb-[3px]'
                      : 'text-gray-500'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <ContactCtaButton
              className={`bg-black text-white uppercase tracking-widest font-semibold hover:bg-neutral-800 transition-all duration-300 shrink-0 ${
                floated
                  ? 'text-[10px] lg:text-xs px-4 lg:px-5 py-2 lg:py-2.5 rounded-full'
                  : 'text-xs px-5 py-3'
              }`}
            >
              {contactLabel}
            </ContactCtaButton>
          </nav>

          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="md:hidden p-2 -mr-1 text-black hover:bg-black/5 rounded-full transition-colors active:scale-95 shrink-0"
            aria-label={t('header.toggleMenu')}
            aria-expanded={isOpen}
          >
            <motion.div initial={false} animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.div>
          </button>
        </div>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              className="md:hidden overflow-hidden border-t border-black/[0.06]"
            >
              <nav
                className={`flex flex-col ${
                  floated ? 'px-4 py-3 space-y-1' : 'px-6 py-4 space-y-4'
                }`}
              >
                {menuLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      href={link.href}
                      onClick={(e) => {
                        blockPreviewNavigation(e);
                        closeMenu();
                      }}
                      className={`block font-medium tracking-tight transition-colors ${
                        floated ? 'py-2.5 text-lg' : 'text-2xl'
                      } ${effectivePathname === link.href ? 'text-black' : 'text-gray-400 hover:text-black'}`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
                <div className={floated ? 'pt-3 pb-1' : 'pt-6 pb-2'}>
                  <ContactCtaButton
                    onClick={closeMenu}
                    className={`block w-full bg-black text-white text-center font-medium tracking-wide ${
                      floated ? 'py-3.5 rounded-full text-sm font-semibold' : 'py-4 rounded-none'
                    }`}
                  >
                    {contactLabel}
                  </ContactCtaButton>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
