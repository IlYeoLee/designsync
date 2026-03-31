"use client";

import * as React from "react";
import { ColorScale, TokenState } from "@/lib/tokens";
import { oklchToHex, generatePaletteFromHex, getAutoForegrounds } from "@/lib/color";
import { getIconMap } from "@/lib/icon-map";
import { Button } from "@/registry/new-york/ui/button";
import { Input } from "@/registry/new-york/ui/input";

type ColorScaleName = "brand" | "neutral" | "error" | "success" | "info";
const COLOR_SCALES: ColorScaleName[] = ["brand", "neutral", "error", "success", "info"];
const STEPS = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"] as const;
type Step = typeof STEPS[number];

// Neutral color variant presets — each is a full 50-900 oklch scale
// Lightness values match the default neutral scale; chroma/hue give a subtle tint
const NEUTRAL_PRESETS: Record<string, Record<Step, string>> = {
  Neutral: {
    "50":  "oklch(0.99 0 0)",
    "100": "oklch(0.97 0 0)",
    "200": "oklch(0.93 0 0)",
    "300": "oklch(0.87 0 0)",
    "400": "oklch(0.72 0 0)",
    "500": "oklch(0.57 0 0)",
    "600": "oklch(0.45 0 0)",
    "700": "oklch(0.33 0 0)",
    "800": "oklch(0.22 0 0)",
    "900": "oklch(0.13 0 0)",
  },
  Stone: {
    "50":  "oklch(0.99 0.003 60)",
    "100": "oklch(0.97 0.004 60)",
    "200": "oklch(0.93 0.004 60)",
    "300": "oklch(0.87 0.005 60)",
    "400": "oklch(0.72 0.006 60)",
    "500": "oklch(0.57 0.006 60)",
    "600": "oklch(0.45 0.006 60)",
    "700": "oklch(0.33 0.007 60)",
    "800": "oklch(0.22 0.007 60)",
    "900": "oklch(0.13 0.007 60)",
  },
  Zinc: {
    "50":  "oklch(0.99 0.002 260)",
    "100": "oklch(0.97 0.003 260)",
    "200": "oklch(0.93 0.004 260)",
    "300": "oklch(0.87 0.005 260)",
    "400": "oklch(0.72 0.005 260)",
    "500": "oklch(0.57 0.005 260)",
    "600": "oklch(0.45 0.005 260)",
    "700": "oklch(0.33 0.006 260)",
    "800": "oklch(0.22 0.006 260)",
    "900": "oklch(0.13 0.006 260)",
  },
  Slate: {
    "50":  "oklch(0.99 0.003 250)",
    "100": "oklch(0.97 0.004 250)",
    "200": "oklch(0.93 0.005 250)",
    "300": "oklch(0.87 0.006 250)",
    "400": "oklch(0.72 0.007 250)",
    "500": "oklch(0.57 0.008 250)",
    "600": "oklch(0.45 0.008 250)",
    "700": "oklch(0.33 0.009 250)",
    "800": "oklch(0.22 0.009 250)",
    "900": "oklch(0.13 0.010 250)",
  },
  Mauve: {
    "50":  "oklch(0.99 0.003 310)",
    "100": "oklch(0.97 0.004 310)",
    "200": "oklch(0.93 0.005 310)",
    "300": "oklch(0.87 0.006 310)",
    "400": "oklch(0.72 0.007 310)",
    "500": "oklch(0.57 0.007 310)",
    "600": "oklch(0.45 0.007 310)",
    "700": "oklch(0.33 0.008 310)",
    "800": "oklch(0.22 0.008 310)",
    "900": "oklch(0.13 0.009 310)",
  },
  Olive: {
    "50":  "oklch(0.99 0.003 130)",
    "100": "oklch(0.97 0.004 130)",
    "200": "oklch(0.93 0.005 130)",
    "300": "oklch(0.87 0.005 130)",
    "400": "oklch(0.72 0.006 130)",
    "500": "oklch(0.57 0.006 130)",
    "600": "oklch(0.45 0.006 130)",
    "700": "oklch(0.33 0.007 130)",
    "800": "oklch(0.22 0.007 130)",
    "900": "oklch(0.13 0.008 130)",
  },
  Taupe: {
    "50":  "oklch(0.99 0.003 80)",
    "100": "oklch(0.97 0.004 80)",
    "200": "oklch(0.93 0.005 80)",
    "300": "oklch(0.87 0.006 80)",
    "400": "oklch(0.72 0.006 80)",
    "500": "oklch(0.57 0.007 80)",
    "600": "oklch(0.45 0.007 80)",
    "700": "oklch(0.33 0.008 80)",
    "800": "oklch(0.22 0.008 80)",
    "900": "oklch(0.13 0.009 80)",
  },
};

