'use client';

import { usePathname } from 'next/navigation';
import Header, { MAIN_HEADER_OFFSET_CLASS } from '@/components/Header';
import Footer from '@/components/Footer';
import TeamShowcase from '@/components/TeamShowcase';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import CinematicTransition from '@/components/CinematicTransition';

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isEditPage = pathname === '/edit' || pathname?.startsWith('/edit/');
  const isContactPage = pathname === '/contact';
  const showTeamShowcase = !isEditPage && !isContactPage;

  return (
    <>
      {!isEditPage && <AnalyticsTracker />}
      {!isEditPage && <CinematicTransition />}
      <div className="min-h-screen bg-white relative flex flex-col overflow-x-hidden">
        {!isEditPage && <Header />}
        <main
          className={`flex-1 shrink-0 flex flex-col relative z-0 ${!isEditPage ? MAIN_HEADER_OFFSET_CLASS : ''}`}
        >
          {children}
        </main>
        {showTeamShowcase && <TeamShowcase />}
        {!isEditPage && <Footer />}
      </div>
    </>
  );
}
