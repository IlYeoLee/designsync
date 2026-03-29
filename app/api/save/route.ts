import { NextRequest, NextResponse } from "next/server";
import { GOOGLE_FONTS, KOREAN_FONTS } from "@/lib/fonts";
import { generateRules } from "@/lib/rules";
import { readableColor } from "colorizr";
import { oklchToHex } from "@/lib/color";

const CDN_BASE = "https://designsync-omega.vercel.app";

function getHeaders() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN env var is not set");
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
    "Content-Type": "application/json",
  };
}

function getRepo() {
  const repo = process.env.GITHUB_REPO;
  if (!repo) throw new Error("GITHUB_REPO env var is not set");
  return repo;
}

/** GET /api/save — env var health check (values hidden) */
export async function GET() {
  return NextResponse.json({
    GITHUB_TOKEN: process.env.GITHUB_TOKEN ? "set" : "MISSING",
    GITHUB_REPO: process.env.GITHUB_REPO ?? "MISSING",
  });
}

/** Fetch a file from GitHub, returns { content, sha } or null if not found */
async function getGitHubFile(
  repo: string,
  headers: Record<string, string>,
  path: string
): Promise<{ content: string; sha: string } | null> {
  const url = `https://api.github.com/repos/${repo}/contents/${path}`;
  const res = await fetch(url, { headers });
  if (res.status === 404) return null;
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`GitHub GET ${path} failed (${res.status}): ${JSON.stringify(err)}`);
  }
  const data = await res.json();
  const content = Buffer.from(data.content, "base64").toString("utf-8");
  return { content, sha: data.sha };
}

/** Commit (create or update) a file on GitHub */
async function commitGitHubFile(
  repo: string,
  headers: Record<string, string>,
  path: string,
  content: string,
  message: string,
  sha: string | null
): Promise<void> {
  const url = `https://api.github.com/repos/${repo}/contents/${path}`;
  const body: Record<string, unknown> = {
    message,
    content: Buffer.from(content).toString("base64"),
  };
  if (sha) body.sha = sha;

  const res = await fetch(url, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`GitHub PUT ${path} failed (${res.status}): ${JSON.stringify(err)}`);
  }
}

function resolveToken(
  value: string,
  primitives: Record<string, string>
): string {
  if (!value.startsWith("var(")) return value;
  const varName = value.match(/var\(([^)]+)\)/)?.[1];
  if (!varName) return value;
  return primitives[varName] ?? value;
}

