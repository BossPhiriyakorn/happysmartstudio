'use client';

export function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-gray-200 bg-gray-50/40">
      <div className="border-b border-gray-200 bg-white px-4 py-3 sm:px-5">
        <h3 className="text-sm font-bold tracking-tight text-black">{title}</h3>
        {description && <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{description}</p>}
      </div>
      <div className="p-4 sm:p-5 space-y-5">{children}</div>
    </section>
  );
}

export function Field({
  label,
  hint,
  children,
  className = '',
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">{label}</label>
      <p className="text-[10px] text-gray-400 -mt-0.5 min-h-[1.25rem] leading-snug">{hint ?? '\u00a0'}</p>
      {children}
    </div>
  );
}

export const inputClass =
  'border border-gray-200 bg-white focus:border-black p-3 text-sm focus:outline-none transition-colors w-full';
export const textareaClass = `${inputClass} font-sans resize-y min-h-[88px]`;
