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

export function LayoutTab({ tokens, onTokenChange }: LayoutTabProps) {
  return (
    <div className="space-y-6 p-4">
      {/* Border Radius */}
      <div>
        <p className="text-xs font-medium text-foreground mb-3">Border Radius</p>

        {/* Radius presets */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {RADIUS_OPTIONS.map(({ key, label, value }) => {
            const currentValue = tokens.primitives.radius[key as keyof typeof tokens.primitives.radius];
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
                title={currentValue}
              >
                <div
                  className="w-8 h-8 bg-primary"
                  style={{ borderRadius: value }}
                />
                <span className="text-[10px] text-muted-foreground">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Custom radius inputs */}
        <p className="text-xs text-muted-foreground mb-2">Custom values</p>
        <div className="space-y-2">
          {RADIUS_OPTIONS.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-8">{label}</span>
              <input
                type="text"
                value={tokens.primitives.radius[key as keyof typeof tokens.primitives.radius]}
                onChange={(e) => {
                  onTokenChange(
                    `--radius-${key === "none" ? "none" : key === "full" ? "full" : `${key}-prim`}`,
                    e.target.value
                  );
                }}
                className="flex-1 h-7 text-xs px-2 rounded-md border border-input bg-background font-mono focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Spacing Scale */}
      <div>
        <p className="text-xs font-medium text-foreground mb-3">Spacing Scale</p>
        <div className="space-y-2">
          {SPACING_KEYS.map((key) => {
            const value = tokens.primitives.spacing[key as keyof typeof tokens.primitives.spacing];
            const pxValue = Math.round(parseFloat(value) * 16);
            return (
              <div key={key} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-6 font-mono">{key}</span>
                <div className="flex-1 relative">
                  {/* Visual bar */}
                  <div
                    className="h-4 bg-primary/20 rounded-sm border border-primary/30 transition-all"
                    style={{ width: `${Math.min(100, (pxValue / 64) * 100)}%`, minWidth: "2px" }}
                  />
                </div>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => onTokenChange(`--spacing-${key}`, e.target.value)}
                  className="w-20 h-7 text-xs px-2 rounded-md border border-input bg-background font-mono text-right focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <span className="text-xs text-muted-foreground w-8 text-right">{pxValue}px</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info */}
      <div className="rounded-md bg-muted/50 p-3 border border-border">
        <p className="text-xs text-muted-foreground">
          Changes apply instantly to the preview. The <code className="font-mono text-xs">--radius</code> semantic
          token follows the MD radius value by default.
        </p>
      </div>
    </div>
  );
}
