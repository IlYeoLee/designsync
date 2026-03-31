import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import dsPlugin from "./eslint-plugin-ds.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// ── DesignSync custom rules ─────────────────────────────────────────────────
// Applied to app/ and components/ — registry/ is intentionally excluded
// (registry components ARE the DS primitives and use raw HTML legitimately).

const RAW_HTML_NO_DS = [
  { el: "button",   ds: "<Button>" },
  { el: "select",   ds: "<NativeSelect> or <Select>" },
  { el: "textarea", ds: "<Textarea>" },
  { el: "h1",       ds: "<TypographyH1>" },
  { el: "h2",       ds: "<TypographyH2>" },
  { el: "h3",       ds: "<TypographyH3>" },
  { el: "h4",       ds: "<TypographyH4>" },
  { el: "aside",    ds: "<Sidebar>" },
  { el: "table",    ds: "<Table> or <DataTable>" },
  { el: "thead",    ds: "<TableHeader>" },
  { el: "tbody",    ds: "<TableBody>" },
  { el: "tr",       ds: "<TableRow>" },
  { el: "th",       ds: "<TableHead>" },
  { el: "td",       ds: "<TableCell>" },
];

// Primitive scale direct refs — use semantic tokens instead
// (Tailwind palette color names are handled by ds/no-raw-tailwind-color)
const BANNED_PRIMITIVE_PATTERNS = [
  { pat: "success-100",  fix: "bg-[color:var(--success)]" },
  { pat: "success-200",  fix: "border-[color:var(--success-border)]" },
  { pat: "success-300",  fix: "border-[color:var(--success-border)]" },
  { pat: "success-600",  fix: "text-[color:var(--success-foreground)]" },
  { pat: "success-700",  fix: "text-[color:var(--success-foreground)]" },
  { pat: "success-800",  fix: "text-[color:var(--success-foreground)]" },
  { pat: "success-900",  fix: "bg-[color:var(--success)]" },
  { pat: "error-100",    fix: "bg-destructive/10" },
  { pat: "error-300",    fix: "border-[color:var(--error-border)]" },
  { pat: "error-600",    fix: "bg-destructive or text-destructive" },
  { pat: "error-700",    fix: "text-destructive" },
  { pat: "info-100",     fix: "bg-[color:var(--info)]" },
  { pat: "info-700",     fix: "text-[color:var(--info-foreground)]" },
  { pat: "info-900",     fix: "bg-[color:var(--info)]" },
];

const noRestrictedSyntaxRules = [
  // Raw HTML elements
  ...RAW_HTML_NO_DS.map(({ el, ds }) => ({
    selector: `JSXOpeningElement[name.name="${el}"]`,
    message: `❌ DS: use ${ds} instead of raw <${el}>. Import from @/registry/new-york/ui/`,
  })),
  // DS primitive scale direct refs in className
  ...BANNED_PRIMITIVE_PATTERNS.map(({ pat, fix }) => ({
    selector: `JSXAttribute[name.name="className"] Literal[value=/${pat.replace(/-/g, "\\-")}/]`,
    message: `❌ DS: primitive ref "${pat}*" → use semantic token: ${fix}`,
  })),
  // rounded-xl / rounded-2xl (use DS radius tokens)
  {
    selector: `JSXAttribute[name.name="className"] Literal[value=/\\brounded-xl\\b|\\brounded-2xl\\b/]`,
    message: "❌ DS: rounded-xl/2xl → use rounded-[var(--ds-card-radius)] or rounded-[var(--ds-element-radius)]",
  },
];

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // DesignSync rules — app/ and components/ only (registry excluded)
  {
    files: ["app/**/*.tsx", "app/**/*.ts", "components/**/*.tsx"],
    ignores: ["registry/**"],
    plugins: { ds: dsPlugin },
    rules: {
      // Whitelist approach: any Tailwind palette color (bg-red-500, text-blue-700…) → error
      // Allows: bg-background, bg-[color:var(--*)], bg-transparent, bg-white, etc.
      "ds/no-raw-tailwind-color": "error",
      "no-restricted-syntax": ["error", ...noRestrictedSyntaxRules],
    },
  },
];

export default eslintConfig;
