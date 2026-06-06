import type { AppContextType } from '@/components/AppContext';
import type { Branding } from '@/lib/data/types';
import { normalizeContactChannels } from '@/lib/contactChannels';
import { buildNavLinks } from '@/lib/menu';
import type { ContactChannels, HomeSlide, StylePage } from '@/types/content';
import type { ActiveTab } from '@/components/EditSidebar';
import type { GeneralSelection } from '@/components/edit/GeneralSettingsHeader';
import type { MenuSelection } from '@/components/edit/MenuSettingsHeader';

export type PreviewPageId = 'home' | 'contact' | 'intro' | string;

export interface StylePagePatch {
  id: string;
  name?: string;
  description?: string;
}

/** Unsaved edit form values merged into live preview */
export interface EditPreviewDraft {
  branding?: Partial<Branding>;
  homeSlides?: HomeSlide[];
  stylePagePatch?: StylePagePatch;
  contactChannels?: ContactChannels;
  contactLabel?: string;
}

export function buildEditPreviewDraft(input: {
  brandForm: Branding;
  slidesForm: HomeSlide[];
  contactForm: { label: string; line: string; phone: string; email: string };
  activeStyleMenuId: string | null;
  pageSettingsForm: { name: string; description: string };
}): EditPreviewDraft {
  const draft: EditPreviewDraft = {
    branding: input.brandForm,
    homeSlides: input.slidesForm,
    contactChannels: {
      line: input.contactForm.line || undefined,
      phone: input.contactForm.phone || undefined,
      email: input.contactForm.email || undefined,
    },
    contactLabel: input.contactForm.label,
  };

  if (input.activeStyleMenuId) {
    draft.stylePagePatch = {
      id: input.activeStyleMenuId,
      name: input.pageSettingsForm.name,
      description: input.pageSettingsForm.description,
    };
  }

  return draft;
}

export function applyStylePagePatch(
  pages: StylePage[],
  patch: StylePagePatch | undefined,
): StylePage[] {
  if (!patch) return pages;
  return pages.map((p) =>
    p.id === patch.id
      ? {
          ...p,
          ...(patch.name !== undefined ? { name: patch.name } : {}),
          ...(patch.description !== undefined ? { description: patch.description } : {}),
        }
      : p,
  );
}

export function previewPathForPage(page: PreviewPageId): string {
  if (page === 'home' || page === 'intro') return '/';
  if (page === 'contact') return '/contact';
  return `/${page}`;
}

export function resolvePreviewPageFromEditContext(input: {
  activeTab: ActiveTab;
  menuSelection: MenuSelection;
  generalSelection: GeneralSelection;
  activeStyleMenuId: string | null;
  stylePages: StylePage[];
}): PreviewPageId {
  if (input.activeTab === 'general') {
    if (input.generalSelection === 'intro') return 'intro';
    if (input.generalSelection === 'channels' || input.generalSelection === 'address') {
      return 'contact';
    }
    return 'home';
  }

  if (input.activeTab === 'home-slides' || input.activeTab === 'keywords') {
    return 'home';
  }

  if (input.activeTab === 'menus') {
    if (input.menuSelection === 'contact') return 'contact';
    if (input.menuSelection === 'home' || input.menuSelection === 'team') return 'home';
    if (input.menuSelection === 'add-page') {
      return input.activeStyleMenuId ?? input.stylePages[0]?.id ?? 'home';
    }
    if (input.activeStyleMenuId) return input.activeStyleMenuId;
  }

  return 'home';
}

export function mergeAppContextWithPreviewDraft(
  base: AppContextType,
  draft: EditPreviewDraft | null,
): AppContextType {
  if (!draft) return base;

  const branding = { ...base.branding, ...draft.branding };
  const stylePages = applyStylePagePatch(base.stylePages, draft.stylePagePatch);
  const homeSlides = draft.homeSlides ?? base.homeSlides;
  const contactChannels = normalizeContactChannels(
    draft.contactChannels ?? base.contactChannels,
  );
  const contactLabel = draft.contactLabel ?? base.contactLabel;
  const menuLinks = buildNavLinks(stylePages, undefined, branding.homeLabel);

  return {
    ...base,
    branding,
    stylePages,
    homeSlides,
    contactChannels,
    contactLabel,
    menuLinks,
  };
}
