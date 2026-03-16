"use client";

import * as React from "react";
import { Moon, Sun, Save, Copy, Check, Loader2, Undo2, RotateCcw } from "lucide-react";

interface HeaderProps {
  isDark: boolean;
  onToggleDark: () => void;
  onSave: () => void;
  isSaving: boolean;
  saveSuccess: boolean;
  onUndo: () => void;
  canUndo: boolean;
  onReset: () => void;
}

export function Header({ isDark, onToggleDark, onSave, isSaving, saveSuccess, onUndo, canUndo, onReset }: HeaderProps) {
  const [copied, setCopied] = React.useState(false);
  const [confirmReset, setConfirmReset] = React.useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText("https://designsync-omega.vercel.app/r/designsync-all.json");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback */ }
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
        {/* Copy URL */}
        <button
          onClick={handleCopyUrl}
          className="h-8 px-3 rounded-md border border-border bg-background hover:bg-accent text-xs flex items-center gap-1.5 transition-colors"
          title="Copy registry URL"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{copied ? "Copied!" : "Copy URL"}</span>
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

        {/* Save */}
        <button
          onClick={onSave}
          disabled={isSaving}
          className="h-8 px-3 rounded-md bg-primary text-primary-foreground hover:opacity-90 text-xs font-medium flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : saveSuccess ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span>{isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save"}</span>
        </button>
      </div>
    </header>
  );
}
