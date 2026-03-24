/**
 * Style presets — density/sizing/radius configurations.
 *
 * Inspired by shadcn/ui styles: Vega, Nova, Maia, Lyra, Mira.
 * Applied via CSS custom properties at runtime (not build-time code transform).
 *
 * Variable categories:
 * --ds-button-radius  → Button, Badge, Toggle (pill OK in Maia)
 * --ds-element-radius → Menubar, Sidebar items, Skeleton, Tabs, Header nav, Calendar, Tooltip, Item, ToggleGroup
 * --ds-input-radius   → Input, Textarea, Select, Command, InputOTP, InputGroup, NativeSelect
 * --ds-card-radius    → Card, Alert, Popover, HoverCard, Dropdown, ContextMenu, Empty, Chart tooltip, Sonner, DataTable
 * --ds-dialog-radius  → Dialog, AlertDialog, Drawer
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
      "--ds-button-h-default": "2.25rem",
      "--ds-button-h-sm": "2rem",
      "--ds-button-h-lg": "2.5rem",
      "--ds-button-h-xs": "1.5rem",
      "--ds-input-h": "2.25rem",
      "--ds-card-padding": "1.5rem",
      "--ds-section-gap": "1rem",
      "--ds-internal-gap": "0.5rem",
      "--ds-button-radius": "var(--radius-md-prim)",
      "--ds-element-radius": "var(--radius-md-prim)",
      "--ds-input-radius": "var(--radius-md-prim)",
      "--ds-card-radius": "var(--radius-xl-prim)",
      "--ds-dialog-radius": "var(--radius-xl-prim)",
      "--ds-base-font-size": "0.875rem",
      "--ds-focus-ring-width": "3px",
    },
  },
  {
    id: "nova",
    label: "Nova",
    desc: "컴팩트 — 대시보드/어드민",
    vars: {
      "--ds-button-h-default": "2rem",
      "--ds-button-h-sm": "1.75rem",
      "--ds-button-h-lg": "2.25rem",
      "--ds-button-h-xs": "1.5rem",
      "--ds-input-h": "2rem",
      "--ds-card-padding": "1rem",
      "--ds-section-gap": "0.5rem",
      "--ds-internal-gap": "0.375rem",
      "--ds-button-radius": "var(--radius-lg-prim)",
      "--ds-element-radius": "var(--radius-lg-prim)",
      "--ds-input-radius": "var(--radius-lg-prim)",
      "--ds-card-radius": "var(--radius-xl-prim)",
      "--ds-dialog-radius": "var(--radius-xl-prim)",
      "--ds-base-font-size": "0.875rem",
      "--ds-focus-ring-width": "3px",
    },
  },
  {
    id: "maia",
    label: "Maia",
    desc: "부드럽고 둥근 — 소비자 앱",
    vars: {
      "--ds-button-h-default": "2.25rem",
      "--ds-button-h-sm": "2rem",
      "--ds-button-h-lg": "2.5rem",
      "--ds-button-h-xs": "1.5rem",
      "--ds-input-h": "2.25rem",
      "--ds-card-padding": "1.5rem",
      "--ds-section-gap": "1.5rem",
      "--ds-internal-gap": "0.5rem",
      "--ds-button-radius": "9999px",        // pill — buttons, badges, toggles
      "--ds-element-radius": "0.625rem",     // 10px — menu items, sidebar, skeleton
      "--ds-input-radius": "0.75rem",        // 12px — inputs, selects
      "--ds-card-radius": "1rem",            // 16px — cards, popover, dropdown
      "--ds-dialog-radius": "1.25rem",       // 20px — dialog, sheet
      "--ds-base-font-size": "0.875rem",
      "--ds-focus-ring-width": "3px",
    },
  },
  {
    id: "lyra",
    label: "Lyra",
    desc: "각지고 샤프 — 개발자 도구",
    vars: {
      "--ds-button-h-default": "2rem",
      "--ds-button-h-sm": "1.75rem",
      "--ds-button-h-lg": "2.25rem",
      "--ds-button-h-xs": "1.5rem",
      "--ds-input-h": "2rem",
      "--ds-card-padding": "1rem",
      "--ds-section-gap": "1rem",
      "--ds-internal-gap": "0.5rem",
      "--ds-button-radius": "0",
      "--ds-element-radius": "0",
      "--ds-input-radius": "0",
      "--ds-card-radius": "0",
      "--ds-dialog-radius": "0",
      "--ds-base-font-size": "0.75rem",
      "--ds-focus-ring-width": "1px",
    },
  },
  {
    id: "mira",
    label: "Mira",
    desc: "초밀집 — 데이터 밀집 UI",
    vars: {
      "--ds-button-h-default": "1.75rem",
      "--ds-button-h-sm": "1.5rem",
      "--ds-button-h-lg": "2rem",
      "--ds-button-h-xs": "1.25rem",
      "--ds-input-h": "1.75rem",
      "--ds-card-padding": "0.75rem",
      "--ds-section-gap": "0.375rem",
      "--ds-internal-gap": "0.25rem",
      "--ds-button-radius": "var(--radius-md-prim)",
      "--ds-element-radius": "var(--radius-sm-prim)",
      "--ds-input-radius": "var(--radius-md-prim)",
      "--ds-card-radius": "var(--radius-lg-prim)",
      "--ds-dialog-radius": "var(--radius-xl-prim)",
      "--ds-base-font-size": "0.75rem",
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
