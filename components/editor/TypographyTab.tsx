"use client";

import * as React from "react";
import { TokenState } from "@/lib/tokens";
import { GOOGLE_FONTS, KOREAN_FONTS, injectGoogleFont, injectKoreanFont } from "@/lib/fonts";
import { Button } from "@/registry/new-york/ui/button";
import { Input } from "@/registry/new-york/ui/input";
import { NativeSelect } from "@/registry/new-york/ui/native-select";
import { Slider } from "@/registry/new-york/ui/slider";

interface TypographyTabProps {
  tokens: TokenState;
  onTokenChange: (variable: string, value: string) => void;
  onFontFamilyChange: (font: string) => void;
  onFontFamilyKoChange: (font: string) => void;
  onFontUpload?: (fontName: string) => void;
  /** Called each time a font weight file is uploaded; used to build @font-face bridge rules */
  onFontFaceAdded?: (weight: number, url: string, isKo: boolean) => void;
  skipFontUpload?: boolean;
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
    <div className="flex items-center h-7 rounded-[var(--ds-element-radius)] border border-input bg-background overflow-hidden focus-within:ring-1 focus-within:ring-ring">
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

/** Map font style name to CSS font-weight number */
function styleToWeight(style: string): number {
  const s = style.toLowerCase();
  if (s.includes("thin") || s.includes("hairline")) return 100;
  if (s.includes("extralight") || s.includes("extra light") || s.includes("ultralight")) return 200;
  if (s.includes("light")) return 300;
  if (s.includes("medium")) return 500;
  if (s.includes("semibold") || s.includes("semi bold") || s.includes("demibold")) return 600;
  if (s.includes("extrabold") || s.includes("extra bold") || s.includes("ultrabold")) return 800;
  if (s.includes("black") || s.includes("heavy")) return 900;
  if (s.includes("bold")) return 700;
  return 400;
}

/** Parse weight from filename like "FontName-Bold.ttf" */
function weightFromFilename(name: string): number {
  const m = name.match(/[-_](thin|hairline|extralight|extra.?light|ultralight|light|medium|semibold|semi.?bold|demibold|extrabold|extra.?bold|ultrabold|black|heavy|bold|regular)/i);
  return m ? styleToWeight(m[1]) : 400;
}

export function TypographyTab({ tokens, onTokenChange, onFontFamilyChange, onFontFamilyKoChange, onFontUpload, onFontFaceAdded, skipFontUpload }: TypographyTabProps) {
  const [fontSearch, setFontSearch] = React.useState("");
  const [localFonts, setLocalFonts] = React.useState<string[]>([]);
  const [localFontsLoading, setLocalFontsLoading] = React.useState(false);
  const [fontSection, setFontSection] = React.useState<"google" | "local">("google");
  const [fontUploadStatus, setFontUploadStatus] = React.useState<{ loading: boolean; font: string; result: Record<string, unknown> | null } | null>(null);
  const [koFontSearch, setKoFontSearch] = React.useState("");
  const [koFontSection, setKoFontSection] = React.useState<"google" | "local">("google");
  const [koLocalFonts, setKoLocalFonts] = React.useState<string[]>([]);
  const [koLocalFontsLoading, setKoLocalFontsLoading] = React.useState(false);
  const [koFontUploadStatus, setKoFontUploadStatus] = React.useState<{ loading: boolean; font: string; result: Record<string, unknown> | null } | null>(null);
  const [supportsLocalFontApi, setSupportsLocalFontApi] = React.useState<boolean | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const koFileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setSupportsLocalFontApi("queryLocalFonts" in window);
  }, []);

  const filteredGoogleFonts = GOOGLE_FONTS.filter((f) =>
    f.toLowerCase().includes(fontSearch.toLowerCase())
  );
  const filteredLocalFonts = localFonts.filter((f) =>
    f.toLowerCase().includes(fontSearch.toLowerCase())
  );

  async function loadLocalFonts() {
    if (!supportsLocalFontApi) return;
    setLocalFontsLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fonts: { family: string }[] = await (window as any).queryLocalFonts();
      setLocalFonts([...new Set(fonts.map((f) => f.family))].sort());
    } catch { setLocalFonts([]); }
    setLocalFontsLoading(false);
  }

  function handleSelectFont(font: string, isGoogle: boolean) {
    if (isGoogle) injectGoogleFont(font);
    onFontFamilyChange(font);

    if (isGoogle && !skipFontUpload) {
      // Google Font → /api/font (download from Google + upload to Storage)
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
    } else {
      // Local Font → try to get font data and upload to Storage
      uploadLocalFont(font);
    }
  }

  async function uploadLocalFont(fontName: string) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fonts: { family: string; style: string; blob: () => Promise<Blob> }[] = await (window as any).queryLocalFonts();
      const matches = fonts.filter((f) => f.family === fontName);
      if (matches.length === 0) return;

      setFontUploadStatus({ loading: true, font: fontName, result: null });

      for (const match of matches) {
        const blob = await match.blob();
        const weight = styleToWeight(match.style || "");
        const formData = new FormData();
        formData.append("file", blob, `${fontName}.ttf`);
        formData.append("fontName", fontName);
        formData.append("fontWeight", String(weight));
        const res = await fetch("/api/font-upload", { method: "POST", body: formData });
        const data = await res.json().catch(() => null);
        if (data?.cdnFontUrl && onFontFaceAdded) onFontFaceAdded(weight, data.cdnFontUrl, false);
      }

      setFontUploadStatus({ loading: false, font: fontName, result: { success: true } });
      if (onFontUpload) onFontUpload(fontName);
      setTimeout(() => setFontUploadStatus(null), 5000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Local font upload failed";
      setFontUploadStatus({ loading: false, font: fontName, result: { error: msg } });
      setTimeout(() => setFontUploadStatus(null), 8000);
    }
  }

  async function handleFileInputUpload(files: FileList | null, setStatus: typeof setFontUploadStatus, fontChangeFn: (f: string) => void) {
    if (!files || files.length === 0) return;
    // Derive font family name from first file's name
    const rawName = files[0].name.replace(/\.(ttf|otf|woff|woff2)$/i, "");
    const fontName = rawName
      .replace(/[-_](thin|hairline|extralight|extra.?light|ultralight|light|medium|semibold|semi.?bold|demibold|extrabold|extra.?bold|ultrabold|black|heavy|bold|regular|italic).*/gi, "")
      .replace(/[-_]/g, " ")
      .trim();

    setStatus({ loading: true, font: fontName, result: null });
    fontChangeFn(fontName);

    const isKoUpload = setStatus === setKoFontUploadStatus;
    for (const f of Array.from(files)) {
      const weight = weightFromFilename(f.name);
      const formData = new FormData();
      formData.append("file", f, f.name);
      formData.append("fontName", fontName);
      formData.append("fontWeight", String(weight));
      const res = await fetch("/api/font-upload", { method: "POST", body: formData });
      const data = await res.json().catch(() => null);
      if (data?.cdnFontUrl && onFontFaceAdded) onFontFaceAdded(weight, data.cdnFontUrl, isKoUpload);
    }

    setStatus({ loading: false, font: fontName, result: { success: true } });
    if (onFontUpload) onFontUpload(fontName);
    setTimeout(() => setStatus(null), 5000);
  }

  async function loadKoLocalFonts() {
    if (!supportsLocalFontApi) return;
    setKoLocalFontsLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fonts: { family: string }[] = await (window as any).queryLocalFonts();
      setKoLocalFonts([...new Set(fonts.map((f) => f.family))].sort());
    } catch { setKoLocalFonts([]); }
    setKoLocalFontsLoading(false);
  }

  async function uploadKoLocalFont(fontName: string) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fonts: { family: string; style: string; blob: () => Promise<Blob> }[] = await (window as any).queryLocalFonts();
      const matches = fonts.filter((f) => f.family === fontName);
      if (matches.length === 0) return;
      setKoFontUploadStatus({ loading: true, font: fontName, result: null });
      for (const match of matches) {
        const blob = await match.blob();
        const weight = styleToWeight(match.style || "");
        const formData = new FormData();
        formData.append("file", blob, `${fontName}.ttf`);
        formData.append("fontName", fontName);
        formData.append("fontWeight", String(weight));
        const res = await fetch("/api/font-upload", { method: "POST", body: formData });
        const data = await res.json().catch(() => null);
        if (data?.cdnFontUrl && onFontFaceAdded) onFontFaceAdded(weight, data.cdnFontUrl, true);
      }
      setKoFontUploadStatus({ loading: false, font: fontName, result: { success: true } });
      if (onFontUpload) onFontUpload(fontName);
      setTimeout(() => setKoFontUploadStatus(null), 5000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Local font upload failed";
      setKoFontUploadStatus({ loading: false, font: fontName, result: { error: msg } });
      setTimeout(() => setKoFontUploadStatus(null), 8000);
    }
  }

  function handleSelectKoFont(font: string, isGoogle: boolean) {
    if (isGoogle) injectKoreanFont(font);
    onFontFamilyKoChange(font);
    if (isGoogle && !skipFontUpload) {
      setKoFontUploadStatus({ loading: true, font, result: null });
      fetch('/api/font', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fontName: font }),
      })
        .then(r => r.json())
        .then(data => {
          setKoFontUploadStatus({ loading: false, font, result: data });
          if (onFontUpload) onFontUpload(font);
          setTimeout(() => setKoFontUploadStatus(null), 5000);
        })
        .catch(() => setKoFontUploadStatus({ loading: false, font, result: { error: 'Network error' } }));
    } else {
      uploadKoLocalFont(font);
    }
  }

  const fontSizeKeys = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"] as const;
  const fontWeightKeys = ["normal", "medium", "semibold", "bold", "extrabold"] as const;
  const lineHeightKeys = ["tight", "normal", "loose"] as const;

  const FONT_SIZE_ROLE: Record<string, string> = {
    xs:   "Caption",
    sm:   "Description",
    base: "Body",
    lg:   "Sub-body",
    xl:   "Subtitle",
    "2xl": "Title",
    "3xl": "Heading",
    "4xl": "Display",
  };
  const FONT_WEIGHT_ROLE: Record<string, string> = {
    normal:    "Body",
    medium:    "Emphasis",
    semibold:  "Subtitle",
    bold:      "Title",
    extrabold: "Strong",
  };
  const LINE_HEIGHT_ROLE: Record<string, string> = {
    tight:  "Heading",
    normal: "Body",
    loose:  "Long text",
  };

  return (
    <div className="flex flex-col gap-[var(--ds-section-gap)] p-[var(--ds-card-padding)]">
      {/* English Font */}
      <div>
        <p className="text-xs font-medium text-foreground mb-2">Latin Font</p>
        <div
          className="w-full p-[var(--ds-card-padding)] rounded-[var(--ds-element-radius)] border border-border bg-muted/30 mb-[var(--ds-internal-gap)]"
          style={{ fontFamily: tokens.primitives.fontFamily }}
        >
          <p className="text-base font-normal">The quick brown fox</p>
          <p className="text-sm text-muted-foreground">{tokens.primitives.fontFamily}</p>
        </div>

        {fontUploadStatus && (
          <div className={`mb-[var(--ds-internal-gap)] px-[var(--ds-card-padding)] py-2 rounded-[var(--ds-element-radius)] text-xs border ${
            fontUploadStatus.loading
              ? "bg-muted/50 border-border text-muted-foreground"
              : fontUploadStatus.result?.error
              ? "bg-destructive/10 border-destructive/30 text-destructive"
              : "bg-[color:var(--success)] border-[color:var(--success-border)] text-[color:var(--success-foreground)]"
          }`}>
            {fontUploadStatus.loading
              ? `Uploading ${fontUploadStatus.font} to CDN...`
              : fontUploadStatus.result?.error
              ? `✗ Upload failed: ${fontUploadStatus.result.error as string}`
              : (
                <span>
                  ✓ {fontUploadStatus.font} uploaded to CDN. Click Save to apply.
                </span>
              )}
          </div>
        )}

        <div className="flex border border-border rounded-[var(--ds-element-radius)] overflow-hidden mb-2">
          {(["google", "local"] as const).map((sec) => (
            <Button
              key={sec}
              variant={fontSection === sec ? "default" : "ghost"}
              size="sm"
              className={`flex-1 rounded-none text-xs py-1.5 transition-colors ${
                fontSection !== sec
                  ? "text-muted-foreground"
                  : ""
              }`}
              onClick={() => {
                setFontSection(sec);
                setFontSearch("");
                if (sec === "local" && localFonts.length === 0) loadLocalFonts();
              }}
            >
              {sec === "google" ? "Google Fonts" : "Local Fonts"}
            </Button>
          ))}
        </div>

        <Input
          type="text"
          placeholder="Search fonts..."
          value={fontSearch}
          onChange={(e) => setFontSearch(e.target.value)}
          className="h-8 text-xs px-2.5 mb-2"
        />
        <div className="max-h-40 overflow-y-auto border border-border rounded-[var(--ds-element-radius)]">
          {fontSection === "google" ? (
            filteredGoogleFonts.length > 0 ? filteredGoogleFonts.map((font) => (
              <Button
                key={font}
                variant="ghost"
                size="sm"
                onClick={() => handleSelectFont(font, true)}
                className={`w-full justify-start rounded-none px-3 py-1.5 text-xs ${
                  tokens.primitives.fontFamily === font ? "bg-accent text-accent-foreground font-medium" : ""
                }`}
              >{font}</Button>
            )) : <p className="text-xs text-muted-foreground p-3">No fonts found</p>
          ) : supportsLocalFontApi === false ? (
            <div className="p-3 flex flex-col gap-2">
              <p className="text-xs text-muted-foreground">This browser does not support the local font API. Please select a font file manually.</p>
              <Button size="sm" variant="outline" className="text-xs" onClick={() => fileInputRef.current?.click()}>
                Select font file (.ttf .otf .woff .woff2)
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".ttf,.otf,.woff,.woff2"
                multiple
                className="hidden"
                onChange={(e) => handleFileInputUpload(e.target.files, setFontUploadStatus, onFontFamilyChange)}
              />
            </div>
          ) : localFontsLoading ? (
            <p className="text-xs text-muted-foreground p-3">Loading local fonts...</p>
          ) : filteredLocalFonts.length > 0 ? filteredLocalFonts.map((font) => (
            <Button
              key={font}
              variant="ghost"
              size="sm"
              onClick={() => handleSelectFont(font, false)}
              className={`w-full justify-start rounded-none px-3 py-1.5 text-xs ${
                tokens.primitives.fontFamily === font ? "bg-accent text-accent-foreground font-medium" : ""
              }`}
            >{font}</Button>
          )) : (
            <p className="text-xs text-muted-foreground p-3">
              {localFonts.length === 0
                ? "Please allow access to local fonts"
                : "No fonts found"}
            </p>
          )}
        </div>
      </div>

      {/* Korean Font */}
      <div>
        <p className="text-xs font-medium text-foreground mb-2">Korean Font</p>
        <div className="w-full p-[var(--ds-card-padding)] rounded-[var(--ds-element-radius)] border border-border bg-muted/30 mb-[var(--ds-internal-gap)]">
          <p className="text-base" style={{ fontFamily: tokens.primitives.fontFamilyKo || undefined }}>
            Hello World
          </p>
          <p className="text-sm text-muted-foreground">
            {tokens.primitives.fontFamilyKo || '(없음 — 영문 폰트 사용)'}
          </p>
        </div>

        {koFontUploadStatus && (
          <div className={`mb-[var(--ds-internal-gap)] px-[var(--ds-card-padding)] py-2 rounded-[var(--ds-element-radius)] text-xs border ${
            koFontUploadStatus.loading
              ? "bg-muted/50 border-border text-muted-foreground"
              : koFontUploadStatus.result?.error
              ? "bg-destructive/10 border-destructive/30 text-destructive"
              : "bg-[color:var(--success)] border-[color:var(--success-border)] text-[color:var(--success-foreground)]"
          }`}>
            {koFontUploadStatus.loading
              ? `${koFontUploadStatus.font} CDN 업로드 중...`
              : koFontUploadStatus.result?.error
              ? `✗ 업로드 실패: ${koFontUploadStatus.result.error as string}`
              : `✓ ${koFontUploadStatus.font} 폰트 CDN 업로드 완료. Save 클릭 시 자동으로 적용됩니다.`}
          </div>
        )}

        <div className="flex border border-border rounded-[var(--ds-element-radius)] overflow-hidden mb-2">
          {(["google", "local"] as const).map((sec) => (
            <Button
              key={sec}
              variant={koFontSection === sec ? "default" : "ghost"}
              size="sm"
              className={`flex-1 rounded-none text-xs py-1.5 transition-colors ${koFontSection !== sec ? "text-muted-foreground" : ""}`}
              onClick={() => {
                setKoFontSection(sec);
                setKoFontSearch("");
                if (sec === "local" && koLocalFonts.length === 0) loadKoLocalFonts();
              }}
            >
              {sec === "google" ? "Google 폰트" : "로컬 폰트"}
            </Button>
          ))}
        </div>

        <Input
          type="text"
          placeholder="한글 폰트 검색..."
          value={koFontSearch}
          onChange={(e) => setKoFontSearch(e.target.value)}
          className="h-8 text-xs px-2.5 mb-2"
        />
        <div className="max-h-40 overflow-y-auto border border-border rounded-[var(--ds-element-radius)]">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFontFamilyKoChange('')}
            className="w-full justify-start rounded-none px-3 py-1.5 text-xs text-muted-foreground"
          >
            없음 (영문 폰트 사용)
          </Button>
          {koFontSection === "google" ? (
            KOREAN_FONTS.filter(f => f.toLowerCase().includes(koFontSearch.toLowerCase())).map(font => (
              <Button
                key={font}
                variant="ghost"
                size="sm"
                onClick={() => handleSelectKoFont(font, true)}
                className={`w-full justify-start rounded-none px-3 py-1.5 text-xs ${tokens.primitives.fontFamilyKo === font ? 'bg-accent font-medium' : ''}`}
              >
                {font}
              </Button>
            ))
          ) : supportsLocalFontApi === false ? (
            <div className="p-3 flex flex-col gap-2">
              <p className="text-xs text-muted-foreground">이 브라우저는 로컬 폰트 API를 지원하지 않습니다. 폰트 파일을 직접 선택하세요.</p>
              <Button size="sm" variant="outline" className="text-xs" onClick={() => koFileInputRef.current?.click()}>
                폰트 파일 선택 (.ttf .otf .woff .woff2)
              </Button>
              <input
                ref={koFileInputRef}
                type="file"
                accept=".ttf,.otf,.woff,.woff2"
                multiple
                className="hidden"
                onChange={(e) => handleFileInputUpload(e.target.files, setKoFontUploadStatus, onFontFamilyKoChange)}
              />
            </div>
          ) : koLocalFontsLoading ? (
            <p className="text-xs text-muted-foreground p-3">로컬 폰트 로딩 중...</p>
          ) : koLocalFonts.filter(f => f.toLowerCase().includes(koFontSearch.toLowerCase())).map(font => (
            <Button
              key={font}
              variant="ghost"
              size="sm"
              onClick={() => handleSelectKoFont(font, false)}
              className={`w-full justify-start rounded-none px-3 py-1.5 text-xs ${tokens.primitives.fontFamilyKo === font ? 'bg-accent font-medium' : ''}`}
            >
              {font}
            </Button>
          ))}
        </div>
      </div>

      {/* Font Sizes — px display */}
      <div>
        <p className="text-xs font-medium text-foreground mb-1">글자 크기</p>
        <p className="text-[10px] text-muted-foreground mb-[var(--ds-internal-gap)]">px 단위로 표시 (rem으로 저장)</p>
        <div className="flex flex-col gap-2">
          {fontSizeKeys.map((key) => {
            const pxVal = Math.round(parseFloat(tokens.primitives.fontSize[key]) * 16);
            return (
              <div key={key} className="flex flex-col gap-0.5">
                {/* preview text — renders at actual token size */}
                <div className="flex items-baseline gap-1.5 overflow-hidden">
                  <span
                    className="text-foreground font-medium leading-none truncate"
                    style={{ fontSize: tokens.primitives.fontSize[key] }}
                  >
                    가나다 Aa
                  </span>
                  <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                    {key} · {FONT_SIZE_ROLE[key]} · {pxVal}px
                  </span>
                </div>
                <div className="flex items-center gap-[var(--ds-section-gap)]">
                  <Slider
                    min={8}
                    max={72}
                    step={1}
                    value={[pxVal]}
                    onValueChange={(vals) => onTokenChange(`--font-size-${key}`, `${(vals[0] / 16).toFixed(4)}rem`)}
                    className="flex-1"
                  />
                  <RemPxInput
                    value={tokens.primitives.fontSize[key]}
                    onChange={(v) => onTokenChange(`--font-size-${key}`, v)}
                    min={0.5}
                    max={4.5}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Font Weight */}
      <div>
        <p className="text-xs font-medium text-foreground mb-[var(--ds-internal-gap)]">글자 굵기</p>
        <div className="flex flex-col gap-2">
          {fontWeightKeys.map((key) => {
            const w = parseInt(tokens.primitives.fontWeight[key]);
            return (
              <div key={key} className="flex flex-col gap-0.5">
                <div className="flex items-baseline gap-1.5">
                  <span
                    className="text-foreground leading-none"
                    style={{ fontSize: tokens.primitives.fontSize.base, fontWeight: w }}
                  >
                    가나다 Aa
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {key} · {FONT_WEIGHT_ROLE[key]} · {w}
                  </span>
                </div>
                <NativeSelect
                  size="sm"
                  value={tokens.primitives.fontWeight[key]}
                  onChange={(e) => onTokenChange(`--font-weight-${key}`, e.target.value)}
                  className="w-full"
                >
                  {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((wv) => (
                    <option key={wv} value={String(wv)}>{wv}</option>
                  ))}
                </NativeSelect>
              </div>
            );
          })}
        </div>
      </div>

      {/* Line Height */}
      <div>
        <p className="text-xs font-medium text-foreground mb-[var(--ds-internal-gap)]">줄 간격</p>
        <div className="flex flex-col gap-2">
          {lineHeightKeys.map((key) => {
            const lh = parseFloat(tokens.primitives.lineHeight[key]);
            return (
              <div key={key} className="flex flex-col gap-0.5">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {key} · {LINE_HEIGHT_ROLE[key]} · {lh.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-[var(--ds-section-gap)]">
                  <Slider
                    min={100}
                    max={250}
                    step={5}
                    value={[Math.round(lh * 100)]}
                    onValueChange={(vals) => onTokenChange(`--line-height-${key}`, String(vals[0] / 100))}
                    className="flex-1"
                  />
                  <div className="flex items-center h-7 rounded-[var(--ds-element-radius)] border border-input bg-background overflow-hidden focus-within:ring-1 focus-within:ring-ring">
                    <input
                      type="number"
                      min={1}
                      max={2.5}
                      step={0.05}
                      value={lh}
                      onChange={(e) => onTokenChange(`--line-height-${key}`, e.target.value)}
                      className="w-12 h-full text-xs px-1.5 bg-transparent font-mono text-right focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
