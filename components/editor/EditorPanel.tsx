"use client";

import * as React from "react";
import { Palette, Type, Layout, ChevronDown, ChevronUp } from "lucide-react";
import { TokenState, HistoryEntry } from "@/lib/tokens";
import { ColorTab } from "./ColorTab";
import { TypographyTab } from "./TypographyTab";
import { LayoutTab } from "./LayoutTab";

type Tab = "colors" | "typography" | "layout";

interface EditorPanelProps {
  tokens: TokenState;
  onTokenChange: (variable: string, value: string) => void;
  onBatchChange: (changes: { variable: string; value: string }[]) => void;
  onSemanticChange: (mode: "light" | "dark", key: string, value: string) => void;
  onFontFamilyChange: (font: string) => void;
  onFontFamilyKoChange: (font: string) => void;
  onIconLibraryChange: (library: string) => void;
  history: HistoryEntry[];
}

export function EditorPanel({
  tokens,
  onTokenChange,
  onBatchChange,
  onSemanticChange,
  onFontFamilyChange,
  onFontFamilyKoChange,
  onIconLibraryChange,
  history,
}: EditorPanelProps) {
  const [activeTab, setActiveTab] = React.useState<Tab>("colors");
  const [historyOpen, setHistoryOpen] = React.useState(true);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "colors", label: "Colors", icon: <Palette className="w-3.5 h-3.5" /> },
    { id: "typography", label: "Type", icon: <Type className="w-3.5 h-3.5" /> },
    { id: "layout", label: "Layout", icon: <Layout className="w-3.5 h-3.5" /> },
  ];

  function formatTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}초 전`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}분 전`;
    return `${Math.floor(minutes / 60)}시간 전`;
  }

  return (
    <div className="w-80 flex-shrink-0 border-r border-border bg-card flex flex-col overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-border flex-shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-primary text-primary font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {activeTab === "colors" && (
          <ColorTab
            tokens={tokens}
            onTokenChange={onTokenChange}
            onBatchChange={onBatchChange}
            onSemanticChange={onSemanticChange}
          />
        )}
        {activeTab === "typography" && (
          <TypographyTab
            tokens={tokens}
            onTokenChange={onTokenChange}
            onFontFamilyChange={onFontFamilyChange}
            onFontFamilyKoChange={onFontFamilyKoChange}
          />
        )}
        {activeTab === "layout" && (
          <LayoutTab
            tokens={tokens}
            onTokenChange={onTokenChange}
            onIconLibraryChange={onIconLibraryChange}
          />
        )}
      </div>

      {/* History panel */}
      {history.length > 0 && (
        <div className="border-t border-border flex-shrink-0">
          <button
            className="w-full flex items-center justify-between px-4 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors"
            onClick={() => setHistoryOpen(!historyOpen)}
          >
            <span className="font-medium">최근 변경 ({history.length})</span>
            {historyOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
          {historyOpen && (
            <div className="px-4 pb-3 space-y-1.5 max-h-32 overflow-y-auto">
              {history.map((entry, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-0.5">•</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-[10px] text-foreground block truncate">{entry.variable}</code>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <span className="w-3 h-3 rounded-sm border border-border inline-block flex-shrink-0"
                        style={{ backgroundColor: entry.from }} />
                      <span className="truncate max-w-[50px]">{entry.from}</span>
                      <span>→</span>
                      <span className="w-3 h-3 rounded-sm border border-border inline-block flex-shrink-0"
                        style={{ backgroundColor: entry.to }} />
                      <span className="truncate max-w-[50px]">{entry.to}</span>
                    </div>
                  </div>
                  <span className="text-[9px] text-muted-foreground flex-shrink-0">
                    {formatTimeAgo(entry.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
