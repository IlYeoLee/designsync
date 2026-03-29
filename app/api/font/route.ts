import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const STORAGE_BUCKET = "fonts";

/** Parse the first latin @font-face block */
function parseFontBlock(css: string): { weight: string; url: string } | null {
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

export async function POST(req: NextRequest) {
  try {
    const { fontName } = await req.json();

    if (!fontName || typeof fontName !== "string") {
      return NextResponse.json({ error: "Missing fontName" }, { status: 400 });
    }

    const fontSlug = fontName.replace(/ /g, "-").toLowerCase();
    const familyEncoded = fontName.replace(/ /g, "+");

    // 1. Fetch from Google Fonts (variable first, then fixed)
    const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

    let fontBlock: { weight: string; url: string } | null = null;
    let isVariable = false;

    const varUrl = `https://fonts.googleapis.com/css2?family=${familyEncoded}:wght@100..900&display=swap`;
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
      const fixedUrl = `https://fonts.googleapis.com/css2?family=${familyEncoded}:wght@400;500;700&display=swap`;
      const fixedRes = await fetch(fixedUrl, { headers: { "User-Agent": ua } });
      if (!fixedRes.ok) {
        return NextResponse.json({ error: `Google Fonts에서 폰트를 찾을 수 없습니다.` }, { status: 500 });
      }
      const css = await fixedRes.text();
      fontBlock = parseFontBlock(css);
    }

    if (!fontBlock) {
      return NextResponse.json({ error: "폰트 데이터를 파싱할 수 없습니다." }, { status: 500 });
    }

    // 2. Download woff2
    const woff2Filename = isVariable ? `${fontSlug}-variable.woff2` : `${fontSlug}-400.woff2`;
    const fontRes = await fetch(fontBlock.url);
    if (!fontRes.ok) {
      return NextResponse.json({ error: "woff2 다운로드 실패" }, { status: 500 });
    }
    const buf = Buffer.from(await fontRes.arrayBuffer());

    // 3. Upload to Supabase Storage
    const { error: uploadError } = await getSupabase().storage
      .from(STORAGE_BUCKET)
      .upload(woff2Filename, buf, {
        contentType: "font/woff2",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: `업로드 실패: ${uploadError.message}` }, { status: 500 });
    }

    // Public URL
    const cdnFontUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${woff2Filename}`;
    const fontWeight = fontBlock.weight;

    return NextResponse.json({
      success: true,
      fontName,
      isVariable,
      fontWeight,
      cdnFontUrl,
    });
  } catch (err) {
    console.error("Font upload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
