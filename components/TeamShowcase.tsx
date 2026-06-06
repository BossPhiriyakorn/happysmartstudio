'use client';

import { useSyncExternalStore } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { DEMO_TEAM_MEMBERS } from '@/data/demoData';
import { useApp } from '@/components/AppContext';
import { ENABLE_MOCK_DATA } from '@/lib/env';
import { shouldBypassImageOptimizer } from '@/lib/imageDisplay';
import { PAGE_BLEED, PAGE_SHELL } from '@/lib/pageLayout';

/** มากกว่านี้จึงเลื่อนอัตโนมัติ — ไม่ถึงให้แสดงคงที่ */
const SLIDE_THRESHOLD = 5;
const MOBILE_SLIDE_THRESHOLD = 2;
const MOBILE_BREAKPOINT = 768;

const CARD_WIDTH = 'w-40 sm:w-44 md:w-48';

function subscribeViewport(onChange: () => void) {
  window.addEventListener('resize', onChange, { passive: true });
  return () => window.removeEventListener('resize', onChange);
}

function getViewportWidth() {
  return window.innerWidth;
}

function TeamCard({
  name,
  role,
  imageUrl,
  variant = 'slide',
}: {
  name: string;
  role: string;
  imageUrl: string;
  variant?: 'slide' | 'grid';
}) {
  const widthClass = variant === 'slide' ? CARD_WIDTH : 'w-full';
  return (
    <article className={`flex flex-col gap-3 ${variant === 'slide' ? 'shrink-0' : ''}`}>
      <div className={`relative aspect-square overflow-hidden bg-gray-100 ${widthClass}`}>
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes={variant === 'slide' ? '(max-width: 640px) 40vw, 12rem' : '(max-width: 640px) 50vw, 20vw'}
          className="object-cover"
          unoptimized={shouldBypassImageOptimizer(imageUrl)}
          referrerPolicy="no-referrer"
        />
      </div>
      <div className={widthClass}>
        <h3 className="font-semibold text-sm tracking-tight leading-tight">{name}</h3>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{role}</p>
      </div>
    </article>
  );
}

export default function TeamShowcase() {
  const { teamMembers, branding } = useApp();
  const viewportWidth = useSyncExternalStore(
    subscribeViewport,
    getViewportWidth,
    () => MOBILE_BREAKPOINT,
  );

  const members =
    teamMembers.length > 0 ? teamMembers : ENABLE_MOCK_DATA ? DEMO_TEAM_MEMBERS : [];

  if (members.length === 0) return null;

  const isMobileView = viewportWidth < MOBILE_BREAKPOINT;
  const shouldSlide = isMobileView
    ? members.length > MOBILE_SLIDE_THRESHOLD
    : members.length > SLIDE_THRESHOLD;
  const slideItems = shouldSlide ? [...members, ...members] : members;

  const gridCols =
    members.length === 1
      ? 'grid-cols-1 max-w-xs'
      : members.length === 2
        ? 'grid-cols-2 max-w-md'
        : members.length === 3
          ? 'grid-cols-2 sm:grid-cols-3 max-w-2xl'
          : members.length === 4
            ? 'grid-cols-2 sm:grid-cols-4 max-w-3xl'
            : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 max-w-5xl';

  return (
    <section id="team" className={`pt-12 pb-10 border-t border-gray-100 bg-white ${PAGE_SHELL}`}>
      <div className="w-full">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-black mb-1">
          {branding.teamSectionTitle}
        </h2>
        <p className="text-gray-500 text-sm md:text-base mb-8 max-w-lg">{branding.teamSectionDescription}</p>

        {shouldSlide ? (
          <div className={`${PAGE_BLEED} overflow-hidden relative py-2`}>
            <motion.div
              className="flex gap-6 md:gap-8 px-6 lg:px-8 w-max"
              animate={{ x: [0, 'calc(-50% - 12px)'] }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: 'loop',
                  duration: Math.max(18, members.length * 4),
                  ease: 'linear',
                },
              }}
            >
              {slideItems.map((member, idx) => (
                <TeamCard
                  key={`${member.id}-${idx}`}
                  name={member.name}
                  role={member.role}
                  imageUrl={member.imageUrl}
                />
              ))}
            </motion.div>
          </div>
        ) : (
          <div className={`grid gap-6 md:gap-8 mx-auto ${gridCols}`}>
            {members.map((member) => (
              <TeamCard
                key={member.id}
                name={member.name}
                role={member.role}
                imageUrl={member.imageUrl}
                variant="grid"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
