/** Inner top padding inside hero bands (main already clears the fixed header). */
export const PAGE_HERO_PADDING_TOP = 'pt-8 md:pt-10';

/** Max-width page shell — single source of horizontal gutters (home, style pages, contact). */
export const PAGE_SHELL = 'mx-auto w-full max-w-7xl px-6 lg:px-8';

/** Cancel shell gutters for full-bleed bands (hero, carousels, feed cards) inside PAGE_SHELL. */
export const PAGE_BLEED = '-mx-6 lg:-mx-8';

/** Re-apply shell gutters inside a bleeds-full-width band. */
export const PAGE_BLEED_INSET = 'px-6 lg:px-8';
