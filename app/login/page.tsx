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
        scopes: "repo",
      },
    });
    if (error) {
      alert("Login error: " + error.message);
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
      alert("Failed to send email: " + error.message);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 p-[var(--ds-card-padding)]">
        <div className="text-center space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="logo" className="w-12 h-12 rounded-[var(--ds-element-radius)] object-cover mx-auto" />
          <p className="text-2xl font-bold text-foreground">{":designSystem:"}</p>
          <p className="text-sm text-muted-foreground">
            Create and manage your design systems.
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-3">
            <Mail className="w-10 h-10 text-primary mx-auto" />
            <p className="text-sm text-foreground font-medium">Check your email!</p>
            <p className="text-xs text-muted-foreground">
              We sent a login link to {email}.<br />
              Click the link to sign in automatically.
            </p>
            <Button variant="ghost" size="sm" onClick={() => setSent(false)}>
              Try another email
            </Button>
          </div>
        ) : (
          <>
            {/* Email login */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
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
                {loading ? "Sending..." : "Continue with Email"}
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">or</span>
              <Separator className="flex-1" />
            </div>

            {/* GitHub login */}
            <Button
              className="w-full"
              variant="outline"
              onClick={signInWithGitHub}
            >
              <Github className="w-4 h-4" />
              Continue with GitHub
            </Button>
          </>
        )}

        <p className="text-xs text-center text-muted-foreground">
          Sign in to create and manage your design systems.
        </p>
      </div>
    </div>
  );
}
