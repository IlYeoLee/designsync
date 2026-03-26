import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { compress } from "wawoff2";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const STORAGE_BUCKET = "fonts";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const fontName = formData.get("fontName") as string | null;

    if (!file || !fontName) {
      return NextResponse.json({ error: "file과 fontName이 필요합니다." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = new Uint8Array(arrayBuffer);

    // Determine if conversion is needed
    const fileName = file.name.toLowerCase();
    let woff2Buffer: Uint8Array;
    let isConverted = false;

    if (fileName.endsWith(".woff2")) {
      // Already woff2, no conversion needed
      woff2Buffer = inputBuffer;
    } else if (fileName.endsWith(".ttf") || fileName.endsWith(".otf") || fileName.endsWith(".woff")) {
      // Convert to woff2
      woff2Buffer = await compress(inputBuffer);
      isConverted = true;
    } else {
      return NextResponse.json({ error: "지원하지 않는 폰트 형식입니다. (ttf, otf, woff, woff2)" }, { status: 400 });
    }

    // Upload to Supabase Storage
    const fontSlug = fontName.replace(/ /g, "-").toLowerCase();
    const woff2Filename = `${fontSlug}-400.woff2`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(woff2Filename, woff2Buffer, {
        contentType: "font/woff2",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: `업로드 실패: ${uploadError.message}` }, { status: 500 });
    }

    const cdnFontUrl = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${woff2Filename}`;

    return NextResponse.json({
      success: true,
      fontName,
      cdnFontUrl,
      isConverted,
      originalFormat: fileName.split(".").pop(),
    });
  } catch (err) {
    console.error("Font upload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
