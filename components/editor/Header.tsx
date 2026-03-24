"use client";

import * as React from "react";
import { Moon, Sun, Save, ClipboardCopy, Check, Loader2, Undo2, RotateCcw } from "lucide-react";

const CDN = "https://designsync-omega.vercel.app";

function buildPrompt(): string {
  return `이 프로젝트에 DesignSync 디자인 시스템을 적용해줘.

## 설치 (한 줄 실행)
\`\`\`bash
curl -fsSL ${CDN}/api/setup | node
\`\`\`

이 명령어가 하는 일:
1. globals.css의 기존 테마(색상, 폰트, 다크모드)를 깨끗이 제거
2. DesignSync 디자인 토큰을 적용 (light/dark 모드 포함)
3. 48개 UI 컴포넌트를 설치 또는 덮어쓰기
4. 원본 globals.css는 .bak으로 백업

## 디자인 토큰
- 색상: var(--primary), var(--secondary), var(--accent), var(--destructive), var(--muted), var(--background), var(--foreground), var(--border), var(--input), var(--ring), var(--card), var(--popover) 및 각 -foreground
- 폰트: var(--font-sans)
- 폰트 크기: var(--font-size-xs) ~ var(--font-size-4xl)
- 폰트 굵기: var(--font-weight-normal), var(--font-weight-medium), var(--font-weight-bold)
- 줄 간격: var(--line-height-tight), var(--line-height-normal), var(--line-height-loose)
- 둥글기: var(--radius)

## 컴포넌트 (import from @/components/ui/)
- Typography: <TypographyH1> <TypographyH2> <TypographyH3> <TypographyH4> <TypographyP> <TypographyLead> <TypographyMuted>
- Button: variant="default|secondary|outline|ghost|destructive|link" size="sm|default|lg|icon"
- Card: <Card> <CardHeader> <CardTitle> <CardDescription> <CardContent> <CardFooter>
- Input, Textarea, Select, Checkbox, Switch, Slider, Label, Form
- Dialog, Sheet, Drawer, AlertDialog, Popover, Tooltip, DropdownMenu, ContextMenu
- Tabs, Accordion, Collapsible, NavigationMenu, Menubar, Sidebar
- Table, Badge, Avatar, Progress, Skeleton, Separator, ScrollArea
- Calendar, Carousel, Chart, Command, Breadcrumb, Pagination, InputOTP
- Toggle, ToggleGroup, HoverCard, AspectRatio, RadioGroup, Resizable

## 규칙
✅ 사용: bg-background, bg-primary, text-foreground, text-muted-foreground, border-border, var(--primary)
❌ 금지: bg-blue-600, bg-[#1a1a1a], text-white (하드코딩), font-semibold (스펙 외), text-[10px]
- <h1 className="text-4xl font-bold"> 대신 → <TypographyH1> 사용
- Button 크기는 size prop으로 (className으로 h-12, px-8 등 금지)
- Input 높이는 기본값 유지 (className으로 높이 변경 금지)
- 커스텀 aside 만들지 말고 <Sidebar> 컴포넌트 사용

설치 명령어를 실행한 후, 기존 코드에서 하드코딩된 색상/크기를 위 토큰으로 교체해줘.`;
}

interface HeaderProps {
  isDark: boolean;
  onToggleDark: () => void;
  onSave: () => Promise<boolean>;
  isSaving: boolean;
  saveSuccess: boolean;
  onUndo: () => void;
  canUndo: boolean;
  onReset: () => void;
}

export function Header({ isDark, onToggleDark, onSave, isSaving, saveSuccess, onUndo, canUndo, onReset }: HeaderProps) {
  const [copyState, setCopyState] = React.useState<"idle" | "saving" | "copied">("idle");
  const [confirmReset, setConfirmReset] = React.useState(false);

  const handleCopyPrompt = async () => {
    if (copyState !== "idle") return;

    // 1. Save first (so CDN has latest tokens)
    setCopyState("saving");
    const saved = await onSave();
    if (!saved) {
      setCopyState("idle");
      return;
    }

    // 2. Copy full prompt to clipboard
    try {
      await navigator.clipboard.writeText(buildPrompt());
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 3000);
    } catch {
      setCopyState("idle");
    }
  };

  function handleResetClick() {
    if (confirmReset) {
      onReset();
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
    }
  }

  return (
    <header className="h-12 border-b border-border bg-card flex items-center px-4 gap-4 flex-shrink-0 z-10">
      {/* Left: Logo */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
          <span className="text-primary-foreground text-xs font-bold">DS</span>
        </div>
        <span className="font-semibold text-sm text-foreground">DesignSync</span>
        <span className="text-xs px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground font-medium">v1.0</span>
      </div>

      <div className="flex-1" />

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Copy Prompt (Save + Copy) */}
        <button
          onClick={handleCopyPrompt}
          disabled={copyState !== "idle"}
          className="h-8 px-3 rounded-md bg-primary text-primary-foreground hover:opacity-90 text-xs font-medium flex items-center gap-1.5 transition-all disabled:opacity-70"
          title="Save &amp; copy setup prompt for AI tools"
        >
          {copyState === "saving" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : copyState === "copied" ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <ClipboardCopy className="w-3.5 h-3.5" />
          )}
          <span>
            {copyState === "saving" ? "Saving..." : copyState === "copied" ? "Copied!" : "Copy"}
          </span>
        </button>

        {/* Reset */}
        <button
          onClick={handleResetClick}
          className={`h-8 px-3 rounded-md border text-xs flex items-center gap-1.5 transition-colors ${
            confirmReset
              ? "border-destructive bg-destructive text-white hover:opacity-90"
              : "border-border bg-background hover:bg-accent"
          }`}
          title="Reset all tokens to defaults"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{confirmReset ? "Confirm?" : "Reset"}</span>
        </button>

        {/* Undo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="h-8 w-8 rounded-md border border-border bg-background hover:bg-accent flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="Undo last change (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={onToggleDark}
          className="h-8 w-8 rounded-md border border-border bg-background hover:bg-accent flex items-center justify-center transition-colors"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Save (standalone) */}
        <button
          onClick={() => onSave()}
          disabled={isSaving}
          className="h-8 px-3 rounded-md border border-border bg-background hover:bg-accent text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : saveSuccess ? (
            <Check className="w-3.5 h-3.5 text-green-500" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span>{isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save"}</span>
        </button>
      </div>
    </header>
  );
}
