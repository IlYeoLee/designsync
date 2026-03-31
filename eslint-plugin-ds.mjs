/**
 * eslint-plugin-ds.mjs — DesignSync local ESLint plugin
 *
 * Whitelist approach: any Tailwind palette color (bg-red-500, text-blue-700…)
 * triggers an error. Only DS semantic tokens and arbitrary var() refs are allowed.
 *
 * Tailwind palette names are a fixed, well-known set — future shades (e.g. "mauve")
 * won't exist in Tailwind so this list stays stable.
 */

// Full Tailwind v3/v4 named palette (all known color names)
const TW_PALETTES = new Set([
  "slate","gray","zinc","neutral","stone",
  "red","orange","amber","yellow","lime","green","emerald","teal",
  "cyan","sky","blue","indigo","violet","purple","fuchsia","pink","rose",
  // Legacy Tailwind v2 names
  "blueGray","coolGray","trueGray","warmGray","lightBlue",
]);

// Pattern: (bg|text|border|…)-(palette)-(shade)
// Captures the full token so we can show it in the message.
const COLOR_RE = new RegExp(
  `\\b(bg|text|border|fill|stroke|from|to|via|ring|outline|decoration|caret|divide|placeholder|shadow)-` +
  `(${[...TW_PALETTES].join("|")})-` +
  `(\\d+|inherit|current|transparent|white|black)\\b`
);

const SEMANTIC_FIX = `DS 시맨틱 토큰 사용: bg-[color:var(--success)], text-destructive, bg-[color:var(--info)] 등`;

function checkClassValue(value, node, context) {
  // Split on whitespace; also handle template literal quasis
  const classes = value.split(/\s+/);
  for (const cls of classes) {
    // Strip variant prefixes: hover:, dark:, sm:, focus-visible:, etc.
    const base = cls.replace(/^(?:[a-z][a-z0-9]*(?:-[a-z0-9]+)*:)+/, "");
    const m = COLOR_RE.exec(base);
    if (m) {
      context.report({
        node,
        message: `❌ DS: hardcoded Tailwind color "${m[0]}" — ${SEMANTIC_FIX}`,
      });
    }
  }
}

export default {
  rules: {
    "no-raw-tailwind-color": {
      meta: {
        type: "problem",
        schema: [],
        messages: {},
      },
      create(context) {
        return {
          // Static className="..."
          "JSXAttribute[name.name='className'] > Literal"(node) {
            if (typeof node.value === "string") checkClassValue(node.value, node, context);
          },
          // Template literal className={`...`}
          "JSXAttribute[name.name='className'] TemplateLiteral > TemplateElement"(node) {
            checkClassValue(node.value.raw, node, context);
          },
          // cn("...") or clsx("...") call arguments
          "CallExpression[callee.name=/^(cn|clsx|cva|cx)$/] > Literal"(node) {
            if (typeof node.value === "string") checkClassValue(node.value, node, context);
          },
          "CallExpression[callee.name=/^(cn|clsx|cva|cx)$/] TemplateLiteral > TemplateElement"(node) {
            checkClassValue(node.value.raw, node, context);
          },
        };
      },
    },
  },
};
