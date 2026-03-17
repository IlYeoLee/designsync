/**
 * Popular Google Fonts list for the typography picker.
 */
export const GOOGLE_FONTS: string[] = [
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Oswald',
  'Raleway',
  'PT Sans',
  'Merriweather',
  'Nunito',
  'Playfair Display',
  'Poppins',
  'Ubuntu',
  'Muli',
  'Rubik',
  'Source Sans Pro',
  'Inter',
  'Noto Sans',
  'Fira Sans',
  'Work Sans',
  'Quicksand',
  'DM Sans',
  'Outfit',
  'Space Grotesk',
  'Plus Jakarta Sans',
  'Sora',
  'Manrope',
  'IBM Plex Sans',
  'Lexend',
  'Cabin',
  'Josefin Sans',
  'Exo 2',
  'Karla',
  'Barlow',
  'Mulish',
  'Jost',
  'Figtree',
  'Be Vietnam Pro',
  'Libre Franklin',
  'Nanum Gothic',
  'Overpass',
  'Arimo',
  'Titillium Web',
  'Encode Sans',
  'Red Hat Display',
  'Albert Sans',
  'Bricolage Grotesque',
  'Geist',
  'Cal Sans',
  'Space Mono',
  'JetBrains Mono',
];

export function getGoogleFontUrl(fontFamily: string): string {
  const encoded = fontFamily.replace(/ /g, '+');
  return `https://fonts.googleapis.com/css2?family=${encoded}:wght@400;500;700&display=swap`;
}

export function injectGoogleFont(fontFamily: string): void {
  if (typeof document === 'undefined') return;
  const id = `gf-${fontFamily.replace(/ /g, '-').toLowerCase()}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = getGoogleFontUrl(fontFamily);
  document.head.appendChild(link);
}

/** Korean font CDN URLs (not available on standard Google Fonts API) */
export const KOREAN_FONT_URLS: Record<string, string> = {
  'Pretendard': 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css',
  'Noto Sans KR': 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap',
  'Nanum Gothic': 'https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700&display=swap',
};

/**
 * Get the CSS import URL for a font family.
 * Returns null for Geist (bundled via next/font).
 */
export function getFontImportUrl(fontFamily: string): string | null {
  if (fontFamily === 'Geist') return null;
  if (KOREAN_FONT_URLS[fontFamily]) return KOREAN_FONT_URLS[fontFamily];
  return getGoogleFontUrl(fontFamily);
}
