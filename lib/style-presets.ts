/**
 * Style presets — density/sizing/radius configurations.
 *
 * Inspired by shadcn/ui styles: Vega, Nova, Maia, Lyra, Mira.
 * Applied via CSS custom properties at runtime (not build-time code transform).
 */

export interface StylePreset {
  id: string;
  label: string;
  desc: string;
  vars: Record<string, string>;
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: "vega",
    label: "Vega",
    desc: "균형 잡힌 기본 — 일반 웹앱",
    vars: {
      "--ds-button-h-default": "2.25rem",   // 36px
      "--ds-button-h-sm": "2rem",           // 32px
      "--ds-button-h-lg": "2.5rem",         // 40px
      "--ds-button-h-xs": "1.5rem",         // 24px
      "--ds-input-h": "2.25rem",            // 36px
      "--ds-card-padding": "1.5rem",        // 24px
      "--ds-section-gap": "1rem",           // 16px
      "--ds-internal-gap": "0.5rem",        // 8px
      "--ds-button-radius": "var(--radius-md-prim)",
      "--ds-input-radius": "var(--radius-md-prim)",
      "--ds-card-radius": "var(--radius-xl-prim)",
      "--ds-dialog-radius": "var(--radius-xl-prim)",
      "--ds-base-font-size": "0.875rem",    // 14px
      "--ds-focus-ring-width": "3px",
    },
  },
  {
    id: "nova",
    label: "Nova",
    desc: "컴팩트 — 대시보드/어드민",
    vars: {
      "--ds-button-h-default": "2rem",      // 32px
      "--ds-button-h-sm": "1.75rem",        // 28px
      "--ds-button-h-lg": "2.25rem",        // 36px
      "--ds-button-h-xs": "1.5rem",         // 24px
      "--ds-input-h": "2rem",               // 32px
      "--ds-card-padding": "1rem",           // 16px
      "--ds-section-gap": "0.5rem",          // 8px
      "--ds-internal-gap": "0.375rem",       // 6px
      "--ds-button-radius": "var(--radius-lg-prim)",
      "--ds-input-radius": "var(--radius-lg-prim)",
      "--ds-card-radius": "var(--radius-xl-prim)",
      "--ds-dialog-radius": "var(--radius-xl-prim)",
      "--ds-base-font-size": "0.875rem",    // 14px
      "--ds-focus-ring-width": "3px",
    },
  },
  {
    id: "maia",
    label: "Maia",
    desc: "부드럽고 둥근 — 소비자 앱",
    vars: {
      "--ds-button-h-default": "2.25rem",   // 36px
      "--ds-button-h-sm": "2rem",           // 32px
      "--ds-button-h-lg": "2.5rem",         // 40px
      "--ds-button-h-xs": "1.5rem",         // 24px
      "--ds-input-h": "2.25rem",            // 36px
      "--ds-card-padding": "1.5rem",        // 24px
      "--ds-section-gap": "1.5rem",          // 24px
      "--ds-internal-gap": "0.5rem",         // 8px
      "--ds-button-radius": "9999px",
      "--ds-input-radius": "9999px",
      "--ds-card-radius": "1rem",            // 16px
      "--ds-dialog-radius": "9999px",
      "--ds-base-font-size": "0.875rem",    // 14px
      "--ds-focus-ring-width": "3px",
    },
  },
  {
    id: "lyra",
    label: "Lyra",
    desc: "각지고 샤프 — 개발자 도구",
    vars: {
      "--ds-button-h-default": "2rem",      // 32px
      "--ds-button-h-sm": "1.75rem",        // 28px
      "--ds-button-h-lg": "2.25rem",        // 36px
      "--ds-button-h-xs": "1.5rem",         // 24px
      "--ds-input-h": "2rem",               // 32px
      "--ds-card-padding": "1rem",           // 16px
      "--ds-section-gap": "1rem",            // 16px
      "--ds-internal-gap": "0.5rem",         // 8px
      "--ds-button-radius": "0",
      "--ds-input-radius": "0",
      "--ds-card-radius": "0",
      "--ds-dialog-radius": "0",
      "--ds-base-font-size": "0.75rem",     // 12px
      "--ds-focus-ring-width": "1px",
    },
  },
  {
    id: "mira",
    label: "Mira",
    desc: "초밀집 — 데이터 밀집 UI",
    vars: {
      "--ds-button-h-default": "1.75rem",   // 28px
      "--ds-button-h-sm": "1.5rem",         // 24px
      "--ds-button-h-lg": "2rem",           // 32px
      "--ds-button-h-xs": "1.25rem",        // 20px
      "--ds-input-h": "1.75rem",            // 28px
      "--ds-card-padding": "0.75rem",        // 12px
      "--ds-section-gap": "0.375rem",        // 6px
      "--ds-internal-gap": "0.25rem",        // 4px
      "--ds-button-radius": "var(--radius-md-prim)",
      "--ds-input-radius": "var(--radius-md-prim)",
      "--ds-card-radius": "var(--radius-lg-prim)",
      "--ds-dialog-radius": "var(--radius-xl-prim)",
      "--ds-base-font-size": "0.75rem",     // 12px
      "--ds-focus-ring-width": "2px",
    },
  },
];

/** Apply a style preset's CSS variables to the document */
export function applyStylePreset(presetId: string): void {
  const preset = STYLE_PRESETS.find((p) => p.id === presetId);
  if (!preset) return;
  for (const [key, value] of Object.entries(preset.vars)) {
    document.documentElement.style.setProperty(key, value);
  }
}

/** Get a preset by ID */
export function getStylePreset(id: string): StylePreset | undefined {
  return STYLE_PRESETS.find((p) => p.id === id);
}
