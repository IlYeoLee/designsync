/**
 * jscodeshift transform: Replace hardcoded Tailwind classes with DesignSync tokens
 */
import type { API, FileInfo } from "jscodeshift";
import { CLASS_MAP } from "../mappings";

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  // Find all className attributes (string literals)
  root
    .find(j.JSXAttribute, { name: { name: "className" } })
    .forEach((path) => {
      const value = path.node.value;

      // Handle string literal: className="..."
      if (value && value.type === "StringLiteral") {
        const original = value.value;
        const replaced = replaceClasses(original);
        if (replaced !== original) {
          value.value = replaced;
          hasChanges = true;
        }
      }

      // Handle template literal: className={`...`}
      if (value && value.type === "JSXExpressionContainer") {
        const expr = value.expression;
        if (expr.type === "TemplateLiteral") {
          expr.quasis.forEach((quasi) => {
            const original = quasi.value.raw;
            const replaced = replaceClasses(original);
            if (replaced !== original) {
              quasi.value.raw = replaced;
              quasi.value.cooked = replaced;
              hasChanges = true;
            }
          });
        }
        // Handle string in expression: className={"..."}
        if (expr.type === "StringLiteral") {
          const original = expr.value;
          const replaced = replaceClasses(original);
          if (replaced !== original) {
            expr.value = replaced;
            hasChanges = true;
          }
        }
      }
    });

  return hasChanges ? root.toSource() : file.source;
}

function replaceClasses(classString: string): string {
  let result = classString;
  for (const [from, to] of Object.entries(CLASS_MAP)) {
    // Word boundary replacement to avoid partial matches
    const regex = new RegExp(`(^|\\s)${escapeRegex(from)}($|\\s)`, "g");
    result = result.replace(regex, `$1${to}$2`);
  }
  return result;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
