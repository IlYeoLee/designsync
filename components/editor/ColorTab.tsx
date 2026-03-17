"use client";

import * as React from "react";
import { ColorScale, TokenState } from "@/lib/tokens";
import { oklchToHex, generatePaletteFromHex } from "@/lib/color";
import { Wand2, ChevronDown } from "lucide-react";

type ColorScaleName = "brand" | "neutral" | "error" | "success" | "warning";
const COLOR_SCALES: ColorScaleName[] = ["brand", "neutral", "error", "success", "warning"];
const STEPS = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"] as const;
type Step = typeof STEPS[number];

const SCALE_LABELS: Record<ColorScaleName, string> = {
  brand: "Brand", neutral: "Neutral", error: "Error", success: "Success", warning: "Warning",
};

// All primitive color var options for semantic dropdowns
const PRIMITIVE_VAR_OPTIONS: { label: string; value: string }[] = [
  ...COLOR_SCALES.flatMap((scale) =>
    STEPS.map((step) => ({
      label: `${scale}-${step}`,
      value: `var(--${scale}-${step})`,
    }))
  ),
  { label: "white", value: "oklch(1 0 0)" },
  { label: "black", value: "oklch(0 0 0)" },
];

interface ColorTabProps {
  tokens: TokenState;
  onTokenChange: (variable: string, value: string) => void;
  onBatchChange: (changes: { variable: string; value: string }[]) => void;
  onSemanticChange: (mode: "light" | "dark", key: string, value: string) => void;
}

