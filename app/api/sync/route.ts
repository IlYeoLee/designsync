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

  console.log('  [1/3] Found ' + globalsPath);

  // 2. Fetch latest tokens
  console.log('  [2/3] Fetching latest tokens...');
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

  // 3. Update globals.css — replace :root and .dark blocks
  let css = fs.readFileSync(globalsPath, 'utf-8');

  // Build new :root and .dark blocks
  const lightVars = Object.entries(tokens.cssVars.light || {})
    .map(([k, v]) => '    --' + k + ': ' + v + ';')
    .join('\\n');
  const darkVars = Object.entries(tokens.cssVars.dark || {})
    .map(([k, v]) => '    --' + k + ': ' + v + ';')
    .join('\\n');

  // Remove existing semantic :root and .dark blocks (keep primitive :root)
  // Strategy: find the LAST :root block (semantic) and .dark block, replace them
  function removeBlock(src, pattern) {
    let result = src;
    // Find the LAST occurrence
    let lastIdx = -1;
    let match;
    const re = new RegExp(pattern.source, pattern.flags);
    while ((match = re.exec(result)) !== null) {
      lastIdx = match.index;
      if (!pattern.global) break;
    }
    if (lastIdx === -1) return result;

    const start = lastIdx;
    let depth = 0, end = start, opened = false;
    for (let i = start; i < result.length; i++) {
      if (result[i] === '{') { depth++; opened = true; }
      if (result[i] === '}') { depth--; }
      if (opened && depth === 0) { end = i + 1; break; }
    }
    return result.slice(0, start) + result.slice(end);
  }

  // Remove semantic :root (second one) and .dark
  // Count :root blocks — if more than 1, remove the last one
  const rootMatches = [...css.matchAll(/:root\\s*\\{/g)];
  if (rootMatches.length >= 2) {
    // Remove last :root block (semantic tokens)
    const lastRoot = rootMatches[rootMatches.length - 1];
    let depth = 0, end = lastRoot.index, opened = false;
    for (let i = lastRoot.index; i < css.length; i++) {
      if (css[i] === '{') { depth++; opened = true; }
      if (css[i] === '}') { depth--; }
      if (opened && depth === 0) { end = i + 1; break; }
    }
    css = css.slice(0, lastRoot.index) + css.slice(end);
  }

  // Remove .dark block
  css = removeBlock(css, /\\.dark\\s*\\{/);

  // Append new semantic blocks
  css = css.trimEnd() + '\\n\\n' +
    '/* Semantic tokens (synced from DesignSync) */\\n' +
    ':root {\\n' + lightVars + '\\n}\\n\\n' +
    '.dark {\\n' + darkVars + '\\n}\\n';

  fs.writeFileSync(globalsPath, css);
  console.log('  [2/3] Tokens updated in ' + globalsPath);

  // 3. Update .cursorrules and CLAUDE.md
  console.log('  [3/3] Updating AI rules...');
  try {
    const rulesText = await fetchText(RULES_URL);
    if (rulesText && !rulesText.trim().startsWith('<')) {
      if (fs.existsSync('.cursorrules')) fs.writeFileSync('.cursorrules', rulesText);
      if (fs.existsSync('CLAUDE.md')) fs.writeFileSync('CLAUDE.md', rulesText);
      if (fs.existsSync('.windsurfrules')) fs.writeFileSync('.windsurfrules', rulesText);
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
