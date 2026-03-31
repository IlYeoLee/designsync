import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const STORAGE_BUCKET = "fonts";

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

    // Determine file format and content type
    const fileName = file.name.toLowerCase();
    const ext = fileName.split(".").pop() || "ttf";
    const supportedFormats: Record<string, string> = {
      ttf: "font/ttf",
      otf: "font/otf",
      woff: "font/woff",
      woff2: "font/woff2",
    };

    const contentType = supportedFormats[ext];
    if (!contentType) {
      return NextResponse.json({ error: "지원하지 않는 폰트 형식입니다. (ttf, otf, woff, woff2)" }, { status: 400 });
    }

    // Upload to Supabase Storage (original format, no conversion)
    const fontWeight = (formData.get("fontWeight") as string | null) || "400";
    const fontSlug = fontName.replace(/ /g, "-").toLowerCase();
    const uploadFilename = `${fontSlug}-${fontWeight}.${ext}`;

    const { error: uploadError } = await getSupabase().storage
      .from(STORAGE_BUCKET)
      .upload(uploadFilename, inputBuffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: `업로드 실패: ${uploadError.message}` }, { status: 500 });
    }

    const cdnFontUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${uploadFilename}`;

    return NextResponse.json({
      success: true,
      fontName,
      cdnFontUrl,
      format: ext,
    });
  } catch (err) {
    console.error("Font upload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
