"use client";

import * as React from "react";
import { TokenState } from "@/lib/tokens";

interface LayoutTabProps {
  tokens: TokenState;
  onTokenChange: (variable: string, value: string) => void;
}

const RADIUS_OPTIONS = [
  { key: "none", label: "None", value: "0px" },
  { key: "sm", label: "SM", value: "0.25rem" },
  { key: "md", label: "MD", value: "0.375rem" },
  { key: "lg", label: "LG", value: "0.5rem" },
  { key: "xl", label: "XL", value: "0.75rem" },
  { key: "full", label: "Full", value: "9999px" },
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
    <div className="flex items-center h-7 rounded-md border border-input bg-background overflow-hidden focus-within:ring-1 focus-within:ring-ring">
      <input
        type="number"
        min={min}
        max={max}
        step={1}
        value={focused ? inputPx : pxVal}
        onFocus={() => { setFocused(true); setInputPx(String(pxVal)); }}
        onBlur={() => { setFocused(false); commit(inputPx); }}
        onChange={(e) => setInputPx(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
        className="w-12 h-full text-xs px-1.5 bg-transparent font-mono text-right focus:outline-none"
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
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={16}
          step={2}
          value={currentStep}
          onChange={(e) => applyScale(+e.target.value)}
          className="flex-1 h-1.5 accent-primary"
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

export function LayoutTab({ tokens, onTokenChange }: LayoutTabProps) {
  return (
    <div className="space-y-6 p-4">
      {/* Border Radius */}
      <div>
        <p className="text-xs font-medium text-foreground mb-3">Border Radius</p>

        {/* Global scale slider */}
        <RadiusScaleSlider tokens={tokens} onTokenChange={onTokenChange} />

        <p className="text-xs text-muted-foreground mb-2 mt-4">Custom values</p>
        <div className="space-y-2">
          {RADIUS_OPTIONS.map(({ key, label }) => {
            const varKey = key === "none" ? "none" : key === "full" ? "full" : `${key}-prim`;
            const currentValue = tokens.primitives.radius[key as keyof typeof tokens.primitives.radius];
            return (
              <div key={key} className="flex items-center gap-3">
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
        <p className="text-xs font-medium text-foreground mb-1">Spacing Scale</p>
        <p className="text-[10px] text-muted-foreground mb-3">Values shown in px (stored as rem)</p>
        <div className="space-y-2">
          {SPACING_KEYS.map((key) => {
            const value = tokens.primitives.spacing[key as keyof typeof tokens.primitives.spacing];
            const pxValue = Math.round(parseFloat(value) * 16);
            return (
              <div key={key} className="flex items-center gap-3">
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
        <p className="text-xs font-medium text-foreground mb-3">Shadows</p>
        <div className="space-y-5">
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
                    className="flex-1 h-8 rounded-md bg-background border border-border/50"
                    style={{ boxShadow: currentShadow }}
                  />
                </div>
                {/* Blur */}
                <div className="flex items-center gap-2 mb-1 pl-8">
                  <span className="text-[10px] text-muted-foreground w-10">Blur</span>
                  <input
                    type="range" min={0} max={30} step={1} value={blur}
                    onChange={(e) => update(+e.target.value, spread, opacity)}
                    className="flex-1 h-1.5 accent-primary"
                  />
                  <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">{blur}px</span>
                </div>
                {/* Spread */}
                <div className="flex items-center gap-2 mb-1 pl-8">
                  <span className="text-[10px] text-muted-foreground w-10">Spread</span>
                  <input
                    type="range" min={-10} max={10} step={1} value={spread}
                    onChange={(e) => update(blur, +e.target.value, opacity)}
                    className="flex-1 h-1.5 accent-primary"
                  />
                  <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">{spread}px</span>
                </div>
                {/* Opacity */}
                <div className="flex items-center gap-2 pl-8">
                  <span className="text-[10px] text-muted-foreground w-10">Opacity</span>
                  <input
                    type="range" min={0} max={0.5} step={0.01} value={opacity}
                    onChange={(e) => update(blur, spread, +e.target.value)}
                    className="flex-1 h-1.5 accent-primary"
                  />
                  <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">{Math.round(opacity * 100)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-md bg-muted/50 p-3 border border-border">
        <p className="text-xs text-muted-foreground">
          Shadows use <code className="font-mono text-xs">shadow-sm/md/lg</code> Tailwind utilities via CSS var wiring.
          Spacing changes affect all <code className="font-mono text-xs">p-*</code>, <code className="font-mono text-xs">gap-*</code> utilities.
        </p>
      </div>

    </div>
  );
}
