/**
 * DesignSync ESLint Plugin — Flat Config
 *
 * Blocks hardcoded values that should use DesignSync tokens.
 * Add to your eslint.config.mjs:
 *
 *   import designsync from "./designsync-eslint.js";
 *   export default [...otherConfigs, designsync];
 */

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Extract the raw string value from a className attribute.
 * Handles: className="..." and className={'...'} / className={`...`}
 * Returns null for dynamic expressions it can't statically analyze.
 */
function getClassNameValue(node) {
  if (!node.value) return null;

  // className="literal"
  if (node.value.type === "Literal" && typeof node.value.value === "string") {
    return { value: node.value.value, loc: node.value.loc };
  }

  // className={"literal"} or className={`literal`}
  if (node.value.type === "JSXExpressionContainer") {
    const expr = node.value.expression;
    if (expr.type === "Literal" && typeof expr.value === "string") {
      return { value: expr.value, loc: expr.loc };
    }
    if (expr.type === "TemplateLiteral" && expr.quasis.length === 1) {
      return { value: expr.quasis[0].value.raw, loc: expr.loc };
    }
  }

  return null;
}

/**
 * Split a className string into individual classes.
 */
function splitClasses(str) {
  return str.split(/\s+/).filter(Boolean);
}

// ─── Patterns ───────────────────────────────────────────────────────────────

// 1. Hardcoded color classes
const HARDCODED_COLOR_RE = new RegExp(
  "^(?:bg|text|border)-(?:" +
    "gray|blue|red|green|slate|zinc|neutral|stone|orange|amber|yellow|" +
    "lime|emerald|teal|cyan|sky|indigo|violet|purple|fuchsia|pink|rose" +
  ")-\\d+(?:\\/\\d+)?$"
);

