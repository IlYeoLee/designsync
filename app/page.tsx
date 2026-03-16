"use client";

import * as React from "react";
import { Header } from "@/components/editor/Header";
import { EditorPanel } from "@/components/editor/EditorPanel";
import { PreviewPanel } from "@/components/editor/PreviewPanel";
import { DEFAULT_TOKENS, TokenState, HistoryEntry, applyTokensToDocument } from "@/lib/tokens";

export default function Home() {
  const [tokens, setTokens] = React.useState<TokenState>(DEFAULT_TOKENS);
  const [isDark, setIsDark] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [history, setHistory] = React.useState<HistoryEntry[]>([]);
  const [snapshots, setSnapshots] = React.useState<TokenState[]>([]);

  // ── Mount: apply primitive tokens ──────────────────────────────
  React.useEffect(() => {
    applyTokensToDocument(DEFAULT_TOKENS);
  }, []);

  // ── Dark mode class ─────────────────────────────────────────────
  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // ── Semantic tokens: apply correct mode's values as inline styles ─
  // Inline styles always win, so we REPLACE them whenever mode or values change.
  // This fixes dark mode: when toggling, the dark semantic set is applied inline,
  // overriding any CSS cascade issues.
  React.useEffect(() => {
    const semanticTokens = isDark ? tokens.semantic.dark : tokens.semantic.light;
    Object.entries(semanticTokens).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
  }, [isDark, tokens.semantic.light, tokens.semantic.dark]);

  // ── Keyboard shortcut: Ctrl/Cmd+Z → undo ────────────────────────
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshots]);

  // ── Token change (single variable) ─────────────────────────────
  function handleTokenChange(variable: string, value: string) {
    setSnapshots((prev) => [...prev.slice(-19), tokens]);

    const oldValue = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
    document.documentElement.style.setProperty(variable, value);

    setTokens((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as TokenState;

      const colorMatch = variable.match(/^--(brand|neutral|error|success|warning)-(\d+)$/);
      if (colorMatch) {
        const [, scale, step] = colorMatch;
        type ScaleKey = keyof typeof next.primitives;
        (next.primitives[scale as ScaleKey] as Record<string, string>)[step] = value;
        return next;
      }
      const fontSizeMatch = variable.match(/^--font-size-(.+)$/);
      if (fontSizeMatch) {
        const k = fontSizeMatch[1] as keyof typeof next.primitives.fontSize;
        if (k in next.primitives.fontSize) next.primitives.fontSize[k] = value;
        return next;
      }
      const fontWeightMatch = variable.match(/^--font-weight-(.+)$/);
      if (fontWeightMatch) {
        const k = fontWeightMatch[1] as keyof typeof next.primitives.fontWeight;
        if (k in next.primitives.fontWeight) next.primitives.fontWeight[k] = value;
        return next;
      }
      const lineHeightMatch = variable.match(/^--line-height-(.+)$/);
      if (lineHeightMatch) {
        const k = lineHeightMatch[1] as keyof typeof next.primitives.lineHeight;
        if (k in next.primitives.lineHeight) next.primitives.lineHeight[k] = value;
        return next;
      }
      const spacingMatch = variable.match(/^--spacing-(\d+)$/);
      if (spacingMatch) {
        const k = spacingMatch[1] as keyof typeof next.primitives.spacing;
        if (k in next.primitives.spacing) next.primitives.spacing[k] = value;
        return next;
      }
      const radiusMap: Record<string, string> = {
        "--radius-none": "none", "--radius-sm-prim": "sm", "--radius-md-prim": "md",
        "--radius-lg-prim": "lg", "--radius-xl-prim": "xl", "--radius-full": "full",
      };
      if (variable in radiusMap) {
        next.primitives.radius[radiusMap[variable] as keyof typeof next.primitives.radius] = value;
        return next;
      }
      return next;
    });

    setHistory((prev) => [
      { variable: variable.replace(/^--/, ""), from: oldValue || "?", to: value, timestamp: new Date() },
      ...prev,
    ].slice(0, 10));
  }

  // ── Batch change (e.g. palette generation) ─────────────────────
  function handleBatchChange(changes: { variable: string; value: string }[]) {
    setSnapshots((prev) => [...prev.slice(-19), tokens]);

    changes.forEach(({ variable, value }) => {
      document.documentElement.style.setProperty(variable, value);
    });

    setTokens((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as TokenState;
      changes.forEach(({ variable, value }) => {
        const colorMatch = variable.match(/^--(brand|neutral|error|success|warning)-(\d+)$/);
        if (colorMatch) {
          const [, scale, step] = colorMatch;
          type ScaleKey = keyof typeof next.primitives;
          (next.primitives[scale as ScaleKey] as Record<string, string>)[step] = value;
        }
      });
      return next;
    });

    setHistory((prev) => [
      { variable: "batch palette change", from: "(multiple)", to: `(${changes.length} vars)`, timestamp: new Date() },
      ...prev,
    ].slice(0, 10));
  }

  // ── Semantic token change ───────────────────────────────────────
  // We update state only; the unified useEffect above will apply inline styles.
  function handleSemanticChange(mode: "light" | "dark", key: string, value: string) {
    setSnapshots((prev) => [...prev.slice(-19), tokens]);

    setTokens((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as TokenState;
      if (mode === "light") next.semantic.light[key] = value;
      else next.semantic.dark[key] = value;
      return next;
    });

    const prevValue = mode === "light" ? tokens.semantic.light[key] : tokens.semantic.dark[key];
    setHistory((prev) => [
      { variable: `${mode}:${key}`, from: prevValue ?? "?", to: value, timestamp: new Date() },
      ...prev,
    ].slice(0, 10));
  }

  // ── Font family ─────────────────────────────────────────────────
  // Set --custom-font-family (used by @theme inline --font-sans fallback chain)
  // AND set body.style.fontFamily directly for immediate effect on all children.
  function handleFontFamilyChange(font: string) {
    setSnapshots((prev) => [...prev.slice(-19), tokens]);
    document.documentElement.style.setProperty("--custom-font-family", font);
    document.body.style.fontFamily = font;
    setTokens((prev) => ({ ...prev, primitives: { ...prev.primitives, fontFamily: font } }));
    setHistory((prev) => [
      { variable: "font-family", from: tokens.primitives.fontFamily, to: font, timestamp: new Date() },
      ...prev,
    ].slice(0, 10));
  }

  // ── Undo ────────────────────────────────────────────────────────
  function handleUndo() {
    const snapshot = snapshots[snapshots.length - 1];
    if (!snapshot) return;
    setSnapshots((prev) => prev.slice(0, -1));
    setTokens(snapshot);

    // Re-apply primitive tokens
    applyTokensToDocument(snapshot);

    // Re-apply font family
    document.documentElement.style.setProperty("--custom-font-family", snapshot.primitives.fontFamily);
    document.body.style.fontFamily = snapshot.primitives.fontFamily;

    // Semantic tokens will be re-applied by the unified useEffect when state updates.
    // But we also apply immediately for instant feedback:
    const semanticTokens = isDark ? snapshot.semantic.dark : snapshot.semantic.light;
    Object.entries(semanticTokens).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });

    setHistory((prev) => [
      { variable: "undo", from: "(current)", to: "(previous)", timestamp: new Date() },
      ...prev,
    ].slice(0, 10));
  }

  // ── Reset ───────────────────────────────────────────────────────
  function handleReset() {
    setSnapshots((prev) => [...prev.slice(-19), tokens]);
    setTokens(DEFAULT_TOKENS);
    applyTokensToDocument(DEFAULT_TOKENS);
    document.documentElement.style.setProperty("--custom-font-family", DEFAULT_TOKENS.primitives.fontFamily);
    document.body.style.fontFamily = DEFAULT_TOKENS.primitives.fontFamily;
    const semanticTokens = isDark ? DEFAULT_TOKENS.semantic.dark : DEFAULT_TOKENS.semantic.light;
    Object.entries(semanticTokens).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
    setHistory((prev) => [
      { variable: "reset", from: "(custom)", to: "(defaults)", timestamp: new Date() },
      ...prev,
    ].slice(0, 10));
  }

  // ── Save ────────────────────────────────────────────────────────
  async function handleSave() {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const response = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokens, commitMessage: "chore: update design tokens via DesignSync editor" }),
      });
      if (!response.ok) {
        const err = await response.json();
        alert(`Save failed: ${err.error || "Unknown error"}`);
      } else {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch {
      alert("Save failed: network error");
    }
    setIsSaving(false);
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header
        isDark={isDark}
        onToggleDark={() => setIsDark(!isDark)}
        onSave={handleSave}
        isSaving={isSaving}
        saveSuccess={saveSuccess}
        onUndo={handleUndo}
        canUndo={snapshots.length > 0}
        onReset={handleReset}
      />
      <div className="flex-1 flex overflow-hidden">
        <EditorPanel
          tokens={tokens}
          onTokenChange={handleTokenChange}
          onBatchChange={handleBatchChange}
          onSemanticChange={handleSemanticChange}
          onFontFamilyChange={handleFontFamilyChange}
          history={history.slice(0, 3)}
        />
        <PreviewPanel />
      </div>
    </div>
  );
}
