import { NextResponse } from "next/server";

const CDN = "https://designsync-omega.vercel.app";

export async function GET() {
  const script = `#!/usr/bin/env node
'use strict';

const fs = require('fs');
const { execSync } = require('child_process');

const CDN = '${CDN}';

console.log('');
console.log('  DesignSync Setup');
console.log('  ================');
console.log('');

// ── Step 1: Validate project ────────────────────────────────────
if (!fs.existsSync('package.json')) {
  console.error('  [ERROR] package.json not found. Run this from your project root.');
  process.exit(1);
}

// ── Step 2: Ensure shadcn is initialized ────────────────────────
if (!fs.existsSync('components.json')) {
  console.log('  [1/4] shadcn not initialized — running init...');
  try {
    execSync('npx -y shadcn@latest init -y -d', { stdio: 'inherit' });
  } catch (e) {
    console.error('  [ERROR] shadcn init failed. Please run "npx shadcn@latest init" manually first.');
    process.exit(1);
  }
} else {
  console.log('  [1/4] shadcn project detected');
}

// ── Step 3: Find and clean globals.css ──────────────────────────
const candidates = [
  'app/globals.css',
  'src/app/globals.css',
  'styles/globals.css',
  'src/styles/globals.css',
];
const globalsPath = candidates.find(c => fs.existsSync(c));

if (!globalsPath) {
  console.error('  [ERROR] globals.css not found in standard locations.');
  process.exit(1);
}

console.log('  [2/4] Found ' + globalsPath + ' — cleaning existing theme...');

// Backup
const original = fs.readFileSync(globalsPath, 'utf-8');
fs.writeFileSync(globalsPath + '.bak', original);

let css = original;

// Remove a CSS block that starts with the given regex pattern.
// Handles nested braces correctly.
function removeAllBlocks(src, pattern) {
  let result = src;
  while (true) {
    const match = result.match(pattern);
    if (!match) return result;
    const start = match.index;
    let depth = 0;
    let end = start;
    let opened = false;
    for (let i = start; i < result.length; i++) {
      if (result[i] === '{') { depth++; opened = true; }
      if (result[i] === '}') { depth--; }
      if (opened && depth === 0) { end = i + 1; break; }
    }
    // Remove the block and any leading comment on the same line
    const lineStart = result.lastIndexOf('\\n', start - 1) + 1;
    const before = result.slice(lineStart, start).trim();
    const cutFrom = before.startsWith('/*') ? lineStart : start;
    result = result.slice(0, cutFrom) + result.slice(end);
  }
}

// Remove theme blocks (order matters: @theme first, then :root/.dark)
css = removeAllBlocks(css, /@theme\\s+inline\\s*\\{/);
css = removeAllBlocks(css, /:root\\s*\\{/);
css = removeAllBlocks(css, /\\.dark\\s*\\{/);
css = removeAllBlocks(css, /@layer\\s+base\\s*\\{/);

// Remove @custom-variant dark line (shadcn add will re-add it)
css = css.replace(/@custom-variant\\s+dark\\s+[^;]+;/g, '');

// Remove Tailwind v3 directives if present (v4 uses @import)
// shadcn add will set up the correct imports
css = css.replace(/@tailwind\\s+base\\s*;/g, '');
css = css.replace(/@tailwind\\s+components\\s*;/g, '');
css = css.replace(/@tailwind\\s+utilities\\s*;/g, '');

// Clean up excessive blank lines
css = css.replace(/\\n{3,}/g, '\\n\\n').trim();

fs.writeFileSync(globalsPath, css + '\\n');
console.log('         Theme cleaned (backup: ' + globalsPath + '.bak)');

// ── Step 4: Install DesignSync ──────────────────────────────────
console.log('  [3/4] Installing DesignSync (tokens + components)...');
console.log('');
try {
  execSync(
    'npx -y shadcn@latest add -o -y ' + CDN + '/r/designsync-all.json',
    { stdio: 'inherit' }
  );
} catch (e) {
  console.error('');
  console.error('  [ERROR] shadcn add failed. Check the output above.');
  console.error('  Your original globals.css is backed up at: ' + globalsPath + '.bak');
  process.exit(1);
}

// ── Done ────────────────────────────────────────────────────────
console.log('');
console.log('  [4/4] Done!');
console.log('');
console.log('  DesignSync has been applied to your project.');
console.log('  Restart your dev server to see the changes.');
console.log('');
console.log('  Tokens:     ' + CDN + '/r/designsync-tokens.json');
console.log('  AI Rules:   ' + CDN + '/r/designsync-all.json');
console.log('');
`;

  return new NextResponse(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
