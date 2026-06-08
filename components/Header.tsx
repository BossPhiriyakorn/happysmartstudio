'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { useApp } from '@/components/AppContext';
import { usePreviewPathname } from '@/components/editPreviewContext';
import ContactCtaButton from '@/components/ContactCtaButton';
import BrandIcon from '@/components/BrandIcon';

/** island ลอย + margin บน — ใช้กับ sticky ด้านล่าง header ตอน scroll */
export const HEADER_ISLAND_OFFSET = '5.5rem';

/** ระยะบน <main> ให้เนื้อหาไม่ทับ fixed header (py-4/5 + แถวโลโก้) */
export const MAIN_HEADER_OFFSET_CLASS = 'pt-20 md:pt-[5.75rem]';

const ISLAND_MAX_WIDTH = 1280;
const SCROLL_THRESHOLD_ON = 20;
const SCROLL_THRESHOLD_OFF = 6;
/** Scroll distance (px) for contact CTA square → pill morph on desktop */
const CONTACT_MORPH_PX = 88;
const CONTACT_RADIUS_MAX = 22;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

/** Smooth ease for scroll → morph target (no hard linear steps) */
function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

function contactMorphFromScroll(y: number) {
  return smoothstep(clamp01(y / CONTACT_MORPH_PX));
}

function subscribeViewport(onChange: () => void) {
  window.addEventListener('resize', onChange, { passive: true });
  return () => window.removeEventListener('resize', onChange);
}

function getViewportWidth() {
  return window.innerWidth;
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  /** Mobile menu panel still animating closed — keep card corners until exit finishes */
  const [menuSheetMounted, setMenuSheetMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const contactMorphTarget = useMotionValue(contactMorphFromScroll(0));
  const contactMorph = useSpring(contactMorphTarget, {
    stiffness: 55,
    damping: 14,
    mass: 0.95,
    restDelta: 0.0008,
  });
  const contactBorderRadius = useTransform(contactMorph, (v) => v * CONTACT_RADIUS_MAX);
  const contactPaddingY = useTransform(contactMorph, (v) => 12 - v * 2);
  const contactPaddingX = useTransform(contactMorph, (v) => 20 - v * 4);
  const contactFontSize = useTransform(contactMorph, (v) => `${0.75 - v * 0.125}rem`);
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
    const onScroll = () => {
      const y = window.scrollY;
      contactMorphTarget.set(contactMorphFromScroll(y));
      setScrolled((prev) => {
        if (!prev && y > SCROLL_THRESHOLD_ON) return true;
        if (prev && y < SCROLL_THRESHOLD_OFF) return false;
        return prev;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [contactMorphTarget]);

  useEffect(() => {
    if (isOpen) setMenuSheetMounted(true);
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const floated = scrolled;
  const compact = floated && !isOpen;
  const contactBtnMotionStyle = {
    borderRadius: contactBorderRadius,
    paddingTop: contactPaddingY,
    paddingBottom: contactPaddingY,
    paddingLeft: contactPaddingX,
    paddingRight: contactPaddingX,
    fontSize: contactFontSize,
  };
  const islandWidth = Math.min(ISLAND_MAX_WIDTH, viewportWidth - 16);
  const barMaxWidth = floated ? islandWidth : viewportWidth;
  const isMobile = viewportWidth < 768;
  const mobileMenuCard = isMobile && floated && (isOpen || menuSheetMounted);
  const barRadius = !floated ? 0 : mobileMenuCard ? 16 : 9999;
  /** Snap radius on mobile island — avoid pill↔card morph through a circle */
  const barTransition =
    isMobile && floated
      ? 'max-width,background-color,box-shadow,border-color'
      : 'max-width,border-radius,background-color,box-shadow,border-color';

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
        className="pointer-events-auto w-full overflow-hidden backdrop-blur-xl duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{
          maxWidth: barMaxWidth,
          borderRadius: barRadius,
          transitionProperty: barTransition,
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
            <BrandIcon
              branding={branding}
              variant="header"
              floated={floated}
              compact={compact}
            />
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
              style={contactBtnMotionStyle}
              className="bg-black text-white uppercase tracking-widest font-semibold hover:bg-neutral-800 shrink-0 inline-flex items-center justify-center lg:text-xs"
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

        <AnimatePresence initial={false} onExitComplete={() => setMenuSheetMounted(false)}>
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
                    className={`block w-full bg-black text-white text-center font-medium tracking-wide transition-[border-radius,padding,font-size,background-color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                      floated ? 'py-3.5 rounded-lg text-sm font-semibold' : 'py-4 rounded-none'
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
