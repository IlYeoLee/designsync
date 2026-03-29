import { NextResponse } from "next/server";

const CDN = "https://designsync-omega.vercel.app";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dsSlug = searchParams.get("ds") || "";

  const tokensUrl = dsSlug
    ? `${CDN}/r/${dsSlug}/designsync-tokens.json`
    : `${CDN}/r/designsync-tokens.json`;
  const componentsUrl = dsSlug
    ? `${CDN}/r/${dsSlug}/designsync-all.json`
    : `${CDN}/r/designsync-all.json`;
  const rulesUrl = dsSlug
    ? `${CDN}/api/rules?ds=${dsSlug}`
    : `${CDN}/api/rules`;

  const script = `#!/usr/bin/env node
'use strict';

const fs = require('fs');
const { execSync } = require('child_process');
const https = require('https');

const TOKENS_URL = '${tokensUrl}';
const COMPONENTS_URL = '${componentsUrl}';
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

  console.log('  [1/5] Found ' + globalsPath);

  // 2. Fetch latest tokens
  console.log('  [2/5] Fetching latest tokens...');
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
  console.log('  [3/5] Updating design tokens...');
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

  // Inject @theme inline mappings for typography/shadow tokens
  if (css.includes('@theme inline')) {
    var themeEnd = css.indexOf('}', css.indexOf('@theme inline'));
    if (themeEnd > 0) {
      var extraMappings = [];
      var fontSizes = ['xs','sm','base','lg','xl','2xl','3xl','4xl','5xl'];
      for (var fi = 0; fi < fontSizes.length; fi++) {
        var fs_key = '--text-' + fontSizes[fi];
        if (!css.includes(fs_key + ':')) {
          extraMappings.push('  ' + fs_key + ': var(--font-size-' + fontSizes[fi] + ');');
        }
      }
      var weights = ['normal','medium','semibold','bold','extrabold'];
      for (var wi = 0; wi < weights.length; wi++) {
        var fw_key = '--font-weight-' + weights[wi];
        if (css.indexOf(fw_key + ':', css.indexOf('@theme')) === -1) {
          extraMappings.push('  ' + fw_key + ': var(--font-weight-' + weights[wi] + ');');
        }
      }
      var leadings = {tight:'tight',snug:'snug',normal:'normal',relaxed:'relaxed',loose:'loose'};
      for (var lk in leadings) {
        var lh_key = '--leading-' + lk;
        if (!css.includes(lh_key + ':')) {
          extraMappings.push('  ' + lh_key + ': var(--line-height-' + leadings[lk] + ');');
        }
      }
      var shadows = ['sm','md','lg'];
      for (var si = 0; si < shadows.length; si++) {
        var sh_key = '--shadow-' + shadows[si];
        if (!css.includes(sh_key + ':')) {
          extraMappings.push('  ' + sh_key + ': var(--ds-shadow-' + shadows[si] + ');');
        }
      }
      if (extraMappings.length > 0) {
        css = css.slice(0, themeEnd) + '\\n' + extraMappings.join('\\n') + '\\n' + css.slice(themeEnd);
      }
    }
  }

  fs.writeFileSync(globalsPath, css);
  console.log('  [3/5] Tokens updated in ' + globalsPath);

  // 4. Create/update AI rules files
  console.log('  [4/5] Updating AI rules...');
  try {
    const rulesText = await fetchText(RULES_URL);
    if (rulesText && !rulesText.trim().startsWith('<')) {
      // Always create these files (not just update existing ones)
      fs.writeFileSync('.cursorrules', rulesText);
      fs.writeFileSync('CLAUDE.md', rulesText);
      fs.writeFileSync('.windsurfrules', rulesText);
      console.log('  [4/5] AI rules written to .cursorrules, CLAUDE.md, .windsurfrules');
    }
  } catch {
    console.log('  [WARN] AI rules update skipped.');
  }

  // 5. Update components
  console.log('  [5/5] Updating components...');
  try {
    execSync('npx -y shadcn@latest add -o -y ' + COMPONENTS_URL, { stdio: 'inherit' });
    console.log('         Components updated');
  } catch (e) {
    console.log('         [WARN] Component update skipped');
  }

  console.log('');
  console.log('  Done! Design system synced (tokens + rules + components).');
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
