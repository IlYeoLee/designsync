"use client";

import * as React from "react";
import { EditorHeader } from "@/components/editor/Header";
import { EditorPanel } from "@/components/editor/EditorPanel";
import { PreviewPanel } from "@/components/editor/PreviewPanel";
import { AppSidebar, type DesignSystem } from "@/components/editor/AppSidebar";
import { DEFAULT_TOKENS, TokenState, HistoryEntry, applyTokensToDocument } from "@/lib/tokens";
import { applyStylePreset } from "@/lib/style-presets";
import { createClient } from "@/lib/supabase";

/** lang="ko" 시 한글 폰트 우선 적용 — style 태그로 주입 */
function applyLangKoOverride(stackKo: string) {
  const styleId = 'ds-font-lang-override';
  let el = document.getElementById(styleId) as HTMLStyleElement | null;
  if (stackKo) {
    if (!el) { el = document.createElement('style'); el.id = styleId; document.head.appendChild(el); }
    el.textContent = `:root:lang(ko) { --font-sans: ${stackKo}; font-family: ${stackKo}; }`;
  } else if (el) {
    el.remove();
  }
}

export default function Home() {
  const supabase = createClient();
  const [tokens, setTokens] = React.useState<TokenState>(DEFAULT_TOKENS);
  const [isDark, setIsDark] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [history, setHistory] = React.useState<HistoryEntry[]>([]);
  const [snapshots, setSnapshots] = React.useState<TokenState[]>([]);

  // ── Sidebar state ──────
  const [designSystems, setDesignSystems] = React.useState<DesignSystem[]>([]);
  const [activeDs, setActiveDs] = React.useState<DesignSystem | null>(null);
  const [userName, setUserName] = React.useState("");
  const [userEmail, setUserEmail] = React.useState("");
  const [loaded, setLoaded] = React.useState(false);

  // ── Mount: load user + design systems from Supabase ──────
  React.useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserName(user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User");
      setUserEmail(user.email || "");

      const { data: dsList } = await supabase
        .from("design_systems")
        .select("*")
        .order("created_at", { ascending: true });

      if (dsList && dsList.length > 0) {
        setDesignSystems(dsList as DesignSystem[]);
        const first = dsList[0] as DesignSystem;
        setActiveDs(first);
        setTokens(first.tokens);
        applyTokensToDocument(first.tokens);
        applyStylePreset(first.style_preset || "vega");
      } else {
        // 첫 방문 — 기본 DS 자동 생성
        const { data: newDs, error: insertError } = await supabase
          .from("design_systems")
          .insert({
            user_id: user.id,
            name: "내 디자인 시스템",
            slug: "my-ds-" + Date.now().toString(36),
            tokens: DEFAULT_TOKENS,
            icon_library: "lucide",
            style_preset: "vega",
          })
          .select()
          .single();

        if (insertError) {
          console.error("DS 생성 실패:", insertError.message);
        }

        if (newDs) {
          const ds = newDs as DesignSystem;
          setDesignSystems([ds]);
          setActiveDs(ds);
          setTokens(ds.tokens);
          applyTokensToDocument(ds.tokens);
          applyStylePreset("vega");
        }
      }
      setLoaded(true);
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const shadowMatch = variable.match(/^--ds-shadow-(sm|md|lg)$/);
      if (shadowMatch) {
        const level = shadowMatch[1] as keyof typeof next.primitives.shadows;
        next.primitives.shadows[level] = value;
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
    const ko = tokens.primitives.fontFamilyKo;
    let stack = '';
    let stackKo = '';
    if (ko && font !== 'Geist') {
      stack = `'${font}', '${ko}', sans-serif`;
      stackKo = `'${ko}', '${font}', sans-serif`;
    } else if (font !== 'Geist') {
      stack = `'${font}', sans-serif`;
      stackKo = stack;
    }
    if (stack) {
      document.documentElement.style.setProperty('--font-sans', stack);
      document.body.style.fontFamily = stack;
    }
    applyLangKoOverride(stackKo !== stack ? stackKo : '');
    document.documentElement.style.setProperty("--custom-font-family", font);
    setTokens((prev) => ({ ...prev, primitives: { ...prev.primitives, fontFamily: font } }));
    setHistory((prev) => [
      { variable: "font-family", from: tokens.primitives.fontFamily, to: font, timestamp: new Date() },
      ...prev,
    ].slice(0, 10));
  }

  function handleFontFamilyKoChange(font: string) {
    setTokens((prev) => ({ ...prev, primitives: { ...prev.primitives, fontFamilyKo: font } }));
    // 즉시 CSS 반영
    const en = tokens.primitives.fontFamily;
    let stack = '';
    let stackKo = '';
    if (font && en && en !== 'Geist') {
      stack = `'${en}', '${font}', sans-serif`;
      stackKo = `'${font}', '${en}', sans-serif`;
    } else if (font) {
      stack = `'${font}', sans-serif`;
      stackKo = stack;
    }
    if (stack) {
      document.documentElement.style.setProperty('--font-sans', stack);
      document.body.style.fontFamily = stack;
    }
    applyLangKoOverride(stackKo !== stack ? stackKo : '');
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

  // ── Save to Supabase ────────────────────────────────────────────
  async function handleSave(): Promise<boolean> {
    if (!activeDs) return false;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const { error } = await supabase
        .from("design_systems")
        .update({
          tokens,
          icon_library: tokens.primitives.iconLibrary,
          style_preset: tokens.primitives.stylePreset,
          updated_at: new Date().toISOString(),
        })
        .eq("id", activeDs.id);

      if (error) {
        alert(`저장 실패: ${error.message}`);
        setIsSaving(false);
        return false;
      }

      // 로컬 상태도 업데이트
      setDesignSystems((prev) =>
        prev.map((ds) => ds.id === activeDs.id ? { ...ds, tokens, icon_library: tokens.primitives.iconLibrary, style_preset: tokens.primitives.stylePreset } : ds)
      );
      setActiveDs((prev) => prev ? { ...prev, tokens } : prev);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      setIsSaving(false);
      return true;
    } catch {
      alert("저장 실패: network error");
      setIsSaving(false);
      return false;
    }
  }

  // ── Sidebar handlers ────────────────────────────────────────────
  function handleSelectDs(ds: DesignSystem) {
    setActiveDs(ds);
    setTokens(ds.tokens);
    applyTokensToDocument(ds.tokens);
    applyStylePreset(ds.style_preset || "vega");
    setHistory([]);
    setSnapshots([]);
  }

  function handleDsCreated(ds: DesignSystem) {
    setDesignSystems((prev) => [...prev, ds]);
    handleSelectDs(ds);
  }

  function handleDsDeleted(id: string) {
    setDesignSystems((prev) => {
      const next = prev.filter((ds) => ds.id !== id);
      if (activeDs?.id === id && next.length > 0) {
        handleSelectDs(next[0]);
      }
      return next;
    });
  }

  function handleDsRenamed(id: string, name: string) {
    setDesignSystems((prev) =>
      prev.map((ds) => ds.id === id ? { ...ds, name } : ds)
    );
    if (activeDs?.id === id) {
      setActiveDs((prev) => prev ? { ...prev, name } : prev);
    }
  }

  if (!loaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-[var(--ds-element-radius)] bg-primary flex items-center justify-center mx-auto">
            <span className="text-primary-foreground text-lg font-bold">DS</span>
          </div>
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <AppSidebar
        designSystems={designSystems}
        activeId={activeDs?.id ?? null}
        onSelect={handleSelectDs}
        onCreated={handleDsCreated}
        onDeleted={handleDsDeleted}
        onRenamed={handleDsRenamed}
        userName={userName}
        userEmail={userEmail}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
      <EditorHeader
        isDark={isDark}
        onToggleDark={() => setIsDark(!isDark)}
        onSave={handleSave}
        isSaving={isSaving}
        saveSuccess={saveSuccess}
        onUndo={handleUndo}
        canUndo={snapshots.length > 0}
        onReset={handleReset}
        fontFamily={tokens.primitives.fontFamily}
        fontFamilyKo={tokens.primitives.fontFamilyKo}
        iconLibrary={tokens.primitives.iconLibrary}
      />
      <div className="flex-1 flex overflow-hidden">
        <EditorPanel
          tokens={tokens}
          onTokenChange={handleTokenChange}
          onBatchChange={handleBatchChange}
          onSemanticChange={handleSemanticChange}
          onFontFamilyChange={handleFontFamilyChange}
          onFontFamilyKoChange={handleFontFamilyKoChange}
          onIconLibraryChange={(lib: string) => setTokens((prev) => ({ ...prev, primitives: { ...prev.primitives, iconLibrary: lib } }))}
          onStylePresetChange={(preset: string) => setTokens((prev) => ({ ...prev, primitives: { ...prev.primitives, stylePreset: preset } }))}
          history={history.slice(0, 3)}
        />
        <PreviewPanel iconLibrary={tokens.primitives.iconLibrary} />
      </div>
      </div>
    </div>
  );
}
