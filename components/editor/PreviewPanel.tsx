"use client";

import * as React from "react";
import { toast } from "sonner";
import { Bar, BarChart, Line, LineChart, XAxis, YAxis } from "recharts";

// Existing components
import { Button } from "@/registry/new-york/ui/button";
import { Badge } from "@/registry/new-york/ui/badge";
import { Input } from "@/registry/new-york/ui/input";
import { Label } from "@/registry/new-york/ui/label";
import { Checkbox } from "@/registry/new-york/ui/checkbox";
import { Switch } from "@/registry/new-york/ui/switch";
import { Textarea } from "@/registry/new-york/ui/textarea";
import { Slider } from "@/registry/new-york/ui/slider";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/registry/new-york/ui/card";
import { Avatar, AvatarFallback } from "@/registry/new-york/ui/avatar";
import { Progress } from "@/registry/new-york/ui/progress";
import { Skeleton } from "@/registry/new-york/ui/skeleton";
import { Separator } from "@/registry/new-york/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/registry/new-york/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/new-york/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/registry/new-york/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/new-york/ui/table";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/registry/new-york/ui/breadcrumb";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/registry/new-york/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/new-york/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/registry/new-york/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "@/registry/new-york/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/registry/new-york/ui/select";
import { RadioGroup, RadioGroupItem } from "@/registry/new-york/ui/radio-group";
import { Toggle } from "@/registry/new-york/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/registry/new-york/ui/toggle-group";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/registry/new-york/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/registry/new-york/ui/collapsible";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/registry/new-york/ui/hover-card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/registry/new-york/ui/alert-dialog";
import { ScrollArea } from "@/registry/new-york/ui/scroll-area";
import { AspectRatio } from "@/registry/new-york/ui/aspect-ratio";

// New components
import { Calendar } from "@/registry/new-york/ui/calendar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/registry/new-york/ui/carousel";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/registry/new-york/ui/chart";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/registry/new-york/ui/command";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuShortcut, ContextMenuTrigger } from "@/registry/new-york/ui/context-menu";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/registry/new-york/ui/drawer";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/registry/new-york/ui/input-otp";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarTrigger } from "@/registry/new-york/ui/menubar";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/registry/new-york/ui/navigation-menu";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/registry/new-york/ui/resizable";
import { Toaster } from "@/registry/new-york/ui/sonner";
import { TypographyH1, TypographyH2, TypographyH3, TypographyH4, TypographyP, TypographyBlockquote, TypographyCode, TypographyLead, TypographyMuted } from "@/registry/new-york/ui/typography";

import { AlertCircle, CheckCircle2, Info, Home, Calculator, Calendar as CalendarIcon, Smile, Settings, User, LayoutDashboard, FileText, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, ChevronsUpDown, ChevronDown } from "lucide-react";

// --- Squircle slot definitions (mirrors squircle-provider.tsx) ---
const PILL_THRESHOLD = 9000;

// Excluded: carousel (clips arrows), resizable (clips handles), scroll-area (clips scrollbar)
const PV_CONTAINER_SLOTS: Record<string, number> = {
  button: 1, card: 1.5, input: 1, textarea: 1, "select-trigger": 1,
  badge: 1, alert: 1, checkbox: 0.5, toggle: 1, "toggle-group-item": 1,
  "tabs-list": 1, "tabs-trigger": 0.8, command: 1, skeleton: 1,
  "input-otp-slot": 1, calendar: 1, chart: 1, "accordion-item": 1,
  "table-container": 1, menubar: 1,
};

const PV_PORTAL_SLOTS: Record<string, number> = {
  "dialog-content": 1.5, "sheet-content": 1.5, "alert-dialog-content": 1.5,
  "drawer-content": 1.5, "popover-content": 1, "dropdown-menu-content": 1,
  "context-menu-content": 1, "menubar-content": 1, "tooltip-content": 0.8,
  "hover-card-content": 1, "select-content": 1, "navigation-menu-content": 1,
  "navigation-menu-viewport": 1,
};

function buildSel(slots: Record<string, number>): string {
  return Object.keys(slots).map((s) => `[data-slot='${s}']`).join(",");
}
const PV_CONTAINER_SEL = buildSel(PV_CONTAINER_SLOTS);
const PV_PORTAL_SEL = buildSel(PV_PORTAL_SLOTS);

