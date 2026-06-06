'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useApp } from '@/components/AppContext';
import ContactCtaButton from '@/components/ContactCtaButton';

export default function Footer() {
  const { branding, contactLabel, menuLinks, t } = useApp();
  const year = new Date().getFullYear();

  const styleLinks = menuLinks.filter(
    (link) => link.pageId && link.href !== '/' && link.href !== '/contact'
  );

  return (
    <footer className="bg-black text-white px-6 py-16 flex-shrink-0 mt-auto">
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
          
          {/* Brand Panel */}
          <div>
            <div className="w-10 h-10 bg-white text-black flex items-center justify-center font-bold tracking-tighter text-xl leading-none pt-0.5 mb-6">
              {branding.shortName}
            </div>
            <h2 className="text-2xl font-semibold tracking-tight mb-3 whitespace-pre-line">
              {branding.footerTitle}
            </h2>
            <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
              {branding.footerDescription}
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs uppercase font-bold tracking-widest text-gray-500 mb-3">{t('footer.coreStyles')}</h3>
            {styleLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Contact Panel */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs uppercase font-bold tracking-widest text-gray-500 mb-3">{t('footer.getInTouch')}</h3>
            <ContactCtaButton className="flex items-center gap-2 group text-sm font-medium text-white hover:text-gray-300 transition-colors">
              {contactLabel} <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
            </ContactCtaButton>
          </div>
        </div>
        
        <div>
          <div className="h-px w-full bg-gray-800 my-4" />
          <div className="text-xs text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span>© {year} {branding.name} Architecture. {t('footer.copyright')}.</span>
            <span>{t('footer.tagline')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
