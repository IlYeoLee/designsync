"use client";

import * as React from "react";
import { TokenState } from "@/lib/tokens";
import { GOOGLE_FONTS, KOREAN_FONTS, injectGoogleFont, injectKoreanFont } from "@/lib/fonts";

interface TypographyTabProps {
  tokens: TokenState;
  onTokenChange: (variable: string, value: string) => void;
  onFontFamilyChange: (font: string) => void;
  onFontFamilyKoChange: (font: string) => void;
  onFontUpload?: (fontName: string) => void;
}

/** Input that displays px value but stores/emits rem values */
function RemPxInput({
  value,
  onChange,
  min = 0.25,
  max = 6,
}: {
  value: string;
  onChange: (remValue: string) => void;
  min?: number;
  max?: number;
}) {
  const remVal = parseFloat(value) || 0;
  const pxVal = Math.round(remVal * 16);

  const [inputPx, setInputPx] = React.useState(String(pxVal));
  const [focused, setFocused] = React.useState(false);

  // Keep in sync when value changes externally
  React.useEffect(() => {
    if (!focused) setInputPx(String(Math.round(parseFloat(value) * 16) || 0));
  }, [value, focused]);

  function commit(raw: string) {
    const px = parseFloat(raw);
    if (!isNaN(px) && px >= min * 16 && px <= max * 16) {
      const rem = +(px / 16).toFixed(4);
      onChange(`${rem}rem`);
    }
    setInputPx(String(Math.round(parseFloat(value) * 16) || 0));
  }

  return (
    <div className="flex items-center h-7 rounded-md border border-input bg-background overflow-hidden focus-within:ring-1 focus-within:ring-ring">
      <input
        type="number"
        min={min * 16}
        max={max * 16}
        step={1}
        value={focused ? inputPx : pxVal}
        onFocus={() => { setFocused(true); setInputPx(String(pxVal)); }}
        onBlur={() => { setFocused(false); commit(inputPx); }}
        onChange={(e) => setInputPx(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { (e.target as HTMLInputElement).blur(); } }}
        className="w-12 h-full text-xs px-1.5 bg-transparent font-mono text-right focus:outline-none"
      />
      <span className="text-[10px] text-muted-foreground px-1.5 bg-muted/30 h-full flex items-center border-l border-input select-none">
        px
      </span>
    </div>
  );
}

