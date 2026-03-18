/**
 * Post-build script: generates a monolithic designsync-all.json
 * that bundles ALL component files + merged dependencies into one.
 *
 * This eliminates 47 sequential HTTP fetches during `shadcn add URL`,
 * reducing install time from ~15 min to ~1 min.
 *
 * Run: node scripts/build-designsync-all.mjs
 * Or via: pnpm registry:build && pnpm build:all
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, basename } from "path";

const BASE = new URL("../public/r", import.meta.url).pathname;

// Files to skip when bundling
const EXCLUDE = new Set([
  "designsync-all",
  "designsync-tokens",
  "registry",
  "complex-component",
  "example-form",
  "example-with-css",
  "hello-world",
  "font-geist",
  "font-montserrat",
  "font-space-mono",
  "typography",
]);

// Load tokens cssVars
const tokens = JSON.parse(readFileSync(join(BASE, "designsync-tokens.json"), "utf8"));

const allFiles = [];
const allDeps = new Set(["lucide-react"]); // always include icons
const seenPaths = new Set();

const files = readdirSync(BASE)
  .filter((f) => f.endsWith(".json"))
  .sort();

for (const fname of files) {
  const name = fname.replace(/\.json$/, "");
  if (EXCLUDE.has(name)) continue;

  const data = JSON.parse(readFileSync(join(BASE, fname), "utf8"));

  for (const fileEntry of data.files ?? []) {
    if (!seenPaths.has(fileEntry.path)) {
      seenPaths.add(fileEntry.path);
      allFiles.push(fileEntry);
    }
  }
  for (const dep of data.dependencies ?? []) {
    allDeps.add(dep);
  }
}

const result = {
  $schema: "https://ui.shadcn.com/schema/registry-item.json",
  name: "designsync-all",
  type: "registry:style",
  title: "DesignSync — All Components",
  description:
    "Install DesignSync design tokens + all UI components in one command.",
  dependencies: [...allDeps].sort(),
  cssVars: tokens.cssVars ?? {},
  files: allFiles,
};

const outPath = join(BASE, "designsync-all.json");
writeFileSync(outPath, JSON.stringify(result, null, 2));

const sizeKB = (statSync(outPath).size / 1024).toFixed(1);
console.log(`✓ designsync-all.json built: ${allFiles.length} files, ${allDeps.size} deps, ${sizeKB} KB`);
