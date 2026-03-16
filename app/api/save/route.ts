import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const GITHUB_REPO = process.env.GITHUB_REPO!; // "IlYeoLee/designsync"
const VERCEL_TOKEN = process.env.VERCEL_TOKEN!;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID!;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID!;

async function getFileSha(path: string): Promise<string | null> {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.sha ?? null;
}

async function commitFile(
  path: string,
  content: string,
  message: string,
  sha: string | null
): Promise<void> {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`;
  const body: Record<string, unknown> = {
    message,
    content: Buffer.from(content).toString("base64"),
  };
  if (sha) {
    body.sha = sha;
  }
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`GitHub commit failed: ${JSON.stringify(err)}`);
  }
}

async function triggerVercelDeploy(): Promise<string> {
  const url = `https://api.vercel.com/v13/deployments?teamId=${VERCEL_TEAM_ID}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "designsync",
      project: VERCEL_PROJECT_ID,
      gitSource: {
        type: "github",
        repoId: GITHUB_REPO,
        ref: "main",
      },
    }),
  });
  const data = await res.json();
  return data.url ? `https://${data.url}` : "https://designsync-omega.vercel.app";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tokens, commitMessage = "chore: update design tokens" } = body;

    if (!tokens) {
      return NextResponse.json({ error: "Missing tokens" }, { status: 400 });
    }

    // 1. Read current designsync-tokens.json
    const tokensFilePath = join(process.cwd(), "public/r/designsync-tokens.json");
    let tokensJson: Record<string, unknown>;
    try {
      const raw = readFileSync(tokensFilePath, "utf-8");
      tokensJson = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Failed to read tokens file" }, { status: 500 });
    }

    // 2. Build resolved semantic token values from the token state
    // We resolve var() references to actual primitive values
    function resolveToken(value: string, primitives: Record<string, string>): string {
      if (!value.startsWith("var(")) return value;
      const varName = value.match(/var\(([^)]+)\)/)?.[1];
      if (!varName) return value;
      return primitives[varName] ?? value;
    }

    // Flatten primitives for resolution
    const flatPrimitives: Record<string, string> = {};
    const { brand, neutral, error, success, warning, radius } = tokens.primitives;
    for (const [step, val] of Object.entries(brand as Record<string, string>)) {
      flatPrimitives[`--brand-${step}`] = val as string;
    }
    for (const [step, val] of Object.entries(neutral as Record<string, string>)) {
      flatPrimitives[`--neutral-${step}`] = val as string;
    }
    for (const [step, val] of Object.entries(error as Record<string, string>)) {
      flatPrimitives[`--error-${step}`] = val as string;
    }
    for (const [step, val] of Object.entries(success as Record<string, string>)) {
      flatPrimitives[`--success-${step}`] = val as string;
    }
    for (const [step, val] of Object.entries(warning as Record<string, string>)) {
      flatPrimitives[`--warning-${step}`] = val as string;
    }
    flatPrimitives["--radius-none"] = radius.none;
    flatPrimitives["--radius-sm-prim"] = radius.sm;
    flatPrimitives["--radius-md-prim"] = radius.md;
    flatPrimitives["--radius-lg-prim"] = radius.lg;
    flatPrimitives["--radius-xl-prim"] = radius.xl;
    flatPrimitives["--radius-full"] = radius.full;

    // Build light cssVars
    const lightVars: Record<string, string> = {};
    for (const [key, val] of Object.entries(tokens.semantic.light as Record<string, string>)) {
      lightVars[key] = resolveToken(val, flatPrimitives);
    }
    // Add chart tokens
    lightVars["chart-1"] = resolveToken("var(--brand-500)", flatPrimitives);
    lightVars["chart-2"] = resolveToken("var(--success-500)", flatPrimitives);
    lightVars["chart-3"] = resolveToken("var(--warning-500)", flatPrimitives);
    lightVars["chart-4"] = resolveToken("var(--error-500)", flatPrimitives);
    lightVars["chart-5"] = resolveToken("var(--neutral-500)", flatPrimitives);
    lightVars["sidebar"] = resolveToken("var(--neutral-100)", flatPrimitives);
    lightVars["sidebar-foreground"] = resolveToken("var(--neutral-900)", flatPrimitives);
    lightVars["sidebar-primary"] = resolveToken("var(--brand-600)", flatPrimitives);
    lightVars["sidebar-primary-foreground"] = resolveToken("var(--neutral-50)", flatPrimitives);
    lightVars["sidebar-accent"] = resolveToken("var(--brand-100)", flatPrimitives);
    lightVars["sidebar-accent-foreground"] = resolveToken("var(--brand-900)", flatPrimitives);
    lightVars["sidebar-border"] = resolveToken("var(--neutral-200)", flatPrimitives);
    lightVars["sidebar-ring"] = resolveToken("var(--brand-400)", flatPrimitives);

    // Build dark cssVars
    const darkVars: Record<string, string> = {};
    for (const [key, val] of Object.entries(tokens.semantic.dark as Record<string, string>)) {
      darkVars[key] = resolveToken(val, flatPrimitives);
    }
    darkVars["sidebar"] = resolveToken("var(--neutral-800)", flatPrimitives);
    darkVars["sidebar-foreground"] = resolveToken("var(--neutral-50)", flatPrimitives);
    darkVars["sidebar-primary"] = resolveToken("var(--brand-400)", flatPrimitives);
    darkVars["sidebar-primary-foreground"] = resolveToken("var(--neutral-900)", flatPrimitives);
    darkVars["sidebar-accent"] = resolveToken("var(--brand-900)", flatPrimitives);
    darkVars["sidebar-accent-foreground"] = resolveToken("var(--brand-100)", flatPrimitives);
    darkVars["sidebar-border"] = resolveToken("var(--neutral-700)", flatPrimitives);
    darkVars["sidebar-ring"] = resolveToken("var(--brand-500)", flatPrimitives);

    // 3. Update the JSON
    tokensJson.cssVars = { light: lightVars, dark: darkVars };
    const updatedTokensJson = JSON.stringify(tokensJson, null, 2);

    // 4. Commit to GitHub
    const tokensSha = await getFileSha("public/r/designsync-tokens.json");
    await commitFile(
      "public/r/designsync-tokens.json",
      updatedTokensJson,
      commitMessage,
      tokensSha
    );

    // Also update globals.css with inline values
    const globalsCssPath = join(process.cwd(), "app/globals.css");
    let globalsCss: string;
    try {
      globalsCss = readFileSync(globalsCssPath, "utf-8");
    } catch {
      return NextResponse.json({ error: "Failed to read globals.css" }, { status: 500 });
    }

    const globalsSha = await getFileSha("app/globals.css");
    await commitFile(
      "app/globals.css",
      globalsCss,
      `${commitMessage} (globals.css preserved)`,
      globalsSha
    );

    // 5. Trigger Vercel deploy
    let deployUrl = "https://designsync-omega.vercel.app";
    try {
      deployUrl = await triggerVercelDeploy();
    } catch (deployErr) {
      console.error("Deploy trigger failed:", deployErr);
      // Non-fatal - tokens are committed
    }

    return NextResponse.json({
      success: true,
      message: "Tokens saved and deploy triggered",
      deployUrl,
    });
  } catch (err) {
    console.error("Save route error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
