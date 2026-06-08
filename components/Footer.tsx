'use client';

import { useMemo } from 'react';
import { useApp } from '@/components/AppContext';
import { CONTACT_CHANNEL_LABELS } from '@/lib/contactLabels';
import { getContactChannelOptions } from '@/lib/contactChannels';
import BrandIcon from '@/components/BrandIcon';
import StudioAddressEntry from '@/components/StudioAddressEntry';
import {
  hasStudioAddress,
  primaryStudioAddress,
  secondaryStudioAddress,
  STUDIO_ADDRESS_2_LABEL,
} from '@/lib/studioAddress';

export default function Footer() {
  const { branding, contactChannels, t } = useApp();
  const year = new Date().getFullYear();

  const channels = useMemo(
    () => getContactChannelOptions(contactChannels, CONTACT_CHANNEL_LABELS),
    [contactChannels],
  );

  const primaryAddress = primaryStudioAddress(branding);
  const secondaryAddress = secondaryStudioAddress(branding);
  const showPrimary = hasStudioAddress(primaryAddress);
  const showSecondary = branding.hqAddress2Enabled && hasStudioAddress(secondaryAddress);

  return (
    <footer className="bg-black text-white px-5 py-10 md:px-6 md:py-16 flex-shrink-0 mt-auto">
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-8 md:gap-12">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-8 md:gap-10 items-start">
          
          {/* Brand Panel — full width on mobile, first column on desktop */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4 md:mb-6 min-w-0">
              <BrandIcon branding={branding} variant="footer" />
              <span className="font-semibold tracking-tight text-base md:text-lg truncate">{branding.name}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight mb-2 md:mb-3 whitespace-pre-line">
              {branding.footerTitle}
            </h2>
            <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
              {branding.footerDescription}
            </p>
          </div>

          {/* Studio address */}
          <div className="flex flex-col gap-3 md:gap-4">
            <h3 className="text-[10px] md:text-xs uppercase font-bold tracking-widest text-gray-500 mb-0 md:mb-1">
              {branding.contactHqLabel}
            </h3>
            {showPrimary ? (
              <StudioAddressEntry address={primaryAddress} />
            ) : (
              <p className="text-sm text-gray-500">—</p>
            )}
            {showSecondary && (
              <div className="flex flex-col gap-1.5 pt-1 border-t border-gray-800/80">
                <p className="text-[10px] md:text-xs uppercase font-bold tracking-widest text-gray-500">
                  {STUDIO_ADDRESS_2_LABEL}
                </p>
                <StudioAddressEntry address={secondaryAddress} />
              </div>
            )}
          </div>

          {/* Contact Panel */}
          <div className="flex flex-col gap-2 md:gap-3">
            <h3 className="text-[10px] md:text-xs uppercase font-bold tracking-widest text-gray-500 mb-1 md:mb-3">
              {t('footer.getInTouch')}
            </h3>
            {channels.length > 0 ? (
              channels.map((channel) => (
                <a
                  key={channel.key}
                  href={channel.href}
                  {...(channel.key === 'line'
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                  className="group flex flex-col gap-0.5"
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    {channel.label}
                  </span>
                  <span className="text-gray-400 group-hover:text-white transition-colors text-xs md:text-sm font-medium break-all leading-snug">
                    {channel.value}
                  </span>
                </a>
              ))
            ) : (
              <p className="text-sm text-gray-500">{branding.contactNoChannels}</p>
            )}
          </div>
        </div>
        
        <div>
          <div className="h-px w-full bg-gray-800 my-2 md:my-4" />
          <div className="text-[11px] md:text-xs text-gray-500 flex flex-col sm:flex-row justify-center sm:justify-between items-center text-center sm:text-left gap-2 sm:gap-4">
            <span>© {year} {branding.name} Architecture. {t('footer.copyright')}.</span>
            <span>{t('footer.tagline')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