const SCALE_LABELS: Record<ColorScaleName, string> = {
  brand: "브랜드 컬러", neutral: "뉴트럴 컬러", error: "오류/경고 컬러", success: "성공 컬러", info: "정보 컬러",
};

// All primitive color var options for semantic dropdowns
const PRIMITIVE_VAR_OPTIONS: { label: string; value: string; scale: ColorScaleName; step: string }[] = [
  ...COLOR_SCALES.flatMap((scale) =>
    STEPS.map((step) => ({
      label: `${scale}-${step}`,
      value: `var(--${scale}-${step})`,
      scale,
      step,
    }))
  ),
  { label: "white", value: "oklch(1 0 0)", scale: "neutral" as ColorScaleName, step: "white" },
  { label: "black", value: "oklch(0 0 0)", scale: "neutral" as ColorScaleName, step: "black" },
];

// Semantic token labels: English name + Korean short description
const SEMANTIC_INFO: Record<string, { label: string; desc: string }> = {
  background:              { label: "배경",           desc: "페이지 배경" },
  card:                    { label: "카드",           desc: "카드 배경" },
  "card-foreground":       { label: "카드 텍스트",    desc: "카드 위 글자" },
  popover:                 { label: "팝오버",         desc: "팝오버/드롭다운 배경" },
  "popover-foreground":    { label: "팝오버 텍스트",  desc: "팝오버 위 글자" },
  secondary:               { label: "보조 배경",      desc: "2차 영역 배경" },
  "secondary-foreground":  { label: "보조 텍스트",    desc: "보조 배경 위 글자" },
  muted:                   { label: "흐린 배경",      desc: "흐린 영역 배경" },
  accent:                  { label: "강조 배경",      desc: "강조/hover 배경" },
  foreground:              { label: "텍스트",         desc: "기본 글자색" },
  "muted-foreground":      { label: "흐린 텍스트",   desc: "부제목·설명 글자" },
  "accent-foreground":     { label: "강조 텍스트",   desc: "강조 배경 위 글자" },
  primary:                 { label: "주 색상",        desc: "브랜드 메인 색상" },
  "primary-foreground":    { label: "주 색 위 텍스트", desc: "주 색상 위 글자" },
  destructive:             { label: "오류 배경",       desc: "오류·삭제 상태 배경" },
  "destructive-foreground":{ label: "오류 텍스트",    desc: "오류 배경 위 글자" },
  "error-border":          { label: "오류 선",        desc: "오류 상태 테두리" },
  border:                  { label: "선",             desc: "일반 UI 테두리" },
  "card-border":           { label: "카드 선",        desc: "카드·패널 테두리" },
  input:                   { label: "입력선",         desc: "폼 요소 테두리" },
  divider:                 { label: "구분선",         desc: "구분선 | 사이드바 선 | 라인탭 하단선" },
  ring:                    { label: "포커스",         desc: "포커스 링 색" },
  selected:                { label: "선택됨",         desc: "선택 항목 배경" },
  "selected-foreground":   { label: "선택 텍스트",   desc: "선택 항목 글자" },
  success:                 { label: "성공 배경",      desc: "성공 상태 배경" },
  "success-foreground":    { label: "성공 텍스트",   desc: "성공 배경 위 글자" },
  "success-border":        { label: "성공 선",        desc: "성공 상태 테두리" },
  warning:                 { label: "경고 배경",      desc: "경고 상태 배경" },
  "warning-foreground":    { label: "경고 텍스트",   desc: "경고 배경 위 글자" },
  "warning-border":        { label: "경고 선",        desc: "경고 상태 테두리" },
  info:                    { label: "정보 배경",      desc: "정보 상태 배경" },
  "info-foreground":       { label: "정보 텍스트",   desc: "정보 배경 위 글자" },
};