// Arbitrary hex colors: bg-[#...], text-[#...], border-[#...]
const ARBITRARY_COLOR_RE = /^(?:bg|text|border)-\[#[0-9a-fA-F]+\]$/;

// hover:/focus:/etc. variants with hardcoded colors
const VARIANT_HARDCODED_COLOR_RE = new RegExp(
  "^(?:hover|focus|active|group-hover|peer-hover|focus-within|focus-visible):" +
  "(?:bg|text|border)-(?:" +
    "gray|blue|red|green|slate|zinc|neutral|stone|orange|amber|yellow|" +
    "lime|emerald|teal|cyan|sky|indigo|violet|purple|fuchsia|pink|rose" +
  ")-\\d+(?:\\/\\d+)?$"
);

// Allowed semantic bg/text/border classes (not flagged)
const SEMANTIC_COLOR_RE = /^(?:bg|text|border)-(?:background|foreground|card|popover|primary|secondary|muted|accent|destructive|border|input|ring|sidebar|inherit|current|transparent|black|white)(?:-foreground)?(?:\/\d+)?$/;

// 2. Hardcoded radius
const HARDCODED_RADIUS_RE = /^rounded-(?:sm|md|lg|xl|2xl|3xl)$/;
// Allowed radius: rounded-full, rounded-none, rounded-[var(--ds-*)]
const ALLOWED_RADIUS_RE = /^rounded-(?:full|none|\[var\(--ds-)/;

// 3. Hardcoded heights for buttons/inputs
const HARDCODED_HEIGHT_RE = /^h-(?:8|9|10|11|12)$/;
// Allowed heights
const ALLOWED_HEIGHT_RE = /^h-(?:full|screen|auto|min|max|fit|px|0|0\.5|1|1\.5|2|2\.5|3|3\.5|4|5|6|7|\[var\(--ds-)/;

// 4. Hardcoded structural padding/gap
const HARDCODED_PADDING_RE = /^(?:p|px|py|pl|pr|pt|pb)-(?:4|5|6|7|8)$/;
const HARDCODED_GAP_RE = /^(?:gap|gap-x|gap-y|space-x|space-y)-(?:4|5|6)$/;

// 5. Raw HTML elements → component replacements
const RAW_ELEMENT_MAP = {
  button: "Button (from @/components/ui/button)",
  input: "Input (from @/components/ui/input)",
  textarea: "Textarea (from @/components/ui/textarea)",
  aside: "Sidebar (from @/components/ui/sidebar)",
  header: "Header (from @/components/ui/header)",
  table: "Table (from @/components/ui/table)",
  h1: "TypographyH1 (from @/components/ui/typography)",
  h2: "TypographyH2 (from @/components/ui/typography)",
  h3: "TypographyH3 (from @/components/ui/typography)",
  h4: "TypographyH4 (from @/components/ui/typography)",
  h5: "TypographyH4 (from @/components/ui/typography)",
  h6: "TypographyH4 (from @/components/ui/typography)",
  hr: "Separator (from @/components/ui/separator)",
  select: "NativeSelect or Select (from @/components/ui/native-select or @/components/ui/select)",
};

// 6. SVG chart children
const SVG_CHART_CHILDREN = new Set(["path", "line", "circle", "rect", "g", "polyline", "polygon"]);

// ─── Rule: no-hardcoded-colors ──────────────────────────────────────────────

const noHardcodedColors = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow hardcoded Tailwind color classes; use DesignSync semantic tokens instead.",
    },
    messages: {
      hardcodedColor:
        "Hardcoded color '{{cls}}' — use a semantic token (bg-primary, text-foreground, border-border, etc.) or a CSS variable: bg-[var(--brand-500)].",
      arbitraryHexColor:
        "Arbitrary hex color '{{cls}}' — use a semantic token or CSS variable: bg-[var(--brand-500)].",
    },
    schema: [],
  },
  create(context) {
    return {
      JSXAttribute(node) {
        if (node.name.name !== "className") return;
        const info = getClassNameValue(node);
        if (!info) return;

        for (const cls of splitClasses(info.value)) {
          // Skip semantic tokens
          if (SEMANTIC_COLOR_RE.test(cls)) continue;
          // Skip classes with CSS var references
          if (cls.includes("var(--")) continue;

          if (HARDCODED_COLOR_RE.test(cls) || VARIANT_HARDCODED_COLOR_RE.test(cls)) {
            context.report({
              node: node.value,
              messageId: "hardcodedColor",
              data: { cls },
            });
          } else if (ARBITRARY_COLOR_RE.test(cls)) {
            context.report({
              node: node.value,
              messageId: "arbitraryHexColor",
              data: { cls },
            });
          }
        }
      },
    };
  },
};

// ─── Rule: no-hardcoded-radius ──────────────────────────────────────────────

const noHardcodedRadius = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow hardcoded border-radius classes; use var(--ds-*-radius) tokens.",
    },
    messages: {
      hardcodedRadius:
        "Hardcoded radius '{{cls}}' — use a DesignSync radius token: rounded-[var(--ds-button-radius)], rounded-[var(--ds-card-radius)], etc.",
    },
    schema: [],
  },
  create(context) {
    return {
      JSXAttribute(node) {
        if (node.name.name !== "className") return;
        const info = getClassNameValue(node);
        if (!info) return;

        for (const cls of splitClasses(info.value)) {
          if (HARDCODED_RADIUS_RE.test(cls) && !ALLOWED_RADIUS_RE.test(cls)) {
            context.report({
              node: node.value,
              messageId: "hardcodedRadius",
              data: { cls },
            });
          }
        }
      },
    };
  },
};

// ─── Rule: no-hardcoded-height ──────────────────────────────────────────────

const noHardcodedHeight = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow hardcoded height classes for buttons/inputs; use var(--ds-*-h) tokens.",
    },
    messages: {
      hardcodedHeight:
        "Hardcoded height '{{cls}}' — use a DesignSync height token: h-[var(--ds-button-h-default)], h-[var(--ds-input-h)], etc.",
    },
    schema: [],
  },
  create(context) {
    return {
      JSXAttribute(node) {
        if (node.name.name !== "className") return;
        const info = getClassNameValue(node);
        if (!info) return;

        for (const cls of splitClasses(info.value)) {
          if (HARDCODED_HEIGHT_RE.test(cls) && !ALLOWED_HEIGHT_RE.test(cls)) {
            context.report({
              node: node.value,
              messageId: "hardcodedHeight",
              data: { cls },
            });
          }
        }
      },
    };
  },
};

// ─── Rule: no-hardcoded-padding ─────────────────────────────────────────────

