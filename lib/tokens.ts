/**
 * Token type definitions and default values for the DesignSync editor.
 */

export type ColorScale = Record<'50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900', string>;

export type TokenState = {
  primitives: {
    brand: ColorScale;
    neutral: ColorScale;
    error: ColorScale;
    success: ColorScale;
    warning: ColorScale;
    fontFamily: string;
    fontFamilyKo: string;
    fontSize: Record<'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl', string>;
    fontWeight: Record<'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold', string>;
    lineHeight: Record<'tight' | 'normal' | 'loose', string>;
    spacing: Record<'1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12' | '16', string>;
    radius: Record<'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full', string>;
    shadows: Record<'sm' | 'md' | 'lg', string>;
    iconLibrary: string;
    stylePreset: string;
  };
  semantic: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
};

export type HistoryEntry = {
  variable: string;
  from: string;
  to: string;
  timestamp: Date;
};

export const DEFAULT_TOKENS: TokenState = {
  primitives: {
    brand: {
      '50': 'oklch(0.97 0.02 250)',
      '100': 'oklch(0.93 0.05 250)',
      '200': 'oklch(0.87 0.09 250)',
      '300': 'oklch(0.78 0.13 250)',
      '400': 'oklch(0.68 0.17 250)',
      '500': 'oklch(0.58 0.20 250)',
      '600': 'oklch(0.48 0.22 250)',
      '700': 'oklch(0.39 0.20 250)',
      '800': 'oklch(0.30 0.16 250)',
      '900': 'oklch(0.22 0.12 250)',
    },
    neutral: {
      '50': 'oklch(0.99 0 0)',
      '100': 'oklch(0.97 0 0)',
      '200': 'oklch(0.93 0 0)',
      '300': 'oklch(0.87 0 0)',
      '400': 'oklch(0.72 0 0)',
      '500': 'oklch(0.57 0 0)',
      '600': 'oklch(0.45 0 0)',
      '700': 'oklch(0.33 0 0)',
      '800': 'oklch(0.22 0 0)',
      '900': 'oklch(0.13 0 0)',
    },
    error: {
      '50': 'oklch(0.97 0.03 25)',
      '100': 'oklch(0.93 0.06 25)',
      '200': 'oklch(0.87 0.10 25)',
      '300': 'oklch(0.78 0.15 25)',
      '400': 'oklch(0.68 0.20 25)',
      '500': 'oklch(0.58 0.24 25)',
      '600': 'oklch(0.53 0.245 27.325)',
      '700': 'oklch(0.44 0.22 25)',
      '800': 'oklch(0.34 0.17 25)',
      '900': 'oklch(0.24 0.12 25)',
    },
    success: {
      '50': 'oklch(0.97 0.03 145)',
      '100': 'oklch(0.93 0.06 145)',
      '200': 'oklch(0.85 0.10 145)',
      '300': 'oklch(0.75 0.14 145)',
      '400': 'oklch(0.65 0.17 145)',
      '500': 'oklch(0.55 0.19 145)',
      '600': 'oklch(0.48 0.18 145)',
      '700': 'oklch(0.38 0.15 145)',
      '800': 'oklch(0.28 0.11 145)',
      '900': 'oklch(0.20 0.08 145)',
    },
    warning: {
      '50': 'oklch(0.98 0.03 85)',
      '100': 'oklch(0.95 0.07 85)',
      '200': 'oklch(0.90 0.12 85)',
      '300': 'oklch(0.83 0.17 85)',
      '400': 'oklch(0.75 0.20 85)',
      '500': 'oklch(0.67 0.22 85)',
      '600': 'oklch(0.58 0.21 85)',
      '700': 'oklch(0.46 0.18 85)',
      '800': 'oklch(0.34 0.14 85)',
      '900': 'oklch(0.24 0.10 85)',
    },
    fontFamily: 'Geist',
    fontFamilyKo: '',
    fontSize: {
      'xs': '0.75rem',
      'sm': '0.875rem',
      'base': '1rem',
      'lg': '1.125rem',
      'xl': '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '3rem',
    },
    fontWeight: {
      'normal': '400',
      'medium': '500',
      'bold': '700',
    },
    lineHeight: {
      'tight': '1.25',
      'normal': '1.5',
      'loose': '1.75',
    },
    spacing: {
      '1': '0.25rem',
      '2': '0.5rem',
      '3': '0.75rem',
      '4': '1rem',
      '5': '1.25rem',
      '6': '1.5rem',
      '8': '2rem',
      '10': '2.5rem',
      '12': '3rem',
      '16': '4rem',
    },
    radius: {
      'none': '0',
      'sm': '0.25rem',
      'md': '0.375rem',
      'lg': '0.5rem',
      'xl': '0.75rem',
      'full': '9999px',
    },
    shadows: {
      sm: '0 1px 2px 0px oklch(0 0 0 / 0.05)',
      md: '0 4px 6px -1px oklch(0 0 0 / 0.10)',
      lg: '0 10px 15px -3px oklch(0 0 0 / 0.10)',
    },
    iconLibrary: 'lucide',
    stylePreset: 'vega',
  },
  semantic: {
    light: {
      'radius': 'var(--radius-md-prim)',
      'background': 'var(--neutral-50)',
      'foreground': 'var(--neutral-900)',
      'card': 'var(--neutral-50)',
      'card-foreground': 'var(--neutral-900)',
      'popover': 'var(--neutral-50)',
      'popover-foreground': 'var(--neutral-900)',
      'primary': 'var(--brand-600)',
      'primary-foreground': 'var(--neutral-50)',
      'secondary': 'var(--neutral-100)',
      'secondary-foreground': 'var(--neutral-900)',
      'muted': 'var(--neutral-100)',
      'muted-foreground': 'var(--neutral-500)',
      'accent': 'var(--brand-100)',
      'accent-foreground': 'var(--brand-900)',
      'destructive': 'var(--error-600)',
      'border': 'var(--neutral-200)',
      'input': 'var(--neutral-200)',
      'ring': 'var(--brand-400)',
    },
    dark: {
      'background': 'var(--neutral-900)',
      'foreground': 'var(--neutral-50)',
      'card': 'var(--neutral-800)',
      'card-foreground': 'var(--neutral-50)',
      'popover': 'var(--neutral-800)',
      'popover-foreground': 'var(--neutral-50)',
      'primary': 'var(--brand-400)',
      'primary-foreground': 'var(--neutral-900)',
      'secondary': 'var(--neutral-800)',
      'secondary-foreground': 'var(--neutral-50)',
      'muted': 'var(--neutral-800)',
      'muted-foreground': 'var(--neutral-400)',
      'accent': 'var(--brand-900)',
      'accent-foreground': 'var(--brand-100)',
      'destructive': 'var(--error-400)',
      'border': 'var(--neutral-700)',
      'input': 'var(--neutral-700)',
      'ring': 'var(--brand-500)',
    },
  },
};

