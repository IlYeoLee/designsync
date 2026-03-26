"use client";

import * as React from "react";
import { TokenState } from "@/lib/tokens";
import { STYLE_PRESETS, applyStylePreset } from "@/lib/style-presets";
import { Button } from "@/registry/new-york/ui/button";
import { Input } from "@/registry/new-york/ui/input";
import { Slider } from "@/registry/new-york/ui/slider";
import { getIconMap, type IconName } from "@/lib/icon-map";

const PREVIEW_ICON_KEYS: IconName[] = ["home", "settings", "search", "bell", "mail"];

const ICON_LIBRARIES = [
  { id: "lucide", label: "Lucide", pkg: "lucide-react", desc: "깔끔한 선형 — shadcn 기본", url: "https://lucide.dev/icons" },
  { id: "tabler", label: "Tabler", pkg: "@tabler/icons-react", desc: "5400+ 굵은 선형 아이콘", url: "https://tabler.io/icons" },
  { id: "phosphor", label: "Phosphor", pkg: "@phosphor-icons/react", desc: "6종 굵기 변형 지원", url: "https://phosphoricons.com" },
  { id: "remix", label: "Remix", pkg: "remixicon", desc: "2800+ 선형/채움 아이콘", url: "https://remixicon.com" },
  { id: "hugeicons", label: "Hugeicons", pkg: "@hugeicons/react", desc: "36000+ 다양한 스타일", url: "https://hugeicons.com" },
] as const;

interface LayoutTabProps {
  tokens: TokenState;
  onTokenChange: (variable: string, value: string) => void;
  onIconLibraryChange: (library: string) => void;
  onStylePresetChange: (preset: string) => void;
}

const RADIUS_OPTIONS = [
  { key: "none", label: "없음", value: "0px" },
  { key: "sm", label: "SM", value: "0.25rem" },
  { key: "md", label: "MD", value: "0.375rem" },
  { key: "lg", label: "LG", value: "0.5rem" },
  { key: "xl", label: "XL", value: "0.75rem" },
  { key: "full", label: "최대", value: "9999px" },
] as const;

const SPACING_KEYS = ["1", "2", "3", "4", "5", "6", "8", "10", "12", "16"] as const;
const SHADOW_LEVELS = [
  { key: "sm", label: "SM", yOffset: 1, defaultBlur: 2, defaultSpread: 0, defaultOpacity: 0.05 },
  { key: "md", label: "MD", yOffset: 4, defaultBlur: 6, defaultSpread: -1, defaultOpacity: 0.10 },
  { key: "lg", label: "LG", yOffset: 10, defaultBlur: 15, defaultSpread: -3, defaultOpacity: 0.10 },
] as const;

function parseShadow(shadowStr: string, yOffset: number): { blur: number; spread: number; opacity: number } {
  const m = shadowStr.match(/0\s+\d+px\s+(\d+)px\s+(-?\d+)px\s+oklch\([^/]+\/\s*([\d.]+)\)/);
  if (m) return { blur: parseInt(m[1]), spread: parseInt(m[2]), opacity: parseFloat(m[3]) };
  return { blur: yOffset * 2, spread: 0, opacity: 0.05 };
}

function buildShadow(yOffset: number, blur: number, spread: number, opacity: number): string {
  return `0 ${yOffset}px ${blur}px ${spread}px oklch(0 0 0 / ${opacity.toFixed(2)})`;
}

