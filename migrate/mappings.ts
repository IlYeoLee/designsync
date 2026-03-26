/**
 * DesignSync Migrate — mapping definitions
 * Used by jscodeshift transforms to replace hardcoded patterns
 */

// HTML element → DesignSync component
export const ELEMENT_MAP: Record<string, {
  component: string;
  importPath: string;
  subComponents?: string[];
  detectBy?: string[]; // className patterns that confirm this mapping
}> = {
  button: {
    component: "Button",
    importPath: "@/components/ui/button",
    detectBy: ["bg-primary", "bg-blue", "bg-destructive", "bg-red", "bg-secondary", "border"],
  },
  input: {
    component: "Input",
    importPath: "@/components/ui/input",
    detectBy: ["border", "rounded", "h-9", "h-10", "px-3"],
  },
  textarea: {
    component: "Textarea",
    importPath: "@/components/ui/textarea",
  },
  select: {
    component: "NativeSelect",
    importPath: "@/components/ui/native-select",
  },
  label: {
    component: "Label",
    importPath: "@/components/ui/label",
  },
};

// Complex pattern → DesignSync component (detected by className/structure)
export const PATTERN_MAP: {
  name: string;
  detect: (classNames: string) => boolean;
  component: string;
  importPath: string;
  variant?: string;
}[] = [
  // Button variants
  {
    name: "primary-button",
    detect: (cls) => /bg-(blue|indigo|primary)-[56]00|bg-primary/.test(cls),
    component: "Button",
    importPath: "@/components/ui/button",
  },
  {
    name: "outline-button",
    detect: (cls) => /border.*(gray|border)/.test(cls) && !/bg-(blue|red|green)/.test(cls),
    component: "Button",
    importPath: "@/components/ui/button",
    variant: "outline",
  },
  {
    name: "destructive-button",
    detect: (cls) => /bg-(red|destructive)-[45]00|bg-destructive/.test(cls),
    component: "Button",
    importPath: "@/components/ui/button",
    variant: "destructive",
  },
  {
    name: "ghost-button",
    detect: (cls) => /hover:bg-(gray|accent)/.test(cls) && !/border/.test(cls) && !/bg-/.test(cls),
    component: "Button",
    importPath: "@/components/ui/button",
    variant: "ghost",
  },
  // Badge
  {
    name: "badge",
    detect: (cls) => /rounded-full.*text-\[?1[0-2]|px-2.*py-0\.5.*rounded/.test(cls),
    component: "Badge",
    importPath: "@/components/ui/badge",
  },
  // Avatar
  {
    name: "avatar",
    detect: (cls) => /rounded-full.*(w-[6-9]|w-1[0-2]|h-[6-9]|h-1[0-2])/.test(cls),
    component: "Avatar",
    importPath: "@/components/ui/avatar",
  },
];

// Tailwind class → semantic token
export const CLASS_MAP: Record<string, string> = {
  // Backgrounds
  "bg-white": "bg-background",
  "bg-gray-50": "bg-background",
  "bg-slate-50": "bg-background",
  "bg-[#fafafa]": "bg-background",
  "bg-[#fff]": "bg-background",
  "bg-gray-100": "bg-muted",
  "bg-slate-100": "bg-muted",
  "bg-gray-200": "bg-muted",
  "bg-blue-600": "bg-primary",
  "bg-blue-700": "bg-primary/90",
  "bg-indigo-600": "bg-primary",
  "bg-red-600": "bg-destructive",
  "bg-red-500": "bg-destructive",
  "bg-blue-50": "bg-accent",
  "bg-indigo-50": "bg-accent",
  "bg-gray-900": "bg-foreground",
  "bg-[#111]": "bg-foreground",
  "bg-[#0a0a0a]": "bg-foreground",

  // Text colors
  "text-gray-900": "text-foreground",
  "text-gray-800": "text-foreground",
  "text-[#111]": "text-foreground",
  "text-black": "text-foreground",
  "text-gray-700": "text-foreground",
  "text-gray-600": "text-muted-foreground",
  "text-gray-500": "text-muted-foreground",
  "text-gray-400": "text-muted-foreground",
  "text-white": "text-primary-foreground",
  "text-blue-600": "text-primary",
  "text-blue-700": "text-primary",
  "text-red-600": "text-destructive",
  "text-red-500": "text-destructive",

  // Borders
  "border-gray-200": "border-border",
  "border-gray-100": "border-border",
  "border-gray-300": "border-input",
  "border-[#e5e5e5]": "border-border",
  "border-[#ddd]": "border-input",
  "border-[#eee]": "border-border",

  // Hover states
  "hover:bg-gray-50": "hover:bg-accent",
  "hover:bg-gray-100": "hover:bg-accent",
  "hover:bg-blue-700": "hover:bg-primary/90",
  "hover:bg-red-600": "hover:bg-destructive/90",
  "hover:text-gray-900": "hover:text-foreground",
  "hover:text-gray-700": "hover:text-foreground",

  // Sizing (density tokens)
  "rounded-xl": "rounded-[var(--ds-card-radius)]",
  "rounded-lg": "rounded-[var(--ds-card-radius)]",
  "p-6": "p-[var(--ds-card-padding)]",
  "p-5": "p-[var(--ds-card-padding)]",
  "px-6": "px-[var(--ds-card-padding)]",
};

// Checkbox detection
export const CHECKBOX_DETECT = (el: string, cls: string): boolean =>
  el === "input" && cls.includes("checkbox");

// Switch/Toggle detection
export const SWITCH_DETECT = (cls: string): boolean =>
  /rounded-full.*(bg-blue|bg-gray|bg-green).*translate/.test(cls);

// Progress bar detection
export const PROGRESS_DETECT = (cls: string): boolean =>
  /bg-gray-200.*rounded-full.*overflow-hidden/.test(cls);