/** Apply all tokens to the document CSS variables */
export function applyTokensToDocument(tokens: TokenState): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // Apply primitive color scales
  const colorScales: Array<[keyof typeof tokens.primitives, string]> = [
    ['brand', 'brand'],
    ['neutral', 'neutral'],
    ['error', 'error'],
    ['success', 'success'],
    ['warning', 'warning'],
  ];

  for (const [key, prefix] of colorScales) {
    const scale = tokens.primitives[key] as ColorScale;
    for (const [step, value] of Object.entries(scale)) {
      root.style.setProperty(`--${prefix}-${step}`, value);
    }
  }

  // Apply typography
  for (const [key, value] of Object.entries(tokens.primitives.fontSize)) {
    root.style.setProperty(`--font-size-${key}`, value);
  }
  for (const [key, value] of Object.entries(tokens.primitives.fontWeight)) {
    root.style.setProperty(`--font-weight-${key}`, value);
  }
  for (const [key, value] of Object.entries(tokens.primitives.lineHeight)) {
    root.style.setProperty(`--line-height-${key}`, value);
  }

  // Apply spacing
  for (const [key, value] of Object.entries(tokens.primitives.spacing)) {
    root.style.setProperty(`--spacing-${key}`, value);
  }

  // Apply radius
  const radiusMap: Record<string, string> = {
    'none': '--radius-none',
    'sm': '--radius-sm-prim',
    'md': '--radius-md-prim',
    'lg': '--radius-lg-prim',
    'xl': '--radius-xl-prim',
    'full': '--radius-full',
  };
  for (const [key, varName] of Object.entries(radiusMap)) {
    root.style.setProperty(varName, tokens.primitives.radius[key as keyof typeof tokens.primitives.radius]);
  }

  // Apply shadows
  root.style.setProperty('--ds-shadow-sm', tokens.primitives.shadows.sm);
  root.style.setProperty('--ds-shadow-md', tokens.primitives.shadows.md);
  root.style.setProperty('--ds-shadow-lg', tokens.primitives.shadows.lg);

  // Apply font family
  // 기본: 영문 폰트 먼저 (영문 자 → 영문 폰트, 한글 자 → 한글 폰트 fallback)
  // lang="ko" 오버라이드: 한글 폰트 먼저 → 혼합 문장도 한글 폰트로 통일
  const fontEn = tokens.primitives.fontFamily;
  const fontKo = tokens.primitives.fontFamilyKo;
  let fontStack = '';
  let fontStackKo = '';
  if (fontKo && fontEn && fontEn !== 'Geist') {
    fontStack = `'${fontEn}', '${fontKo}', sans-serif`;
    fontStackKo = `'${fontKo}', '${fontEn}', sans-serif`;
  } else if (fontKo) {
    fontStack = `'${fontKo}', sans-serif`;
    fontStackKo = fontStack;
  } else if (fontEn && fontEn !== 'Geist') {
    fontStack = `'${fontEn}', sans-serif`;
    fontStackKo = fontStack;
  }
  if (fontStack) {
    root.style.setProperty('--font-sans', fontStack);
    document.body.style.fontFamily = fontStack;
  }

  // Inject :lang(ko) override style tag (한글 문서/번역 시 자동 전환)
  const styleId = 'ds-font-lang-override';
  let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
  if (fontStackKo && fontStackKo !== fontStack) {
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `:root:lang(ko) { --font-sans: ${fontStackKo}; font-family: ${fontStackKo}; }`;
  } else if (styleEl) {
    styleEl.remove();
  }

  // 기존 --custom-font-family도 유지
  root.style.setProperty('--custom-font-family', fontEn || 'Geist');
}
