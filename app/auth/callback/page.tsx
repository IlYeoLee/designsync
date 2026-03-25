"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Supabase automatically handles the code exchange
    // when it detects the auth params in the URL hash/query
    supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        router.push("/");
      }
    });

    // Fallback: if already signed in, redirect
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.push("/");
      }
    });
  }, [router, supabase.auth]);

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
