'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { useApp } from '@/components/AppContext';

export type RevealDirection = 'up' | 'right' | 'left';

const ROUTE_DIRECTIONS: RevealDirection[] = ['right', 'left'];

function pickIntroDirection(): RevealDirection {
  return 'up';
}

function pickRouteDirection(): RevealDirection {
  return ROUTE_DIRECTIONS[Math.floor(Math.random() * ROUTE_DIRECTIONS.length)];
}
const INTRO_HOLD_MS = 2400;
const INTRO_TOTAL_MS = 4200;
const ROUTE_TOTAL_MS = 580;
const LOCK_FAILSAFE_MS = 8000;

type OverlayState = {
  mode: 'intro' | 'route';
  reveal: boolean;
  direction: RevealDirection;
};

declare global {
  interface Window {
    __cinematicLockFailsafe?: number;
  }
}

function releaseIntroLock() {
  document.documentElement.classList.remove('cinematic-lock');
  if (typeof window !== 'undefined' && window.__cinematicLockFailsafe) {
    window.clearTimeout(window.__cinematicLockFailsafe);
    window.__cinematicLockFailsafe = undefined;
  }
}

function isPublicPage(pathname: string) {
  return pathname !== '/edit';
}

export default function CinematicTransition() {
  const pathname = usePathname();
  const { branding } = useApp();
  const [overlay, setOverlay] = useState<OverlayState | null>(null);

  const prevPathRef = useRef<string | null>(null);
  const introStartedRef = useRef(false);

  useLayoutEffect(() => {
    if (!isPublicPage(pathname)) {
      releaseIntroLock();
      return undefined;
    }

    const failsafe = window.setTimeout(releaseIntroLock, LOCK_FAILSAFE_MS);

    return () => {
      window.clearTimeout(failsafe);
    };
  }, [pathname]);

  // Intro — ครั้งเดียวต่อ full page load (ไม่ผูก pathname ไม่งั้นเปลี่ยนหน้าแล้วเล่น up ซ้ำ)
  useLayoutEffect(() => {
    if (!isPublicPage(pathname)) {
      releaseIntroLock();
      return undefined;
    }
    if (introStartedRef.current) return undefined;

    introStartedRef.current = true;
    let cancelled = false;
    const direction = pickIntroDirection();

    setOverlay({ mode: 'intro', reveal: false, direction });

    const revealTimer = window.setTimeout(() => {
      if (cancelled) return;
      releaseIntroLock();
      setOverlay({ mode: 'intro', reveal: true, direction });
    }, INTRO_HOLD_MS);

    const hideTimer = window.setTimeout(() => {
      if (cancelled) return;
      setOverlay(null);
      releaseIntroLock();
    }, INTRO_TOTAL_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(revealTimer);
      window.clearTimeout(hideTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intro once per load only
  }, []);

  // Route change — เฉพาะหน้า public → public
  useEffect(() => {
    if (!isPublicPage(pathname)) {
      prevPathRef.current = pathname;
      return undefined;
    }

    if (prevPathRef.current === null) {
      prevPathRef.current = pathname;
      return undefined;
    }
    if (prevPathRef.current === pathname) return undefined;

    prevPathRef.current = pathname;
    let cancelled = false;
    const direction = pickRouteDirection();

    setOverlay({ mode: 'route', reveal: false, direction });

    const openTimer = window.setTimeout(() => {
      if (!cancelled) setOverlay({ mode: 'route', reveal: true, direction });
    }, 50);

    const hideTimer = window.setTimeout(() => {
      if (!cancelled) setOverlay(null);
    }, ROUTE_TOTAL_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(openTimer);
      window.clearTimeout(hideTimer);
    };
  }, [pathname]);

  useEffect(() => {
    if (!overlay) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [overlay]);

  useEffect(() => {
    if (!isPublicPage(pathname)) {
      setOverlay(null);
      releaseIntroLock();
    }
  }, [pathname]);

  useEffect(() => () => releaseIntroLock(), []);

  if (!isPublicPage(pathname) || !overlay) return null;

  const brandName = branding.name || 'HappySmart Studio';
  const isIntro = overlay.mode === 'intro';
  const reveal = overlay.reveal;
  const { direction } = overlay;

  return createPortal(
    <div
      className={`cinematic-overlay dir-${direction} ${reveal ? 'is-revealing' : ''} ${isIntro ? 'is-intro' : 'is-route'}`}
      aria-hidden
    >
      {isIntro && (
        <div className={`cinematic-brand-wrap ${reveal ? 'is-fading-out' : 'is-visible'}`}>
          <p className="cinematic-brand-kicker">{branding.introKicker}</p>
          <h1 className="cinematic-brand">{brandName}</h1>
        </div>
      )}

      <div className="cinematic-curtain cinematic-curtain-full" />
    </div>,
    document.body,
  );
}
