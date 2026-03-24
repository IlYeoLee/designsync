"use client";

import * as React from "react";
import { Moon, Sun, Save, ClipboardCopy, Check, Loader2, Undo2, RotateCcw } from "lucide-react";

const CDN = "https://designsync-omega.vercel.app";

function buildPrompt(): string {
  return `이 프로젝트에 DesignSync 디자인 시스템을 적용해줘.

**중요: 아래 규칙은 이번 작업뿐 아니라, 이 대화에서 앞으로 작성하는 모든 코드에 영구적으로 적용된다.**

## 1. 설치 (한 줄 실행)
\`\`\`bash
curl -fsSL ${CDN}/api/setup | node
\`\`\`

이 명령어가 하는 일:
1. globals.css의 기존 테마(색상, 폰트, 다크모드)를 깨끗이 제거
2. DesignSync 디자인 토큰을 적용 (light/dark 모드 포함)
3. 48개 UI 컴포넌트를 설치 또는 덮어쓰기
4. 원본 globals.css는 .bak으로 백업

## 2. 디자인 토큰 (모든 스타일링의 기본 단위)
- 색상: var(--primary), var(--secondary), var(--accent), var(--destructive), var(--muted), var(--background), var(--foreground), var(--border), var(--input), var(--ring), var(--card), var(--popover) 및 각 -foreground
- 폰트: var(--font-sans)
- 폰트 크기: var(--font-size-xs) ~ var(--font-size-4xl)
- 폰트 굵기: var(--font-weight-normal), var(--font-weight-medium), var(--font-weight-bold)
- 줄 간격: var(--line-height-tight), var(--line-height-normal), var(--line-height-loose)
- 둥글기: var(--radius)

## 3. 컴포넌트 (import from @/components/ui/)
- Typography: <TypographyH1> <TypographyH2> <TypographyH3> <TypographyH4> <TypographyP> <TypographyLead> <TypographyMuted>
- Button: variant="default|secondary|outline|ghost|destructive|link" size="sm|default|lg|icon"
- Card: <Card> <CardHeader> <CardTitle> <CardDescription> <CardContent> <CardFooter>
- Input, Textarea, Select, Checkbox, Switch, Slider, Label, Form
- Dialog, Sheet, Drawer, AlertDialog, Popover, Tooltip, DropdownMenu, ContextMenu
- Tabs, Accordion, Collapsible, NavigationMenu, Menubar, Sidebar
- Table, Badge, Avatar, Progress, Skeleton, Separator, ScrollArea
- Calendar, Carousel, Chart, Command, Breadcrumb, Pagination, InputOTP
- Toggle, ToggleGroup, HoverCard, AspectRatio, RadioGroup, Resizable

## 4. 필수 규칙 (위반 시 즉시 수정)

### 절대 금지 — 하드코딩
- ❌ bg-blue-600, bg-[#1a1a1a], text-white, text-gray-500 등 직접 색상
- ❌ text-[10px], text-[14px], h-[52px] 등 임의 크기
- ❌ font-semibold, leading-relaxed 등 토큰에 없는 유틸리티
- ❌ style={{ color: '#fff' }} 인라인 스타일로 색상/크기 지정

### 반드시 사용
- ✅ bg-background, bg-primary, text-foreground, text-muted-foreground, border-border
- ✅ text-sm, text-base, text-lg 등 토큰 기반 크기
- ✅ font-normal, font-medium, font-bold (토큰에 정의된 것만)
- ✅ rounded-sm, rounded-md, rounded-lg (토큰 radius)

### 컴포넌트 사용 규칙
- <h1 className="text-4xl font-bold"> 대신 → <TypographyH1> 사용
- Button 크기는 size prop으로 (className으로 h-12, px-8 등 금지)
- Input 높이는 기본값 유지 (className으로 높이 변경 금지)
- 커스텀 aside/nav 만들지 말고 <Sidebar>, <NavigationMenu> 사용

### 커스텀 UI 만들 때 (DesignSync에 없는 컴포넌트)
DesignSync에 해당 컴포넌트가 없더라도 아래는 반드시 지켜야 한다:
- 배경색: bg-background, bg-card, bg-muted, bg-primary, bg-secondary, bg-accent 중 선택
- 텍스트: text-foreground, text-muted-foreground, text-primary-foreground 등 시맨틱 색상
- 테두리: border-border
- 둥글기: rounded-sm ~ rounded-xl (토큰 radius)
- 폰트 크기/굵기/줄간격: 반드시 토큰 값 사용
- 그림자: shadow-sm, shadow-md, shadow-lg
- 색상이 필요하면 var(--brand-500), var(--neutral-200) 등 프리미티브 토큰 참조 가능

## 5. 실행 순서
1. 위 설치 명령어를 실행해서 디자인 시스템을 적용
2. 기존 코드에서 하드코딩된 색상/크기/폰트를 위 토큰으로 전부 교체
3. 이후 새로 작성하는 모든 코드도 위 규칙을 따를 것`;
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
