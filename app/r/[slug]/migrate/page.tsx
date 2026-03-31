import { createClient } from "@supabase/supabase-js";
import { generateRules } from "@/lib/rules";
import { CopyPromptButton } from "./CopyPromptButton";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default async function MigratePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let fontFamily = "";
  let fontFamilyKo = "";
  let fontSansValue = "";
  let iconLibrary = "lucide";

  try {
    const { data } = await getSupabase()
      .from("design_systems")
      .select("tokens, icon_library")
      .eq("slug", slug)
      .single();

    if (data) {
      fontFamily = data.tokens?.primitives?.fontFamily || "";
      fontFamilyKo = data.tokens?.primitives?.fontFamilyKo || "";
      iconLibrary = data.icon_library || "lucide";

      if (fontFamilyKo && fontFamily && fontFamily !== "Geist") {
        fontSansValue = `'${fontFamily}', '${fontFamilyKo}', sans-serif`;
      } else if (fontFamilyKo) {
        fontSansValue = `'${fontFamilyKo}', sans-serif`;
      } else if (fontFamily && fontFamily !== "Geist") {
        fontSansValue = `'${fontFamily}', sans-serif`;
      }
    }
  } catch {
    // DS not found — show generic prompt
  }

  const prompt = generateRules({
    fontFamily,
    fontFamilyKo,
    fontSansValue,
    iconLibrary,
    dsSlug: slug,
    includeInstall: false,
  });

  const fullPrompt = `이 프로젝트에 DesignSync 디자인 시스템이 설치되어 있습니다.
아래 규칙에 따라 src/ 폴더 전체를 마이그레이션하세요.
완료 후 \`npx eslint src/\` 실행 — 에러 0이 될 때까지 수정하세요.

---

${prompt}`;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-xl flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold text-foreground">마이그레이션 프롬프트</h1>
          <p className="text-sm text-muted-foreground">
            아래 버튼을 눌러 프롬프트를 복사한 뒤 Claude / Cursor에 붙여넣으세요.
          </p>
        </div>

        <CopyPromptButton prompt={fullPrompt} />

        <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">적용 후 검증</p>
          <code className="block font-mono text-xs bg-background rounded px-2 py-1 border border-border">
            npx eslint src/
          </code>
          <p>에러 0이면 마이그레이션 완료입니다.</p>
        </div>
      </div>
    </div>
  );
}
