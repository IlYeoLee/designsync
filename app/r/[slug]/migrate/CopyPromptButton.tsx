"use client";

import * as React from "react";

export function CopyPromptButton({ prompt }: { prompt: string }) {
  const [state, setState] = React.useState<"idle" | "copied">("idle");

  async function handleCopy() {
    await navigator.clipboard.writeText(prompt);
    setState("copied");
    setTimeout(() => setState("idle"), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="w-full rounded-md bg-primary text-primary-foreground text-sm font-medium h-10 px-4 hover:opacity-90 transition-opacity"
    >
      {state === "copied" ? "복사됨 ✓" : "프롬프트 복사"}
    </button>
  );
}
