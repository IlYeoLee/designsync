import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getInstallationToken } from "@/lib/github-app";
import { generateRules } from "@/lib/rules";

const CDN_BASE = "https://designsync-omega.vercel.app";

// ── GitHub API helpers ──────────────────────────────────────────────

function ghHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
    "Content-Type": "application/json",
  };
}

async function ghGet(url: string, headers: Record<string, string>) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`GitHub GET ${url} → ${res.status}: ${JSON.stringify(err)}`);
  }
  return res.json();
}

async function ghPost(url: string, headers: Record<string, string>, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`GitHub POST ${url} → ${res.status}: ${JSON.stringify(err)}`);
  }
  return res.json();
}

async function ghPatch(url: string, headers: Record<string, string>, body: unknown) {
  const res = await fetch(url, {
    method: "PATCH",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`GitHub PATCH ${url} → ${res.status}: ${JSON.stringify(err)}`);
  }
  return res.json();
}

// ── Generate globals.css token injection snippet ────────────────────

function generateTokenCSS(
  lightVars: Record<string, string>,
  darkVars: Record<string, string>,
  fontSansKoValue: string,
  fontSansValue: string,
): string {
  const indent = "  ";

  function varsBlock(vars: Record<string, string>): string {
    return Object.entries(vars)
      .map(([k, v]) => `${indent}--${k}: ${v};`)
      .join("\n");
  }

  let css = `/* DesignSync — Auto-generated design tokens */\n`;
  css += `/* Do NOT edit manually. Managed by DesignSync auto-PR. */\n\n`;

  // @theme inline block for Tailwind v4
  css += `@theme inline {\n`;
  // font-size mappings
  const fontSizeKeys = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"];
  for (const k of fontSizeKeys) {
    if (lightVars[`font-size-${k}`]) {
      css += `${indent}--text-${k}: var(--font-size-${k}, ${lightVars[`font-size-${k}`]});\n`;
    }
  }
  // font-weight mappings
  const fwKeys = ["normal", "medium", "semibold", "bold", "extrabold"];
  for (const k of fwKeys) {
    if (lightVars[`font-weight-${k}`]) {
      css += `${indent}--font-weight-${k}: var(--font-weight-${k});\n`;
    }
  }
  // line-height
  const lhKeys = ["tight", "normal", "relaxed", "loose"];
  for (const k of lhKeys) {
    if (lightVars[`line-height-${k}`]) {
      css += `${indent}--leading-${k}: var(--line-height-${k}, ${lightVars[`line-height-${k}`]});\n`;
    }
  }
  // shadow
  for (const level of ["sm", "md", "lg"]) {
    const key = `ds-shadow-${level}`;
    if (lightVars[key]) {
      css += `${indent}--shadow-${level}: var(--${key});\n`;
    }
  }
  css += `}\n\n`;

  // :root (light)
  css += `:root {\n`;
  css += varsBlock(lightVars);
  css += `\n}\n\n`;

  // .dark (dark mode)
  css += `.dark {\n`;
  css += varsBlock(darkVars);
  css += `\n}\n\n`;

  // Border reset for Tailwind v4
  css += `*, ::after, ::before {\n`;
  css += `${indent}border-color: var(--color-border, currentColor);\n`;
  css += `}\n`;

  // lang="ko" font override
  if (fontSansKoValue && fontSansKoValue !== fontSansValue) {
    css += `\n:root:lang(ko) {\n`;
    css += `${indent}--font-sans: ${fontSansKoValue};\n`;
    css += `}\n`;
  }

  return css;
}

