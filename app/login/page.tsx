"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/registry/new-york/ui/button";
import { Input } from "@/registry/new-york/ui/input";
import { Label } from "@/registry/new-york/ui/label";
import { Separator } from "@/registry/new-york/ui/separator";
import { Mail } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function signInWithGitHub() {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      alert("로그인 에러: " + error.message);
    }
  }

  async function signInWithEmail() {
    if (!email.trim()) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) {
      alert("이메일 전송 실패: " + error.message);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 p-[var(--ds-card-padding)]">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-[var(--ds-element-radius)] bg-primary flex items-center justify-center mx-auto">
            <span className="text-primary-foreground text-lg font-bold">DS</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">DesignSync</h1>
          <p className="text-sm text-muted-foreground">
            디자인 시스템을 만들고 관리하세요.
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-3">
            <Mail className="w-10 h-10 text-primary mx-auto" />
            <p className="text-sm text-foreground font-medium">이메일을 확인하세요!</p>
            <p className="text-xs text-muted-foreground">
              {email}로 로그인 링크를 보냈습니다.<br />
              링크를 클릭하면 자동으로 로그인됩니다.
            </p>
            <Button variant="ghost" size="sm" onClick={() => setSent(false)}>
              다른 이메일로 시도
            </Button>
          </div>
        ) : (
          <>
            {/* Email login */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && signInWithEmail()}
                />
              </div>
              <Button
                className="w-full"
                onClick={signInWithEmail}
                disabled={loading || !email.trim()}
              >
                {loading ? "전송 중..." : "이메일로 계속하기"}
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">또는</span>
              <Separator className="flex-1" />
            </div>

            {/* GitHub login */}
            <Button
              className="w-full"
              variant="outline"
              onClick={signInWithGitHub}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub로 계속하기
            </Button>
          </>
        )}

        <p className="text-xs text-center text-muted-foreground">
          로그인하면 디자인 시스템을 생성하고 관리할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
