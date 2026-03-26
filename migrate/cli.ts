#!/usr/bin/env node
/**
 * DesignSync Migrate CLI
 *
 * Automatically transforms existing code to use DesignSync components and tokens.
 * Uses jscodeshift for AST-based reliable transforms.
 *
 * Usage:
 *   npx ts-node migrate/cli.ts [--dry-run] [path]
 *
 * Or via setup script:
 *   Built into the setup flow automatically.
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const targetDir = args.find((a) => !a.startsWith("--")) || ".";

console.log("");
console.log("  DesignSync Migrate");
console.log("  ==================");
console.log(`  Target: ${path.resolve(targetDir)}`);
if (dryRun) console.log("  Mode: DRY RUN (no changes written)");
console.log("");

// Find all TSX/JSX files (excluding node_modules, .next, components/ui)
function findFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".next", ".git", "components/ui", "registry"].some(
        (skip) => fullPath.includes(skip)
      )) continue;
      files.push(...findFiles(fullPath));
    } else if (/\.(tsx|jsx)$/.test(entry.name)) {
      // Skip DesignSync component files
      if (!fullPath.includes(path.join("components", "ui"))) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

const files = findFiles(targetDir);
console.log(`  Found ${files.length} TSX/JSX files to process`);
console.log("");

if (files.length === 0) {
  console.log("  No files to process.");
  process.exit(0);
}

// Step 1: Replace Tailwind classes
console.log("  [1/2] Replacing hardcoded Tailwind classes...");
try {
  const transformPath = path.join(__dirname, "transforms", "replace-classes.ts");
  const fileList = files.join(" ");
  const cmd = `npx jscodeshift --parser=tsx --transform=${transformPath} ${dryRun ? "--dry" : ""} ${fileList}`;
  execSync(cmd, { stdio: "pipe", cwd: targetDir });
  console.log("         Done");
} catch (e) {
  console.log("         Completed (some files may have been skipped)");
}

// Step 2: Replace HTML elements with components
console.log("  [2/2] Replacing HTML elements with DesignSync components...");
try {
  const transformPath = path.join(__dirname, "transforms", "replace-elements.ts");
  const fileList = files.join(" ");
  const cmd = `npx jscodeshift --parser=tsx --transform=${transformPath} ${dryRun ? "--dry" : ""} ${fileList}`;
  execSync(cmd, { stdio: "pipe", cwd: targetDir });
  console.log("         Done");
} catch (e) {
  console.log("         Completed (some files may have been skipped)");
}

console.log("");
console.log("  Migration complete!");
console.log("  Review changes and restart your dev server.");
console.log("");
