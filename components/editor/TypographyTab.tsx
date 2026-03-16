"use client";

import * as React from "react";
import { TokenState } from "@/lib/tokens";
import { GOOGLE_FONTS, injectGoogleFont } from "@/lib/fonts";

interface TypographyTabProps {
  tokens: TokenState;
  onTokenChange: (variable: string, value: string) => void;
  onFontFamilyChange: (font: string) => void;
}

export function TypographyTab({ tokens, onTokenChange, onFontFamilyChange }: TypographyTabProps) {
  const [fontSearch, setFontSearch] = React.useState("");
  const [localFonts, setLocalFonts] = React.useState<string[]>([]);
  const [localFontsLoading, setLocalFontsLoading] = React.useState(false);
  const [fontSection, setFontSection] = React.useState<"google" | "local">("google");

  const filteredGoogleFonts = GOOGLE_FONTS.filter((f) =>
    f.toLowerCase().includes(fontSearch.toLowerCase())
  );

  const filteredLocalFonts = localFonts.filter((f) =>
    f.toLowerCase().includes(fontSearch.toLowerCase())
  );

  async function loadLocalFonts() {
    setLocalFontsLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const win = window as any;
      if ("queryLocalFonts" in win) {
        const fonts: { family: string }[] = await win.queryLocalFonts();
        const families = [...new Set(fonts.map((f) => f.family))].sort();
        setLocalFonts(families);
      } else {
        setLocalFonts([]);
      }
    } catch {
      setLocalFonts([]);
    }
    setLocalFontsLoading(false);
  }

  function handleSelectFont(font: string, isGoogle: boolean) {
    if (isGoogle) {
      injectGoogleFont(font);
    }
    onFontFamilyChange(font);
  }

  const fontSizeKeys = ["xs", "sm", "base", "lg", "xl", "2xl"] as const;
  const fontWeightKeys = ["normal", "medium", "bold"] as const;
  const lineHeightKeys = ["tight", "normal", "loose"] as const;

  return (
    <div className="space-y-6 p-4">
      {/* Font Family */}
      <div>
        <p className="text-xs font-medium text-foreground mb-2">Font Family</p>

        {/* Current font preview */}
        <div
          className="w-full p-3 rounded-md border border-border bg-muted/30 mb-3"
          style={{ fontFamily: tokens.primitives.fontFamily }}
        >
          <p className="text-base font-normal">The quick brown fox</p>
          <p className="text-sm text-muted-foreground">{tokens.primitives.fontFamily}</p>
        </div>

        {/* Section tabs */}
        <div className="flex border border-border rounded-md overflow-hidden mb-2">
          <button
            className={`flex-1 text-xs py-1.5 transition-colors ${
              fontSection === "google"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-accent"
            }`}
            onClick={() => setFontSection("google")}
          >
            Google Fonts
          </button>
          <button
            className={`flex-1 text-xs py-1.5 transition-colors ${
              fontSection === "local"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-accent"
            }`}
            onClick={() => {
              setFontSection("local");
              if (localFonts.length === 0) loadLocalFonts();
            }}
          >
            Local Fonts
          </button>
        </div>

        <input
          type="text"
          placeholder="Search fonts..."
          value={fontSearch}
          onChange={(e) => setFontSearch(e.target.value)}
          className="w-full h-8 text-xs px-2.5 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring mb-2"
        />

        <div className="max-h-40 overflow-y-auto border border-border rounded-md">
          {fontSection === "google" ? (
            filteredGoogleFonts.length > 0 ? (
              filteredGoogleFonts.map((font) => (
                <button
                  key={font}
                  onClick={() => handleSelectFont(font, true)}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-accent transition-colors ${
                    tokens.primitives.fontFamily === font ? "bg-accent text-accent-foreground font-medium" : ""
                  }`}
                >
                  {font}
                </button>
              ))
            ) : (
              <p className="text-xs text-muted-foreground p-3">No fonts found</p>
            )
          ) : localFontsLoading ? (
            <p className="text-xs text-muted-foreground p-3">Loading local fonts...</p>
          ) : filteredLocalFonts.length > 0 ? (
            filteredLocalFonts.slice(0, 50).map((font) => (
              <button
                key={font}
                onClick={() => handleSelectFont(font, false)}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-accent transition-colors ${
                  tokens.primitives.fontFamily === font ? "bg-accent text-accent-foreground font-medium" : ""
                }`}
              >
                {font}
              </button>
            ))
          ) : (
            <p className="text-xs text-muted-foreground p-3">
              {localFonts.length === 0
                ? "Local Font Access API not available or permission denied"
                : "No fonts found"}
            </p>
          )}
        </div>
      </div>

      {/* Font Sizes */}
      <div>
        <p className="text-xs font-medium text-foreground mb-3">Font Sizes</p>
        <div className="space-y-2">
          {fontSizeKeys.map((key) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-8 font-mono">{key}</span>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.05"
                value={parseFloat(tokens.primitives.fontSize[key])}
                onChange={(e) => onTokenChange(`--font-size-${key}`, `${e.target.value}rem`)}
                className="flex-1 h-1.5 accent-primary"
              />
              <input
                type="text"
                value={tokens.primitives.fontSize[key]}
                onChange={(e) => onTokenChange(`--font-size-${key}`, e.target.value)}
                className="w-16 h-6 text-xs px-1.5 rounded border border-input bg-background font-mono text-center focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Font Weight */}
      <div>
        <p className="text-xs font-medium text-foreground mb-3">Font Weights</p>
        <div className="space-y-2">
          {fontWeightKeys.map((key) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-12">{key}</span>
              <select
                value={tokens.primitives.fontWeight[key]}
                onChange={(e) => onTokenChange(`--font-weight-${key}`, e.target.value)}
                className="flex-1 h-7 text-xs px-2 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((w) => (
                  <option key={w} value={String(w)}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Line Height */}
      <div>
        <p className="text-xs font-medium text-foreground mb-3">Line Heights</p>
        <div className="space-y-2">
          {lineHeightKeys.map((key) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-12">{key}</span>
              <input
                type="range"
                min="1"
                max="2.5"
                step="0.05"
                value={parseFloat(tokens.primitives.lineHeight[key])}
                onChange={(e) => onTokenChange(`--line-height-${key}`, e.target.value)}
                className="flex-1 h-1.5 accent-primary"
              />
              <input
                type="text"
                value={tokens.primitives.lineHeight[key]}
                onChange={(e) => onTokenChange(`--line-height-${key}`, e.target.value)}
                className="w-12 h-6 text-xs px-1.5 rounded border border-input bg-background font-mono text-center focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