// Grouping for semantic token editor
const SEMANTIC_GROUPS: { title: string; keys: string[] }[] = [
  { title: "배경",   keys: ["background", "card", "card-foreground", "popover", "popover-foreground", "secondary", "secondary-foreground", "muted", "accent"] },
  { title: "텍스트", keys: ["foreground", "muted-foreground", "accent-foreground"] },
  { title: "액션",   keys: ["primary", "primary-foreground"] },
  { title: "테두리", keys: ["card-border", "input", "divider", "ring"] },
  { title: "상태",   keys: ["selected", "selected-foreground"] },
  { title: "피드백", keys: ["destructive", "destructive-foreground", "error-border", "success", "success-foreground", "success-border", "warning", "warning-foreground", "warning-border", "info", "info-foreground"] },
];

// Non-color semantic tokens to hide from the color editor
const SEMANTIC_SKIP = new Set(["radius"]);

interface ColorTabProps {
  tokens: TokenState;
  onTokenChange: (variable: string, value: string) => void;
  onBatchChange: (changes: { variable: string; value: string }[]) => void;
  onSemanticChange: (mode: "light" | "dark", key: string, value: string) => void;
  iconLibrary: string;
  isDark: boolean;
}

/** Custom dropdown for semantic token with color swatches */
function SemanticDropdown({
  value,
  tokens,
  onChange,
}: {
  value: string;
  tokens: TokenState;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Get color for a var() reference
  function getColor(val: string): string {
    if (val.startsWith("var(--")) {
      const varName = val.match(/var\(--([^)]+)\)/)?.[1];
      if (varName) {
        const [scale, step] = varName.split("-") as [ColorScaleName, string];
        if (tokens.primitives[scale] && step in (tokens.primitives[scale] as ColorScale)) {
          return (tokens.primitives[scale] as ColorScale)[step as keyof ColorScale];
        }
      }
    }
    return val;
  }

  const currentLabel = PRIMITIVE_VAR_OPTIONS.find((o) => o.value === value)?.label || value;

  return (
    <div ref={ref} className="relative flex-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        className="w-full h-6 text-[10px] px-1.5 font-mono truncate text-left flex items-center gap-1"
      >
        <span
          className="w-3 h-3 rounded-sm border border-border flex-shrink-0 inline-block"
          style={{ backgroundColor: getColor(value) }}
        />
        <span className="truncate">{currentLabel}</span>
      </Button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-40 bg-card border border-border rounded-[var(--ds-element-radius)] shadow-lg max-h-[240px] overflow-y-auto w-full min-w-[180px]">
          {COLOR_SCALES.map((scale) => (
            <div key={scale}>
              <div className="px-2 py-1 text-[9px] font-medium text-muted-foreground bg-muted/50 sticky top-0">
                {SCALE_LABELS[scale]}
              </div>
              {STEPS.map((step) => {
                const opt = PRIMITIVE_VAR_OPTIONS.find(
                  (o) => o.scale === scale && o.step === step
                );
                if (!opt) return null;
                const color = getColor(opt.value);
                const isSelected = opt.value === value;
                return (
                  <Button
                    key={opt.value}
                    variant="ghost"
                    size="sm"
                    className={`w-full px-2 py-0.5 h-auto text-[10px] font-mono flex items-center gap-1.5 rounded-none justify-start ${
                      isSelected ? "bg-accent font-medium" : ""
                    }`}
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                  >
                    <span
                      className="w-3 h-3 rounded-sm border border-border flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    {opt.label}
                  </Button>
                );
              })}
            </div>
          ))}
          {/* White / Black / Transparent */}
          <div className="px-2 py-1 text-[9px] font-medium text-muted-foreground bg-muted/50 sticky top-0">
            기타
          </div>
          {[
            { label: "white", value: "oklch(1 0 0)", color: "#ffffff" },
            { label: "black", value: "oklch(0 0 0)", color: "#000000" },
            { label: "없음 (transparent)", value: "transparent", color: "transparent" },
          ].map((opt) => (
            <Button
              key={opt.value}
              variant="ghost"
              size="sm"
              className={`w-full px-2 py-0.5 h-auto text-[10px] font-mono flex items-center gap-1.5 rounded-none justify-start ${
                opt.value === value ? "bg-accent font-medium" : ""
              }`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              <span
                className="w-3 h-3 rounded-sm border border-border flex-shrink-0"
                style={{ backgroundColor: opt.color }}
              />
              {opt.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Detect which neutral preset currently matches the token state (if any) */
function detectActiveNeutralPreset(tokens: TokenState): string | null {
  for (const [name, preset] of Object.entries(NEUTRAL_PRESETS)) {
    const allMatch = STEPS.every((step) => {
      const current = tokens.primitives.neutral[step as keyof ColorScale]
        .replace(/\s+/g, " ")
        .trim();
      const expected = preset[step].replace(/\s+/g, " ").trim();
      return current === expected;
    });
    if (allMatch) return name;
  }
  return null;
}

/** Row of small preset buttons for neutral color variants */
function NeutralPresetSelector({
  tokens,
  onBatchChange,
}: {
  tokens: TokenState;
  onBatchChange: (changes: { variable: string; value: string }[]) => void;
}) {
  const activePreset = detectActiveNeutralPreset(tokens);

  function applyPreset(name: string) {
    const preset = NEUTRAL_PRESETS[name];
    if (!preset) return;
    const changes = STEPS.map((step) => ({
      variable: `--neutral-${step}`,
      value: preset[step],
    }));
    onBatchChange(changes);
  }

  return (
    <div className="flex items-center gap-1.5 mb-2 flex-wrap">
      {Object.entries(NEUTRAL_PRESETS).map(([name, preset]) => {
        const isActive = activePreset === name;
        return (
          <Button
            key={name}
            variant="outline"
            size="sm"
            className={`flex items-center gap-1 px-1.5 py-0.5 h-auto text-[10px] ${
              isActive
                ? "border-foreground bg-accent text-foreground font-medium"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            }`}
            onClick={() => applyPreset(name)}
            title={`뉴트럴 프리셋: ${name}`}
          >
            <span
              className="w-3 h-3 rounded-sm border border-border flex-shrink-0"
              style={{ backgroundColor: preset["500"] }}
            />
            <span>{name}</span>
          </Button>
        );
      })}
    </div>
  );
}

export function ColorTab({ tokens, onTokenChange, onBatchChange, onSemanticChange, iconLibrary, isDark }: ColorTabProps) {
  const icons = getIconMap(iconLibrary);
  const [mounted, setMounted] = React.useState(false);
  const [activeColor, setActiveColor] = React.useState<{ scale: ColorScaleName; step: string } | null>(null);
  const colorGridRef = React.useRef<HTMLDivElement>(null);
  const [pickerHex, setPickerHex] = React.useState("#000000");
  // Per-scale one-click picker hex
  const [scalePicker, setScalePicker] = React.useState<Record<ColorScaleName, string>>({
    brand: "#000000", neutral: "#808080", error: "#e03030", success: "#20a020", info: "#0080d0",
  });
  const [openScalePicker, setOpenScalePicker] = React.useState<ColorScaleName | null>(null);
  const [semanticMode, setSemanticMode] = React.useState<"light" | "dark">(isDark ? "dark" : "light");
  const [semanticOpen, setSemanticOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // 헤더 다크모드 토글과 시맨틱 편집 모드 동기화
  React.useEffect(() => {
    setSemanticMode(isDark ? "dark" : "light");
  }, [isDark]);

  // Close color picker popup when clicking outside the color grid area
  React.useEffect(() => {
    if (!activeColor) return;
    function handleClick(e: MouseEvent) {
      if (colorGridRef.current && !colorGridRef.current.contains(e.target as Node)) {
        setActiveColor(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [activeColor]);

  // Compute initial scale picker hex after mount
  React.useEffect(() => {
    if (!mounted) return;
    const next = { ...scalePicker };
    for (const scale of COLOR_SCALES) {
      if (scale === "neutral") continue;
      const val = tokens.primitives[scale]["600" as Step];
      next[scale] = oklchToHex(val);
    }
    setScalePicker(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  function handleSwatchClick(scale: ColorScaleName, step: string) {
    const isActive = activeColor?.scale === scale && activeColor?.step === step;
    if (isActive) {
      setActiveColor(null);
      return;
    }
    if (mounted) {
      const val = tokens.primitives[scale][step as keyof ColorScale];
      setPickerHex(oklchToHex(val));
    }
    setActiveColor({ scale, step });
  }

  function handlePickerChange(scale: ColorScaleName, step: string, hex: string) {
    setPickerHex(hex);
    // Step 600 is the anchor — changing it regenerates the full palette
    if (step === "600" && scale !== "neutral") {
      const palette = generatePaletteFromHex(hex);
      if (palette) {
        const changes = Object.entries(palette).map(([s, value]) => ({
          variable: `--${scale}-${s}`,
          value,
        }));
        onBatchChange(changes);
        setScalePicker((prev) => ({ ...prev, [scale]: hex }));

        // Auto-contrast for brand palette
        if (scale === "brand") {
          applyAutoForegrounds(palette);
        }
        return;
      }
    }
    onTokenChange(`--${scale}-${step}`, hex);
  }

  /** Apply auto-contrast foregrounds for all semantic tokens that sit on brand colors */
  function applyAutoForegrounds(palette: Record<string, string>) {
    const fgs = getAutoForegrounds(palette);
    for (const [key, value] of Object.entries(fgs.light)) {
      onSemanticChange("light", key, value);
    }
    for (const [key, value] of Object.entries(fgs.dark)) {
      onSemanticChange("dark", key, value);
    }
  }

  function handleGeneratePalette(scale: ColorScaleName, hex: string) {
    const palette = generatePaletteFromHex(hex);
    if (!palette) return;
    const changes = Object.entries(palette).map(([step, value]) => ({
      variable: `--${scale}-${step}`,
      value,
    }));
    // neutral-50 is always white
    if (scale === "neutral") {
      const idx = changes.findIndex((c) => c.variable === "--neutral-50");
      if (idx !== -1) changes[idx].value = "oklch(1 0 0)";
      else changes.push({ variable: "--neutral-50", value: "oklch(1 0 0)" });
    }
    onBatchChange(changes);

    // Brand 팔레트 변경 시 foreground 자동 대비 (WCAG 기반)
    if (scale === "brand") {
      applyAutoForegrounds(palette);
    }

    setOpenScalePicker(null);
  }

  function handleScalePickerChange(scale: ColorScaleName, hex: string) {
    setScalePicker((prev) => ({ ...prev, [scale]: hex }));
  }

  function handleScalePickerHexInput(scale: ColorScaleName, raw: string) {
    const withHash = raw.startsWith("#") ? raw : `#${raw}`;
    if (/^#[0-9a-fA-F]{0,6}$/.test(withHash)) {
      setScalePicker((prev) => ({ ...prev, [scale]: withHash }));
      if (withHash.length === 7) {
        // Valid hex — no auto-generate, just update picker display
      }
    }
  }

  const semanticTokens = semanticMode === "light" ? tokens.semantic.light : tokens.semantic.dark;

  return (
    <div className="flex flex-col gap-[var(--ds-section-gap)] p-[var(--ds-card-padding)]">
      {/* Color Scales */}
      <div ref={colorGridRef}>
      {COLOR_SCALES.map((scale) => (
        <div key={scale}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-foreground capitalize">{SCALE_LABELS[scale]}</span>
            <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground px-1.5 py-0.5 h-auto hover:border-primary/50"
                  onClick={() => setOpenScalePicker(openScalePicker === scale ? null : scale)}
                  title="기준색 하나로 팔레트 자동 생성"
                >
                  <icons.wand className="w-2.5 h-2.5" />
                  Auto
                </Button>
                {openScalePicker === scale && (
                  <div className="absolute right-0 top-full mt-1 z-30 bg-card border border-border rounded-[var(--ds-element-radius)] shadow-lg p-3 min-w-[200px]">
                    <p className="text-[10px] text-muted-foreground mb-2 font-medium">
                      기준색 → 50~900 자동 생성
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="color"
                        value={scalePicker[scale]}
                        onChange={(e) => handleScalePickerChange(scale, e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border border-border"
                      />
                      <Input
                        type="text"
                        value={scalePicker[scale]}
                        onChange={(e) => handleScalePickerHexInput(scale, e.target.value)}
                        onBlur={(e) => {
                          const raw = e.target.value;
                          const withHash = raw.startsWith("#") ? raw : `#${raw}`;
                          if (/^#[0-9a-fA-F]{6}$/.test(withHash)) {
                            setScalePicker((prev) => ({ ...prev, [scale]: withHash }));
                          }
                        }}
                        className="flex-1 h-8 text-xs px-2 font-mono"
                        placeholder="#000000"
                      />
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full h-7 text-xs font-medium"
                      onClick={() => handleGeneratePalette(scale, scalePicker[scale])}
                    >
                      팔레트 생성
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-6 text-[10px] text-muted-foreground hover:text-foreground mt-1"
                      onClick={() => setOpenScalePicker(null)}
                    >
                      취소
                    </Button>
                  </div>
                )}
              </div>
          </div>

          {/* Neutral preset selector — only for the neutral scale */}
          {scale === "neutral" && (
            <NeutralPresetSelector tokens={tokens} onBatchChange={onBatchChange} />
          )}

          <div className="grid grid-cols-10 gap-1">
            {STEPS.map((step, stepIdx) => {
              const value = tokens.primitives[scale][step as keyof ColorScale];
              const isActive = activeColor?.scale === scale && activeColor?.step === step;
              // Position popup: left for first 3 steps, right for last 3, center otherwise
              const popupAlign = stepIdx <= 2 ? "left-0" : stepIdx >= 7 ? "right-0" : "left-1/2 -translate-x-1/2";
              return (
                <div key={step} className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    title={`${scale}-${step}: ${value}`}
                    className={`w-full aspect-square rounded-sm border-2 cursor-pointer transition-transform hover:scale-110 p-0 h-auto ${
                      isActive ? "border-foreground scale-110 shadow-md" : "border-transparent"
                    }`}
                    style={{ backgroundColor: value }}
                    onClick={() => handleSwatchClick(scale, step)}
                  />
                  {isActive && mounted && (
                    <div className={`absolute top-full ${popupAlign} mt-1 z-20 bg-card border border-border rounded-[var(--ds-element-radius)] shadow-lg p-2 min-w-[130px]`}>
                      <p className="text-xs text-muted-foreground mb-1 font-mono">{scale}-{step}</p>
                      <input
                        type="color"
                        value={pickerHex}
                        className="w-full h-8 rounded cursor-pointer border-0"
                        onChange={(e) => handlePickerChange(scale, step, e.target.value)}
                      />
                      <Input
                        type="text"
                        value={pickerHex}
                        className="w-full h-6 text-[10px] px-1.5 mt-1 font-mono text-center"
                        onChange={(e) => {
                          const raw = e.target.value;
                          // Allow typing with or without '#'
                          const withHash = raw.startsWith("#") ? raw : `#${raw}`;
                          if (/^#[0-9a-fA-F]{0,6}$/.test(withHash)) {
                            setPickerHex(withHash);
                            if (withHash.length === 7) {
                              handlePickerChange(scale, step, withHash);
                            }
                          }
                        }}
                        onBlur={(e) => {
                          // On blur, if valid 7-char hex, apply
                          const raw = e.target.value;
                          const withHash = raw.startsWith("#") ? raw : `#${raw}`;
                          if (/^#[0-9a-fA-F]{6}$/.test(withHash)) {
                            handlePickerChange(scale, step, withHash);
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-10 gap-1 mt-0.5">
            {STEPS.map((step) => (
              <span key={step} className="text-center text-[8px] text-muted-foreground">{step}</span>
            ))}
          </div>
        </div>
      ))}
      </div>

      {/* Semantic Mappings – Editable */}
      <div className="mt-4 pt-4 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className="w-full flex items-center justify-between mb-[var(--ds-internal-gap)] h-auto px-0 hover:bg-transparent"
          onClick={() => setSemanticOpen((v) => !v)}
        >
          <p className="text-xs text-muted-foreground font-medium">시멘틱 토큰</p>
          <icons.chevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${semanticOpen ? "rotate-180" : ""}`} />
        </Button>

        {semanticOpen && (
          <>
            {/* Light / Dark toggle */}
            <div className="flex border border-border rounded-[var(--ds-element-radius)] overflow-hidden mb-[var(--ds-internal-gap)]">
              {(["light", "dark"] as const).map((m) => (
                <Button
                  key={m}
                  variant={semanticMode === m ? "default" : "ghost"}
                  size="sm"
                  className={`flex-1 text-xs py-1 h-auto rounded-none ${
                    semanticMode !== m
                      ? "bg-background text-muted-foreground hover:bg-accent"
                      : ""
                  }`}
                  onClick={() => setSemanticMode(m)}
                >
                  {m === "light" ? "라이트" : "다크"}
                </Button>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              {SEMANTIC_GROUPS.map((group) => {
                const groupEntries = group.keys
                  .filter((key) => !SEMANTIC_SKIP.has(key))
                  .map((key) => [key, semanticTokens[key]] as [string, string])
                  .filter(([, value]) => value !== undefined);
                if (groupEntries.length === 0) return null;
                return (
                  <div key={group.title}>
                    <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 px-0.5">{group.title}</p>
                    <div className="flex flex-col gap-[var(--ds-internal-gap)]">
                      {groupEntries.map(([key, value]) => {
                        const info = SEMANTIC_INFO[key];
                        return (
                          <div key={key} className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-sm border border-border flex-shrink-0"
                              style={{ backgroundColor: value === "transparent" ? "transparent" : `var(--${key})` }}
                            />
                            <div className="w-24 flex-shrink-0">
                              <span className="text-[10px] text-foreground font-medium block leading-tight truncate">
                                {info?.label ?? key}
                              </span>
                              {info?.desc && (
                                <span className="text-[9px] text-muted-foreground block leading-tight">
                                  {info.desc}
                                </span>
                              )}
                            </div>
                            <SemanticDropdown
                              value={value}
                              tokens={tokens}
                              onChange={(v) => onSemanticChange(semanticMode, key, v)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {/* 그룹에 없는 토큰 (사용자 커스텀) */}
              {Object.entries(semanticTokens)
                .filter(([key]) => !SEMANTIC_SKIP.has(key) && !SEMANTIC_GROUPS.flatMap((g) => g.keys).includes(key))
                .map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-sm border border-border flex-shrink-0" style={{ backgroundColor: `var(--${key})` }} />
                    <div className="w-24 flex-shrink-0">
                      <span className="text-[10px] text-foreground font-medium block leading-tight truncate">{key}</span>
                    </div>
                    <SemanticDropdown value={value} tokens={tokens} onChange={(v) => onSemanticChange(semanticMode, key, v)} />
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
