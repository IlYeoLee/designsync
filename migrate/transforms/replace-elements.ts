/**
 * jscodeshift transform: Replace HTML elements with DesignSync components
 */
import type { API, FileInfo, JSXElement } from "jscodeshift";
import { ELEMENT_MAP } from "../mappings";

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;
  const importsToAdd: Map<string, Set<string>> = new Map();

  // Process each HTML element in the map
  for (const [htmlTag, mapping] of Object.entries(ELEMENT_MAP)) {
    root
      .find(j.JSXElement, {
        openingElement: { name: { name: htmlTag } },
      })
      .forEach((path) => {
        const el = path.node as JSXElement;
        const classAttr = el.openingElement.attributes?.find(
          (attr) =>
            attr.type === "JSXAttribute" &&
            attr.name.name === "className"
        );

        // If detectBy patterns specified, check className matches
        if (mapping.detectBy && classAttr) {
          const classValue = getClassString(classAttr);
          if (!classValue) return;
          const matches = mapping.detectBy.some((pattern) =>
            classValue.includes(pattern)
          );
          if (!matches) return;
        }

        // Replace element name
        if (el.openingElement.name.type === "JSXIdentifier") {
          el.openingElement.name.name = mapping.component;
        }
        if (el.closingElement && el.closingElement.name.type === "JSXIdentifier") {
          el.closingElement.name.name = mapping.component;
        }

        // Remove className for elements where the component handles styling
        if (htmlTag === "button" || htmlTag === "input" || htmlTag === "textarea" || htmlTag === "select") {
          el.openingElement.attributes = el.openingElement.attributes?.filter(
            (attr) =>
              !(attr.type === "JSXAttribute" && attr.name.name === "className")
          );
        }

        // Track import needed
        if (!importsToAdd.has(mapping.importPath)) {
          importsToAdd.set(mapping.importPath, new Set());
        }
        importsToAdd.get(mapping.importPath)!.add(mapping.component);
        hasChanges = true;
      });
  }

  // Add imports
  if (hasChanges) {
    for (const [importPath, components] of importsToAdd) {
      // Check if import already exists
      const existingImport = root
        .find(j.ImportDeclaration, { source: { value: importPath } })
        .paths();

      if (existingImport.length > 0) {
        // Add missing specifiers to existing import
        const existing = existingImport[0].node;
        const existingNames = new Set(
          existing.specifiers?.map((s) =>
            s.type === "ImportSpecifier" ? s.imported.name : ""
          )
        );
        for (const comp of components) {
          if (!existingNames.has(comp)) {
            existing.specifiers?.push(
              j.importSpecifier(j.identifier(comp))
            );
          }
        }
      } else {
        // Add new import at top
        const specifiers = [...components].map((comp) =>
          j.importSpecifier(j.identifier(comp))
        );
        const importDecl = j.importDeclaration(specifiers, j.literal(importPath));
        const body = root.find(j.Program).get("body");
        body.unshift(importDecl);
      }
    }
  }

  return hasChanges ? root.toSource() : file.source;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getClassString(attr: any): string | null {
  if (attr.value?.type === "StringLiteral") return attr.value.value;
  if (attr.value?.type === "JSXExpressionContainer") {
    if (attr.value.expression?.type === "StringLiteral")
      return attr.value.expression.value;
    if (attr.value.expression?.type === "TemplateLiteral")
      return attr.value.expression.quasis.map((q: { value: { raw: string } }) => q.value.raw).join("");
  }
  return null;
}
