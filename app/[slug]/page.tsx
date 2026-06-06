'use client';

import { useParams, notFound } from 'next/navigation';
import StylePage from '@/components/StylePage';
import { useApp } from '@/components/AppContext';
import { RESERVED_SLUGS } from '@/types/content';

export default function DynamicStyleRoutePage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const { stylePages, rooms } = useApp();

  if (!slug || RESERVED_SLUGS.has(slug)) notFound();

  const page = stylePages.find((p) => p.id === slug);
  if (!page) notFound();

  const pageRooms = rooms.filter((r) => r.pageId === page.id);

  return (
    <StylePage
      title={page.name}
      description={page.description}
      pageId={page.id}
      rooms={pageRooms}
    />
  );
}
