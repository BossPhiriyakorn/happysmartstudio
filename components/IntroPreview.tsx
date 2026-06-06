'use client';

import { useApp } from '@/components/AppContext';

/** Static mock of the cinematic intro (no session lock / animation) */
export default function IntroPreview() {
  const { branding } = useApp();
  const brandName = branding.name || 'HappySmart Studio';

  return (
    <div className="relative min-h-[min(70vh,520px)] bg-black text-white flex flex-col items-center justify-center px-6 text-center">
      <p className="text-xs md:text-sm uppercase tracking-[0.35em] text-gray-400 mb-4">
        {branding.introKicker}
      </p>
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tighter">{brandName}</h1>
      <p className="mt-8 text-[11px] text-gray-500 uppercase tracking-widest max-w-sm">
        ตัวอย่างอินโทร — แสดงครั้งเดียวต่อ session บนเว็บจริง
      </p>
    </div>
  );
}
