"use client";

import * as React from "react";
import { Moon, Sun, Save, ClipboardCopy, Check, Loader2, Undo2, RotateCcw } from "lucide-react";
import { generateRules } from "@/lib/rules";
import {
  Header as HeaderRoot,
  HeaderLogo,
  HeaderActions,
} from "@/registry/new-york/ui/header";
import { Button } from "@/registry/new-york/ui/button";
import { Badge } from "@/registry/new-york/ui/badge";

interface EditorHeaderProps {
  isDark: boolean;
  onToggleDark: () => void;
  onSave: () => Promise<boolean>;
  isSaving: boolean;
  saveSuccess: boolean;
  onUndo: () => void;
  canUndo: boolean;
  onReset: () => void;
  fontFamily: string;
  fontFamilyKo: string;
  iconLibrary: string;
}

export function EditorHeader({
  isDark,
  onToggleDark,
  onSave,
  isSaving,
  saveSuccess,
  onUndo,
  canUndo,
  onReset,
  fontFamily,
  fontFamilyKo,
  iconLibrary,
}: EditorHeaderProps) {
  const [copyState, setCopyState] = React.useState<"idle" | "saving" | "copied">("idle");
  const [confirmReset, setConfirmReset] = React.useState(false);

  const handleCopyPrompt = async () => {
    if (copyState !== "idle") return;

    setCopyState("saving");
    const saved = await onSave();
    if (!saved) {
      setCopyState("idle");
      return;
    }

    let fontSansValue = "";
    if (fontFamilyKo && fontFamily && fontFamily !== "Geist") {
      fontSansValue = `'${fontFamily}', '${fontFamilyKo}', sans-serif`;
    } else if (fontFamilyKo) {
      fontSansValue = `'${fontFamilyKo}', sans-serif`;
    } else if (fontFamily && fontFamily !== "Geist") {
      fontSansValue = `'${fontFamily}', sans-serif`;
    }

    const prompt = generateRules({
      fontFamily: fontFamily !== "Geist" ? fontFamily : undefined,
      fontFamilyKo: fontFamilyKo || undefined,
      fontSansValue: fontSansValue || undefined,
      iconLibrary: iconLibrary || "lucide",
      includeInstall: true,
    });

    try {
      await navigator.clipboard.writeText(prompt);
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
    <HeaderRoot className="flex-shrink-0">
      <HeaderLogo href="/">
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
          <span className="text-primary-foreground text-xs font-bold">DS</span>
        </div>
        <span>DesignSync</span>
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">v1.0</Badge>
      </HeaderLogo>

      <HeaderActions>
        {/* Copy Prompt (Save + Copy) */}
        <Button
          size="sm"
          onClick={handleCopyPrompt}
          disabled={copyState !== "idle"}
          title="Save &amp; copy setup prompt for AI tools"
        >
          {copyState === "saving" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : copyState === "copied" ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <ClipboardCopy className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">
            {copyState === "saving" ? "저장 중..." : copyState === "copied" ? "복사됨!" : "복사"}
          </span>
        </Button>

        {/* Reset */}
        <Button
          variant={confirmReset ? "destructive" : "outline"}
          size="sm"
          onClick={handleResetClick}
          title="Reset all tokens to defaults"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{confirmReset ? "확인?" : "초기화"}</span>
        </Button>

        {/* Undo */}
        <Button
          variant="outline"
          size="icon"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </Button>

        {/* Dark mode toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleDark}
          title={isDark ? "라이트 모드" : "다크 모드"}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        {/* Save */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSave()}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : saveSuccess ? (
            <Check className="w-3.5 h-3.5 text-green-500" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span>{isSaving ? "저장 중..." : saveSuccess ? "저장됨!" : "저장"}</span>
        </Button>
      </HeaderActions>
    </HeaderRoot>
  );
}
