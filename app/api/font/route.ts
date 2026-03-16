import { NextRequest, NextResponse } from "next/server";

function getGitHubHeaders() {
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

async function getFileSha(
  repo: string,
  headers: Record<string, string>,
  path: string
): Promise<string | null> {
  const res = await fetch(
    `https://api.github.com/repos/${repo}/contents/${path}`,
    { headers }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.sha ?? null;
}

async function getFileContent(
  repo: string,
  headers: Record<string, string>,
  path: string
): Promise<{ content: string; sha: string } | null> {
  const res = await fetch(
    `https://api.github.com/repos/${repo}/contents/${path}`,
    { headers }
  );
  if (res.status === 404) return null;
  if (!res.ok) return null;
  const data = await res.json();
  return { content: Buffer.from(data.content, "base64").toString("utf-8"), sha: data.sha };
}

async function commitFile(
  repo: string,
  headers: Record<string, string>,
  path: string,
  content: Buffer | string,
  message: string,
  sha: string | null
): Promise<void> {
  const base64 =
    typeof content === "string"
      ? Buffer.from(content).toString("base64")
      : content.toString("base64");
  const body: Record<string, unknown> = { message, content: base64 };
  if (sha) body.sha = sha;
  const res = await fetch(
    `https://api.github.com/repos/${repo}/contents/${path}`,
    { method: "PUT", headers, body: JSON.stringify(body) }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`GitHub PUT ${path} failed (${res.status}): ${JSON.stringify(err)}`);
  }
}

interface FontBlock {
  weight: number;
  url: string;
}

function parseFontCss(css: string): FontBlock[] {
  const blocks: FontBlock[] = [];
  // Match "/* latin */" comment followed by @font-face block
  const regex = /\/\*\s*latin\s*\*\/\s*@font-face\s*\{([^}]+)\}/g;
  let match;
  while ((match = regex.exec(css)) !== null) {
    const block = match[1];
    const weightMatch = block.match(/font-weight:\s*(\d+)/);
    const urlMatch = block.match(/src:\s*url\(([^)]+)\)/);
    if (weightMatch && urlMatch) {
      blocks.push({
        weight: parseInt(weightMatch[1]),
        url: urlMatch[1].replace(/['"]/g, ""),
      });
    }
  }
  return blocks;
}

export async function POST(req: NextRequest) {
  try {
    const repo = getRepo();
    const headers = getGitHubHeaders();
    const { fontName } = await req.json();

    if (!fontName || typeof fontName !== "string") {
      return NextResponse.json({ error: "Missing fontName" }, { status: 400 });
    }

    const fontSlug = fontName.replace(/ /g, "-");
    const familyEncoded = fontName.replace(/ /g, "+");

    // 1. Fetch Google Fonts CSS (woff2 format requires browser UA)
    const googleFontsUrl = `https://fonts.googleapis.com/css2?family=${familyEncoded}:wght@400;500;700&display=swap`;
    const cssRes = await fetch(googleFontsUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    if (!cssRes.ok) {
      return NextResponse.json(
        { error: `Failed to fetch Google Fonts CSS: ${cssRes.status}` },
        { status: 500 }
      );
    }
    const fontCss = await cssRes.text();
    const fontBlocks = parseFontCss(fontCss);
    if (fontBlocks.length === 0) {
      return NextResponse.json(
        { error: "No latin font blocks found in Google Fonts CSS" },
        { status: 500 }
      );
    }

    // 2. Download woff2 files and commit to GitHub
    const committed: { weight: number; githubPath: string }[] = [];
    for (const { weight, url } of fontBlocks) {
      const fontRes = await fetch(url);
      if (!fontRes.ok) continue;
      const buf = Buffer.from(await fontRes.arrayBuffer());
      const githubPath = `public/fonts/${fontSlug}-${weight}.woff2`;
      const sha = await getFileSha(repo, headers, githubPath);
      await commitFile(repo, headers, githubPath, buf, `feat: add ${fontName} ${weight} font`, sha);
      committed.push({ weight, githubPath });
    }

    if (committed.length === 0) {
      return NextResponse.json({ error: "Failed to download any font files" }, { status: 500 });
    }

    // 3. Build @font-face CSS for globals.css (uses local /fonts/ path)
    const fontFaceLocal = committed
      .map(
        ({ weight }) =>
          `@font-face {\n  font-family: '${fontName}';\n  font-style: normal;\n  font-weight: ${weight};\n  font-display: swap;\n  src: url('/fonts/${fontSlug}-${weight}.woff2') format('woff2');\n}`
      )
      .join("\n");
    const fontMarker = `/* ${fontName} (self-hosted via DesignSync) */`;
    const globalsExisting = await getFileContent(repo, headers, "app/globals.css");
    if (globalsExisting && !globalsExisting.content.includes(fontMarker)) {
      const newGlobals = `${fontMarker}\n${fontFaceLocal}\n\n${globalsExisting.content}`;
      await commitFile(repo, headers, "app/globals.css", newGlobals,
        `feat: add @font-face for ${fontName}`, globalsExisting.sha);
    }

    // 4. Build registry CSS file content (uses CDN URL for portability)
    const cdnBase = "https://designsync-omega.vercel.app";
    const registryCss = committed
      .map(
        ({ weight }) =>
          `@font-face {\n  font-family: '${fontName}';\n  font-style: normal;\n  font-weight: ${weight};\n  font-display: swap;\n  src: url('${cdnBase}/fonts/${fontSlug}-${weight}.woff2') format('woff2');\n  unicode-range: U+0000-00FF;\n}`
      )
      .join("\n\n");

    // 5. Create/update registry item JSON
    const registrySlug = `font-${fontSlug.toLowerCase()}`;
    const registryItem = {
      $schema: "https://ui.shadcn.com/schema/registry-item.json",
      name: registrySlug,
      type: "registry:file",
      description: `${fontName} font — served from DesignSync CDN. After install, add @import './${registrySlug}.css' to your globals.css.`,
      files: [
        {
          path: `registry/styles/${registrySlug}.css`,
          type: "registry:file",
          target: `app/${registrySlug}.css`,
          content: registryCss,
        },
      ],
    };
    const registryItemPath = `public/r/${registrySlug}.json`;
    const registryItemSha = await getFileSha(repo, headers, registryItemPath);
    await commitFile(
      repo, headers, registryItemPath,
      JSON.stringify(registryItem, null, 2),
      `feat: add ${fontName} font registry item`,
      registryItemSha
    );

    return NextResponse.json({
      success: true,
      fontName,
      weightsUploaded: committed.map((f) => f.weight),
      registryUrl: `${cdnBase}/r/${registrySlug}.json`,
      installCommand: `shadcn add ${cdnBase}/r/${registrySlug}.json`,
      cssImport: `@import './${registrySlug}.css';`,
    });
  } catch (err) {
    console.error("Font upload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