export function ColorTab({ tokens, onTokenChange, onBatchChange, onSemanticChange }: ColorTabProps) {
  const [mounted, setMounted] = React.useState(false);
  const [activeColor, setActiveColor] = React.useState<{ scale: ColorScaleName; step: string } | null>(null);
  const [pickerHex, setPickerHex] = React.useState("#000000");
  // Per-scale one-click picker hex
  const [scalePicker, setScalePicker] = React.useState<Record<ColorScaleName, string>>({
    brand: "#000000", neutral: "#808080", error: "#e03030", success: "#20a020", warning: "#e08000",
  });
  const [openScalePicker, setOpenScalePicker] = React.useState<ColorScaleName | null>(null);
  const [semanticMode, setSemanticMode] = React.useState<"light" | "dark">("light");
  const [semanticOpen, setSemanticOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

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
        return;
      }
    }
    onTokenChange(`--${scale}-${step}`, hex);
  }

  function handleGeneratePalette(scale: ColorScaleName, hex: string) {
    const palette = generatePaletteFromHex(hex);
    if (!palette) return;
    const changes = Object.entries(palette).map(([step, value]) => ({
      variable: `--${scale}-${step}`,
      value,
    }));
    onBatchChange(changes);
    setOpenScalePicker(null);
  }

  function handleScalePickerChange(scale: ColorScaleName, hex: string) {
    setScalePicker((prev) => ({ ...prev, [scale]: hex }));
  }

  const semanticTokens = semanticMode === "light" ? tokens.semantic.light : tokens.semantic.dark;
  const SEMANTIC_LABELS: Record<string, string> = {
    primary: "Primary", "primary-foreground": "Primary Fg",
    background: "Background", foreground: "Foreground",
    card: "Card", "card-foreground": "Card Fg",
    secondary: "Secondary", "secondary-foreground": "Secondary Fg",
    muted: "Muted", "muted-foreground": "Muted Fg",
    accent: "Accent", "accent-foreground": "Accent Fg",
    destructive: "Destructive", border: "Border", input: "Input", ring: "Ring",
  };

  return (
    <div className="space-y-5 p-4">
      {/* Color Scales */}
      {COLOR_SCALES.map((scale) => (
        <div key={scale}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-foreground capitalize">{SCALE_LABELS[scale]}</span>
            {scale !== "neutral" && (
              <div className="relative">
                <button
                  className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5 rounded border border-border hover:border-primary/50"
                  onClick={() => setOpenScalePicker(openScalePicker === scale ? null : scale)}
                  title="Generate full palette from one color"
                >
                  <Wand2 className="w-2.5 h-2.5" />
                  Auto
                </button>
                {openScalePicker === scale && (
                  <div className="absolute right-0 top-full mt-1 z-30 bg-card border border-border rounded-md shadow-lg p-3 min-w-[180px]">
                    <p className="text-[10px] text-muted-foreground mb-2 font-medium">
                      Base color → generate 50~900
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="color"
                        value={scalePicker[scale]}
                        onChange={(e) => handleScalePickerChange(scale, e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border border-border"
                      />
                      <span className="text-xs font-mono text-muted-foreground">{scalePicker[scale]}</span>
                    </div>
                    <button
                      className="w-full h-7 bg-primary text-primary-foreground text-xs rounded-md hover:opacity-90 transition-opacity font-medium"
                      onClick={() => handleGeneratePalette(scale, scalePicker[scale])}
                    >
                      Generate Palette
                    </button>
                    <button
                      className="w-full h-6 text-[10px] text-muted-foreground hover:text-foreground mt-1"
                      onClick={() => setOpenScalePicker(null)}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-10 gap-1">
            {STEPS.map((step) => {
              const value = tokens.primitives[scale][step as keyof ColorScale];
              const isActive = activeColor?.scale === scale && activeColor?.step === step;
              return (
                <div key={step} className="relative">
                  <button
                    title={`${scale}-${step}: ${value}`}
                    className={`w-full aspect-square rounded-sm border-2 cursor-pointer transition-transform hover:scale-110 ${
                      isActive ? "border-foreground scale-110 shadow-md" : "border-transparent"
                    }`}
                    style={{ backgroundColor: value }}
                    onClick={() => handleSwatchClick(scale, step)}
                  />
                  {isActive && mounted && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-20 bg-card border border-border rounded-md shadow-lg p-2 min-w-[130px]">
                      <p className="text-xs text-muted-foreground mb-1 font-mono">{scale}-{step}</p>
                      <input
                        type="color"
                        value={pickerHex}
                        className="w-full h-8 rounded cursor-pointer border-0"
                        onChange={(e) => handlePickerChange(scale, step, e.target.value)}
                      />
                      <input
                        type="text"
                        value={pickerHex}
                        className="w-full h-6 text-[10px] px-1.5 mt-1 rounded border border-input bg-background font-mono text-center focus:outline-none focus:ring-1 focus:ring-ring"
                        onChange={(e) => {
                          if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) {
                            setPickerHex(e.target.value);
                            if (e.target.value.length === 7) {
                              handlePickerChange(scale, step, e.target.value);
                            }
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

      {/* Semantic Mappings – Editable */}
      <div className="mt-4 pt-4 border-t border-border">
        <button
          className="w-full flex items-center justify-between mb-3"
          onClick={() => setSemanticOpen((v) => !v)}
        >
          <p className="text-xs text-muted-foreground font-medium">Semantic Mappings</p>
          <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${semanticOpen ? "rotate-180" : ""}`} />
        </button>

        {semanticOpen && (
          <>
            {/* Light / Dark toggle */}
            <div className="flex border border-border rounded-md overflow-hidden mb-3">
              {(["light", "dark"] as const).map((m) => (
                <button
                  key={m}
                  className={`flex-1 text-xs py-1 transition-colors ${
                    semanticMode === m
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:bg-accent"
                  }`}
                  onClick={() => setSemanticMode(m)}
                >
                  {m === "light" ? "Light" : "Dark"}
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              {Object.entries(semanticTokens).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-sm border border-border flex-shrink-0"
                    style={{ backgroundColor: `var(--${key})` }}
                  />
                  <span className="text-[10px] text-muted-foreground w-24 flex-shrink-0 truncate">
                    {SEMANTIC_LABELS[key] ?? key}
                  </span>
                  <select
                    value={value}
                    onChange={(e) => onSemanticChange(semanticMode, key, e.target.value)}
                    className="flex-1 h-6 text-[10px] px-1 rounded border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring font-mono truncate"
                  >
                    <option value={value}>{value}</option>
                    {PRIMITIVE_VAR_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
