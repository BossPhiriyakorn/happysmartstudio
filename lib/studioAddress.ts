import type { Branding } from '@/lib/data/types';

export type StudioAddress = {
  line1: string;
  line2: string;
  mapUrl: string;
};

export const STUDIO_ADDRESS_2_LABEL = 'ที่อยู่ 2';

export function hasStudioAddress(address: StudioAddress): boolean {
  return Boolean(address.line1.trim() || address.line2.trim());
}

export function primaryStudioAddress(branding: Branding): StudioAddress {
  return {
    line1: branding.hqAddressLine1,
    line2: branding.hqAddressLine2,
    mapUrl: branding.hqAddressMapUrl,
  };
}

export function secondaryStudioAddress(branding: Branding): StudioAddress {
  return {
    line1: branding.hqAddress2Line1,
    line2: branding.hqAddress2Line2,
    mapUrl: branding.hqAddress2MapUrl,
  };
}

export function normalizeMapUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
