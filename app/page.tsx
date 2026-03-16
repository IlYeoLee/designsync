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

  // Apply tokens to document on mount
  React.useEffect(() => {
    applyTokensToDocument(DEFAULT_TOKENS);
  }, []);

  // Sync dark mode class
  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  function handleTokenChange(variable: string, value: string) {
    const oldValue =
      getComputedStyle(document.documentElement).getPropertyValue(variable).trim();

    // Apply to document immediately for live preview
    document.documentElement.style.setProperty(variable, value);

    // Update state based on variable name
    setTokens((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as TokenState;

      // Primitive color scales
      const colorMatch = variable.match(/^--(brand|neutral|error|success|warning)-(\d+)$/);
      if (colorMatch) {
        const [, scale, step] = colorMatch;
        type ScaleKey = keyof typeof next.primitives;
        type StepKey = keyof typeof next.primitives.brand;
        (next.primitives[scale as ScaleKey] as Record<string, string>)[step as StepKey] = value;
        return next;
      }

      // Font sizes
      const fontSizeMatch = variable.match(/^--font-size-(.+)$/);
      if (fontSizeMatch) {
        const key = fontSizeMatch[1] as keyof typeof next.primitives.fontSize;
        if (key in next.primitives.fontSize) {
          next.primitives.fontSize[key] = value;
        }
        return next;
      }

      // Font weights
      const fontWeightMatch = variable.match(/^--font-weight-(.+)$/);
      if (fontWeightMatch) {
        const key = fontWeightMatch[1] as keyof typeof next.primitives.fontWeight;
        if (key in next.primitives.fontWeight) {
          next.primitives.fontWeight[key] = value;
        }
        return next;
      }

      // Line heights
      const lineHeightMatch = variable.match(/^--line-height-(.+)$/);
      if (lineHeightMatch) {
        const key = lineHeightMatch[1] as keyof typeof next.primitives.lineHeight;
        if (key in next.primitives.lineHeight) {
          next.primitives.lineHeight[key] = value;
        }
        return next;
      }

      // Spacing
      const spacingMatch = variable.match(/^--spacing-(\d+)$/);
      if (spacingMatch) {
        const key = spacingMatch[1] as keyof typeof next.primitives.spacing;
        if (key in next.primitives.spacing) {
          next.primitives.spacing[key] = value;
        }
        return next;
      }

      // Radius primitives
      const radiusMap: Record<string, string> = {
        '--radius-none': 'none',
        '--radius-sm-prim': 'sm',
        '--radius-md-prim': 'md',
        '--radius-lg-prim': 'lg',
        '--radius-xl-prim': 'xl',
        '--radius-full': 'full',
      };
      if (variable in radiusMap) {
        const key = radiusMap[variable] as keyof typeof next.primitives.radius;
        next.primitives.radius[key] = value;
        return next;
      }

      return next;
    });

    // Add to history (max 10, keep last 3 displayed)
    setHistory((prev) => {
      const newEntry: HistoryEntry = {
        variable: variable.replace(/^--/, ""),
        from: oldValue || "?",
        to: value,
        timestamp: new Date(),
      };
      return [newEntry, ...prev].slice(0, 10);
    });
  }

  function handleFontFamilyChange(font: string) {
    document.documentElement.style.setProperty("--font-sans", font);
    setTokens((prev) => {
      const next = { ...prev, primitives: { ...prev.primitives, fontFamily: font } };
      return next;
    });
    setHistory((prev) => [
      {
        variable: "font-family",
        from: tokens.primitives.fontFamily,
        to: font,
        timestamp: new Date(),
      },
      ...prev,
    ].slice(0, 10));
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
          commitMessage: `chore: update design tokens via DesignSync editor`,
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

  const recentHistory = history.slice(0, 3);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header
        isDark={isDark}
        onToggleDark={() => setIsDark(!isDark)}
        onSave={handleSave}
        isSaving={isSaving}
        saveSuccess={saveSuccess}
      />
      <div className="flex-1 flex overflow-hidden">
        <EditorPanel
          tokens={tokens}
          onTokenChange={handleTokenChange}
          onFontFamilyChange={handleFontFamilyChange}
          history={recentHistory}
        />
        <PreviewPanel />
      </div>
    </div>
  );
}
