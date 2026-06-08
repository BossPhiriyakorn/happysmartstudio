'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import type { Branding } from '@/lib/data/types';
import { shouldBypassImageOptimizer } from '@/lib/imageDisplay';

type BrandIconProps = {
  branding: Pick<Branding, 'iconMode' | 'shortName' | 'logoUrl'>;
  variant?: 'header' | 'footer';
  floated?: boolean;
  compact?: boolean;
};

function useLogo(branding: BrandIconProps['branding']) {
  return branding.iconMode === 'logo' && branding.logoUrl.trim().length > 0;
}

export default function BrandIcon({
  branding,
  variant = 'header',
  floated = false,
  compact = false,
}: BrandIconProps) {
  const showLogo = useLogo(branding);

  if (variant === 'footer') {
    const frameClass = showLogo ? 'bg-black' : 'bg-white text-black';
    return (
      <div
        className={`w-10 h-10 flex items-center justify-center font-bold tracking-tighter text-xl leading-none pt-0.5 overflow-hidden shrink-0 ${frameClass}`}
      >
        {showLogo ? (
          <Image
            src={branding.logoUrl}
            alt={branding.shortName || 'Logo'}
            width={40}
            height={40}
            className="w-full h-full object-contain p-0.5"
            unoptimized={shouldBypassImageOptimizer(branding.logoUrl)}
          />
        ) : (
          branding.shortName
        )}
      </div>
    );
  }

  const sizeClass = floated ? 'w-8 h-8 sm:w-9 sm:h-9 text-base sm:text-lg' : 'w-8 h-8 text-lg';
  const frameClass = showLogo ? '' : 'bg-black text-white';

  return (
    <motion.div
      className={`flex items-center justify-center font-bold tracking-tighter leading-none shrink-0 overflow-hidden ${sizeClass} ${frameClass}`}
      animate={{ scale: compact ? 0.92 : 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
    >
      {showLogo ? (
        <Image
          src={branding.logoUrl}
          alt={branding.shortName || 'Logo'}
          width={36}
          height={36}
          className="w-full h-full object-contain p-0.5"
          unoptimized={shouldBypassImageOptimizer(branding.logoUrl)}
        />
      ) : (
        branding.shortName
      )}
    </motion.div>
  );
}
