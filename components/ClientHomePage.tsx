'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { useApp } from './AppContext';
import DesignFeed from './DesignFeed';
import { PAGE_BLEED, PAGE_BLEED_INSET, PAGE_HERO_PADDING_TOP, PAGE_SHELL } from '@/lib/pageLayout';

export default function ClientHomePage() {
  const { branding } = useApp();

  return (
    <div className={`flex flex-col w-full pb-10 ${PAGE_SHELL}`}>
      {/* Hero Header */}
      <section
        className={`${PAGE_BLEED} ${PAGE_BLEED_INSET} ${PAGE_HERO_PADDING_TOP} pb-10 mb-10 bg-black text-white flex flex-col items-start`}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex flex-col gap-4 max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 text-xs font-semibold uppercase tracking-widest text-white w-max">
            <span className="w-1.5 h-1.5 rounded-full bg-white block" />
            {branding.studioBadge}
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tighter leading-[1.05] text-white text-balance whitespace-pre-line">
            {branding.heroTitle}
          </h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed animate-fade">
            {branding.heroDescription}
          </p>
        </motion.div>
      </section>

      {/* Random Daily Inspiration Feed */}
      <DesignFeed />

    </div>
  );
}
