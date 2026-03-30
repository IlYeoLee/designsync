import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const SYSTEM_PROMPT = `You are a DesignSync migration assistant.
Rewrite the given React/Next.js JSX/TSX file to use DesignSync design tokens and components.

CRITICAL RULES:
- Fix ONLY UI/styling. Do NOT change any logic, state, props, event handlers, or data.
- Return ONLY the complete migrated file content. No explanation. No markdown fences.

━━━ COLOR TOKEN MAPPINGS ━━━
bg-blue-600, bg-indigo-600, bg-violet-600  → bg-primary
bg-white, bg-gray-50, bg-[#fafafa]         → bg-background
bg-gray-100, bg-slate-100, bg-zinc-100     → bg-muted
bg-gray-900, bg-slate-900, bg-[#111]       → bg-card
bg-red-600, bg-red-500                     → bg-destructive
bg-blue-50, bg-indigo-50                   → bg-accent
text-gray-900, text-slate-900, text-black  → text-foreground
text-gray-500, text-gray-400               → text-muted-foreground
text-white (on primary/dark bg)            → text-primary-foreground
text-blue-600, text-indigo-600             → text-primary
text-red-600, text-red-500                 → text-destructive
border-gray-200, border-gray-100           → border-border
border-gray-300, border-[#ddd]             → border-input

━━━ TOKEN MAPPINGS (RADIUS / HEIGHT / SPACING) ━━━
rounded-xl, rounded-lg  (card/panel)       → rounded-[var(--ds-card-radius)]
rounded-md              (button)           → rounded-[var(--ds-button-radius)]
rounded-md              (input/select)     → rounded-[var(--ds-input-radius)]
rounded-md              (menu/dropdown)    → rounded-[var(--ds-element-radius)]
h-9, h-10               (button)           → h-[var(--ds-button-h-default)]
h-8                     (small button)     → h-[var(--ds-button-h-sm)]
h-12                    (large button)     → h-[var(--ds-button-h-lg)]
h-9                     (input)            → h-[var(--ds-input-h)]
p-6, p-5                (card)             → p-[var(--ds-card-padding)]
gap-4, gap-6            (section layout)   → gap-[var(--ds-section-gap)]
gap-2, gap-3            (internal items)   → gap-[var(--ds-internal-gap)]
focus-visible:ring-[3px]                   → focus-visible:ring-[var(--ds-focus-ring-width)]

━━━ COMPONENT MIGRATIONS ━━━
Raw HTML → DesignSync (always add the import):
  <button>     → <Button>          from @/components/ui/button
  <input>      → <Input>           from @/components/ui/input
  <textarea>   → <Textarea>        from @/components/ui/textarea
  <select>     → <NativeSelect>    from @/components/ui/native-select
  <label>      → <Label>           from @/components/ui/label
  <h1>~<h4>    → <TypographyH1~H4> from @/components/ui/typography
  <p>          → <TypographyP>     from @/components/ui/typography
  <ul>/<ol>    → <TypographyList>  from @/components/ui/typography
  <blockquote> → <TypographyBlockquote> from @/components/ui/typography
  <code>       → <TypographyCode>  from @/components/ui/typography
  <small>      → <TypographySmall> from @/components/ui/typography
  <kbd>        → <Kbd>             from @/components/ui/kbd
  <hr>         → <Separator>       from @/components/ui/separator
  <table>/<thead>/<tbody>/<tfoot>/<tr>/<th>/<td>
               → Table/TableHeader/TableBody/TableFooter/TableRow/TableHead/TableCell
                                   from @/components/ui/table

Pattern → DesignSync component:
  div with border+rounded+shadow (card-like)
    → <Card><CardContent>...</CardContent></Card>  from @/components/ui/card
  div with animate-pulse
    → <Skeleton>                                   from @/components/ui/skeleton
  div/p with role="alert"
    → <Alert><AlertDescription>...</AlertDescription></Alert> from @/components/ui/alert
  span with small text + rounded + bg (badge-like)
    → <Badge>                                      from @/components/ui/badge
  div with rounded-full + img or initials (avatar-like)
    → <Avatar><AvatarImage/><AvatarFallback>       from @/components/ui/avatar
  <progress value={n}>
    → <Progress value={n} />                       from @/components/ui/progress
  div with animate-spin
    → <Spinner>                                    from @/components/ui/spinner`;

export async function POST(req: NextRequest) {
  try {
    const { content, filename } = await req.json();

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "content required" }, { status: 400 });
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Migrate this file${filename ? ` (${filename})` : ""}:\n\n${content}`,
        },
      ],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    // 마크다운 펜스 제거
    const migrated = raw
      .replace(/^```(?:tsx?|jsx?)?\n?/, "")
      .replace(/\n?```\s*$/, "");

    return NextResponse.json({ migrated });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
