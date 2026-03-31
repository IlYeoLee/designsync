import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

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

// Hardcoded state/semantic colors that must use DS tokens
const BANNED_COLOR_PATTERNS = [
  { pat: "bg-amber-",    fix: "bg-[color:var(--warning)]" },
  { pat: "bg-yellow-",   fix: "bg-[color:var(--warning)]" },
  { pat: "bg-orange-",   fix: "bg-[color:var(--warning)] or bg-destructive" },
  { pat: "bg-green-",    fix: "bg-[color:var(--success)]" },
  { pat: "bg-emerald-",  fix: "bg-[color:var(--success)]" },
  { pat: "bg-teal-",     fix: "bg-[color:var(--success)]" },
  { pat: "bg-rose-",     fix: "bg-destructive/10 or bg-[color:var(--warning)]" },
  { pat: "bg-red-",      fix: "bg-destructive or bg-[color:var(--warning)]" },
  { pat: "bg-blue-",     fix: "bg-[color:var(--info)]" },
  { pat: "bg-sky-",      fix: "bg-[color:var(--info)]" },
  { pat: "bg-cyan-",     fix: "bg-[color:var(--info)]" },
  { pat: "bg-indigo-",   fix: "bg-[color:var(--info)]" },
  { pat: "text-amber-",  fix: "text-[color:var(--warning-foreground)]" },
  { pat: "text-yellow-", fix: "text-[color:var(--warning-foreground)]" },
  { pat: "text-green-",  fix: "text-[color:var(--success-foreground)]" },
  { pat: "text-emerald-",fix: "text-[color:var(--success-foreground)]" },
  { pat: "text-rose-",   fix: "text-destructive" },
  { pat: "text-red-",    fix: "text-destructive" },
  { pat: "text-blue-",   fix: "text-[color:var(--info-foreground)]" },
  { pat: "text-sky-",    fix: "text-[color:var(--info-foreground)]" },
  { pat: "border-amber-",fix: "border-[color:var(--warning-border)]" },
  { pat: "border-green-",fix: "border-[color:var(--success-border)]" },
  { pat: "border-rose-", fix: "border-[color:var(--error-border)]" },
  { pat: "border-red-",  fix: "border-[color:var(--error-border)]" },
  { pat: "border-blue-", fix: "border-[color:var(--info-foreground)]" },
  // Primitive scale direct refs — use semantic tokens instead
  { pat: "success-100",  fix: "use semantic token: bg-[color:var(--success)]" },
  { pat: "success-200",  fix: "use semantic token: border-[color:var(--success-border)]" },
  { pat: "success-300",  fix: "use semantic token: border-[color:var(--success-border)]" },
  { pat: "success-600",  fix: "use semantic token: text-[color:var(--success-foreground)]" },
  { pat: "success-700",  fix: "use semantic token: text-[color:var(--success-foreground)]" },
  { pat: "success-800",  fix: "use semantic token: text-[color:var(--success-foreground)]" },
  { pat: "success-900",  fix: "use semantic token: bg-[color:var(--success)]" },
  { pat: "error-100",    fix: "use semantic token: bg-destructive/10" },
  { pat: "error-300",    fix: "use semantic token: border-[color:var(--error-border)]" },
  { pat: "error-600",    fix: "use semantic token: bg-destructive or text-destructive" },
  { pat: "error-700",    fix: "use semantic token: text-destructive" },
  { pat: "info-100",     fix: "use semantic token: bg-[color:var(--info)]" },
  { pat: "info-700",     fix: "use semantic token: text-[color:var(--info-foreground)]" },
  { pat: "info-900",     fix: "use semantic token: bg-[color:var(--info)]" },
];

const noRestrictedSyntaxRules = [
  // Raw HTML elements
  ...RAW_HTML_NO_DS.map(({ el, ds }) => ({
    selector: `JSXOpeningElement[name.name="${el}"]`,
    message: `❌ DS: use ${ds} instead of raw <${el}>. Import from @/registry/new-york/ui/`,
  })),
  // Hardcoded state colors in className
  ...BANNED_COLOR_PATTERNS.map(({ pat, fix }) => ({
    selector: `JSXAttribute[name.name="className"] Literal[value=/${pat.replace(/-/g, "\\-")}/]`,
    message: `❌ DS: hardcoded color "${pat}*" → ${fix}`,
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
    rules: {
      "no-restricted-syntax": ["error", ...noRestrictedSyntaxRules],
    },
  },
];

export default eslintConfig;
