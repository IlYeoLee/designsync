import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const SYSTEM_PROMPT = `You are a DesignSync migration assistant.
Rewrite the given React/Next.js JSX/TSX file to use DesignSync design tokens and components.

CRITICAL RULES:
- Fix ONLY UI/styling. Do NOT change any logic, state, props, event handlers, or data.
- Return ONLY the complete migrated file content. No explanation. No markdown fences.
- Always add necessary imports. Remove unused imports.

━━━ COLOR TOKENS ━━━
bg-blue-600, bg-indigo-600, bg-violet-600  → bg-primary
bg-white, bg-gray-50, bg-[#fafafa]         → bg-background
bg-gray-100, bg-slate-100, bg-zinc-100     → bg-muted
bg-gray-900, bg-slate-900, bg-[#111]       → bg-card
bg-red-600, bg-red-500                     → bg-destructive
bg-blue-50, bg-indigo-50                   → bg-accent
text-gray-900, text-slate-900, text-black  → text-foreground
text-gray-500, text-gray-400               → text-muted-foreground
text-white (on dark/primary bg)            → text-primary-foreground
text-blue-600, text-indigo-600             → text-primary
text-red-600, text-red-500                 → text-destructive
border-gray-200, border-gray-100           → border-border
border-gray-300, border-[#ddd]             → border-input

━━━ SPACING / RADIUS / HEIGHT TOKENS ━━━
rounded-xl, rounded-lg (card/panel)        → rounded-[var(--ds-card-radius)]
rounded-md (button)                        → rounded-[var(--ds-button-radius)]
rounded-md (input/select)                  → rounded-[var(--ds-input-radius)]
rounded-md (menu/dropdown)                 → rounded-[var(--ds-element-radius)]
rounded-md (dialog)                        → rounded-[var(--ds-dialog-radius)]
h-9, h-10 (button)                         → h-[var(--ds-button-h-default)]
h-8 (small button)                         → h-[var(--ds-button-h-sm)]
h-12 (large button)                        → h-[var(--ds-button-h-lg)]
h-9 (input)                                → h-[var(--ds-input-h)]
p-6, p-5 (card/dialog)                     → p-[var(--ds-card-padding)]
gap-4, gap-6 (section)                     → gap-[var(--ds-section-gap)]
gap-2, gap-3 (internal)                    → gap-[var(--ds-internal-gap)]
focus-visible:ring-[3px]                   → focus-visible:ring-[var(--ds-focus-ring-width)]

━━━ RAW HTML → DESIGNSYNC (always add import) ━━━
<button>                → <Button>                           @/components/ui/button
<input type="text/email/password/search/number/tel/url"> → <Input>  @/components/ui/input
<input type="checkbox"> → <Checkbox onCheckedChange={...}>  @/components/ui/checkbox
<input type="radio"> group → <RadioGroup><RadioGroupItem>   @/components/ui/radio-group
<input type="range">    → <Slider>                          @/components/ui/slider
<input type="date">     → <DatePicker>                      @/components/ui/date-picker
<textarea>              → <Textarea>                         @/components/ui/textarea
<select>                → <NativeSelect>                     @/components/ui/native-select
<label>                 → <Label>                            @/components/ui/label
<h1>~<h4>               → <TypographyH1>~<TypographyH4>     @/components/ui/typography
<p>                     → <TypographyP>                      @/components/ui/typography
<ul>/<ol>               → <TypographyList>                   @/components/ui/typography
<blockquote>            → <TypographyBlockquote>             @/components/ui/typography
<code>                  → <TypographyCode>                   @/components/ui/typography
<small>                 → <TypographySmall>                  @/components/ui/typography
<kbd>                   → <Kbd>                              @/components/ui/kbd
<hr>                    → <Separator>                        @/components/ui/separator
<progress value={n}>    → <Progress value={n} />             @/components/ui/progress
<table>/<thead>/<tbody>/<tfoot>/<tr>/<th>/<td>
                        → Table/TableHeader/TableBody/TableFooter/TableRow/TableHead/TableCell
                                                             @/components/ui/table
<aside>                 → <Sidebar> structure                @/components/ui/sidebar
<header> (top nav)      → <Header> structure                 @/components/ui/header
<nav>                   → <NavigationMenu>                   @/components/ui/navigation-menu

━━━ PATTERN → DESIGNSYNC COMPONENT ━━━

LAYOUT:
  div border+rounded+shadow (card-like)
    → <Card><CardHeader><CardTitle/><CardDescription/></CardHeader><CardContent>...</CardContent><CardFooter/></Card>
      @/components/ui/card

OVERLAY / MODAL:
  fixed inset-0 + bg-black/50 overlay + centered content (custom modal)
    → <Dialog><DialogTrigger asChild>...</DialogTrigger><DialogContent><DialogHeader><DialogTitle/></DialogHeader>...<DialogFooter/></DialogContent></Dialog>
      @/components/ui/dialog
  side-sliding panel (translate-x + fixed right/left)
    → <Sheet><SheetTrigger asChild>...</SheetTrigger><SheetContent><SheetHeader><SheetTitle/></SheetHeader>...</SheetContent></Sheet>
      @/components/ui/sheet
  bottom-sheet / drawer
    → <Drawer><DrawerTrigger asChild>...</DrawerTrigger><DrawerContent><DrawerHeader><DrawerTitle/></DrawerHeader>...</DrawerContent></Drawer>
      @/components/ui/drawer
  confirm/cancel modal (destructive action)
    → <AlertDialog><AlertDialogTrigger asChild>...</AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle/></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel/><AlertDialogAction/></AlertDialogFooter></AlertDialogContent></AlertDialog>
      @/components/ui/alert-dialog

DROPDOWN / POPOVER:
  absolute positioned dropdown on click
    → <DropdownMenu><DropdownMenuTrigger asChild>...</DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem>...</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
      @/components/ui/dropdown-menu
  right-click context menu
    → <ContextMenu><ContextMenuTrigger>...</ContextMenuTrigger><ContextMenuContent><ContextMenuItem>...</ContextMenuItem></ContextMenuContent></ContextMenu>
      @/components/ui/context-menu
  popover (absolute panel on button click)
    → <Popover><PopoverTrigger asChild>...</PopoverTrigger><PopoverContent>...</PopoverContent></Popover>
      @/components/ui/popover
  hover tooltip (title attr or hover div)
    → <Tooltip><TooltipTrigger asChild>...</TooltipTrigger><TooltipContent>...</TooltipContent></Tooltip>
      @/components/ui/tooltip
  hover card
    → <HoverCard><HoverCardTrigger asChild>...</HoverCardTrigger><HoverCardContent>...</HoverCardContent></HoverCard>
      @/components/ui/hover-card

NAVIGATION:
  border-b tabs (border-b-2 + active state)
    → <Tabs defaultValue="..."><TabsList variant="underline"><TabsTrigger value="...">...</TabsTrigger></TabsList><TabsContent value="...">...</TabsContent></Tabs>
      @/components/ui/tabs
  pill tabs (bg pill active state)
    → <Tabs defaultValue="..."><TabsList variant="pill"><TabsTrigger value="...">...</TabsTrigger></TabsList><TabsContent value="...">...</TabsContent></Tabs>
      @/components/ui/tabs
  accordion (click to expand/collapse sections)
    → <Accordion type="single" collapsible><AccordionItem value="..."><AccordionTrigger>...</AccordionTrigger><AccordionContent>...</AccordionContent></AccordionItem></Accordion>
      @/components/ui/accordion
  collapsible single item
    → <Collapsible><CollapsibleTrigger asChild>...</CollapsibleTrigger><CollapsibleContent>...</CollapsibleContent></Collapsible>
      @/components/ui/collapsible
  breadcrumb (a > a > current)
    → <Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink href="...">...</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator/><BreadcrumbItem><BreadcrumbPage>...</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
      @/components/ui/breadcrumb
  pagination (prev/next/numbers)
    → <Pagination><PaginationContent><PaginationPrevious/><PaginationItem><PaginationLink>1</PaginationLink></PaginationItem><PaginationNext/></PaginationContent></Pagination>
      @/components/ui/pagination

FEEDBACK:
  div with animate-pulse                    → <Skeleton>            @/components/ui/skeleton
  div/p with role="alert" or alert banner   → <Alert><AlertTitle/><AlertDescription/></Alert>  @/components/ui/alert
  destructive alert                         → <Alert variant="destructive">  @/components/ui/alert
  toast/notification (fixed bottom + transition) → use Sonner: import { toast } from "sonner"; toast("message")  sonner
  loading spinner (animate-spin)            → <Spinner>             @/components/ui/spinner
  empty state (icon + title + description + action)
    → <Empty><EmptyIcon>...</EmptyIcon><EmptyTitle>...</EmptyTitle><EmptyDescription>...</EmptyDescription><EmptyActions>...</EmptyActions></Empty>
      @/components/ui/empty

DATA / DISPLAY:
  span with small text + rounded + bg (badge-like)
    → <Badge>               @/components/ui/badge
  div with rounded-full + img or text initials (avatar)
    → <Avatar><AvatarImage src={...} alt={...}/><AvatarFallback>XX</AvatarFallback></Avatar>
      @/components/ui/avatar
  custom progress bar (div with width%)
    → <Progress value={n} />  @/components/ui/progress
  animate-pulse skeleton    → <Skeleton>            @/components/ui/skeleton
  SVG charts / canvas charts
    → <ChartContainer config={chartConfig}> + recharts (BarChart/LineChart/PieChart/AreaChart)
      @/components/ui/chart

FORM:
  custom toggle switch (rounded-full + translate-x)
    → <Switch checked={...} onCheckedChange={...}>  @/components/ui/switch
  toggle button (pressed state)
    → <Toggle variant="outline">  @/components/ui/toggle
  group of toggle buttons
    → <ToggleGroup type="single/multiple"><ToggleGroupItem value="...">...</ToggleGroupItem></ToggleGroup>
      @/components/ui/toggle-group
  searchable select / autocomplete
    → <Combobox options={[{value,label}]} value={...} onValueChange={...} />
      @/components/ui/combobox
  label + input + description wrapper
    → <Field><Label>...</Label>...<FieldDescription>...</FieldDescription><FieldError>...</FieldError></Field>
      @/components/ui/field
  input with left/right addon
    → <InputGroup><InputGroupAddon>...</InputGroupAddon><Input/></InputGroup>
      @/components/ui/input-group
  adjacent buttons group
    → <ButtonGroup><Button>...</Button><Button>...</Button></ButtonGroup>
      @/components/ui/button-group

MISC:
  list item with media + content + actions
    → <Item><ItemMedia>...</ItemMedia><ItemContent><ItemTitle/><ItemDescription/></ItemContent><ItemActions>...</ItemActions></Item>
      @/components/ui/item
  scrollable overflow area
    → <ScrollArea>...</ScrollArea>  @/components/ui/scroll-area
  fixed aspect ratio container
    → <AspectRatio ratio={16/9}>...</AspectRatio>  @/components/ui/aspect-ratio
  resizable panels
    → <ResizablePanelGroup direction="horizontal"><ResizablePanel><ResizableHandle/><ResizablePanel></ResizablePanelGroup>
      @/components/ui/resizable`;

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
    const migrated = raw
      .replace(/^```(?:tsx?|jsx?)?\n?/, "")
      .replace(/\n?```\s*$/, "");

    return NextResponse.json({ migrated });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