const noHardcodedPadding = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow hardcoded structural padding/gap; use var(--ds-card-padding), var(--ds-section-gap).",
    },
    messages: {
      hardcodedPadding:
        "Hardcoded structural padding '{{cls}}' — use p-[var(--ds-card-padding)] or similar DesignSync token.",
      hardcodedGap:
        "Hardcoded structural gap '{{cls}}' — use gap-[var(--ds-section-gap)] or gap-[var(--ds-internal-gap)].",
    },
    schema: [],
  },
  create(context) {
    return {
      JSXAttribute(node) {
        if (node.name.name !== "className") return;
        const info = getClassNameValue(node);
        if (!info) return;

        for (const cls of splitClasses(info.value)) {
          if (cls.includes("var(--")) continue;

          if (HARDCODED_PADDING_RE.test(cls)) {
            context.report({
              node: node.value,
              messageId: "hardcodedPadding",
              data: { cls },
            });
          } else if (HARDCODED_GAP_RE.test(cls)) {
            context.report({
              node: node.value,
              messageId: "hardcodedGap",
              data: { cls },
            });
          }
        }
      },
    };
  },
};

// ─── Rule: no-raw-html-elements ─────────────────────────────────────────────

const noRawHtmlElements = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow raw HTML form elements; use DesignSync UI components instead.",
    },
    messages: {
      rawElement:
        "Raw <{{element}}> element — use <{{replacement}}> instead.",
    },
    schema: [],
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        // Only check simple identifiers (lowercase = HTML elements)
        if (node.name.type !== "JSXIdentifier") return;
        const name = node.name.name;

        if (RAW_ELEMENT_MAP[name]) {
          context.report({
            node,
            messageId: "rawElement",
            data: {
              element: name,
              replacement: RAW_ELEMENT_MAP[name],
            },
          });
        }
      },
    };
  },
};

// ─── Rule: no-raw-svg-chart ─────────────────────────────────────────────────

const noRawSvgChart = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow raw SVG elements that look like charts; use <ChartContainer> + recharts.",
    },
    messages: {
      rawSvgChart:
        "Raw <svg> with chart-like children ({{children}}) — use <ChartContainer> + recharts instead of raw SVG.",
    },
    schema: [],
  },
  create(context) {
    return {
      JSXElement(node) {
        const opening = node.openingElement;
        if (opening.name.type !== "JSXIdentifier" || opening.name.name !== "svg") {
          return;
        }

        // Check if any children are chart-like SVG elements
        const chartChildren = [];
        for (const child of node.children) {
          if (
            child.type === "JSXElement" &&
            child.openingElement.name.type === "JSXIdentifier" &&
            SVG_CHART_CHILDREN.has(child.openingElement.name.name)
          ) {
            chartChildren.push(child.openingElement.name.name);
          }
        }

        // Only flag if there are multiple chart-like children (looks like a chart, not a simple icon)
        if (chartChildren.length >= 2) {
          context.report({
            node: opening,
            messageId: "rawSvgChart",
            data: { children: [...new Set(chartChildren)].join(", ") },
          });
        }
      },
    };
  },
};

// ─── Plugin Definition ──────────────────────────────────────────────────────

const plugin = {
  meta: {
    name: "eslint-plugin-designsync",
    version: "1.0.0",
  },
  rules: {
    "no-hardcoded-colors": noHardcodedColors,
    "no-hardcoded-radius": noHardcodedRadius,
    "no-hardcoded-height": noHardcodedHeight,
    "no-hardcoded-padding": noHardcodedPadding,
    "no-raw-html-elements": noRawHtmlElements,
    "no-raw-svg-chart": noRawSvgChart,
  },
};

// ─── Flat Config Export ─────────────────────────────────────────────────────
// Usage in eslint.config.mjs:
//   import designsync from "./designsync-eslint.js";
//   export default [...otherConfigs, designsync];

module.exports = {
  files: ["**/*.{jsx,tsx}"],
  plugins: {
    designsync: plugin,
  },
  rules: {
    "designsync/no-hardcoded-colors": "error",
    "designsync/no-hardcoded-radius": "error",
    "designsync/no-hardcoded-height": "error",
    "designsync/no-hardcoded-padding": "error",
    "designsync/no-raw-html-elements": "error",
    "designsync/no-raw-svg-chart": "error",
  },
};

// Also support ESM import
if (typeof module !== "undefined" && module.exports) {
  module.exports.default = module.exports;
}
