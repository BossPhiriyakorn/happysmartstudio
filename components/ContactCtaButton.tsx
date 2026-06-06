'use client';

import { useMemo, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import ContactChannelPicker from '@/components/ContactChannelPicker';
import { useApp } from '@/components/AppContext';
import { CONTACT_CHANNEL_LABELS } from '@/lib/contactLabels';
import { getContactChannelOptions, openContactChannel } from '@/lib/contactChannels';

interface ContactCtaButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  children?: ReactNode;
}

export default function ContactCtaButton({
  label,
  children,
  onClick,
  disabled,
  ...props
}: ContactCtaButtonProps) {
  const { contactChannels, contactLabel } = useApp();
  const [pickerOpen, setPickerOpen] = useState(false);

  const options = useMemo(
    () => getContactChannelOptions(contactChannels, CONTACT_CHANNEL_LABELS),
    [contactChannels],
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (options.length === 0) return;
    if (options.length === 1) {
      openContactChannel(options[0]);
      return;
    }
    setPickerOpen(true);
  };

  return (
    <>
      <button
        type="button"
        disabled={disabled ?? options.length === 0}
        onClick={handleClick}
        {...props}
      >
        {children ?? label ?? contactLabel}
      </button>
      <ContactChannelPicker open={pickerOpen} onClose={() => setPickerOpen(false)} options={options} />
    </>
  );
}
