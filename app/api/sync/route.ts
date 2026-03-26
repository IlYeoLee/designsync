import { NextResponse } from "next/server";

const CDN = "https://designsync-omega.vercel.app";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dsSlug = searchParams.get("ds") || "";

  const tokensUrl = dsSlug
    ? `${CDN}/r/${dsSlug}/designsync-tokens.json`
    : `${CDN}/r/designsync-tokens.json`;
  const rulesUrl = dsSlug
    ? `${CDN}/api/rules?ds=${dsSlug}`
    : `${CDN}/api/rules`;

  const script = `#!/usr/bin/env node
'use strict';

const fs = require('fs');
const https = require('https');

const TOKENS_URL = '${tokensUrl}';
const RULES_URL = '${rulesUrl}';

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? require('https') : require('http');
    mod.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJSON(res.headers.location).then(resolve, reject);
      }
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch { resolve(data); }
      });
    }).on('error', reject);
  });
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? require('https') : require('http');
    mod.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchText(res.headers.location).then(resolve, reject);
      }
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

(async () => {
  console.log('');
  console.log('  DesignSync Sync');
  console.log('  ===============');
  console.log('');

  // 1. Find globals.css
  const candidates = [
    'app/globals.css',
    'src/app/globals.css',
    'styles/globals.css',
    'src/styles/globals.css',
  ];
  const globalsPath = candidates.find((c) => fs.existsSync(c));

  if (!globalsPath) {
    console.error('  [ERROR] globals.css not found.');
    process.exit(1);
  }

  console.log('  [1/4] Found ' + globalsPath);

  // 2. Fetch latest tokens
  console.log('  [2/4] Fetching latest tokens...');
  let tokens;
  try {
    tokens = await fetchJSON(TOKENS_URL);
  } catch (e) {
    console.error('  [ERROR] Failed to fetch tokens:', e.message || e);
    process.exit(1);
  }

  if (!tokens || !tokens.cssVars) {
    console.error('  [ERROR] Invalid token data.');
    process.exit(1);
  }

  // 3. Update globals.css — replace ALL :root and .dark blocks
  console.log('  [3/4] Updating design tokens...');
  let css = fs.readFileSync(globalsPath, 'utf-8');

  // Build new :root and .dark blocks (includes primitives + semantic + density + font)
  const lightVars = Object.entries(tokens.cssVars.light || {})
    .map(([k, v]) => '    --' + k + ': ' + v + ';')
    .join('\\n');
  const darkVars = Object.entries(tokens.cssVars.dark || {})
    .map(([k, v]) => '    --' + k + ': ' + v + ';')
    .join('\\n');

  // Remove ALL :root and .dark blocks (primitives + semantic — rewrite everything fresh)
  function removeAllBlocks(src, pattern) {
    let result = src;
    // Remove blocks from last to first to preserve indices
    const re = new RegExp(pattern.source, pattern.flags.replace('g', '') + 'g');
    const matches = [...result.matchAll(re)];
    for (let m = matches.length - 1; m >= 0; m--) {
      const start = matches[m].index;
      let depth = 0, end = start, opened = false;
      for (let i = start; i < result.length; i++) {
        if (result[i] === '{') { depth++; opened = true; }
        if (result[i] === '}') { depth--; }
        if (opened && depth === 0) { end = i + 1; break; }
      }
      // Also remove preceding comment line if it exists
      let commentStart = start;
      const before = result.slice(0, start);
      const lastNewline = before.lastIndexOf('\\n');
      if (lastNewline !== -1) {
        const lineBeforeBlock = before.slice(lastNewline + 1).trim();
        if (lineBeforeBlock.startsWith('/*') && lineBeforeBlock.endsWith('*/')) {
          commentStart = lastNewline + 1;
        }
      }
      result = result.slice(0, commentStart) + result.slice(end);
    }
    return result;
  }

  // Remove ALL :root blocks and ALL .dark blocks
  css = removeAllBlocks(css, /:root\\s*\\{/);
  css = removeAllBlocks(css, /\\.dark\\s*\\{/);

  // Clean up excessive blank lines left after removal
  css = css.replace(/(\\n\\s*){3,}/g, '\\n\\n');

  // Append new complete blocks (primitives + semantic + density + font all in one)
  css = css.trimEnd() + '\\n\\n' +
    '/* Design tokens (synced from DesignSync) */\\n' +
    ':root {\\n' + lightVars + '\\n}\\n\\n' +
    '.dark {\\n' + darkVars + '\\n}\\n';

  fs.writeFileSync(globalsPath, css);
  console.log('  [3/4] Tokens updated in ' + globalsPath);

  // 4. Create/update AI rules files
  console.log('  [4/4] Updating AI rules...');
  try {
    const rulesText = await fetchText(RULES_URL);
    if (rulesText && !rulesText.trim().startsWith('<')) {
      // Always create these files (not just update existing ones)
      fs.writeFileSync('.cursorrules', rulesText);
      fs.writeFileSync('CLAUDE.md', rulesText);
      fs.writeFileSync('.windsurfrules', rulesText);
      console.log('  [4/4] AI rules written to .cursorrules, CLAUDE.md, .windsurfrules');
    }
  } catch {
    console.log('  [WARN] AI rules update skipped.');
  }

  console.log('');
  console.log('  Done! Design tokens synced.');
  console.log('  Restart your dev server to see changes.');
  console.log('');
})().catch((e) => {
  console.error('  [FATAL]', e.message || e);
  process.exit(1);
});
`;

  return new NextResponse(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
