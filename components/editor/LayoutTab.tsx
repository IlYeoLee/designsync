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

/** Input showing px, but stores/emits rem. For 9999px edge case, bypasses conversion. */
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
  const displayUnit = isSpecial ? "px" : "px";

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
        {displayUnit}
      </span>
    </div>
  );
}

export function LayoutTab({ tokens, onTokenChange }: LayoutTabProps) {
  return (
    <div className="space-y-6 p-4">
      {/* Border Radius */}
      <div>
        <p className="text-xs font-medium text-foreground mb-3">Border Radius</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {RADIUS_OPTIONS.map(({ key, label, value }) => {
            const currentRadius = tokens.primitives.radius[key as keyof typeof tokens.primitives.radius];
            return (
              <button
                key={key}
                onClick={() => {
                  onTokenChange(
                    `--radius-${key === "none" ? "none" : key === "full" ? "full" : `${key}-prim`}`,
                    value
                  );
                  onTokenChange("--radius", value === "9999px" ? "9999px" : value);
                }}
                className="flex flex-col items-center gap-2 p-2.5 rounded-md border border-border hover:border-primary/50 hover:bg-accent/30 transition-colors"
              >
                <div className="w-8 h-8 bg-primary" style={{ borderRadius: currentRadius }} />
                <span className="text-[10px] text-muted-foreground">{label}</span>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground mb-2">Custom values</p>
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
                  max={64}
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

      <div className="rounded-md bg-muted/50 p-3 border border-border">
        <p className="text-xs text-muted-foreground">
          All values are stored as rem internally. The <code className="font-mono text-xs">--radius</code> semantic
          token follows the MD radius value by default.
        </p>
      </div>
    </div>
  );
}
