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
    console.log('  [1/7] shadcn not initialized — running init...');
    try {
      execSync('npx -y shadcn@latest init -y -d', { stdio: 'inherit' });
    } catch (e) {
      console.error('  [ERROR] shadcn init failed. Please run "npx shadcn@latest init" manually first.');
      process.exit(1);
    }
  } else {
    console.log('  [1/7] shadcn project detected');
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

  console.log('  [2/7] Found ' + globalsPath + ' — cleaning existing theme...');

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
  console.log('  [3/7] Installing DesignSync (tokens + components)...');
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

  // Parse icon library package from rules (pre-fetch)
  var iconPkg = 'lucide-react';
  try {
    var _iconRules = await fetchText('${rulesUrl}');
    if (_iconRules && !_iconRules.trim().startsWith('<')) {
      var _pkgMatch = _iconRules.match(/\\(\\s*.([a-z@][a-z0-9\\-/@]*).\\s*\\)\\s*\\u{C544}\\u{C774}\\u{CF58}/u);
      if (_pkgMatch) iconPkg = _pkgMatch[1];
    }
  } catch (_e) { /* fallback to lucide-react */ }

  // Install additional peer dependencies
  console.log('         Installing peer dependencies (framer-motion, ' + iconPkg + ')...');
  try {
    // Detect package manager
    var pm = fs.existsSync('pnpm-lock.yaml') ? 'pnpm add' : fs.existsSync('yarn.lock') ? 'yarn add' : 'npm install --save';
    execSync(pm + ' framer-motion ' + iconPkg, { stdio: 'pipe' });
    console.log('         Peer dependencies installed');
  } catch (e) {
    console.log('         [WARN] Could not auto-install framer-motion/' + iconPkg + '. Run manually:');
    console.log('         npm install framer-motion ' + iconPkg);
  }

  // ── Step 3b: Inject missing CSS variables ──────────────────────
  // shadcn add only writes standard shadcn keys (primary, background, etc.)
  // Custom keys (brand-*, neutral-*, ds-*, radius-*, etc.) are ignored.
  // Fetch the full token JSON and inject any missing variables.
  console.log('         Injecting custom CSS variables...');
  try {
    var tokensData = JSON.parse(await fetchText('${tokensUrl}'.replace('designsync-all', 'designsync-tokens')));
    var cssAfterShadcn = fs.readFileSync(globalsPath, 'utf-8');

    // Collect vars that shadcn didn't write
    var lightMissing = [];
    var darkMissing = [];

    if (tokensData.cssVars) {
      var lightVars = tokensData.cssVars.light || {};
      var darkVars = tokensData.cssVars.dark || {};

      for (var key in lightVars) {
        if (!cssAfterShadcn.includes('--' + key + ':')) {
          lightMissing.push('    --' + key + ': ' + lightVars[key] + ';');
        }
      }
      for (var key in darkVars) {
        if (!cssAfterShadcn.includes('--' + key + ':')) {
          darkMissing.push('    --' + key + ': ' + darkVars[key] + ';');
        }
      }
    }

    if (lightMissing.length > 0) {
      // Inject into first :root block
      var rootEnd = cssAfterShadcn.indexOf('}');
      if (rootEnd > 0) {
        cssAfterShadcn = cssAfterShadcn.slice(0, rootEnd) + lightMissing.join('\\n') + '\\n' + cssAfterShadcn.slice(rootEnd);
      }
    }

    if (darkMissing.length > 0) {
      // Inject into .dark block
      var darkStart = cssAfterShadcn.indexOf('.dark');
      if (darkStart > 0) {
        var darkBraceEnd = cssAfterShadcn.indexOf('}', darkStart);
        if (darkBraceEnd > 0) {
          cssAfterShadcn = cssAfterShadcn.slice(0, darkBraceEnd) + darkMissing.join('\\n') + '\\n' + cssAfterShadcn.slice(darkBraceEnd);
        }
      }
    }

    fs.writeFileSync(globalsPath, cssAfterShadcn);
    console.log('         Injected ' + lightMissing.length + ' light + ' + darkMissing.length + ' dark variables');
  } catch (e) {
    console.log('         [WARN] Could not inject custom variables: ' + (e.message || e));
  }

  // ── Step 4b: Tailwind v3 compatibility ──────────────────────────
  // If @tailwind directives exist (v3), add color mappings to tailwind.config
  var cssContent = fs.readFileSync(globalsPath, 'utf-8');
  var isV3 = cssContent.includes('@tailwind base');

  if (isV3) {
    console.log('  [3.5/7] Tailwind v3 detected — patching tailwind.config...');

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
  console.log('  [4/7] Generating AI rule files...');

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
      '**These rules apply permanently to ALL code written in this conversation.**',
      '',
      '## 1. Color Tokens (MUST use)',
      '- Backgrounds: bg-background, bg-card, bg-muted, bg-primary, bg-secondary, bg-accent, bg-popover, bg-destructive',
      '- Text: text-foreground, text-muted-foreground, text-primary-foreground, text-card-foreground, text-accent-foreground',
      '- Borders: border-border, border-input',
      '- Focus: ring-ring, focus-visible:ring-ring/50',
      '- Sidebar: bg-sidebar, text-sidebar-foreground, border-sidebar-border',
      '- Charts: var(--chart-1) through var(--chart-5)',
      '- Primitive scales (only when semantic tokens are insufficient): --{brand|neutral|error|success|warning}-{50..900}',
      '',
      '## 2. Font Tokens',
      '- Family: var(--font-sans) for body, var(--font-mono) for code. Do NOT add next/font or Google Fonts links.',
      '- Sizes: text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl, text-4xl, text-5xl',
      '- Weights: font-normal(400), font-medium(500), font-semibold(600), font-bold(700), font-extrabold(800)',
      '- Line height: leading-tight, leading-normal, leading-loose',
      '',
      '## 3. Spacing Tokens',
      '- Scale: gap-1(4px), gap-2(8px), gap-3(12px), gap-4(16px), gap-6(24px), gap-8(32px), gap-10(40px), gap-12(48px)',
      '- FORBIDDEN: gap-[13px], p-[20px] — use token scale values only',
      '',
      '## 4. Density / Style Presets (CRITICAL)',
      '**All sizing/radius/padding is controlled by CSS variables. New components MUST use these.**',
      '',
      '### Radius — NEVER use rounded-md, rounded-lg, rounded-xl directly:',
      '- Buttons/badges/toggles: rounded-[var(--ds-button-radius)]',
      '- Menus/sidebar/skeleton/tabs/tooltip: rounded-[var(--ds-element-radius)]',
      '- Inputs/select/textarea: rounded-[var(--ds-input-radius)]',
      '- Cards/popover/dropdown/alert: rounded-[var(--ds-card-radius)]',
      '- Dialog/sheet/drawer: rounded-[var(--ds-dialog-radius)]',
      '',
      '### Height — NEVER use h-8, h-9, h-10 directly:',
      '- Button default: h-[var(--ds-button-h-default)], sm: h-[var(--ds-button-h-sm)], lg: h-[var(--ds-button-h-lg)]',
      '- Input: h-[var(--ds-input-h)]',
      '',
      '### Padding — NEVER use p-6, p-4, gap-4 for structural padding:',
      '- Card/dialog/sheet: p-[var(--ds-card-padding)]',
      '- Section gap: gap-[var(--ds-section-gap)]',
      '- Internal gap: gap-[var(--ds-internal-gap)]',
      '- Focus ring: focus-visible:ring-[var(--ds-focus-ring-width)]',
      '',
      '## 5. Top 20 Components (import from @/components/ui/)',
      '- Button: <Button variant="default|secondary|outline|ghost|destructive|link" size="sm|default|lg|icon">',
      '- Card: <Card> <CardHeader> <CardTitle> <CardDescription> <CardContent> <CardFooter>',
      '- Input: <Input placeholder="..." />',
      '- Textarea: <Textarea />',
      '- Select: <Select><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="a">A</SelectItem></SelectContent></Select>',
      '- Dialog: <Dialog><DialogTrigger asChild><Button>Open</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Title</DialogTitle></DialogHeader></DialogContent></Dialog>',
      '- Sheet: <Sheet><SheetTrigger asChild><Button>Open</Button></SheetTrigger><SheetContent><SheetHeader><SheetTitle>Title</SheetTitle></SheetHeader></SheetContent></Sheet>',
      '- Tabs: <Tabs defaultValue="t1"><TabsList><TabsTrigger value="t1">Tab</TabsTrigger></TabsList><TabsContent value="t1">Content</TabsContent></Tabs>',
      '- Table: <Table><TableHeader><TableRow><TableHead>Col</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>Val</TableCell></TableRow></TableBody></Table>',
      '- Badge: <Badge variant="default|secondary|outline|destructive">',
      '- Alert: <Alert variant="default|destructive"><AlertTitle>Title</AlertTitle><AlertDescription>Desc</AlertDescription></Alert>',
      '- DropdownMenu: <DropdownMenu><DropdownMenuTrigger><Button>Menu</Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem>Item</DropdownMenuItem></DropdownMenuContent></DropdownMenu>',
      '- Tooltip: <Tooltip><TooltipTrigger>Hover</TooltipTrigger><TooltipContent>Info</TooltipContent></Tooltip>',
      '- Typography: <TypographyH1> <TypographyH2> <TypographyH3> <TypographyH4> <TypographyP> <TypographyMuted> <TypographyLead> <TypographyCode>',
      '- Checkbox: <Checkbox />, Switch: <Switch />, Slider: <Slider />, RadioGroup: <RadioGroup>',
      '- Label: <Label>, Form: <Form>, Field: <Field> <FieldDescription> <FieldError>',
      '- Accordion: <Accordion><AccordionItem><AccordionTrigger>Q</AccordionTrigger><AccordionContent>A</AccordionContent></AccordionItem></Accordion>',
      '- Avatar: <Avatar><AvatarImage src="..." /><AvatarFallback>AB</AvatarFallback></Avatar>',
      '- Spinner: <Spinner size="sm|default|lg|xl" />',
      '- Empty: <Empty><EmptyIcon><Search /></EmptyIcon><EmptyTitle>No results</EmptyTitle><EmptyDescription>Try again</EmptyDescription></Empty>',
      '',
      '## 6. FORBIDDEN — Raw HTML Elements',
      '- <button> → <Button> (from @/components/ui/button)',
      '- <input> → <Input> (type="date" → <DatePicker>)',
      '- <textarea> → <Textarea>',
      '- <select> → <Select> or <NativeSelect>',
      '- <label> → <Label>',
      '- <table> → <Table> component',
      '- <h1>~<h6> → <TypographyH1>~<TypographyH4>',
      '- Custom modal div → <Dialog> or <Sheet>',
      '- Custom dropdown div → <DropdownMenu> or <Select>',
      '',
      '## 7. FORBIDDEN — Hardcoded Values',
      '- Colors: bg-blue-600, bg-[#1a1a1a], text-white, text-gray-500, bg-slate-100, style={{ color: "#fff" }}',
      '- Arbitrary sizes: text-[10px], h-[52px], w-[300px]',
      '- Hardcoded hex/rgb/hsl: #ffffff, rgb(0,0,0), hsl(0,0%,100%)',
      '- Arbitrary spacing: gap-[13px], p-[20px]',
      '- Direct radius: rounded-md, rounded-lg → use var(--ds-*-radius) instead',
      '- Direct height: h-9, h-10 → use var(--ds-button-h-default), var(--ds-input-h)',
      '- Direct structural padding: p-6, gap-4 → use var(--ds-card-padding), var(--ds-section-gap)',
      '- next/font or Google Fonts <link> tags',
      '',
      '## 8. Icon Library (Lucide)',
      'This project uses **lucide-react** for all icons.',
      '- import { Home, Settings, User, Search, Plus, X, Check } from "lucide-react"',
      '- Size: className="w-4 h-4" (default), "w-3.5 h-3.5" (small), "w-5 h-5" (large)',
      '- FORBIDDEN: @tabler/icons-react, @phosphor-icons/react, @remixicon/react, react-icons, heroicons, raw SVG, emoji as icons',
      '- Use icons actively in buttons, menus, navigation, lists, status indicators',
      '',
      '## 9. Dark Mode',
      'Do NOT manually branch for dark mode. Semantic tokens (bg-background, text-foreground) auto-switch.',
      'NEVER use dark: prefix for colors (e.g. dark:bg-gray-900 is forbidden).',
      '',
      '## 10. Custom UI',
      'Even for components not in DesignSync, ALWAYS use semantic tokens for colors, fonts, spacing, radius.',
      'If a specific color is needed, reference CSS variables: bg-[var(--brand-500)], text-[var(--success-600)].',
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

  // ── Step 5b: Install ESLint plugin ─────────────────────────────
  console.log('');
  console.log('  [5/7] Installing DesignSync ESLint plugin...');

  try {
    var eslintPluginUrl = '${CDN}/designsync-eslint.js';
    var eslintPluginCode = await fetchText(eslintPluginUrl);

    if (eslintPluginCode && !eslintPluginCode.trim().startsWith('<')) {
      fs.writeFileSync('designsync-eslint.js', eslintPluginCode);
      console.log('         Downloaded designsync-eslint.js');

      // Try to patch eslint.config.mjs
      var eslintConfigPath = ['eslint.config.mjs', 'eslint.config.js', 'eslint.config.ts']
        .find(function(f) { return fs.existsSync(f); });

      if (eslintConfigPath) {
        var eslintConfig = fs.readFileSync(eslintConfigPath, 'utf-8');
        if (!eslintConfig.includes('designsync-eslint')) {
          // Add import at top
          var importLine = "import designsync from './designsync-eslint.js';";
          // For .ts files use require-style or keep import
          eslintConfig = importLine + '\\n' + eslintConfig;

          // Add to the exported array — find the default export array and append
          // Pattern: export default [...]; or export default tseslint.config(...);
          if (eslintConfig.includes('export default [')) {
            eslintConfig = eslintConfig.replace(
              /export default \\[/,
              'export default [\\n  designsync,'
            );
          } else if (eslintConfig.match(/export default [a-zA-Z]+\\.config\\(/)) {
            // tseslint.config(...) pattern — add designsync as first arg
            eslintConfig = eslintConfig.replace(
              /(export default [a-zA-Z]+\\.config\\()/,
              '$1\\n  designsync,'
            );
          } else {
            // Fallback: just log instructions
            console.log('         [NOTE] Could not auto-patch ' + eslintConfigPath);
            console.log('         Add manually: import designsync from \\'./designsync-eslint.js\\';');
            console.log('         Then add designsync to your config array.');
          }
          fs.writeFileSync(eslintConfigPath, eslintConfig);
          console.log('         Patched ' + eslintConfigPath + ' with DesignSync rules');
        } else {
          console.log('         ESLint config already includes DesignSync');
        }
      } else {
        console.log('         No eslint.config.mjs found — creating one...');
        var newEslintConfig = [
          "import designsync from './designsync-eslint.js';",
          "",
          "export default [",
          "  designsync,",
          "];",
          "",
        ].join('\\n');
        fs.writeFileSync('eslint.config.mjs', newEslintConfig);
        console.log('         Created eslint.config.mjs with DesignSync rules');
      }
    } else {
      console.log('         [WARN] Could not download ESLint plugin (got HTML response). Skipping.');
    }
  } catch (e) {
    console.log('         [WARN] ESLint plugin setup failed: ' + (e.message || e) + '. Skipping.');
  }

  // ── Step 6: Migrate existing code ─────────────────────────────
  console.log('');
  console.log('  [6/7] Migrating existing code to DesignSync tokens...');

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
          var regex = new RegExp('(\\\\s|"|\\x27|\\x60)' + escapeRegex(from) + '(\\\\s|"|\\x27|\\x60)', 'g');
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

  // ── Element replacement pass ──────────────────────────────────
  var ELEMENT_REPLACEMENTS = [
    { from: 'button', to: 'Button', importPath: '@/components/ui/button' },
    { from: 'input', to: 'Input', importPath: '@/components/ui/input' },
    { from: 'textarea', to: 'Textarea', importPath: '@/components/ui/textarea' },
    { from: 'select', to: 'NativeSelect', importPath: '@/components/ui/native-select' },
    { from: 'label', to: 'Label', importPath: '@/components/ui/label' },
  ];

  var elementMigratedCount = 0;
  for (var fi = 0; fi < sourceFiles.length; fi++) {
    var content = fs.readFileSync(sourceFiles[fi], 'utf-8');
    var modified = false;
    var importsNeeded = [];

    for (var ei = 0; ei < ELEMENT_REPLACEMENTS.length; ei++) {
      var el = ELEMENT_REPLACEMENTS[ei];
      var openRegex = new RegExp('<' + el.from + '(\\\\s|>|/)', 'g');
      var closeRegex = new RegExp('</' + el.from + '>', 'g');

      if (openRegex.test(content)) {
        content = content.replace(new RegExp('<' + el.from + '(\\\\s|>)', 'g'), '<' + el.to + '$1');
        content = content.replace(new RegExp('<' + el.from + '/', 'g'), '<' + el.to + '/');
        content = content.replace(closeRegex, '</' + el.to + '>');
        // Strip className from replaced elements (component handles its own styling)
        if (el.from !== 'label') {
          content = content.replace(new RegExp('<' + el.to + '\\\\s+className="[^"]*"', 'g'), '<' + el.to);
          content = content.replace(new RegExp('<' + el.to + '\\\\s+className=\\\\{[^}]*\\\\}', 'g'), '<' + el.to);
        }
        importsNeeded.push(el);
        modified = true;
      }
    }

    if (modified) {
      for (var ii = 0; ii < importsNeeded.length; ii++) {
        var imp = importsNeeded[ii];
        if (!content.includes('from \\x27' + imp.importPath + '\\x27') && !content.includes('from "' + imp.importPath + '"')) {
          content = 'import { ' + imp.to + ' } from "' + imp.importPath + '";\\n' + content;
        }
      }
      fs.writeFileSync(sourceFiles[fi], content);
      elementMigratedCount++;
    }
  }
  console.log('         Element replacement: ' + elementMigratedCount + ' files updated');

  // ── Context-aware radius replacement ──────────────────────────
  var radiusMigratedCount = 0;
  for (var fi = 0; fi < sourceFiles.length; fi++) {
    var content = fs.readFileSync(sourceFiles[fi], 'utf-8');
    var changed = false;

    var lines = content.split('\\n');
    for (var li = 0; li < lines.length; li++) {
      var line = lines[li];
      var newLine = line;

      if (line.includes('rounded-md') || line.includes('rounded-lg') || line.includes('rounded-xl') || line.includes('rounded-sm')) {
        var radius = 'var(--ds-element-radius)';
        if (/[<.](?:button|Button|btn)/i.test(line) || /bg-primary|variant/.test(line)) {
          radius = 'var(--ds-button-radius)';
        } else if (/[<.](?:input|Input|textarea|Textarea|select|Select)/i.test(line) || /border-input|placeholder/.test(line)) {
          radius = 'var(--ds-input-radius)';
        } else if (/[<.](?:Card|card|dialog|Dialog|sheet|Sheet|alert|Alert|popover|Popover)/i.test(line) || /shadow-|border-border/i.test(line)) {
          radius = 'var(--ds-card-radius)';
        }
        newLine = newLine.replace(/rounded-(?:sm|md|lg|xl)/g, 'rounded-[' + radius + ']');
      }

      if (newLine !== line) {
        lines[li] = newLine;
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(sourceFiles[fi], lines.join('\\n'));
      radiusMigratedCount++;
    }
  }
  console.log('         Context-aware radius: ' + radiusMigratedCount + ' files updated');

  // ── Done ────────────────────────────────────────────────────────
  console.log('');
  console.log('  [7/7] Done!');
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
  console.log('    - designsync-eslint.js (ESLint plugin — blocks hardcoded values)');
  console.log('');
  if (migratedCount > 0 || elementMigratedCount > 0 || radiusMigratedCount > 0) {
    console.log('  Migrated: ' + migratedCount + ' files (class tokens), ' + elementMigratedCount + ' files (element replacement), ' + radiusMigratedCount + ' files (radius tokens)');
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