function pvApply(
  ck: import("@cornerkit/core").default,
  el: HTMLElement, mult: number, baseR: number, smoothing: number,
  prefix: string, idx: number,
): void {
  if (!el.id) el.id = `${prefix}-${idx}-${Date.now()}`;
  const styles = getComputedStyle(el);
  if ((parseFloat(styles.borderRadius) || 0) >= PILL_THRESHOLD) return;

  const r = Math.min(mult * baseR, 9999);
  // Skip if effective radius is 0 — no smoothing needed
  if (r <= 0) return;

  // Read existing border so CornerKit renders it via SVG (not clipped)
  const bw = parseFloat(styles.borderWidth) || 0;
  const bc = styles.borderColor || "";
  const opts: Record<string, unknown> = { radius: r, smoothing };
  if (bw > 0 && bc) {
    opts.border = { width: bw, color: bc };
  }

  try {
    if (el.hasAttribute("data-squircle-applied")) {
      ck.update(`#${el.id}`, opts);
    } else {
      ck.apply(`#${el.id}`, opts);
      el.setAttribute("data-squircle-applied", "true");
    }
  } catch {
    try { ck.apply(`#${el.id}`, opts); el.setAttribute("data-squircle-applied", "true"); } catch {}
  }

  // Shadow: clip-path clips box-shadow — remove it entirely when squircle is active
  const bs = styles.boxShadow;
  if (bs && bs !== "none") {
    if (!el.dataset.origShadow) {
      el.dataset.origShadow = el.style.boxShadow || "";
    }
    el.style.boxShadow = "none";
  }
}

type PreviewCategory = "form" | "overlay" | "navigation" | "display" | "feedback";

const PREVIEW_CATEGORIES: { id: PreviewCategory; label: string }[] = [
  { id: "form", label: "Form" },
  { id: "overlay", label: "Overlay" },
  { id: "navigation", label: "Navigation" },
  { id: "display", label: "Display" },
  { id: "feedback", label: "Feedback" },
];

// ─── Form ──────────────────────────────────────────────────────────────────────

