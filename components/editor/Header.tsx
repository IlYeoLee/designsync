"use client";

import * as React from "react";
import { Moon, Sun, Save, ClipboardCopy, Check, Loader2, Undo2, RotateCcw } from "lucide-react";
import { generateRules } from "@/lib/rules";

interface HeaderProps {
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
}

export function Header({
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
}: HeaderProps) {
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

    // 2. Build font-sans value for the prompt
    let fontSansValue = "";
    if (fontFamilyKo && fontFamily && fontFamily !== "Geist") {
      fontSansValue = `'${fontFamily}', '${fontFamilyKo}', sans-serif`;
    } else if (fontFamilyKo) {
      fontSansValue = `'${fontFamilyKo}', sans-serif`;
    } else if (fontFamily && fontFamily !== "Geist") {
      fontSansValue = `'${fontFamily}', sans-serif`;
    }

    // 3. Generate full prompt with install section
    const prompt = generateRules({
      fontFamily: fontFamily !== "Geist" ? fontFamily : undefined,
      fontFamilyKo: fontFamilyKo || undefined,
      fontSansValue: fontSansValue || undefined,
      includeInstall: true,
    });

    // 4. Copy to clipboard
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
          title="Save &amp; copy setup prompt for AI tools (Cursor, Claude Code, Windsurf)"
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