export async function POST(req: NextRequest) {
  try {
    // Resolve env vars inside handler — avoids module-init "Bearer undefined" bug
    const repo = getRepo();
    const headers = getHeaders();

    const body = await req.json();
    const {
      tokens,
      commitMessage = "chore: update design tokens",
    } = body;

    if (!tokens) {
      return NextResponse.json({ error: "Missing tokens" }, { status: 400 });
    }

    // 1. Flatten primitives for resolving var() references
    const flatPrimitives: Record<string, string> = {};
    const { brand, neutral, error, success, warning, radius } =
      tokens.primitives;

    for (const [step, val] of Object.entries(brand as Record<string, string>)) {
      flatPrimitives[`--brand-${step}`] = val;
    }
    for (const [step, val] of Object.entries(neutral as Record<string, string>)) {
      flatPrimitives[`--neutral-${step}`] = val;
    }
    for (const [step, val] of Object.entries(error as Record<string, string>)) {
      flatPrimitives[`--error-${step}`] = val;
    }
    for (const [step, val] of Object.entries(success as Record<string, string>)) {
      flatPrimitives[`--success-${step}`] = val;
    }
    for (const [step, val] of Object.entries(warning as Record<string, string>)) {
      flatPrimitives[`--warning-${step}`] = val;
    }
    flatPrimitives["--radius-none"] = radius.none;
    flatPrimitives["--radius-sm-prim"] = radius.sm;
    flatPrimitives["--radius-md-prim"] = radius.md;
    flatPrimitives["--radius-lg-prim"] = radius.lg;
    flatPrimitives["--radius-xl-prim"] = radius.xl;
    flatPrimitives["--radius-full"] = radius.full;

    // 2. Build light cssVars
    const lightVars: Record<string, string> = {};
    for (const [key, val] of Object.entries(
      tokens.semantic.light as Record<string, string>
    )) {
      lightVars[key] = resolveToken(val, flatPrimitives);
    }
    lightVars["chart-1"] = flatPrimitives["--brand-500"];
    lightVars["chart-2"] = flatPrimitives["--success-500"];
    lightVars["chart-3"] = flatPrimitives["--warning-500"];
    lightVars["chart-4"] = flatPrimitives["--error-500"];
    lightVars["chart-5"] = flatPrimitives["--neutral-500"];
    // Auto-contrast: pick white or black foreground based on brand luminance
    const brand600Hex = oklchToHex(flatPrimitives["--brand-600"] || "#000000");
    const brand400Hex = oklchToHex(flatPrimitives["--brand-400"] || "#000000");
    const lightPrimaryFg = readableColor(brand600Hex);  // '#ffffff' or '#000000'
    const darkPrimaryFg = readableColor(brand400Hex);

    lightVars["primary-foreground"] = lightPrimaryFg === "#ffffff"
      ? flatPrimitives["--neutral-50"] : flatPrimitives["--neutral-900"];
    lightVars["sidebar"] = flatPrimitives["--neutral-100"];
    lightVars["sidebar-foreground"] = flatPrimitives["--neutral-900"];
    lightVars["sidebar-primary"] = flatPrimitives["--brand-600"];
    lightVars["sidebar-primary-foreground"] = lightPrimaryFg === "#ffffff"
      ? flatPrimitives["--neutral-50"] : flatPrimitives["--neutral-900"];
    lightVars["sidebar-accent"] = flatPrimitives["--brand-100"];
    lightVars["sidebar-accent-foreground"] = flatPrimitives["--brand-900"];
    lightVars["sidebar-border"] = flatPrimitives["--neutral-200"];
    lightVars["sidebar-ring"] = flatPrimitives["--brand-400"];

    // 3. Build dark cssVars
    const darkVars: Record<string, string> = {};
    for (const [key, val] of Object.entries(
      tokens.semantic.dark as Record<string, string>
    )) {
      darkVars[key] = resolveToken(val, flatPrimitives);
    }
    darkVars["primary-foreground"] = darkPrimaryFg === "#ffffff"
      ? flatPrimitives["--neutral-50"] : flatPrimitives["--neutral-900"];
    darkVars["sidebar"] = flatPrimitives["--neutral-800"];
    darkVars["sidebar-foreground"] = flatPrimitives["--neutral-50"];
    darkVars["sidebar-primary"] = flatPrimitives["--brand-400"];
    darkVars["sidebar-primary-foreground"] = darkPrimaryFg === "#ffffff"
      ? flatPrimitives["--neutral-50"] : flatPrimitives["--neutral-900"];
    darkVars["sidebar-accent"] = flatPrimitives["--brand-900"];
    darkVars["sidebar-accent-foreground"] = flatPrimitives["--brand-100"];
    darkVars["sidebar-border"] = flatPrimitives["--neutral-700"];
    darkVars["sidebar-ring"] = flatPrimitives["--brand-500"];

    // 4. Fetch current tokens file from GitHub (gets content + sha)
    const TOKENS_PATH = "public/r/designsync-tokens.json";
    const existing = await getGitHubFile(repo, headers, TOKENS_PATH);

    let tokensJson: Record<string, unknown> = {};
    if (existing) {
      try {
        tokensJson = JSON.parse(existing.content);
      } catch {
        tokensJson = {};
      }
    }

    // 4b. Apply font + typography tokens
    const fontFamily = tokens.primitives?.fontFamily || 'Geist';
    const fontFamilyKo = tokens.primitives?.fontFamilyKo || '';

    // font-sans 기본 스택: 영문 폰트 먼저 (영문 자는 영문 폰트, 한글 자는 한글 폰트로 fallback)
    let fontSansValue = '';
    if (fontFamilyKo && fontFamily !== 'Geist') {
      fontSansValue = `'${fontFamily}', '${fontFamilyKo}', sans-serif`;
    } else if (fontFamilyKo) {
      fontSansValue = `'${fontFamilyKo}', sans-serif`;
    } else if (fontFamily !== 'Geist') {
      fontSansValue = `'${fontFamily}', sans-serif`;
    }

    if (fontSansValue) {
      lightVars["font-sans"] = fontSansValue;
      darkVars["font-sans"] = fontSansValue;
    }

    // Tailwind v4 requires --spacing for gap-*/p-*/m-* utilities
    lightVars["spacing"] = "0.25rem";
    darkVars["spacing"] = "0.25rem";

    // lang="ko" 오버라이드: 한글 폰트 먼저 → 한글+영문 혼합 문장도 한글 폰트 하나로 통일
    // (Pretendard/Noto Sans KR은 Latin 글리프 포함하므로 영문도 커버 가능)
    // 번역 플러그인이 lang 어트리뷰트 변경 시 자동 전환됨
    let fontSansKoValue = '';
    if (fontFamilyKo && fontFamily !== 'Geist') {
      fontSansKoValue = `'${fontFamilyKo}', '${fontFamily}', sans-serif`;
    } else if (fontFamilyKo) {
      fontSansKoValue = `'${fontFamilyKo}', sans-serif`;
    } else if (fontFamily !== 'Geist') {
      fontSansKoValue = `'${fontFamily}', sans-serif`;
    }

    if (tokens.primitives?.fontSize) {
      for (const [key, val] of Object.entries(tokens.primitives.fontSize as Record<string, string>)) {
        lightVars[`font-size-${key}`] = val;
        darkVars[`font-size-${key}`] = val;
      }
    }
    if (tokens.primitives?.fontWeight) {
      for (const [key, val] of Object.entries(tokens.primitives.fontWeight as Record<string, string>)) {
        lightVars[`font-weight-${key}`] = val;
        darkVars[`font-weight-${key}`] = val;
      }
    }
    if (tokens.primitives?.lineHeight) {
      for (const [key, val] of Object.entries(tokens.primitives.lineHeight as Record<string, string>)) {
        lightVars[`line-height-${key}`] = val;
        darkVars[`line-height-${key}`] = val;
      }
    }

    tokensJson.cssVars = { light: lightVars, dark: darkVars };
    tokensJson.type = "registry:style";

    // Tailwind v4 border reset + lang="ko" font override
    const css: Record<string, Record<string, string>> = {
      "*, ::after, ::before": {
        "border-color": "var(--color-border, currentColor)",
      },
    };
    if (fontSansKoValue && fontSansKoValue !== fontSansValue) {
      css[":root:lang(ko)"] = { "--font-sans": fontSansKoValue };
    }
    tokensJson.css = css;

    // Clean up stale squircle/cornerkit artifacts from old saves
    delete tokensJson.files;
    delete tokensJson.dependencies;

    // Font: for known Google Fonts that have been self-hosted, add registryDependency
    // so `shadcn add designsync-tokens.json` also installs the font CSS file.
    // Local fonts (not in GOOGLE_FONTS) are device-specific — only set --font-sans var.
    const isGoogleFont = fontFamily !== 'Geist' && GOOGLE_FONTS.includes(fontFamily);
    const registryDependencies: string[] = [];
    if (isGoogleFont) {
      const fontSlug = fontFamily.replace(/ /g, '-').toLowerCase();
      registryDependencies.push(`${CDN_BASE}/r/font-${fontSlug}.json`);
    }
    // 한글 폰트 — 모든 KOREAN_FONTS에 대해 registry 파일 있음 (Pretendard 포함)
    if (fontFamilyKo && KOREAN_FONTS.includes(fontFamilyKo)) {
      const koSlug = fontFamilyKo.replace(/ /g, '-').toLowerCase();
      registryDependencies.push(`${CDN_BASE}/r/font-${koSlug}.json`);
    }
    if (registryDependencies.length > 0) {
      tokensJson.registryDependencies = registryDependencies;
    } else {
      delete tokensJson.registryDependencies;
    }

    const updatedContent = JSON.stringify(tokensJson, null, 2);

    // 5. Commit tokens to GitHub
    await commitGitHubFile(
      repo,
      headers,
      TOKENS_PATH,
      updatedContent,
      commitMessage,
      existing?.sha ?? null
    );

    // 6. Embed AI coding rules into designsync-all.json "readme" field
    // AI tools (Cursor @URL, Claude Code, Windsurf) reading this JSON will see the rules.
    // shadcn add ignores unknown fields — no breakage.
    const readme = generateRules({
      fontFamily,
      fontFamilyKo,
      fontSansValue,
      includeInstall: false,
    });

    const ALL_PATH = 'public/r/designsync-all.json';
    const existingAll = await getGitHubFile(repo, headers, ALL_PATH);
    let allJson: Record<string, unknown> = {};
    if (existingAll) {
      try { allJson = JSON.parse(existingAll.content); } catch { allJson = {}; }
    }
    allJson.readme = readme;
    await commitGitHubFile(
      repo,
      headers,
      ALL_PATH,
      JSON.stringify(allJson, null, 2),
      'chore: update AI coding rules in designsync-all.json',
      existingAll?.sha ?? null
    );

    return NextResponse.json({
      success: true,
      message: "Tokens saved. Vercel will auto-deploy from the GitHub commit.",
      deployUrl: "https://designsync-omega.vercel.app",
    });
  } catch (err) {
    console.error("Save route error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