function RemPxInput({
  value,
  onChange,
  min = 0,
  max = 64,
}: {
  value: string;
  onChange: (v: string) => void;
  min?: number;
  max?: number;
}) {
  const isSpecial = value === "0px" || value === "9999px";
  const remVal = isSpecial ? (value === "9999px" ? 9999 : 0) : parseFloat(value) || 0;
  const pxVal = isSpecial ? (value === "9999px" ? 9999 : 0) : Math.round(remVal * 16);

  const [inputPx, setInputPx] = React.useState(String(pxVal));
  const [focused, setFocused] = React.useState(false);

  React.useEffect(() => {
    if (!focused) setInputPx(String(pxVal));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, focused]);

  function commit(raw: string) {
    const px = parseFloat(raw);
    if (!isNaN(px) && px >= min && px <= max) {
      if (px === 9999) { onChange("9999px"); return; }
      if (px === 0) { onChange("0px"); return; }
      onChange(`${+(px / 16).toFixed(4)}rem`);
    }
    setInputPx(String(pxVal));
  }

  return (
    <div className="flex items-center h-7 rounded-[var(--ds-element-radius)] border border-input bg-background overflow-hidden focus-within:ring-1 focus-within:ring-ring">
      <Input
        type="number"
        min={min}
        max={max}
        step={1}
        value={focused ? inputPx : pxVal}
        onFocus={() => { setFocused(true); setInputPx(String(pxVal)); }}
        onBlur={() => { setFocused(false); commit(inputPx); }}
        onChange={(e) => setInputPx(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
        className="w-12 h-full text-xs px-1.5 bg-transparent font-mono text-right focus:outline-none border-0 shadow-none rounded-none"
      />
      <span className="text-[10px] text-muted-foreground px-1.5 bg-muted/30 h-full flex items-center border-l border-input select-none">
        px
      </span>
    </div>
  );
}

/** Base radius scale (px): even numbers that scale proportionally with the slider */
const BASE_RADIUS_PX = { sm: 2, md: 4, lg: 6, xl: 8 } as const;
const SCALE_STEPS = [0, 2, 4, 6, 8, 10, 12, 14, 16] as const;

function RadiusScaleSlider({
  tokens,
  onTokenChange,
}: {
  tokens: TokenState;
  onTokenChange: (variable: string, value: string) => void;
}) {
  // Derive current scale from md value
  const mdPx = Math.round(parseFloat(tokens.primitives.radius.md || "0") * 16);
  const currentStep = SCALE_STEPS.reduce((closest, step) =>
    Math.abs(step - mdPx) < Math.abs(closest - mdPx) ? step : closest, SCALE_STEPS[0]);

  function applyScale(step: number) {
    const keys = ["sm", "md", "lg", "xl"] as const;
    const base = BASE_RADIUS_PX;
    keys.forEach((k) => {
      const px = Math.round((step / 4) * base[k]);
      // Force even
      const even = px % 2 === 0 ? px : px + 1;
      const val = even === 0 ? "0px" : `${+(even / 16).toFixed(4)}rem`;
      onTokenChange(`--radius-${k}-prim`, val);
    });
    // Also update --radius (used as default)
    const mdVal = Math.round((step / 4) * base.md);
    const mdEven = mdVal % 2 === 0 ? mdVal : mdVal + 1;
    onTokenChange("--radius", mdEven === 0 ? "0px" : `${+(mdEven / 16).toFixed(4)}rem`);
  }

  return (
    <div className="flex flex-col gap-[var(--ds-internal-gap)]">
      <div className="flex items-center gap-[var(--ds-section-gap)]">
        <Slider
          min={0}
          max={16}
          step={2}
          value={[currentStep]}
          onValueChange={(vals) => applyScale(vals[0])}
          className="flex-1"
        />
        <span className="text-xs font-mono text-muted-foreground w-12 text-right">
          {currentStep}px
        </span>
      </div>
      <div className="flex gap-1.5">
        {["sm", "md", "lg", "xl"].map((k) => {
          const v = tokens.primitives.radius[k as keyof typeof tokens.primitives.radius];
          const px = v === "0px" ? 0 : Math.round(parseFloat(v) * 16);
          return (
            <div key={k} className="flex items-center gap-1">
              <div className="w-5 h-5 bg-primary" style={{ borderRadius: v }} />
              <span className="text-[10px] text-muted-foreground">{px}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function LayoutTab({ tokens, onTokenChange, onIconLibraryChange, onStylePresetChange }: LayoutTabProps) {
  return (
    <div className="flex flex-col gap-[var(--ds-section-gap)] p-[var(--ds-card-padding)]">
      {/* Style Presets */}
      <div>
        <p className="text-xs font-medium text-foreground mb-2">스타일 프리셋</p>
        <p className="text-[10px] text-muted-foreground mb-[var(--ds-internal-gap)]">컴포넌트 밀도와 둥글기를 한 번에 설정합니다.</p>
        <div className="grid grid-cols-1 gap-1.5">
          {STYLE_PRESETS.map((preset) => {
            const isActive = tokens.primitives.stylePreset === preset.id;
            const btnH = preset.vars["--ds-button-h-default"];
            const btnRadius = preset.vars["--ds-button-radius"];
            const radiusDisplay = btnRadius === "9999px"
              ? "full"
              : btnRadius === "0"
                ? "0"
                : btnRadius.replace("var(--radius-", "").replace("-prim)", "");
            return (
              <Button
                key={preset.id}
                variant={isActive ? "outline" : "ghost"}
                onClick={() => {
                  applyStylePreset(preset.id);
                  onStylePresetChange(preset.id);
                }}
                className={`flex flex-col items-start px-3 py-2.5 h-auto rounded-[var(--ds-element-radius)] border text-left transition-colors ${
                  isActive
                    ? "border-primary bg-accent text-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-medium">{preset.label}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    h:{btnH} r:{radiusDisplay}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground mt-1">{preset.desc}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Border Radius */}
      <div>
        <p className="text-xs font-medium text-foreground mb-[var(--ds-internal-gap)]">테두리 둥글기</p>

        {/* Global scale slider */}
        <RadiusScaleSlider tokens={tokens} onTokenChange={onTokenChange} />

        <p className="text-xs text-muted-foreground mb-2 mt-4">커스텀 값</p>
        <div className="flex flex-col gap-[var(--ds-internal-gap)]">
          {RADIUS_OPTIONS.map(({ key, label }) => {
            const varKey = key === "none" ? "none" : key === "full" ? "full" : `${key}-prim`;
            const currentValue = tokens.primitives.radius[key as keyof typeof tokens.primitives.radius];
            return (
              <div key={key} className="flex items-center gap-[var(--ds-section-gap)]">
                <span className="text-xs text-muted-foreground w-8">{label}</span>
                <div className="flex-1" />
                <RemPxInput
                  value={currentValue}
                  onChange={(v) => onTokenChange(`--radius-${varKey}`, v)}
                  min={0}
                  max={key === "full" ? 9999 : 64}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Spacing Scale */}
      <div>
        <p className="text-xs font-medium text-foreground mb-1">간격</p>
        <p className="text-[10px] text-muted-foreground mb-[var(--ds-internal-gap)]">px 단위로 표시 (rem으로 저장)</p>
        <div className="flex flex-col gap-[var(--ds-internal-gap)]">
          {SPACING_KEYS.map((key) => {
            const value = tokens.primitives.spacing[key as keyof typeof tokens.primitives.spacing];
            const pxValue = Math.round(parseFloat(value) * 16);
            return (
              <div key={key} className="flex items-center gap-[var(--ds-section-gap)]">
                <span className="text-xs text-muted-foreground w-6 font-mono">{key}</span>
                <div className="flex-1 relative">
                  <div
                    className="h-4 bg-primary/20 rounded-sm border border-primary/30 transition-all"
                    style={{ width: `${Math.min(100, (pxValue / 64) * 100)}%`, minWidth: "2px" }}
                  />
                </div>
                <RemPxInput
                  value={value}
                  onChange={(v) => onTokenChange(`--spacing-${key}`, v)}
                  min={0}
                  max={64}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Shadows */}
      <div>
        <p className="text-xs font-medium text-foreground mb-[var(--ds-internal-gap)]">그림자</p>
        <div className="flex flex-col gap-[var(--ds-section-gap)]">
          {SHADOW_LEVELS.map(({ key, label, yOffset }) => {
            const currentShadow = tokens.primitives.shadows?.[key] ??
              `0 ${yOffset}px ${yOffset * 2}px 0px oklch(0 0 0 / 0.05)`;
            const { blur, spread, opacity } = parseShadow(currentShadow, yOffset);

            function update(newBlur: number, newSpread: number, newOpacity: number) {
              onTokenChange(`--ds-shadow-${key}`, buildShadow(yOffset, newBlur, newSpread, newOpacity));
            }

            return (
              <div key={key}>
                {/* Preview */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-muted-foreground w-6 font-mono">{label}</span>
                  <div
                    className="flex-1 h-8 rounded-[var(--ds-element-radius)] bg-background border border-border/50"
                    style={{ boxShadow: currentShadow }}
                  />
                </div>
                {/* Blur */}
                <div className="flex items-center gap-2 mb-1 pl-8">
                  <span className="text-[10px] text-muted-foreground w-10">블러</span>
                  <Slider
                    min={0} max={30} step={1} value={[blur]}
                    onValueChange={(vals) => update(vals[0], spread, opacity)}
                    className="flex-1"
                  />
                  <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">{blur}px</span>
                </div>
                {/* Spread */}
                <div className="flex items-center gap-2 mb-1 pl-8">
                  <span className="text-[10px] text-muted-foreground w-10">확산</span>
                  <Slider
                    min={-10} max={10} step={1} value={[spread]}
                    onValueChange={(vals) => update(blur, vals[0], opacity)}
                    className="flex-1"
                  />
                  <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">{spread}px</span>
                </div>
                {/* Opacity */}
                <div className="flex items-center gap-2 pl-8">
                  <span className="text-[10px] text-muted-foreground w-10">투명도</span>
                  <Slider
                    min={0} max={0.5} step={0.01} value={[opacity]}
                    onValueChange={(vals) => update(blur, spread, vals[0])}
                    className="flex-1"
                  />
                  <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">{Math.round(opacity * 100)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Icon Library */}
      <div>
        <p className="text-xs font-medium text-foreground mb-2">아이콘 라이브러리</p>
        <p className="text-[10px] text-muted-foreground mb-[var(--ds-internal-gap)]">Copy 시 AI가 이 아이콘 라이브러리를 사용합니다.</p>
        <div className="grid grid-cols-1 gap-1.5">
          {ICON_LIBRARIES.map((lib) => (
            <Button
              key={lib.id}
              variant={tokens.primitives.iconLibrary === lib.id ? "outline" : "ghost"}
              onClick={() => onIconLibraryChange(lib.id)}
              className={`flex flex-col items-start px-3 py-2.5 h-auto rounded-[var(--ds-element-radius)] border text-left transition-colors ${
                tokens.primitives.iconLibrary === lib.id
                  ? "border-primary bg-accent text-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-medium">{lib.label}</span>
                <a
                  href={lib.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] text-muted-foreground hover:text-primary underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  전체 보기
                </a>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                {PREVIEW_ICON_KEYS.map((key) => {
                  const libIcons = getIconMap(lib.id);
                  const Icon = libIcons[key];
                  return <Icon key={key} className="w-4 h-4" />;
                })}
              </div>
              <span className="text-[10px] text-muted-foreground mt-1">{lib.desc}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-[var(--ds-element-radius)] bg-muted/50 p-[var(--ds-card-padding)] border border-border">
        <p className="text-xs text-muted-foreground">
          그림자는 CSS 변수를 통해 <code className="font-mono text-xs">shadow-sm/md/lg</code> Tailwind 유틸리티에 연결됩니다.
          간격 변경은 모든 <code className="font-mono text-xs">p-*</code>, <code className="font-mono text-xs">gap-*</code> 유틸리티에 영향을 줍니다.
        </p>
      </div>

    </div>
  );
}
