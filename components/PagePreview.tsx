'use client';

import ContactPage from '@/app/contact/page';
import ClientHomePage from '@/components/ClientHomePage';
import Footer from '@/components/Footer';
import IntroPreview from '@/components/IntroPreview';
import { useApp } from '@/components/AppContext';
import StylePage from '@/components/StylePage';
import TeamShowcase from '@/components/TeamShowcase';
import type { PreviewPageId } from '@/lib/editPreview';

function PreviewChrome({ children, showTeam }: { children: React.ReactNode; showTeam?: boolean }) {
  return (
    <div className="flex flex-col min-h-0 bg-white">
      {children}
      {showTeam !== false && <TeamShowcase />}
      <Footer />
    </div>
  );
}

export default function PagePreview({ page }: { page: PreviewPageId }) {
  const { stylePages, rooms } = useApp();

  if (page === 'intro') {
    return (
      <PreviewChrome showTeam={false}>
        <IntroPreview />
      </PreviewChrome>
    );
  }

  if (page === 'home') {
    return (
      <PreviewChrome>
        <ClientHomePage />
      </PreviewChrome>
    );
  }

  if (page === 'contact') {
    return (
      <div className="flex flex-col min-h-0 bg-white">
        <ContactPage />
        <Footer />
      </div>
    );
  }

  const stylePage = stylePages.find((p) => p.id === page);
  if (!stylePage) {
    return (
      <p className="text-sm text-gray-500 p-8 text-center">
        ไม่พบหน้าเมนูนี้ — บันทึกหรือเลือกเมนูอื่น
      </p>
    );
  }

  return (
    <PreviewChrome>
      <StylePage
        title={stylePage.name}
        description={stylePage.description}
        pageId={stylePage.id}
        rooms={rooms.filter((r) => r.pageId === stylePage.id)}
      />
    </PreviewChrome>
  );
}
