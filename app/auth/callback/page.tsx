"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    async function handleCallback() {
      // URL에서 code 파라미터 추출
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (code) {
        // code를 세션으로 교환
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          router.push("/");
          return;
        }
      }

      // code가 없거나 에러 → hash fragment 체크 (implicit flow)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/");
        return;
      }

      // 전부 실패 → 로그인으로
      router.push("/login");
    }

    handleCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-[var(--ds-element-radius)] bg-primary flex items-center justify-center mx-auto animate-pulse">
          <span className="text-primary-foreground text-lg font-bold">DS</span>
        </div>
        <p className="text-sm text-muted-foreground">로그인 처리 중...</p>
      </div>
    </div>
  );
}