// ── Main route ──────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(c) { c.forEach(({ name, value, options }) => { try { cookieStore.set(name, value, options); } catch {} }); },
        },
      }
    );

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { designSystemId, dsSlug } = body;

    if (!designSystemId) {
      return NextResponse.json({ error: "Missing designSystemId" }, { status: 400 });
    }

    // Fetch design system with GitHub config
    const { data: ds, error: dsError } = await supabase
      .from("design_systems")
      .select("*")
      .eq("id", designSystemId)
      .eq("user_id", user.id)
      .single();

    if (dsError || !ds) {
      return NextResponse.json({ error: "Design system not found" }, { status: 404 });
    }

    if (!ds.github_repo) {
      return NextResponse.json({ error: "GitHub repo not configured" }, { status: 400 });
    }

    // Resolve token: App installation > PAT
    let ghToken: string;
    if (ds.github_installation_id) {
      try {
        ghToken = await getInstallationToken(ds.github_installation_id);
      } catch (e) {
        return NextResponse.json(
          { error: `GitHub App token failed: ${e instanceof Error ? e.message : "unknown"}` },
          { status: 500 }
        );
      }
    } else if (ds.github_token) {
      ghToken = ds.github_token as string;
    } else {
      return NextResponse.json({ error: "GitHub not connected" }, { status: 400 });
    }

    const repo = ds.github_repo as string;
    const baseBranch = (ds.github_branch as string) || "main";
    const headers = ghHeaders(ghToken);
    const apiBase = `https://api.github.com/repos/${repo}`;

    // 1. Verify repo access
    try {
      await ghGet(apiBase, headers);
    } catch {
      return NextResponse.json(
        { error: `Cannot access repo ${repo}. Check token permissions.` },
        { status: 403 }
      );
    }

    // 2. Get base branch SHA
    const refData = await ghGet(`${apiBase}/git/ref/heads/${baseBranch}`, headers);
    const baseSha = refData.object.sha;

    // 3. Create new branch
    const branchName = `designsync/update-tokens-${Date.now().toString(36)}`;
    await ghPost(`${apiBase}/git/refs`, headers, {
      ref: `refs/heads/${branchName}`,
      sha: baseSha,
    });

    // 4. Build token CSS content
    // We fetch the latest tokens from the CDN (already saved by /api/save)
    const slug = dsSlug || ds.slug;
    const tokensUrl = `${CDN_BASE}/r/designsync-tokens.json`;
    const tokensRes = await fetch(tokensUrl);
    let tokenCSS = "";

    if (tokensRes.ok) {
      const tokensJson = await tokensRes.json();
      const lightVars = tokensJson.cssVars?.light || {};
      const darkVars = tokensJson.cssVars?.dark || {};

      const ff = ds.tokens?.primitives?.fontFamily || "Geist";
      const ffKo = ds.tokens?.primitives?.fontFamilyKo || "";
      let ffSans = "";
      let ffSansKo = "";

      if (ffKo && ff !== "Geist") {
        ffSans = `'${ff}', '${ffKo}', sans-serif`;
        ffSansKo = `'${ffKo}', '${ff}', sans-serif`;
      } else if (ffKo) {
        ffSans = `'${ffKo}', sans-serif`;
        ffSansKo = ffSans;
      } else if (ff !== "Geist") {
        ffSans = `'${ff}', sans-serif`;
        ffSansKo = ffSans;
      }

      tokenCSS = generateTokenCSS(lightVars, darkVars, ffSansKo, ffSans);
    }

    if (!tokenCSS) {
      // Fallback: generate from stored tokens directly
      return NextResponse.json({ error: "Failed to generate token CSS" }, { status: 500 });
    }

    // 5. Create blobs for files
    const fontFamily = ds.tokens?.primitives?.fontFamily || "Geist";
    const fontFamilyKo = ds.tokens?.primitives?.fontFamilyKo || "";
    let fontSansValue = "";
    if (fontFamilyKo && fontFamily !== "Geist") {
      fontSansValue = `'${fontFamily}', '${fontFamilyKo}', sans-serif`;
    } else if (fontFamilyKo) {
      fontSansValue = `'${fontFamilyKo}', sans-serif`;
    } else if (fontFamily !== "Geist") {
      fontSansValue = `'${fontFamily}', sans-serif`;
    }

    const claudeMd = generateRules({
      fontFamily: fontFamily !== "Geist" ? fontFamily : undefined,
      fontFamilyKo: fontFamilyKo || undefined,
      fontSansValue: fontSansValue || undefined,
      iconLibrary: ds.tokens?.primitives?.iconLibrary || "lucide",
      dsSlug: slug,
    });

    const files: { path: string; content: string }[] = [
      {
        path: "designsync-tokens.css",
        content: tokenCSS,
      },
      {
        path: "CLAUDE.md",
        content: claudeMd,
      },
    ];

    // Also create a .designsync.json config file
    const dsConfig = {
      version: 1,
      slug,
      registryUrl: CDN_BASE,
      installCommand: `npx shadcn@latest add ${CDN_BASE}/r/designsync-all.json`,
      updatedAt: new Date().toISOString(),
    };
    files.push({
      path: ".designsync.json",
      content: JSON.stringify(dsConfig, null, 2) + "\n",
    });

    // Create blobs
    const blobShas: { path: string; sha: string }[] = [];
    for (const file of files) {
      const blob = await ghPost(`${apiBase}/git/blobs`, headers, {
        content: file.content,
        encoding: "utf-8",
      });
      blobShas.push({ path: file.path, sha: blob.sha });
    }

    // 6. Get base tree
    const baseCommit = await ghGet(`${apiBase}/git/commits/${baseSha}`, headers);
    const baseTreeSha = baseCommit.tree.sha;

    // 7. Create new tree
    const tree = await ghPost(`${apiBase}/git/trees`, headers, {
      base_tree: baseTreeSha,
      tree: blobShas.map((b) => ({
        path: b.path,
        mode: "100644",
        type: "blob",
        sha: b.sha,
      })),
    });

    // 8. Create commit
    const commit = await ghPost(`${apiBase}/git/commits`, headers, {
      message: `chore(designsync): update design tokens\n\nAuto-generated by DesignSync.\nDesign system: ${ds.name} (${slug})`,
      tree: tree.sha,
      parents: [baseSha],
    });

    // 9. Update branch ref
    await ghPatch(`${apiBase}/git/refs/heads/${branchName}`, headers, {
      sha: commit.sha,
    });

    // 10. Create PR
    const pr = await ghPost(`${apiBase}/pulls`, headers, {
      title: `[DesignSync] Update design tokens`,
      head: branchName,
      base: baseBranch,
      body: [
        `## DesignSync Token Update`,
        ``,
        `Design system **${ds.name}** tokens have been updated.`,
        ``,
        `### Files changed`,
        `- \`designsync-tokens.css\` — CSS custom properties (light + dark)`,
        `- \`.designsync.json\` — DesignSync config`,
        ``,
        `### How to apply`,
        `Import \`designsync-tokens.css\` in your \`globals.css\`:`,
        `\`\`\`css`,
        `@import "./designsync-tokens.css";`,
        `\`\`\``,
        ``,
        `Or install via shadcn CLI:`,
        `\`\`\`bash`,
        `npx shadcn@latest add ${CDN_BASE}/r/designsync-all.json`,
        `\`\`\``,
        ``,
        `---`,
        `*Auto-generated by [DesignSync](${CDN_BASE})*`,
      ].join("\n"),
    });

    return NextResponse.json({
      success: true,
      prUrl: pr.html_url,
      prNumber: pr.number,
      branch: branchName,
    });
  } catch (err) {
    console.error("GitHub PR creation error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