function FormPreview() {
  const [sliderVal, setSliderVal] = React.useState([50]);
  const [checked, setChecked] = React.useState(false);
  const [switched, setSwitched] = React.useState(false);
  const [otpValue, setOtpValue] = React.useState("");
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <div className="space-y-6">
      {/* Buttons */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Buttons</h3>
        <div className="flex flex-wrap gap-2">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
        </div>
      </div>

      <Separator />

      {/* Input + Label */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Input</h3>
        <div className="space-y-3 max-w-sm">
          <div className="space-y-1.5">
            <Label htmlFor="email-preview">Email address</Label>
            <Input id="email-preview" type="email" placeholder="you@example.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="textarea-preview">Message</Label>
            <Textarea id="textarea-preview" placeholder="Type your message here..." rows={3} />
          </div>
        </div>
      </div>

      <Separator />

      {/* OTP Input */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Input OTP</h3>
        <div className="space-y-2">
          <Label>Verification code</Label>
          <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          {otpValue && (
            <p className="text-xs text-muted-foreground">Entered: {otpValue}</p>
          )}
        </div>
      </div>

      <Separator />

      {/* Checkbox & Switch */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Controls</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="check-preview"
              checked={checked}
              onCheckedChange={(v) => setChecked(v === true)}
            />
            <Label htmlFor="check-preview">Accept terms and conditions</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="switch-preview"
              checked={switched}
              onCheckedChange={setSwitched}
            />
            <Label htmlFor="switch-preview">Enable notifications</Label>
          </div>
        </div>
      </div>

      <Separator />

      {/* Slider */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Slider</h3>
        <div className="max-w-sm">
          <Slider
            value={sliderVal}
            onValueChange={setSliderVal}
            min={0}
            max={100}
            step={1}
            className="mb-2"
          />
          <p className="text-xs text-muted-foreground">Value: {sliderVal[0]}</p>
        </div>
      </div>

      <Separator />

      {/* Calendar */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Calendar</h3>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border border-border w-fit"
        />
      </div>
    </div>
  );
}

// ─── Overlay ───────────────────────────────────────────────────────────────────

function OverlayPreview() {
  return (
    <div className="space-y-6">
      {/* Drawer */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Drawer</h3>
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline">Open Drawer</Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto w-full max-w-sm">
              <DrawerHeader>
                <DrawerTitle>Edit Profile</DrawerTitle>
                <DrawerDescription>
                  Make changes to your profile here. Click save when done.
                </DrawerDescription>
              </DrawerHeader>
              <div className="p-4 space-y-3">
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input placeholder="Your name" />
                </div>
                <div className="space-y-1.5">
                  <Label>Username</Label>
                  <Input placeholder="@username" />
                </div>
              </div>
              <DrawerFooter>
                <Button>Save changes</Button>
                <DrawerClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      <Separator />

      {/* Command */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Command</h3>
        <Command className="rounded-lg border border-border shadow-md max-w-sm">
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem>
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>Calendar</span>
              </CommandItem>
              <CommandItem>
                <Smile className="mr-2 h-4 w-4" />
                <span>Search Emoji</span>
              </CommandItem>
              <CommandItem>
                <Calculator className="mr-2 h-4 w-4" />
                <span>Calculator</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Settings">
              <CommandItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
                <CommandShortcut>⌘P</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
                <CommandShortcut>⌘S</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </div>

      <Separator />

      {/* Context Menu */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Context Menu</h3>
        <ContextMenu>
          <ContextMenuTrigger>
            <div className="flex h-20 w-full max-w-sm items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground cursor-default select-none">
              Right-click here
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-48">
            <ContextMenuLabel>Actions</ContextMenuLabel>
            <ContextMenuSeparator />
            <ContextMenuItem>
              <FileText className="mr-2 h-4 w-4" />
              Open
              <ContextMenuShortcut>⌘O</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem>
              Rename
              <ContextMenuShortcut>F2</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem className="text-destructive focus:text-destructive">
              Delete
              <ContextMenuShortcut>⌫</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>

      <Separator />

      {/* Dialog */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Dialog</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open Dialog</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>Make changes to your profile here. Click save when done.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input placeholder="Your name" />
              </div>
              <div className="space-y-1.5">
                <Label>Username</Label>
                <Input placeholder="@username" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Separator />

      {/* AlertDialog */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Alert Dialog</h3>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete Account</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account and remove all data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Separator />

      {/* Sheet */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Sheet</h3>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Open Sheet</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Edit Profile</SheetTitle>
              <SheetDescription>Make changes to your profile here. Click save when done.</SheetDescription>
            </SheetHeader>
            <div className="space-y-3 py-4">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input placeholder="Your name" />
              </div>
            </div>
            <SheetFooter>
              <Button>Save changes</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <Separator />

      {/* Dropdown Menu */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Dropdown Menu</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Open Menu <ChevronDown className="ml-2 h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" /> Profile <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" /> Settings <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Separator />

      {/* Popover */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Popover</h3>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Open Popover</Button>
          </PopoverTrigger>
          <PopoverContent className="w-72">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Dimensions</h4>
              <p className="text-xs text-muted-foreground">Set the dimensions for the layer.</p>
              <div className="grid grid-cols-3 items-center gap-3">
                <Label className="text-right text-xs">Width</Label>
                <Input defaultValue="100%" className="col-span-2 h-7 text-xs" />
              </div>
              <div className="grid grid-cols-3 items-center gap-3">
                <Label className="text-right text-xs">Max. width</Label>
                <Input defaultValue="300px" className="col-span-2 h-7 text-xs" />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Separator />

      {/* Tooltip */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Tooltip</h3>
        <TooltipProvider>
          <div className="flex gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">Hover me</Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>This is a tooltip</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open settings</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      <Separator />

      {/* HoverCard */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Hover Card</h3>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="link" className="text-sm p-0 h-auto">@designsync</Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-64">
            <div className="flex gap-3">
              <Avatar>
                <AvatarFallback>DS</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="text-sm font-medium">DesignSync</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Design token editor for shadcn/ui.</p>
                <p className="text-xs text-muted-foreground mt-1">Joined March 2024</p>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>

      <Separator />

      {/* Collapsible */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Collapsible</h3>
        <CollapsibleDemo />
      </div>

      <Separator />

      {/* Select */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Select</h3>
        <div className="flex flex-wrap gap-3">
          <Select>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="orange">Orange</SelectItem>
              <SelectItem value="grape">Grape</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="react">
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="react">React</SelectItem>
              <SelectItem value="vue">Vue</SelectItem>
              <SelectItem value="svelte">Svelte</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* RadioGroup */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Radio Group</h3>
        <RadioGroup defaultValue="comfortable">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="default" id="r1" />
            <Label htmlFor="r1">Default</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="comfortable" id="r2" />
            <Label htmlFor="r2">Comfortable</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="compact" id="r3" />
            <Label htmlFor="r3">Compact</Label>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      {/* Toggle & ToggleGroup */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Toggle & Toggle Group</h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Toggle aria-label="Bold"><Bold className="h-4 w-4" /></Toggle>
            <Toggle aria-label="Italic"><Italic className="h-4 w-4" /></Toggle>
            <Toggle aria-label="Underline"><Underline className="h-4 w-4" /></Toggle>
          </div>
          <ToggleGroup type="single" defaultValue="center">
            <ToggleGroupItem value="left" aria-label="Left"><AlignLeft className="h-4 w-4" /></ToggleGroupItem>
            <ToggleGroupItem value="center" aria-label="Center"><AlignCenter className="h-4 w-4" /></ToggleGroupItem>
            <ToggleGroupItem value="right" aria-label="Right"><AlignRight className="h-4 w-4" /></ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <Separator />

      {/* ScrollArea */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Scroll Area</h3>
        <ScrollArea className="h-36 w-64 rounded-md border border-border p-3">
          <div className="space-y-2">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="text-xs text-muted-foreground">
                Item {i + 1} — scroll to see more content below
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Separator />

      {/* AspectRatio */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Aspect Ratio</h3>
        <div className="w-64">
          <AspectRatio ratio={16 / 9} className="rounded-md overflow-hidden bg-muted border border-border">
            <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
              16 / 9
            </div>
          </AspectRatio>
        </div>
      </div>
    </div>
  );
}

function CollapsibleDemo() {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-72 space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Starred repositories</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
            <ChevronsUpDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
      </div>
      <div className="rounded-md border border-border px-3 py-2 text-xs font-mono">@radix-ui/primitives</div>
      <CollapsibleContent className="space-y-2">
        <div className="rounded-md border border-border px-3 py-2 text-xs font-mono">@radix-ui/colors</div>
        <div className="rounded-md border border-border px-3 py-2 text-xs font-mono">@stitches/react</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ─── Navigation ────────────────────────────────────────────────────────────────

function NavigationPreview() {
  return (
    <div className="space-y-6">
      {/* Menubar */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Menubar</h3>
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>New Tab <MenubarShortcut>⌘T</MenubarShortcut></MenubarItem>
              <MenubarItem>New Window <MenubarShortcut>⌘N</MenubarShortcut></MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Save <MenubarShortcut>⌘S</MenubarShortcut></MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Edit</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Undo <MenubarShortcut>⌘Z</MenubarShortcut></MenubarItem>
              <MenubarItem>Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut></MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Cut</MenubarItem>
              <MenubarItem>Copy</MenubarItem>
              <MenubarItem>Paste</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Zoom In</MenubarItem>
              <MenubarItem>Zoom Out</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>

      <Separator />

      {/* Navigation Menu */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Navigation Menu</h3>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4 w-[300px]">
                  <li>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                      <div>
                        <div className="text-sm font-medium mb-1">Introduction</div>
                        <p className="text-xs text-muted-foreground">Re-usable components built with Radix UI.</p>
                      </div>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                      <div>
                        <div className="text-sm font-medium mb-1">Installation</div>
                        <p className="text-xs text-muted-foreground">How to install dependencies.</p>
                      </div>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Components</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid grid-cols-2 gap-2 p-4 w-[350px]">
                  {["Alert", "Button", "Card", "Dialog", "Input", "Select"].map((name) => (
                    <li key={name}>
                      <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                        {name}
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                Docs
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <Separator />

      {/* Breadcrumb */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Breadcrumb</h3>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#"><Home className="w-3.5 h-3.5" /></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Components</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <Separator />

      {/* Tabs */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Tabs</h3>
        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="account" className="mt-3">
            <Card><CardHeader><CardTitle>Account</CardTitle><CardDescription>Manage your account settings.</CardDescription></CardHeader></Card>
          </TabsContent>
          <TabsContent value="password" className="mt-3">
            <Card><CardHeader><CardTitle>Password</CardTitle><CardDescription>Change your password here.</CardDescription></CardHeader></Card>
          </TabsContent>
          <TabsContent value="settings" className="mt-3">
            <Card><CardHeader><CardTitle>Settings</CardTitle><CardDescription>Manage your preferences.</CardDescription></CardHeader></Card>
          </TabsContent>
        </Tabs>
      </div>

      <Separator />

      {/* Sidebar Preview (static mockup) */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Sidebar</h3>
        <div className="flex rounded-lg border border-border overflow-hidden h-48">
          <div className="w-44 bg-sidebar border-r border-sidebar-border flex flex-col p-2 gap-0.5">
            <div className="px-2 py-1.5 mb-1">
              <span className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">App</span>
            </div>
            {[
              { icon: LayoutDashboard, label: "Dashboard", active: true },
              { icon: FileText, label: "Documents", active: false },
              { icon: CalendarIcon, label: "Calendar", active: false },
              { icon: Settings, label: "Settings", active: false },
            ].map(({ icon: Icon, label, active }) => (
              <div
                key={label}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs cursor-default transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </div>
            ))}
          </div>
          <div className="flex-1 bg-background p-4">
            <p className="text-xs font-medium text-foreground mb-1">Main Content</p>
            <p className="text-xs text-muted-foreground">Sidebar layout preview</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Pagination */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Pagination</h3>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline">Previous</Button>
          {[1, 2, 3, 4, 5].map((page) => (
            <Button key={page} size="sm" variant={page === 2 ? "default" : "outline"} className="w-8 px-0">
              {page}
            </Button>
          ))}
          <Button size="sm" variant="outline">Next</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Display ───────────────────────────────────────────────────────────────────

const chartData = [
  { month: "Jan", revenue: 4200, users: 240 },
  { month: "Feb", revenue: 5800, users: 310 },
  { month: "Mar", revenue: 4900, users: 280 },
  { month: "Apr", revenue: 7200, users: 420 },
  { month: "May", revenue: 6100, users: 380 },
  { month: "Jun", revenue: 8400, users: 510 },
];

const barChartConfig = {
  revenue: { label: "Revenue", color: "var(--brand-500)" },
  users: { label: "Users", color: "var(--brand-300)" },
} satisfies ChartConfig;

const lineChartConfig = {
  users: { label: "Users", color: "var(--brand-500)" },
} satisfies ChartConfig;

function DisplayPreview() {
  return (
    <div className="space-y-6">
      {/* Typography */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Typography</h3>
        <div className="space-y-2 max-w-lg">
          <TypographyH1>Heading 1</TypographyH1>
          <TypographyH2>Heading 2</TypographyH2>
          <TypographyH3>Heading 3</TypographyH3>
          <TypographyH4>Heading 4</TypographyH4>
          <TypographyLead>A lead paragraph introduces the section with slightly larger text.</TypographyLead>
          <TypographyP>Regular paragraph text. The quick brown fox jumps over the lazy dog.</TypographyP>
          <TypographyBlockquote>
            &ldquo;Design is not just what it looks like. Design is how it works.&rdquo; &mdash; Steve Jobs
          </TypographyBlockquote>
          <TypographyCode>npm install @designsync/ui</TypographyCode>
          <TypographyMuted>This is muted / helper text for secondary information.</TypographyMuted>
        </div>
      </div>

      <Separator />

      {/* Chart — Bar */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Chart — Bar</h3>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Monthly Revenue</CardTitle>
            <CardDescription>January – June 2024</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barChartConfig} className="h-48 w-full">
              <BarChart data={chartData}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Chart — Line */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Chart — Line</h3>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm">User Growth</CardTitle>
            <CardDescription>Active users over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={lineChartConfig} className="h-48 w-full">
              <LineChart data={chartData}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="users" stroke="var(--color-users)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Carousel */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Carousel</h3>
        <Carousel className="w-full max-w-sm mx-auto">
          <CarouselContent>
            {[
              { title: "Component Library", desc: "47 production-ready components", color: "bg-brand-100" },
              { title: "Design Tokens", desc: "2-layer token system with primitives", color: "bg-brand-200" },
              { title: "Dark Mode", desc: "Full dark mode support out of the box", color: "bg-brand-300" },
              { title: "Customizable", desc: "Edit tokens and preview in real time", color: "bg-brand-400" },
            ].map((item, i) => (
              <CarouselItem key={i}>
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-8 text-center gap-2 h-36">
                    <Badge variant="secondary">{i + 1} / 4</Badge>
                    <p className="font-semibold text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      <Separator />

      {/* Resizable */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Resizable</h3>
        <ResizablePanelGroup direction="horizontal" className="rounded-lg border border-border h-32 max-w-lg">
          <ResizablePanel defaultSize={50} minSize={20}>
            <div className="flex h-full items-center justify-center p-4">
              <p className="text-xs text-muted-foreground font-medium">Left Panel</p>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50} minSize={20}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={50}>
                <div className="flex h-full items-center justify-center p-2">
                  <p className="text-xs text-muted-foreground">Top Right</p>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={50}>
                <div className="flex h-full items-center justify-center p-2">
                  <p className="text-xs text-muted-foreground">Bottom Right</p>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <Separator />

      {/* Cards & Badges */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Card & Badges</h3>
        <Card className="max-w-sm shadow-md">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">John Doe</CardTitle>
                  <CardDescription>Software Engineer</CardDescription>
                </div>
              </div>
              <Badge>Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Building great products with great teams.</p>
            <div className="flex gap-1.5 mt-3">
              <Badge variant="secondary">React</Badge>
              <Badge variant="secondary">TypeScript</Badge>
              <Badge variant="outline">Design</Badge>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1">Message</Button>
            <Button size="sm" className="flex-1">Follow</Button>
          </CardFooter>
        </Card>
      </div>

      <Separator />

      {/* Table */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Table</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              { name: "Alice Kim", role: "Designer", status: "Active" },
              { name: "Bob Lee", role: "Developer", status: "Away" },
              { name: "Carol Wang", role: "Manager", status: "Active" },
            ].map((row) => (
              <TableRow key={row.name}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{row.role}</TableCell>
                <TableCell>
                  <Badge variant={row.status === "Active" ? "default" : "secondary"}>{row.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Separator />

      {/* Accordion */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Accordion</h3>
        <Accordion type="single" collapsible className="max-w-sm">
          <AccordionItem value="item-1">
            <AccordionTrigger>What is DesignSync?</AccordionTrigger>
            <AccordionContent>
              DesignSync is a visual design token editor that lets you customize your design system in real-time.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>How does it work?</AccordionTrigger>
            <AccordionContent>
              Edit tokens on the left panel and see changes reflected instantly in this preview.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <Separator />

      {/* Progress & Skeleton */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Progress & Skeleton</h3>
        <div className="space-y-3 max-w-sm">
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Upload progress</span><span>68%</span>
            </div>
            <Progress value={68} />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Feedback ──────────────────────────────────────────────────────────────────

function FeedbackPreview() {
  return (
    <div className="space-y-6">
      {/* Sonner */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Sonner Toast</h3>
        <Toaster />
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => toast("Event has been created")}>
            Default
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.success("Saved successfully!", { description: "Your design tokens have been updated." })}>
            Success
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.error("Deploy failed", { description: "Check your API credentials and try again." })}>
            Error
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.warning("Unsaved changes", { description: "You have unsaved changes that will be lost." })}>
            Warning
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.info("Update available", { description: "A new version is available for download." })}>
            Info
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.loading("Deploying...", { description: "Pushing changes to Vercel." })}>
            Loading
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast("File saved", {
            action: { label: "Undo", onClick: () => console.log("Undo") },
          })}>
            With Action
          </Button>
        </div>
      </div>

      <Separator />

      {/* Alerts */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Alert</h3>
        <div className="space-y-3">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>Your account has been successfully updated.</AlertDescription>
          </Alert>
          <Alert
            style={{
              borderColor: "var(--success-300)",
              backgroundColor: "var(--success-50)",
            }}
          >
            <CheckCircle2 className="h-4 w-4" style={{ color: "var(--success-600)" }} />
            <AlertTitle style={{ color: "var(--success-800)" }}>Success</AlertTitle>
            <AlertDescription style={{ color: "var(--success-700)" }}>
              Your changes have been saved and deployed successfully.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Failed to connect to the server. Please check your network connection.</AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────────

export function PreviewPanel({
  squircleEnabled = false,
  squircleSmoothing = 60,
  radiusKey,
  tokenKey,
}: {
  squircleEnabled?: boolean;
  squircleSmoothing?: number;
  radiusKey?: string;
  tokenKey?: string;
}) {
  const [category, setCategory] = React.useState<PreviewCategory>("form");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const ckRef = React.useRef<import("@cornerkit/core").default | null>(null);

  // Apply cornerKit squircle to preview elements
  React.useEffect(() => {
    // Cleanup: destroy CornerKit instance and restore shadows
    const cleanupAll = () => {
      try { ckRef.current?.destroy(); } catch { /* ignore */ }
      ckRef.current = null;
      // Restore shadows on all squircle-applied elements
      const restoreEls = [
        ...(containerRef.current?.querySelectorAll("[data-squircle-applied]") ?? []),
        ...document.querySelectorAll("[data-squircle-applied]"),
      ];
      restoreEls.forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.removeAttribute("data-squircle-applied");
        if (htmlEl.dataset.origShadow !== undefined) {
          htmlEl.style.boxShadow = htmlEl.dataset.origShadow || "";
          delete htmlEl.dataset.origShadow;
        }
      });
    };

    if (!squircleEnabled || !containerRef.current) {
      cleanupAll();
      return;
    }

    const smoothing = squircleSmoothing / 100;
    const baseR = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--radius-md-prim")) * 16 || 8;

    // Skip if radius is 0
    if (baseR <= 0) {
      cleanupAll();
      return;
    }

    // Small delay to let React render the category content
    const timer = setTimeout(() => {
      import("@cornerkit/core").then(({ default: CornerKit }) => {
        if (!containerRef.current) return;
        // Destroy previous instance to avoid stale references
        try { ckRef.current?.destroy(); } catch { /* ignore */ }
        ckRef.current = new CornerKit();
        const ck = ckRef.current;

        // 1. Container elements
        const containerEls = containerRef.current!.querySelectorAll(PV_CONTAINER_SEL);
        containerEls.forEach((el, i) => {
          const htmlEl = el as HTMLElement;
          const slot = htmlEl.getAttribute("data-slot") || "";
          const cfg = PV_CONTAINER_SLOTS[slot];
          if (!cfg) return;
          pvApply(ck, htmlEl, cfg, baseR, smoothing, "sq-pv", i);
        });

        // 2. Portal elements (dialog, popover, dropdown, etc.)
        const portalEls = document.querySelectorAll(PV_PORTAL_SEL);
        portalEls.forEach((el, i) => {
          const htmlEl = el as HTMLElement;
          const slot = htmlEl.getAttribute("data-slot") || "";
          const cfg = PV_PORTAL_SLOTS[slot];
          if (!cfg) return;
          pvApply(ck, htmlEl, cfg, baseR, smoothing, "sq-pt", i);
        });
      });
    }, 50);

    // Also observe document.body for portal elements
    const portalObserver = new MutationObserver(() => {
      if (!squircleEnabled) return;
      import("@cornerkit/core").then(({ default: CornerKit }) => {
        if (!ckRef.current) ckRef.current = new CornerKit();
        const ck = ckRef.current;
        const smoothVal = squircleSmoothing / 100;
        const r = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--radius-md-prim")) * 16 || 8;
        const portalEls = document.querySelectorAll(PV_PORTAL_SEL);
        portalEls.forEach((el, i) => {
          const htmlEl = el as HTMLElement;
          if (htmlEl.hasAttribute("data-squircle-applied")) return;
          const slot = htmlEl.getAttribute("data-slot") || "";
          const cfg = PV_PORTAL_SLOTS[slot];
          if (!cfg) return;
          pvApply(ck, htmlEl, cfg, r, smoothVal, "sq-pt", i);
        });
      });
    });
    portalObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(timer);
      portalObserver.disconnect();
      cleanupAll();
    };
  }, [squircleEnabled, squircleSmoothing, category, radiusKey, tokenKey]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      <div className="border-b border-border bg-card flex items-center px-4 gap-1 flex-shrink-0 overflow-x-auto">
        {PREVIEW_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`px-3 py-2.5 text-xs whitespace-nowrap transition-colors ${
              category === cat.id
                ? "border-b-2 border-primary text-primary font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          {category === "form" && <FormPreview />}
          {category === "overlay" && <OverlayPreview />}
          {category === "navigation" && <NavigationPreview />}
          {category === "display" && <DisplayPreview />}
          {category === "feedback" && <FeedbackPreview />}
        </div>
      </div>
    </div>
  );
}
