import { NextResponse } from "next/server";

const CDN = "https://designsync-omega.vercel.app";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dsSlug = searchParams.get("ds") || "";

  // If slug provided, use dynamic URLs; otherwise fallback to static
  const tokensUrl = dsSlug
    ? `${CDN}/r/${dsSlug}/designsync-all.json`
    : `${CDN}/r/designsync-all.json`;
  const rulesUrl = dsSlug
    ? `${CDN}/api/rules?ds=${dsSlug}`
    : `${CDN}/api/rules`;

  const script = `#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');

const CDN = '${CDN}';

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? require('https') : require('http');
    mod.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchText(res.headers.location).then(resolve, reject);
      }
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

(async () => {
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
    console.log('  [1/5] shadcn not initialized — running init...');
    try {
      execSync('npx -y shadcn@latest init -y -d', { stdio: 'inherit' });
    } catch (e) {
      console.error('  [ERROR] shadcn init failed. Please run "npx shadcn@latest init" manually first.');
      process.exit(1);
    }
  } else {
    console.log('  [1/5] shadcn project detected');
  }

  // ── Step 3: Find and clean globals.css ──────────────────────────
  const candidates = [
    'app/globals.css',
    'src/app/globals.css',
    'styles/globals.css',
    'src/styles/globals.css',
  ];
  const globalsPath = candidates.find((c) => fs.existsSync(c));

  if (!globalsPath) {
    console.error('  [ERROR] globals.css not found in standard locations.');
    process.exit(1);
  }

  console.log('  [2/5] Found ' + globalsPath + ' — cleaning existing theme...');

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
      result = result.slice(0, start) + result.slice(end);
    }
  }

  // Remove theme blocks (order matters)
  css = removeAllBlocks(css, /@theme\\s+inline\\s*\\{/);
  css = removeAllBlocks(css, /:root\\s*\\{/);
  css = removeAllBlocks(css, /\\.dark\\s*\\{/);
  css = removeAllBlocks(css, /@layer\\s+base\\s*\\{/);

  // Remove @custom-variant dark line (shadcn add will re-add it)
  css = css.replace(/@custom-variant\\s+dark\\s+[^;]+;/g, '');

  // Keep Tailwind v3 directives if present — shadcn add needs them
  // (only remove if @import "tailwindcss" exists — means v4)

  // Clean up excessive blank lines
  css = css.replace(/\\n{3,}/g, '\\n\\n').trim();

  fs.writeFileSync(globalsPath, css + '\\n');
  console.log('         Theme cleaned (backup: ' + globalsPath + '.bak)');

  // ── Step 4: Install DesignSync ──────────────────────────────────
  console.log('  [3/5] Installing DesignSync (tokens + components)...');
  console.log('');
  try {
    execSync(
      'npx -y shadcn@latest add -o -y ' + '${tokensUrl}',
      { stdio: 'inherit' }
    );
  } catch (e) {
    console.error('');
    console.error('  [ERROR] shadcn add failed. Check the output above.');
    console.error('  Your original globals.css is backed up at: ' + globalsPath + '.bak');
    process.exit(1);
  }

  // Install additional peer dependencies
  try {
    execSync('npm install framer-motion --save 2>/dev/null || npx pnpm add framer-motion 2>/dev/null || true', { stdio: 'pipe' });
  } catch { /* ignore */ }

  // ── Step 4b: Tailwind v3 compatibility ──────────────────────────
  // If @tailwind directives exist (v3), add color mappings to tailwind.config
  var cssContent = fs.readFileSync(globalsPath, 'utf-8');
  var isV3 = cssContent.includes('@tailwind base');

  if (isV3) {
    console.log('  [3.5/5] Tailwind v3 detected — patching tailwind.config...');

    var configPath = ['tailwind.config.ts', 'tailwind.config.js', 'tailwind.config.mjs']
      .find(function(f) { return fs.existsSync(f); });

    if (configPath) {
      var configContent = fs.readFileSync(configPath, 'utf-8');

      if (!configContent.includes('--primary')) {
        var colorMapping = [
          '    extend: {',
          '      colors: {',
          '        background: "var(--background)",',
          '        foreground: "var(--foreground)",',
          '        card: { DEFAULT: "var(--card)", foreground: "var(--card-foreground)" },',
          '        popover: { DEFAULT: "var(--popover)", foreground: "var(--popover-foreground)" },',
          '        primary: { DEFAULT: "var(--primary)", foreground: "var(--primary-foreground)" },',
          '        secondary: { DEFAULT: "var(--secondary)", foreground: "var(--secondary-foreground)" },',
          '        muted: { DEFAULT: "var(--muted)", foreground: "var(--muted-foreground)" },',
          '        accent: { DEFAULT: "var(--accent)", foreground: "var(--accent-foreground)" },',
          '        destructive: { DEFAULT: "var(--destructive)", foreground: "var(--destructive-foreground)" },',
          '        border: "var(--border)",',
          '        input: "var(--input)",',
          '        ring: "var(--ring)",',
          '        sidebar: {',
          '          DEFAULT: "var(--sidebar)",',
          '          foreground: "var(--sidebar-foreground)",',
          '          primary: "var(--sidebar-primary)",',
          '          "primary-foreground": "var(--sidebar-primary-foreground)",',
          '          accent: "var(--sidebar-accent)",',
          '          "accent-foreground": "var(--sidebar-accent-foreground)",',
          '          border: "var(--sidebar-border)",',
          '          ring: "var(--sidebar-ring)",',
          '        },',
          '        chart: { 1: "var(--chart-1)", 2: "var(--chart-2)", 3: "var(--chart-3)", 4: "var(--chart-4)", 5: "var(--chart-5)" },',
          '      },',
          '      borderRadius: {',
          '        lg: "var(--radius)",',
          '        md: "calc(var(--radius) - 2px)",',
          '        sm: "calc(var(--radius) - 4px)",',
          '      },',
          '    }',
        ].join('\\n');

        configContent = configContent.replace(
          /extend:\\s*\\{[^}]*\\}/,
          colorMapping
        );

        fs.writeFileSync(configPath, configContent);
        console.log('         Patched ' + configPath + ' with DesignSync color mappings');
      }
    }
  }

  // ── Step 5: Generate AI rule files ──────────────────────────────
  console.log('');
  console.log('  [4/5] Generating AI rule files...');

  let rulesText = '';
  try {
    rulesText = await fetchText('${rulesUrl}');
    // Guard against HTML error pages (e.g. 404/500 rendered as HTML)
    if (rulesText.trim().startsWith('<') || rulesText.trim().startsWith('<!')) {
      throw new Error('Received HTML instead of rules text');
    }
  } catch (e) {
    console.error('  [WARN] Could not fetch rules from CDN (' + (e.message || e) + '). Using embedded fallback.');
    rulesText = [
      '# DesignSync — AI Coding Rules',
      '# Re-run the setup command to regenerate this file with full rules.',
      '',
      '**All code in this project must follow the DesignSync design system.**',
      '',
      '## Tokens',
      'Use semantic tokens: bg-background, bg-primary, text-foreground, border-border',
      'Never hardcode colors: bg-blue-600, bg-[#1a1a1a], text-white, style={{ color: "#fff" }}',
      'Font sizes: text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl, text-4xl',
      'Font weights: font-normal, font-medium, font-bold (only these three)',
      'Border radius: rounded-sm, rounded-md, rounded-lg, rounded-xl',
      '',
      '## Components',
      'Import from @/components/ui/ — use Button, Card, Input, Dialog, Sheet, Tabs, etc.',
      'Use <TypographyH1> instead of <h1 className="...">, <TypographyP> instead of raw <p>.',
      'Use size prop for Button, never className for dimensions.',
      '',
      '## Custom UI',
      'Even for components not in DesignSync, always use the tokens above for colors, fonts, spacing, radius.',
      'Never use dark: prefix for colors — semantic tokens handle light/dark automatically.',
      '',
    ].join('\\n');
  }

  // .cursorrules
  if (fs.existsSync('.cursorrules')) {
    fs.writeFileSync('.cursorrules.bak', fs.readFileSync('.cursorrules', 'utf-8'));
  }
  fs.writeFileSync('.cursorrules', rulesText);
  console.log('         Created .cursorrules');

  // CLAUDE.md
  if (fs.existsSync('CLAUDE.md')) {
    fs.writeFileSync('CLAUDE.md.bak', fs.readFileSync('CLAUDE.md', 'utf-8'));
  }
  fs.writeFileSync('CLAUDE.md', rulesText);
  console.log('         Created CLAUDE.md');

  // .windsurfrules (Windsurf)
  if (fs.existsSync('.windsurfrules')) {
    fs.writeFileSync('.windsurfrules.bak', fs.readFileSync('.windsurfrules', 'utf-8'));
  }
  fs.writeFileSync('.windsurfrules', rulesText);
  console.log('         Created .windsurfrules');

  // ── Done ────────────────────────────────────────────────────────
  console.log('');
  console.log('  [5/5] Done!');
  console.log('');
  console.log('  DesignSync has been applied to your project.');
  console.log('  Restart your dev server to see the changes.');
  console.log('');
  console.log('  Generated files:');
  console.log('    - ' + globalsPath + '     (design tokens + theme)');
  console.log('    - components/ui/*    (61 UI components)');
  console.log('    - .cursorrules       (Cursor AI rules)');
  console.log('    - CLAUDE.md          (Claude Code AI rules)');
  console.log('    - .windsurfrules     (Windsurf AI rules)');
  console.log('');
  console.log('  Every new AI conversation will automatically load these rules.');
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
