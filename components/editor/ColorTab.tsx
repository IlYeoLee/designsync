"use client";

import * as React from "react";
import { ColorScale, TokenState } from "@/lib/tokens";
import { oklchToHex } from "@/lib/color";

type ColorScaleName = "brand" | "neutral" | "error" | "success" | "warning";
const COLOR_SCALES: ColorScaleName[] = ["brand", "neutral", "error", "success", "warning"];
const STEPS = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"] as const;

const SCALE_LABELS: Record<ColorScaleName, string> = {
  brand: "Brand",
  neutral: "Neutral",
  error: "Error",
  success: "Success",
  warning: "Warning",
};

interface ColorTabProps {
  tokens: TokenState;
  onTokenChange: (variable: string, value: string) => void;
}

export function ColorTab({ tokens, onTokenChange }: ColorTabProps) {
  const [activeColor, setActiveColor] = React.useState<{ scale: ColorScaleName; step: string } | null>(null);

  function getSwatchHex(scale: ColorScaleName, step: string): string {
    const value = tokens.primitives[scale][step as keyof ColorScale];
    return oklchToHex(value);
  }

  function handleColorChange(scale: ColorScaleName, step: string, hex: string) {
    onTokenChange(`--${scale}-${step}`, hex);
  }

  return (
    <div className="space-y-5 p-4">
      {COLOR_SCALES.map((scale) => (
        <div key={scale}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-foreground capitalize">
              {SCALE_LABELS[scale]}
            </span>
          </div>
          <div className="grid grid-cols-10 gap-1">
            {STEPS.map((step) => {
              const hex = getSwatchHex(scale, step);
              const isActive = activeColor?.scale === scale && activeColor?.step === step;
              return (
                <div key={step} className="relative">
                  <button
                    title={`${scale}-${step}: ${tokens.primitives[scale][step as keyof ColorScale]}`}
                    className={`
                      w-full aspect-square rounded-sm border-2 cursor-pointer transition-transform hover:scale-110
                      ${isActive ? "border-foreground scale-110 shadow-md" : "border-transparent"}
                    `}
                    style={{ backgroundColor: hex }}
                    onClick={() => setActiveColor(isActive ? null : { scale, step })}
                  />
                  {isActive && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-20 bg-card border border-border rounded-md shadow-lg p-2 min-w-[120px]">
                      <p className="text-xs text-muted-foreground mb-1 font-mono">{scale}-{step}</p>
                      <input
                        type="color"
                        value={hex}
                        className="w-full h-8 rounded cursor-pointer border-0"
                        onChange={(e) => handleColorChange(scale, step, e.target.value)}
                      />
                      <p className="text-xs font-mono text-center mt-1 text-muted-foreground">{hex}</p>
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

      {/* Semantic mappings info */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground mb-3 font-medium">Semantic Mappings (Light)</p>
        <div className="space-y-1.5">
          {[
            { label: "Primary", varName: "--primary", value: tokens.semantic.light.primary },
            { label: "Background", varName: "--background", value: tokens.semantic.light.background },
            { label: "Foreground", varName: "--foreground", value: tokens.semantic.light.foreground },
            { label: "Accent", varName: "--accent", value: tokens.semantic.light.accent },
            { label: "Destructive", varName: "--destructive", value: tokens.semantic.light.destructive },
            { label: "Border", varName: "--border", value: tokens.semantic.light.border },
            { label: "Muted", varName: "--muted", value: tokens.semantic.light.muted },
          ].map(({ label, varName, value }) => (
            <div key={varName} className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{label}</span>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-4 h-4 rounded-sm border border-border"
                  style={{ backgroundColor: `var(${varName})` }}
                />
                <code className="text-xs text-muted-foreground">{value}</code>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
