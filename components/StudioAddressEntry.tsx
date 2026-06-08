import { hasStudioAddress, normalizeMapUrl, type StudioAddress } from '@/lib/studioAddress';

type StudioAddressEntryProps = {
  address: StudioAddress;
  className?: string;
  linkClassName?: string;
};

export default function StudioAddressEntry({
  address,
  className = 'text-gray-400 text-xs md:text-sm not-italic leading-relaxed',
  linkClassName = 'hover:text-white transition-colors',
}: StudioAddressEntryProps) {
  if (!hasStudioAddress(address)) return null;

  const mapUrl = normalizeMapUrl(address.mapUrl);
  const body = (
    <>
      {address.line1}
      {address.line2.trim() ? (
        <>
          <br />
          {address.line2}
        </>
      ) : null}
    </>
  );

  if (mapUrl) {
    return (
      <a
        href={mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${className} ${linkClassName} block`}
      >
        {body}
      </a>
    );
  }

  return <address className={className}>{body}</address>;
}
