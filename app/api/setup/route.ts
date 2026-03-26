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
    console.log('  [1/6] shadcn not initialized — running init...');
    try {
      execSync('npx -y shadcn@latest init -y -d', { stdio: 'inherit' });
    } catch (e) {
      console.error('  [ERROR] shadcn init failed. Please run "npx shadcn@latest init" manually first.');
      process.exit(1);
    }
  } else {
    console.log('  [1/6] shadcn project detected');
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

  console.log('  [2/6] Found ' + globalsPath + ' — cleaning existing theme...');

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
  console.log('  [3/6] Installing DesignSync (tokens + components)...');
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
    console.log('  [3.5/6] Tailwind v3 detected — patching tailwind.config...');

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
  console.log('  [4/6] Generating AI rule files...');

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

  // ── Step 5: Migrate existing code ─────────────────────────────
  console.log('');
  console.log('  [5/6] Migrating existing code to DesignSync tokens...');

  var CLASS_MAP = {
    'bg-white': 'bg-background', 'bg-gray-50': 'bg-background', 'bg-slate-50': 'bg-background',
    'bg-[#fafafa]': 'bg-background', 'bg-[#fff]': 'bg-background',
    'bg-gray-100': 'bg-muted', 'bg-slate-100': 'bg-muted', 'bg-gray-200': 'bg-muted',
    'bg-blue-600': 'bg-primary', 'bg-blue-700': 'bg-primary/90', 'bg-indigo-600': 'bg-primary',
    'bg-red-600': 'bg-destructive', 'bg-red-500': 'bg-destructive',
    'bg-blue-50': 'bg-accent', 'bg-indigo-50': 'bg-accent',
    'bg-gray-900': 'bg-foreground', 'bg-[#111]': 'bg-foreground', 'bg-[#0a0a0a]': 'bg-foreground',
    'text-gray-900': 'text-foreground', 'text-gray-800': 'text-foreground',
    'text-[#111]': 'text-foreground', 'text-black': 'text-foreground',
    'text-gray-700': 'text-foreground', 'text-gray-600': 'text-muted-foreground',
    'text-gray-500': 'text-muted-foreground', 'text-gray-400': 'text-muted-foreground',
    'text-white': 'text-primary-foreground',
    'text-blue-600': 'text-primary', 'text-blue-700': 'text-primary',
    'text-red-600': 'text-destructive', 'text-red-500': 'text-destructive',
    'border-gray-200': 'border-border', 'border-gray-100': 'border-border',
    'border-gray-300': 'border-input',
    'border-[#e5e5e5]': 'border-border', 'border-[#ddd]': 'border-input', 'border-[#eee]': 'border-border',
    'hover:bg-gray-50': 'hover:bg-accent', 'hover:bg-gray-100': 'hover:bg-accent',
    'hover:bg-blue-700': 'hover:bg-primary/90', 'hover:bg-red-600': 'hover:bg-destructive/90',
    'hover:text-gray-900': 'hover:text-foreground', 'hover:text-gray-700': 'hover:text-foreground',
    'rounded-xl': 'rounded-[var(--ds-card-radius)]', 'rounded-lg': 'rounded-[var(--ds-card-radius)]',
    'rounded-md': 'rounded-[var(--ds-element-radius)]', 'rounded-sm': 'rounded-[var(--ds-element-radius)]',
    'p-6': 'p-[var(--ds-card-padding)]', 'p-5': 'p-[var(--ds-card-padding)]',
    'p-4': 'p-[var(--ds-card-padding)]',
    'px-6': 'px-[var(--ds-card-padding)]', 'px-5': 'px-[var(--ds-card-padding)]',
    'py-6': 'py-[var(--ds-card-padding)]', 'py-5': 'py-[var(--ds-card-padding)]',
    'gap-6': 'gap-[var(--ds-section-gap)]', 'gap-5': 'gap-[var(--ds-section-gap)]',
    'gap-4': 'gap-[var(--ds-section-gap)]', 'gap-3': 'gap-[var(--ds-internal-gap)]',
    'space-y-6': 'space-y-[var(--ds-section-gap)]', 'space-y-5': 'space-y-[var(--ds-section-gap)]',
    'space-y-4': 'space-y-[var(--ds-section-gap)]', 'space-y-3': 'space-y-[var(--ds-internal-gap)]',
    'h-10': 'h-[var(--ds-input-h)]', 'h-9': 'h-[var(--ds-button-h-default)]',
    'h-8': 'h-[var(--ds-button-h-sm)]',
  };

  function escapeRegex(s) { return s.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&'); }

  function replaceClasses(classStr) {
    var result = classStr;
    for (var from in CLASS_MAP) {
      var to = CLASS_MAP[from];
      var regex = new RegExp('(^|\\\\s)' + escapeRegex(from) + '($|\\\\s)', 'g');
      result = result.replace(regex, '$1' + to + '$2');
    }
    return result;
  }

  function findSourceFiles(dir) {
    var results = [];
    try {
      var entries = fs.readdirSync(dir, { withFileTypes: true });
      for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        var full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (['node_modules', '.next', '.git', 'dist', 'build'].indexOf(entry.name) >= 0) continue;
          if (full.includes(path.join('components', 'ui'))) continue;
          results = results.concat(findSourceFiles(full));
        } else if (/\\.(tsx|jsx)$/.test(entry.name)) {
          if (!full.includes(path.join('components', 'ui'))) {
            results.push(full);
          }
        }
      }
    } catch (e) { /* permission error, skip */ }
    return results;
  }

  var sourceFiles = findSourceFiles('.');
  var migratedCount = 0;

  // className="..." pattern — matches both className="..." and className={'...'} and className={\\x60...\\x60}
  var classNameRegex = /className\\s*=\\s*(?:"([^"]+)"|'([^']+)'|\\{\\s*"([^"]+)"\\s*\\}|\\{\\s*'([^']+)'\\s*\\}|\\{\\s*\\x60([^\\x60]+)\\x60\\s*\\})/g;

  for (var fi = 0; fi < sourceFiles.length; fi++) {
    try {
      var content = fs.readFileSync(sourceFiles[fi], 'utf-8');
      var changed = false;
      var newContent = content.replace(classNameRegex, function(match) {
        var replaced = match;
        for (var from in CLASS_MAP) {
          var to = CLASS_MAP[from];
          // Replace whole-word class occurrences
          var regex = new RegExp('(\\\\s|"|\'|\\x60)' + escapeRegex(from) + '(\\\\s|"|\'|\\x60)', 'g');
          var prev = replaced;
          replaced = replaced.replace(regex, '$1' + to + '$2');
          if (replaced !== prev) changed = true;
        }
        return replaced;
      });
      if (changed) {
        fs.writeFileSync(sourceFiles[fi], newContent);
        migratedCount++;
      }
    } catch (e) { /* skip unreadable files */ }
  }

  console.log('         Scanned ' + sourceFiles.length + ' files, migrated ' + migratedCount + ' files');

  // ── Done ────────────────────────────────────────────────────────
  console.log('');
  console.log('  [6/6] Done!');
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
  if (migratedCount > 0) {
    console.log('  Migrated ' + migratedCount + ' files: hardcoded colors → semantic tokens');
  }
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
