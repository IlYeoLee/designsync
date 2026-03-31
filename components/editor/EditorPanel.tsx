"use client";

import * as React from "react";
import { getIconMap } from "@/lib/icon-map";
import { TokenState, HistoryEntry } from "@/lib/tokens";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/registry/new-york/ui/tabs";
import { Button } from "@/registry/new-york/ui/button";
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
  onStylePresetChange: (preset: string) => void;
  iconLibrary: string;
  history: HistoryEntry[];
  isDark: boolean;
}

export function EditorPanel({
  tokens,
  onTokenChange,
  onBatchChange,
  onSemanticChange,
  onFontFamilyChange,
  onFontFamilyKoChange,
  onIconLibraryChange,
  onStylePresetChange,
  iconLibrary,
  history,
  isDark,
}: EditorPanelProps) {
  const icons = getIconMap(iconLibrary);
  const [activeTab, setActiveTab] = React.useState<Tab>("colors");
  const [historyOpen, setHistoryOpen] = React.useState(true);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "colors", label: "Colors", icon: <icons.palette className="w-3.5 h-3.5" /> },
    { id: "typography", label: "Type", icon: <icons.type className="w-3.5 h-3.5" /> },
    { id: "layout", label: "Layout", icon: <icons.layout className="w-3.5 h-3.5" /> },
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
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)} className="flex flex-col flex-1 overflow-hidden">
        <TabsList variant="underline" className="flex-shrink-0">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex-1 gap-1.5 text-xs">
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1 overflow-y-auto min-h-0">
          <TabsContent value="colors">
            <ColorTab
              tokens={tokens}
              onTokenChange={onTokenChange}
              onBatchChange={onBatchChange}
              onSemanticChange={onSemanticChange}
              iconLibrary={iconLibrary}
              isDark={isDark}
            />
          </TabsContent>
          <TabsContent value="typography">
            <TypographyTab
              tokens={tokens}
              onTokenChange={onTokenChange}
              onFontFamilyChange={onFontFamilyChange}
              onFontFamilyKoChange={onFontFamilyKoChange}
            />
          </TabsContent>
          <TabsContent value="layout">
            <LayoutTab
              tokens={tokens}
              onTokenChange={onTokenChange}
              onIconLibraryChange={onIconLibraryChange}
              onStylePresetChange={onStylePresetChange}
            />
          </TabsContent>
        </div>
      </Tabs>

      {/* History panel */}
      {history.length > 0 && (
        <div className="border-t border-border flex-shrink-0">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between px-[var(--ds-card-padding)] py-2 h-auto rounded-none text-xs text-muted-foreground hover:text-foreground hover:bg-accent/30"
            onClick={() => setHistoryOpen(!historyOpen)}
          >
            <span className="font-medium">최근 변경 ({history.length})</span>
            {historyOpen ? <icons.chevronDown className="w-3.5 h-3.5" /> : <icons.chevronUp className="w-3.5 h-3.5" />}
          </Button>
          {historyOpen && (
            <div className="px-[var(--ds-card-padding)] pb-[var(--ds-internal-gap)] flex flex-col gap-[var(--ds-internal-gap)] max-h-32 overflow-y-auto">
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
