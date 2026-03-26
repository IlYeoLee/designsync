"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/registry/new-york/ui/button";
import { Input } from "@/registry/new-york/ui/input";
import { Label } from "@/registry/new-york/ui/label";
import { Separator } from "@/registry/new-york/ui/separator";
import { Mail, Github } from "lucide-react";

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
              <Github className="w-4 h-4" />
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