export function TypographyTab({ tokens, onTokenChange, onFontFamilyChange, onFontFamilyKoChange, onFontUpload }: TypographyTabProps) {
  const [fontSearch, setFontSearch] = React.useState("");
  const [localFonts, setLocalFonts] = React.useState<string[]>([]);
  const [localFontsLoading, setLocalFontsLoading] = React.useState(false);
  const [fontSection, setFontSection] = React.useState<"google" | "local">("google");
  const [fontUploadStatus, setFontUploadStatus] = React.useState<{ loading: boolean; font: string; result: Record<string, unknown> | null } | null>(null);
  const [koFontSearch, setKoFontSearch] = React.useState("");

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
        setLocalFonts([...new Set(fonts.map((f) => f.family))].sort());
      } else {
        setLocalFonts([]);
      }
    } catch { setLocalFonts([]); }
    setLocalFontsLoading(false);
  }

  function handleSelectFont(font: string, isGoogle: boolean) {
    if (isGoogle) injectGoogleFont(font);
    onFontFamilyChange(font);
    if (isGoogle) {
      setFontUploadStatus({ loading: true, font, result: null });
      fetch('/api/font', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fontName: font }),
      })
        .then(r => r.json())
        .then(data => {
          setFontUploadStatus({ loading: false, font, result: data });
          if (onFontUpload) onFontUpload(font);
          setTimeout(() => setFontUploadStatus(null), 5000);
        })
        .catch(() => setFontUploadStatus({ loading: false, font, result: { error: 'Network error' } }));
    }
  }

  function handleSelectKoFont(font: string) {
    injectKoreanFont(font);
    onFontFamilyKoChange(font);
  }

  const fontSizeKeys = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"] as const;
  const fontWeightKeys = ["normal", "medium", "bold"] as const;
  const lineHeightKeys = ["tight", "normal", "loose"] as const;

  return (
    <div className="space-y-6 p-4">
      {/* English Font */}
      <div>
        <p className="text-xs font-medium text-foreground mb-2">English Font</p>
        <div
          className="w-full p-3 rounded-md border border-border bg-muted/30 mb-3"
          style={{ fontFamily: tokens.primitives.fontFamily }}
        >
          <p className="text-base font-normal">The quick brown fox</p>
          <p className="text-sm text-muted-foreground">{tokens.primitives.fontFamily}</p>
        </div>

        {fontUploadStatus && (
          <div className={`mb-3 px-3 py-2 rounded-md text-xs border ${
            fontUploadStatus.loading
              ? "bg-muted/50 border-border text-muted-foreground"
              : fontUploadStatus.result?.error
              ? "bg-destructive/10 border-destructive/30 text-destructive"
              : "bg-success-50 border-success-200 text-success-700"
          }`}>
            {fontUploadStatus.loading
              ? `Uploading ${fontUploadStatus.font} to CDN...`
              : fontUploadStatus.result?.error
              ? `✗ Upload failed: ${fontUploadStatus.result.error as string}`
              : (
                <span>
                  ✓ {fontUploadStatus.font} 폰트 CDN 업로드 완료. Save 클릭 시 자동으로 적용됩니다.
                </span>
              )}
          </div>
        )}

        <div className="flex border border-border rounded-md overflow-hidden mb-2">
          {(["google", "local"] as const).map((sec) => (
            <button
              key={sec}
              className={`flex-1 text-xs py-1.5 transition-colors ${
                fontSection === sec
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-accent"
              }`}
              onClick={() => {
                setFontSection(sec);
                setFontSearch("");
                if (sec === "local" && localFonts.length === 0) loadLocalFonts();
              }}
            >
              {sec === "google" ? "Google Fonts" : "Local Fonts"}
            </button>
          ))}
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
            filteredGoogleFonts.length > 0 ? filteredGoogleFonts.map((font) => (
              <button
                key={font}
                onClick={() => handleSelectFont(font, true)}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-accent transition-colors ${
                  tokens.primitives.fontFamily === font ? "bg-accent text-accent-foreground font-medium" : ""
                }`}
              >{font}</button>
            )) : <p className="text-xs text-muted-foreground p-3">No fonts found</p>
          ) : localFontsLoading ? (
            <p className="text-xs text-muted-foreground p-3">Loading local fonts...</p>
          ) : filteredLocalFonts.length > 0 ? filteredLocalFonts.map((font) => (
            <button
              key={font}
              onClick={() => handleSelectFont(font, false)}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-accent transition-colors ${
                tokens.primitives.fontFamily === font ? "bg-accent text-accent-foreground font-medium" : ""
              }`}
            >{font}</button>
          )) : (
            <p className="text-xs text-muted-foreground p-3">
              {localFonts.length === 0
                ? "Local Font Access API not available or permission denied"
                : "No fonts found"}
            </p>
          )}
        </div>
      </div>

      {/* Korean Font */}
      <div>
        <p className="text-xs font-medium text-foreground mb-2">Korean Font</p>
        <div className="w-full p-3 rounded-md border border-border bg-muted/30 mb-3">
          <p className="text-base" style={{ fontFamily: tokens.primitives.fontFamilyKo || undefined }}>
            안녕하세요 Hello
          </p>
          <p className="text-sm text-muted-foreground">
            {tokens.primitives.fontFamilyKo || '(없음 — 영문 폰트 사용)'}
          </p>
        </div>
        <input
          type="text"
          placeholder="한글 폰트 검색..."
          value={koFontSearch}
          onChange={(e) => setKoFontSearch(e.target.value)}
          className="w-full h-8 text-xs px-2.5 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring mb-2"
        />
        <div className="max-h-40 overflow-y-auto border border-border rounded-md">
          <button
            onClick={() => onFontFamilyKoChange('')}
            className="w-full text-left px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent"
          >
            없음 (영문 폰트 사용)
          </button>
          {KOREAN_FONTS.filter(f => f.toLowerCase().includes(koFontSearch.toLowerCase())).map(font => (
            <button
              key={font}
              onClick={() => handleSelectKoFont(font)}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-accent ${tokens.primitives.fontFamilyKo === font ? 'bg-accent font-medium' : ''}`}
            >
              {font}
            </button>
          ))}
        </div>
      </div>

      {/* Font Sizes — px display */}
      <div>
        <p className="text-xs font-medium text-foreground mb-1">Font Sizes</p>
        <p className="text-[10px] text-muted-foreground mb-3">Values shown in px (stored as rem)</p>
        <div className="space-y-2">
          {fontSizeKeys.map((key) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-8 font-mono">{key}</span>
              <input
                type="range"
                min={8}
                max={48}
                step={1}
                value={Math.round(parseFloat(tokens.primitives.fontSize[key]) * 16)}
                onChange={(e) => onTokenChange(`--font-size-${key}`, `${(+e.target.value / 16).toFixed(4)}rem`)}
                className="flex-1 h-1.5 accent-primary"
              />
              <RemPxInput
                value={tokens.primitives.fontSize[key]}
                onChange={(v) => onTokenChange(`--font-size-${key}`, v)}
                min={0.5}
                max={3}
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
                  <option key={w} value={String(w)}>{w}</option>
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
                min={100}
                max={250}
                step={5}
                value={Math.round(parseFloat(tokens.primitives.lineHeight[key]) * 100)}
                onChange={(e) => onTokenChange(`--line-height-${key}`, String(+e.target.value / 100))}
                className="flex-1 h-1.5 accent-primary"
              />
              {/* Line height is unitless — show as plain number, fixed 2 decimals */}
              <div className="flex items-center h-7 rounded-md border border-input bg-background overflow-hidden focus-within:ring-1 focus-within:ring-ring">
                <input
                  type="number"
                  min={1}
                  max={2.5}
                  step={0.05}
                  value={parseFloat(tokens.primitives.lineHeight[key])}
                  onChange={(e) => onTokenChange(`--line-height-${key}`, e.target.value)}
                  className="w-12 h-full text-xs px-1.5 bg-transparent font-mono text-right focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
