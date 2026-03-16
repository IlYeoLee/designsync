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

  // Undo stack — stores full TokenState snapshots before each change
  const [snapshots, setSnapshots] = React.useState<TokenState[]>([]);

  // Dark-mode semantic override <style> tag ref
  const darkStyleRef = React.useRef<HTMLStyleElement | null>(null);

  // Apply primitive tokens on mount
  React.useEffect(() => {
    applyTokensToDocument(DEFAULT_TOKENS);
    // Apply light semantic tokens inline
    Object.entries(DEFAULT_TOKENS.semantic.light).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
  }, []);

  // Sync dark mode class + dark semantic tokens via <style> tag
  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Inject dark semantic tokens into a dynamic <style> tag so they work
  // inside .dark {} without fighting the CSS cascade
  React.useEffect(() => {
    if (!darkStyleRef.current) {
      const style = document.createElement("style");
      style.id = "designsync-dark-semantic";
      document.head.appendChild(style);
      darkStyleRef.current = style;
    }
    const rules = Object.entries(tokens.semantic.dark)
      .map(([k, v]) => `  --${k}: ${v};`)
      .join("
");
    darkStyleRef.current.textContent = `.dark {
${rules}
}`;
  }, [tokens.semantic.dark]);

  // Apply light semantic tokens whenever they change
  React.useEffect(() => {
    Object.entries(tokens.semantic.light).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
  }, [tokens.semantic.light]);

  // Keyboard shortcut: Ctrl+Z / Cmd+Z → undo
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshots]);

  /** Save a snapshot then apply a single variable change */
  function handleTokenChange(variable: string, value: string) {
    // Snapshot before change
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
        const k = radiusMap[variable] as keyof typeof next.primitives.radius;
        next.primitives.radius[k] = value;
        return next;
      }
      return next;
    });

    setHistory((prev) => {
      const entry: HistoryEntry = {
        variable: variable.replace(/^--/, ""),
        from: oldValue || "?",
        to: value,
        timestamp: new Date(),
      };
      return [entry, ...prev].slice(0, 10);
    });
  }

  /** Batch change — snapshot once, apply many variables */
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

    setHistory((prev) => [{
      variable: "batch palette change",
      from: "(multiple)",
      to: `(${changes.length} vars)`,
      timestamp: new Date(),
    }, ...prev].slice(0, 10));
  }

  /** Semantic token change — updates state + DOM + dark style tag */
  function handleSemanticChange(mode: "light" | "dark", key: string, value: string) {
    setSnapshots((prev) => [...prev.slice(-19), tokens]);

    if (mode === "light") {
      document.documentElement.style.setProperty(`--${key}`, value);
    }

    setTokens((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as TokenState;
      if (mode === "light") {
        next.semantic.light[key] = value;
      } else {
        next.semantic.dark[key] = value;
      }
      return next;
    });

    setHistory((prev) => [{
      variable: `${mode}:${key}`,
      from: (mode === "light" ? tokens.semantic.light[key] : tokens.semantic.dark[key]) ?? "?",
      to: value,
      timestamp: new Date(),
    }, ...prev].slice(0, 10));
  }

  function handleFontFamilyChange(font: string) {
    setSnapshots((prev) => [...prev.slice(-19), tokens]);
    document.documentElement.style.setProperty("--font-sans", font);
    setTokens((prev) => ({ ...prev, primitives: { ...prev.primitives, fontFamily: font } }));
    setHistory((prev) => [{
      variable: "font-family",
      from: tokens.primitives.fontFamily,
      to: font,
      timestamp: new Date(),
    }, ...prev].slice(0, 10));
  }

  /** Undo: restore last snapshot and reapply to DOM */
  function handleUndo() {
    const snapshot = snapshots[snapshots.length - 1];
    if (!snapshot) return;
    setSnapshots((prev) => prev.slice(0, -1));
    setTokens(snapshot);
    // Reapply all primitive tokens
    applyTokensToDocument(snapshot);
    // Reapply light semantic tokens
    Object.entries(snapshot.semantic.light).forEach(([k, v]) => {
      document.documentElement.style.setProperty(`--${k}`, v);
    });
    // Dark semantic tokens update via useEffect watching tokens.semantic.dark
    setHistory((prev) => [{
      variable: "undo",
      from: "(current)",
      to: "(previous)",
      timestamp: new Date(),
    }, ...prev].slice(0, 10));
  }

  async function handleSave() {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const response = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokens,
          commitMessage: "chore: update design tokens via DesignSync editor",
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        console.error("Save failed:", err);
        alert(`Save failed: ${err.error || "Unknown error"}`);
      } else {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Save error:", err);
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
