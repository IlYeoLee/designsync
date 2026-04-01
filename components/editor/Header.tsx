"use client";

import * as React from "react";
import { getIconMap } from "@/lib/icon-map";
import { generateRules } from "@/lib/rules";
import {
  Header as HeaderRoot,
  HeaderActions,
} from "@/registry/new-york/ui/header";
import { SidebarTrigger } from "@/registry/new-york/ui/sidebar";
import { Button } from "@/registry/new-york/ui/button";
import { Github, ExternalLink } from "lucide-react";

interface EditorHeaderProps {
  isDark: boolean;
  onToggleDark: () => void;
  onSave: () => Promise<boolean>;
  onUndo: () => void;
  canUndo: boolean;
  onReset: () => void;
  fontFamily: string;
  fontFamilyKo: string;
  iconLibrary: string;
  dsSlug: string;
  prResult?: { url: string; number: number } | null;
  prError?: string | null;
  prCreating?: boolean;
}

export function EditorHeader({
  isDark,
  onToggleDark,
  onSave,
  onUndo,
  canUndo,
  onReset,
  fontFamily,
  fontFamilyKo,
  iconLibrary,
  dsSlug,
  prResult,
  prError,
  prCreating,
}: EditorHeaderProps) {
  const icons = getIconMap(iconLibrary);
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

    const fontSansValue = fontFamilyKo && fontFamily && fontFamily !== "Geist"
      ? `'${fontFamily}', '${fontFamilyKo}', sans-serif`
      : fontFamilyKo ? `'${fontFamilyKo}', sans-serif`
      : fontFamily && fontFamily !== "Geist" ? `'${fontFamily}', sans-serif`
      : "";

    const prompt = generateRules({
      fontFamily,
      fontFamilyKo,
      fontSansValue,
      iconLibrary,
      dsSlug,
      includeInstall: true,
      defaultMode: isDark ? "dark" : "light",
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
      <SidebarTrigger />

      <HeaderActions>
        {/* Save + Copy Install Command */}
        <Button
          size="sm"
          onClick={handleCopyPrompt}
          disabled={copyState !== "idle"}
          title="Save & copy install command"
        >
          {copyState === "saving" ? (
            <icons.loader className="w-3.5 h-3.5 animate-spin" />
          ) : copyState === "copied" ? (
            <icons.check className="w-3.5 h-3.5" />
          ) : (
            <icons.copy className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">
            {copyState === "saving" ? "Saving..." : copyState === "copied" ? "Copied!" : "Save · Copy"}
          </span>
        </Button>

        {/* Reset */}
        <Button
          variant={confirmReset ? "destructive" : "outline"}
          size="sm"
          onClick={handleResetClick}
          title="Reset all tokens to defaults"
        >
          <icons.reset className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{confirmReset ? "Confirm?" : "Reset"}</span>
        </Button>

        {/* Undo */}
        <Button
          variant="outline"
          size="icon"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <icons.undo className="w-4 h-4" />
        </Button>

        {/* Dark mode toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleDark}
          title={isDark ? "Light mode" : "Dark mode"}
        >
          {isDark ? <icons.sun className="w-4 h-4" /> : <icons.moon className="w-4 h-4" />}
        </Button>

        {/* PR Status */}
        {prCreating && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <icons.loader className="w-3 h-3 animate-spin" />
            <span className="hidden sm:inline">Creating PR...</span>
          </span>
        )}
        {prResult && (
          <a
            href={prResult.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary flex items-center gap-1 hover:underline"
          >
            <Github className="w-3 h-3" />
            <span className="hidden sm:inline">PR #{prResult.number}</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        )}
        {prError && (
          <span className="text-xs text-destructive flex items-center gap-1" title={prError}>
            <Github className="w-3 h-3" />
            <span className="hidden sm:inline">PR Failed</span>
          </span>
        )}
      </HeaderActions>
    </HeaderRoot>
  );
}
