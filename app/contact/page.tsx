'use client';

import { useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, MapPin, Phone, Mail, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { useApp } from '@/components/AppContext';
import ContactCtaButton from '@/components/ContactCtaButton';
import { CONTACT_CHANNEL_LABELS } from '@/lib/contactLabels';
import { getContactChannelOptions, openContactChannel } from '@/lib/contactChannels';
import { shouldBypassImageOptimizer } from '@/lib/imageDisplay';
import { PAGE_BLEED, PAGE_BLEED_INSET, PAGE_HERO_PADDING_TOP, PAGE_SHELL } from '@/lib/pageLayout';

const CHANNEL_ICONS = {
  line: MessageCircle,
  phone: Phone,
  email: Mail,
} as const;

export default function ContactPage() {
  const { teamMembers, contactChannels, branding, contactLabel } = useApp();

  const channels = useMemo(
    () => getContactChannelOptions(contactChannels, CONTACT_CHANNEL_LABELS),
    [contactChannels],
  );

  return (
    <div className={`flex flex-col bg-white min-h-screen pb-16 ${PAGE_SHELL}`}>
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`${PAGE_BLEED} ${PAGE_BLEED_INSET} ${PAGE_HERO_PADDING_TOP} pb-16 bg-black text-white`}
      >
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tighter mb-4 text-balance leading-none whitespace-pre-line">
          {branding.contactHeroTitle}
        </h1>
        <p className="text-gray-400 leading-relaxed text-base md:text-lg max-w-md">
          {branding.contactHeroDesc}
        </p>
      </motion.section>

      {teamMembers.length > 0 && (
        <section className="pt-12 pb-10 border-b border-gray-100 w-full">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-black mb-2">
              {branding.teamSectionTitle}
            </h2>
            <p className="text-gray-500 text-sm md:text-base mb-10 max-w-lg">{branding.teamSectionDescription}</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {teamMembers.map((member, index) => (
                <motion.article
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 + index * 0.06 }}
                  className="flex flex-col gap-3 group"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <Image
                      src={member.imageUrl}
                      alt={member.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      unoptimized={shouldBypassImageOptimizer(member.imageUrl)}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm md:text-base tracking-tight leading-tight">
                      {member.name}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-500 mt-0.5">{member.role}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      <section className="py-16 flex-1 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="max-w-xl"
        >
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-black mb-2">
            {branding.contactChannelsTitle}
          </h2>
          <p className="text-gray-500 text-sm md:text-base mb-10">{branding.contactChannelsDesc}</p>

          {channels.length > 0 ? (
            <div className="flex flex-col gap-4 mb-10">
              {channels.map((channel) => {
                const Icon = CHANNEL_ICONS[channel.key];
                return (
                  <button
                    key={channel.key}
                    type="button"
                    onClick={() => openContactChannel(channel)}
                    className="flex items-center gap-4 text-left w-full border border-gray-200 px-4 py-4 hover:border-black hover:bg-gray-50 transition-colors group"
                  >
                    <span className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Icon size={20} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">
                        {channel.label}
                      </span>
                      <span className="block text-base text-gray-800 break-all">{channel.value}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 mb-10">{branding.contactNoChannels}</p>
          )}

          <ContactCtaButton
            label={contactLabel}
            className="bg-black text-white py-4 px-8 font-medium tracking-wide flex items-center justify-center gap-2 group w-full hover:bg-neutral-800 transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {contactLabel}
            <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
          </ContactCtaButton>

          <div className="mt-14 pt-10 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
              {branding.contactHqLabel}
            </h3>
            <div className="flex items-start gap-4 text-base text-gray-600 mb-8">
              <MapPin size={24} className="text-black shrink-0 mt-0.5" />
              <span>
                {branding.hqAddressLine1}
                <br />
                {branding.hqAddressLine2}
              </span>
            </div>
            <div className="bg-gray-50 border border-gray-100 p-6 md:p-8">
              <h4 className="font-semibold text-lg tracking-tight mb-2">{branding.contactHoursTitle}</h4>
              <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">{branding.contactHoursDesc}</p>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
