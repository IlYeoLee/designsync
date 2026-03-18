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

/** Parse the first latin @font-face block — works for both variable and fixed-weight fonts */
function parseFontBlock(css: string): { weight: string; url: string } | null {
  // Try to find a "latin" annotated block first, then fall back to any @font-face block
  const patterns = [
    /\/\*\s*latin\s*\*\/\s*@font-face\s*\{([^}]+)\}/,
    /@font-face\s*\{([^}]+)\}/,
  ];
  for (const regex of patterns) {
    const match = regex.exec(css);
    if (!match) continue;
    const block = match[1];
    const weightMatch = block.match(/font-weight:\s*([\d\s]+)/);
    const urlMatch = block.match(/src:\s*url\(([^)]+)\)/);
    if (weightMatch && urlMatch) {
      return {
        weight: weightMatch[1].trim(),
        url: urlMatch[1].replace(/['"]/g, ""),
      };
    }
  }
  return null;
}

const CDN_BASE = "https://designsync-omega.vercel.app";

export async function POST(req: NextRequest) {
  try {
    const repo = getRepo();
    const headers = getGitHubHeaders();
    const { fontName } = await req.json();

    if (!fontName || typeof fontName !== "string") {
      return NextResponse.json({ error: "Missing fontName" }, { status: 400 });
    }

    const fontSlug = fontName.replace(/ /g, "-").toLowerCase();
    const familyEncoded = fontName.replace(/ /g, "+");

    // 1. Try variable font first (wght@100..900), fall back to fixed weights
    const varUrl = `https://fonts.googleapis.com/css2?family=${familyEncoded}:wght@100..900&display=swap`;
    const fixedUrl = `https://fonts.googleapis.com/css2?family=${familyEncoded}:wght@400;500;700&display=swap`;

    const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

    let fontBlock: { weight: string; url: string } | null = null;
    let isVariable = false;

    const varRes = await fetch(varUrl, { headers: { "User-Agent": ua } });
    if (varRes.ok) {
      const css = await varRes.text();
      const parsed = parseFontBlock(css);
      if (parsed && parsed.weight.includes(" ")) {
        fontBlock = parsed;
        isVariable = true;
      } else if (parsed) {
        fontBlock = parsed;
      }
    }

    if (!fontBlock) {
      const fixedRes = await fetch(fixedUrl, { headers: { "User-Agent": ua } });
      if (!fixedRes.ok) {
        return NextResponse.json({ error: `Failed to fetch Google Fonts CSS: ${fixedRes.status}` }, { status: 500 });
      }
      const css = await fixedRes.text();
      fontBlock = parseFontBlock(css);
    }

    if (!fontBlock) {
      return NextResponse.json({ error: "No font block found in Google Fonts CSS" }, { status: 500 });
    }

    // 2. Download woff2 and commit to GitHub
    const woff2Filename = isVariable ? `${fontSlug}-variable.woff2` : `${fontSlug}-400.woff2`;
    const githubPath = `public/fonts/${woff2Filename}`;
    const fontRes = await fetch(fontBlock.url);
    if (!fontRes.ok) {
      return NextResponse.json({ error: "Failed to download woff2" }, { status: 500 });
    }
    const buf = Buffer.from(await fontRes.arrayBuffer());
    const sha = await getFileSha(repo, headers, githubPath);
    await commitFile(repo, headers, githubPath, buf, `feat: add ${fontName} font`, sha);

    const cdnFontUrl = `${CDN_BASE}/fonts/${woff2Filename}`;
    const fontWeight = fontBlock.weight; // e.g. "100 900" or "400"

    // 3. Update globals.css in the repo (for DesignSync editor itself)
    const fontMarker = `/* ${fontName} (self-hosted via DesignSync) */`;
    const globalsExisting = await getFileContent(repo, headers, "app/globals.css");
    if (globalsExisting && !globalsExisting.content.includes(fontMarker)) {
      const fontFaceBlock = `${fontMarker}\n@font-face {\n  font-family: '${fontName}';\n  font-style: normal;\n  font-weight: ${fontWeight};\n  font-display: swap;\n  src: url('${cdnFontUrl}') format('woff2');\n}\n`;
      const newGlobals = `${fontFaceBlock}\n${globalsExisting.content}`;
      await commitFile(repo, headers, "app/globals.css", newGlobals,
        `feat: add @font-face for ${fontName}`, globalsExisting.sha);
    }

    // 4. Create registry:style item — css field auto-injects @font-face into consumer's globals.css
    const registrySlug = `font-${fontSlug}`;
    const registryItem = {
      $schema: "https://ui.shadcn.com/schema/registry-item.json",
      name: registrySlug,
      type: "registry:style",
      description: `${fontName} font — self-hosted from DesignSync CDN. Auto-injects @font-face into globals.css.`,
      css: {
        "@font-face": {
          "font-family": `'${fontName}'`,
          "font-style": "normal",
          "font-weight": fontWeight,
          "font-display": "swap",
          "src": `url('${cdnFontUrl}') format('woff2')`,
        },
      },
    };

    const registryItemPath = `public/r/${registrySlug}.json`;
    const registryItemSha = await getFileSha(repo, headers, registryItemPath);
    await commitFile(
      repo, headers, registryItemPath,
      JSON.stringify(registryItem, null, 2),
      `feat: registry:style font item for ${fontName}`,
      registryItemSha
    );

    return NextResponse.json({
      success: true,
      fontName,
      isVariable,
      fontWeight,
      cdnFontUrl,
      registryUrl: `${CDN_BASE}/r/${registrySlug}.json`,
      installCommand: `shadcn add ${CDN_BASE}/r/${registrySlug}.json`,
    });
  } catch (err) {
    console.error("Font upload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
