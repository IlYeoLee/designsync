"use client";

import * as React from "react";
import { toast } from "sonner";
import { ko } from "date-fns/locale";
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
import { Header, HeaderLogo, HeaderNav, HeaderNavLink, HeaderActions, HeaderMobileNav, HeaderMobileNavLink } from "@/registry/new-york/ui/header";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/registry/new-york/ui/navigation-menu";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/registry/new-york/ui/resizable";
import { Toaster } from "@/registry/new-york/ui/sonner";
import { TypographyH1, TypographyH2, TypographyH3, TypographyH4, TypographyP, TypographyBlockquote, TypographyCode, TypographyLead, TypographyMuted } from "@/registry/new-york/ui/typography";

// B-category components
import { Combobox } from "@/registry/new-york/ui/combobox";
import { ButtonGroup } from "@/registry/new-york/ui/button-group";
import { Field, FieldDescription } from "@/registry/new-york/ui/field";
import { InputGroup, InputGroupAddon } from "@/registry/new-york/ui/input-group";
import { Spinner } from "@/registry/new-york/ui/spinner";
import { NativeSelect } from "@/registry/new-york/ui/native-select";
import { Kbd } from "@/registry/new-york/ui/kbd";
import { Empty, EmptyIcon, EmptyTitle, EmptyDescription, EmptyActions } from "@/registry/new-york/ui/empty";
import { Item, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions } from "@/registry/new-york/ui/item";

import { AlertCircle, CheckCircle2, Info, Home, Calculator, Calendar as CalendarIcon, Smile, Settings, User, LayoutDashboard, FileText, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, ChevronsUpDown, ChevronDown } from "lucide-react";

type PreviewCategory = "form" | "overlay" | "navigation" | "display" | "feedback";

const PREVIEW_CATEGORIES: { id: PreviewCategory; label: string }[] = [
  { id: "form", label: "폼" },
  { id: "overlay", label: "오버레이" },
  { id: "navigation", label: "내비게이션" },
  { id: "display", label: "디스플레이" },
  { id: "feedback", label: "피드백" },
];

// ─── Form ──────────────────────────────────────────────────────────────────────

function FormPreview() {
  const [sliderVal, setSliderVal] = React.useState([50]);
  const [checked, setChecked] = React.useState(false);
  const [switched, setSwitched] = React.useState(false);
  const [otpValue, setOtpValue] = React.useState("");
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [comboValue, setComboValue] = React.useState("");
  const [comboMultiValue, setComboMultiValue] = React.useState<string[]>([]);

  return (
    <div className="space-y-6">
      {/* Buttons */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Buttons</h3>
        <div className="flex flex-wrap gap-2">
          <Button>기본</Button>
          <Button variant="secondary">보조</Button>
          <Button variant="outline">외곽선</Button>
          <Button variant="ghost">투명</Button>
          <Button variant="destructive">삭제</Button>
          <Button variant="link">링크</Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Button size="sm">작게</Button>
          <Button size="default">기본</Button>
          <Button size="lg">크게</Button>
          <Button disabled>비활성</Button>
        </div>
      </div>

      <Separator />

      {/* Input + Label */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Input</h3>
        <div className="space-y-3 max-w-sm">
          <div className="space-y-1.5">
            <Label htmlFor="email-preview">이메일 주소</Label>
            <Input id="email-preview" type="email" placeholder="email@example.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="textarea-preview">메시지</Label>
            <Textarea id="textarea-preview" placeholder="메시지를 입력하세요..." rows={3} />
          </div>
        </div>
      </div>

      <Separator />

      {/* OTP Input */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Input OTP</h3>
        <div className="space-y-2">
          <Label>인증 코드</Label>
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
            <p className="text-xs text-muted-foreground">입력값: {otpValue}</p>
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
            <Label htmlFor="check-preview">이용약관에 동의합니다</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="switch-preview"
              checked={switched}
              onCheckedChange={setSwitched}
            />
            <Label htmlFor="switch-preview">알림 받기</Label>
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
          <p className="text-xs text-muted-foreground">값: {sliderVal[0]}</p>
        </div>
      </div>

      <Separator />

      {/* Calendar */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">캘린더</h3>
        <Calendar
          mode="single"
          locale={ko}
          selected={date}
          onSelect={setDate}
          className="rounded-md border border-border w-fit"
        />
      </div>

      <Separator />

      {/* Combobox */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Combobox</h3>
        <div className="space-y-4 max-w-sm">
          <div className="space-y-1.5">
            <Label>프레임워크 선택</Label>
            <Combobox
              options={[
                { value: "react", label: "React" },
                { value: "vue", label: "Vue" },
                { value: "svelte", label: "Svelte" },
                { value: "angular", label: "Angular" },
              ]}
              value={comboValue}
              onValueChange={setComboValue}
              placeholder="프레임워크를 선택하세요"
              searchPlaceholder="검색..."
              emptyMessage="결과가 없습니다."
            />
          </div>
          <div className="space-y-1.5">
            <Label>태그 선택 (다중)</Label>
            <Combobox
              options={[
                { value: "design", label: "디자인" },
                { value: "dev", label: "개발" },
                { value: "marketing", label: "마케팅" },
                { value: "planning", label: "기획" },
              ]}
              value={comboMultiValue}
              onValueChange={setComboMultiValue}
              multiple
              placeholder="태그를 선택하세요"
              searchPlaceholder="검색..."
              emptyMessage="결과가 없습니다."
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* ButtonGroup */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Button Group</h3>
        <ButtonGroup>
          <Button variant="outline">왼쪽</Button>
          <Button variant="outline">가운데</Button>
          <Button variant="outline">오른쪽</Button>
        </ButtonGroup>
      </div>

      <Separator />

      {/* Field */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Field</h3>
        <div className="max-w-sm">
          <Field>
            <Label htmlFor="field-email">이메일</Label>
            <Input id="field-email" type="email" placeholder="email@example.com" />
            <FieldDescription>이메일 주소를 입력하세요</FieldDescription>
          </Field>
        </div>
      </div>

      <Separator />

      {/* InputGroup */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Input Group</h3>
        <div className="max-w-sm">
          <InputGroup>
            <InputGroupAddon>https://</InputGroupAddon>
            <Input placeholder="example" />
            <InputGroupAddon>.com</InputGroupAddon>
          </InputGroup>
        </div>
      </div>

      <Separator />

      {/* Spinner */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Spinner</h3>
        <div className="flex items-center gap-4">
          <Spinner size="sm" />
          <Spinner />
          <Spinner size="lg" />
          <Spinner size="xl" />
        </div>
      </div>

      <Separator />

      {/* NativeSelect */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Native Select</h3>
        <div className="max-w-sm">
          <NativeSelect defaultValue="">
            <option value="" disabled>선택하세요</option>
            <option value="1">옵션 1</option>
            <option value="2">옵션 2</option>
            <option value="3">옵션 3</option>
          </NativeSelect>
        </div>
      </div>

      <Separator />

      {/* Kbd */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Kbd</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Kbd>⌘</Kbd><Kbd>K</Kbd>
          </div>
          <div className="flex items-center gap-1">
            <Kbd>Ctrl</Kbd><Kbd>C</Kbd>
          </div>
        </div>
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
            <Button variant="outline">열기</Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto w-full max-w-sm">
              <DrawerHeader>
                <DrawerTitle>프로필 편집</DrawerTitle>
                <DrawerDescription>
                  프로필을 수정하세요. 완료 후 저장을 눌러주세요.
                </DrawerDescription>
              </DrawerHeader>
              <div className="p-4 space-y-3">
                <div className="space-y-1.5">
                  <Label>이름</Label>
                  <Input placeholder="이름을 입력하세요" />
                </div>
                <div className="space-y-1.5">
                  <Label>사용자 이름</Label>
                  <Input placeholder="@username" />
                </div>
              </div>
              <DrawerFooter>
                <Button>저장</Button>
                <DrawerClose asChild>
                  <Button variant="outline">취소</Button>
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
          <CommandInput placeholder="명령어 또는 검색..." />
          <CommandList>
            <CommandEmpty>결과가 없습니다.</CommandEmpty>
            <CommandGroup heading="추천">
              <CommandItem>
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>캘린더</span>
              </CommandItem>
              <CommandItem>
                <Smile className="mr-2 h-4 w-4" />
                <span>이모지 검색</span>
              </CommandItem>
              <CommandItem>
                <Calculator className="mr-2 h-4 w-4" />
                <span>계산기</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="설정">
              <CommandItem>
                <User className="mr-2 h-4 w-4" />
                <span>프로필</span>
                <CommandShortcut>⌘P</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>설정</span>
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
              여기를 우클릭
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-48">
            <ContextMenuLabel>작업</ContextMenuLabel>
            <ContextMenuSeparator />
            <ContextMenuItem>
              <FileText className="mr-2 h-4 w-4" />
              열기
              <ContextMenuShortcut>⌘O</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem>
              이름 바꾸기
              <ContextMenuShortcut>F2</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem className="text-destructive focus:text-destructive">
              삭제
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
            <Button variant="outline">열기</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>프로필 편집</DialogTitle>
              <DialogDescription>프로필을 수정하세요. 완료 후 저장을 눌러주세요.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label>이름</Label>
                <Input placeholder="이름을 입력하세요" />
              </div>
              <div className="space-y-1.5">
                <Label>사용자 이름</Label>
                <Input placeholder="@username" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">취소</Button>
              <Button>저장</Button>
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
            <Button variant="destructive">계정 삭제</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
              <AlertDialogDescription>
                이 작업은 되돌릴 수 없습니다. 계정이 영구적으로 삭제되고 모든 데이터가 제거됩니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction>계속</AlertDialogAction>
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
            <Button variant="outline">열기</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>프로필 편집</SheetTitle>
              <SheetDescription>프로필을 수정하세요. 완료 후 저장을 눌러주세요.</SheetDescription>
            </SheetHeader>
            <div className="space-y-3 py-4">
              <div className="space-y-1.5">
                <Label>이름</Label>
                <Input placeholder="이름을 입력하세요" />
              </div>
            </div>
            <SheetFooter>
              <Button>저장</Button>
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
            <Button variant="outline">메뉴 <ChevronDown className="ml-2 h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            <DropdownMenuLabel>내 계정</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" /> 프로필 <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" /> 설정 <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">로그아웃</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Separator />

      {/* Popover */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Popover</h3>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">열기</Button>
          </PopoverTrigger>
          <PopoverContent className="w-72">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">크기</h4>
              <p className="text-xs text-muted-foreground">레이어 크기를 설정하세요.</p>
              <div className="grid grid-cols-3 items-center gap-3">
                <Label className="text-right text-xs">너비</Label>
                <Input defaultValue="100%" className="col-span-2 h-7 text-xs" />
              </div>
              <div className="grid grid-cols-3 items-center gap-3">
                <Label className="text-right text-xs">최대 너비</Label>
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
                <Button variant="outline" size="sm">마우스를 올려보세요</Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>툴팁입니다</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>설정 열기</p>
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
                <p className="text-xs text-muted-foreground mt-0.5">shadcn/ui 기반 디자인 토큰 에디터.</p>
                <p className="text-xs text-muted-foreground mt-1">2024년 3월 가입</p>
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
              <SelectValue placeholder="과일을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apple">사과</SelectItem>
              <SelectItem value="banana">바나나</SelectItem>
              <SelectItem value="orange">오렌지</SelectItem>
              <SelectItem value="grape">포도</SelectItem>
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
            <Label htmlFor="r1">기본</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="comfortable" id="r2" />
            <Label htmlFor="r2">편안하게</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="compact" id="r3" />
            <Label htmlFor="r3">촘촘하게</Label>
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
                항목 {i + 1} — 아래로 스크롤해서 더 보기
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
        <h4 className="text-sm font-medium">즐겨찾기</h4>
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
      {/* Header */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Header</h3>
        <div className="rounded-md border border-border overflow-hidden">
          <Header>
            <HeaderLogo href="#">
              <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-[10px] font-bold">A</span>
              </div>
              <span>AppName</span>
            </HeaderLogo>
            <HeaderNav>
              <HeaderNavLink href="#" active>대시보드</HeaderNavLink>
              <HeaderNavLink href="#">프로젝트</HeaderNavLink>
              <HeaderNavLink href="#">설정</HeaderNavLink>
            </HeaderNav>
            <HeaderActions>
              <Button variant="outline" size="sm">로그인</Button>
              <Button size="sm">시작하기</Button>
            </HeaderActions>
            <HeaderMobileNav title="메뉴">
              <HeaderMobileNavLink href="#" active>대시보드</HeaderMobileNavLink>
              <HeaderMobileNavLink href="#">프로젝트</HeaderMobileNavLink>
              <HeaderMobileNavLink href="#">설정</HeaderMobileNavLink>
            </HeaderMobileNav>
          </Header>
        </div>
      </div>

      <Separator />

      {/* Menubar */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Menubar</h3>
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>파일</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>새 탭 <MenubarShortcut>⌘T</MenubarShortcut></MenubarItem>
              <MenubarItem>새 창 <MenubarShortcut>⌘N</MenubarShortcut></MenubarItem>
              <MenubarSeparator />
              <MenubarItem>저장 <MenubarShortcut>⌘S</MenubarShortcut></MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>편집</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>실행취소 <MenubarShortcut>⌘Z</MenubarShortcut></MenubarItem>
              <MenubarItem>다시실행 <MenubarShortcut>⇧⌘Z</MenubarShortcut></MenubarItem>
              <MenubarSeparator />
              <MenubarItem>잘라내기</MenubarItem>
              <MenubarItem>복사</MenubarItem>
              <MenubarItem>붙여넣기</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>보기</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>확대</MenubarItem>
              <MenubarItem>축소</MenubarItem>
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
              <NavigationMenuTrigger>시작하기</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4 w-[300px]">
                  <li>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                      <div>
                        <div className="text-sm font-medium mb-1">소개</div>
                        <p className="text-xs text-muted-foreground">Radix UI 기반의 재사용 가능한 컴포넌트.</p>
                      </div>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                      <div>
                        <div className="text-sm font-medium mb-1">설치</div>
                        <p className="text-xs text-muted-foreground">의존성 설치 방법.</p>
                      </div>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>컴포넌트</NavigationMenuTrigger>
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
                문서
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
              <BreadcrumbLink href="#">컴포넌트</BreadcrumbLink>
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
            <TabsTrigger value="account">계정</TabsTrigger>
            <TabsTrigger value="password">비밀번호</TabsTrigger>
            <TabsTrigger value="settings">설정</TabsTrigger>
          </TabsList>
          <TabsContent value="account" className="mt-3">
            <Card><CardHeader><CardTitle>계정</CardTitle><CardDescription>계정 설정을 관리하세요.</CardDescription></CardHeader></Card>
          </TabsContent>
          <TabsContent value="password" className="mt-3">
            <Card><CardHeader><CardTitle>비밀번호</CardTitle><CardDescription>비밀번호를 변경하세요.</CardDescription></CardHeader></Card>
          </TabsContent>
          <TabsContent value="settings" className="mt-3">
            <Card><CardHeader><CardTitle>설정</CardTitle><CardDescription>환경설정을 관리하세요.</CardDescription></CardHeader></Card>
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
              { icon: LayoutDashboard, label: "대시보드", active: true },
              { icon: FileText, label: "문서", active: false },
              { icon: CalendarIcon, label: "캘린더", active: false },
              { icon: Settings, label: "설정", active: false },
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
            <p className="text-xs font-medium text-foreground mb-1">메인 콘텐츠</p>
            <p className="text-xs text-muted-foreground">사이드바 레이아웃 미리보기</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Pagination */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Pagination</h3>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline">이전</Button>
          {[1, 2, 3, 4, 5].map((page) => (
            <Button key={page} size="sm" variant={page === 2 ? "default" : "outline"} className="w-8 px-0">
              {page}
            </Button>
          ))}
          <Button size="sm" variant="outline">다음</Button>
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
          <TypographyH1 style={{ fontSize: 'var(--font-size-4xl)' }}>Heading 1</TypographyH1>
          <TypographyH2>Heading 2</TypographyH2>
          <TypographyH3>Heading 3</TypographyH3>
          <TypographyH4>Heading 4</TypographyH4>
          <TypographyLead>리드 문단은 조금 더 큰 텍스트로 섹션을 소개합니다.</TypographyLead>
          <TypographyP>일반 본문 텍스트입니다. 빠른 갈색 여우가 게으른 개를 뛰어넘었습니다.</TypographyP>
          <TypographyBlockquote>
            &ldquo;디자인은 어떻게 보이는가가 아니라, 어떻게 작동하는가이다.&rdquo; &mdash; 스티브 잡스
          </TypographyBlockquote>
          <TypographyCode>npm install @designsync/ui</TypographyCode>
          <TypographyMuted>보조 정보를 위한 흐린 텍스트입니다.</TypographyMuted>
        </div>
      </div>

      <Separator />

      {/* Empty */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Empty</h3>
        <Empty>
          <EmptyIcon><FileText /></EmptyIcon>
          <EmptyTitle>데이터가 없습니다</EmptyTitle>
          <EmptyDescription>새 항목을 추가해보세요.</EmptyDescription>
          <EmptyActions>
            <Button>추가하기</Button>
          </EmptyActions>
        </Empty>
      </div>

      <Separator />

      {/* Item */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Item</h3>
        <div className="rounded-md border border-border divide-y divide-border">
          <Item>
            <ItemMedia>
              <Avatar><AvatarFallback>김</AvatarFallback></Avatar>
            </ItemMedia>
            <ItemContent>
              <ItemTitle>김수현</ItemTitle>
              <ItemDescription>프론트엔드 개발자</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button variant="outline" size="sm">보기</Button>
            </ItemActions>
          </Item>
          <Item>
            <ItemMedia>
              <Avatar><AvatarFallback>이</AvatarFallback></Avatar>
            </ItemMedia>
            <ItemContent>
              <ItemTitle>이준호</ItemTitle>
              <ItemDescription>디자이너</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button variant="outline" size="sm">보기</Button>
            </ItemActions>
          </Item>
          <Item>
            <ItemMedia>
              <Avatar><AvatarFallback>왕</AvatarFallback></Avatar>
            </ItemMedia>
            <ItemContent>
              <ItemTitle>왕서연</ItemTitle>
              <ItemDescription>프로젝트 매니저</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button variant="outline" size="sm">보기</Button>
            </ItemActions>
          </Item>
        </div>
      </div>

      <Separator />

      {/* Chart — Bar */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Chart — Bar</h3>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">월간 매출</CardTitle>
            <CardDescription>2024년 1월 – 6월</CardDescription>
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
            <CardTitle className="text-sm">사용자 증가</CardTitle>
            <CardDescription>기간별 활성 사용자</CardDescription>
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
              { title: "컴포넌트 라이브러리", desc: "47개 프로덕션 컴포넌트", color: "bg-brand-100" },
              { title: "디자인 토큰", desc: "프리미티브 기반 2레이어 토큰", color: "bg-brand-200" },
              { title: "다크 모드", desc: "완벽한 다크 모드 지원", color: "bg-brand-300" },
              { title: "커스터마이징", desc: "토큰 편집 후 실시간 미리보기", color: "bg-brand-400" },
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
              <p className="text-xs text-muted-foreground font-medium">왼쪽 패널</p>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50} minSize={20}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={50}>
                <div className="flex h-full items-center justify-center p-2">
                  <p className="text-xs text-muted-foreground">오른쪽 상단</p>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={50}>
                <div className="flex h-full items-center justify-center p-2">
                  <p className="text-xs text-muted-foreground">오른쪽 하단</p>
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
                  <CardTitle className="text-base">김도현</CardTitle>
                  <CardDescription>소프트웨어 엔지니어</CardDescription>
                </div>
              </div>
              <Badge>활성</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">좋은 팀과 함께 좋은 제품을 만듭니다.</p>
            <div className="flex gap-1.5 mt-3">
              <Badge variant="secondary">React</Badge>
              <Badge variant="secondary">TypeScript</Badge>
              <Badge variant="outline">Design</Badge>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1">메시지</Button>
            <Button size="sm" className="flex-1">팔로우</Button>
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
              <TableHead>이름</TableHead>
              <TableHead>역할</TableHead>
              <TableHead>상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              { name: "김수현", role: "디자이너", status: "활성" },
              { name: "이준호", role: "개발자", status: "자리비움" },
              { name: "왕서연", role: "매니저", status: "활성" },
            ].map((row) => (
              <TableRow key={row.name}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{row.role}</TableCell>
                <TableCell>
                  <Badge variant={row.status === "활성" ? "default" : "secondary"}>{row.status}</Badge>
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
            <AccordionTrigger>DesignSync가 뭔가요?</AccordionTrigger>
            <AccordionContent>
              DesignSync는 디자인 토큰을 실시간으로 커스터마이징할 수 있는 비주얼 에디터입니다.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>어떻게 사용하나요?</AccordionTrigger>
            <AccordionContent>
              왼쪽 패널에서 토큰을 편집하면 이 미리보기에 바로 반영됩니다.
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
              <span>업로드 진행률</span><span>68%</span>
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
          <Button variant="outline" size="sm" onClick={() => toast("이벤트가 생성되었습니다")}>
            기본
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.success("저장 완료!", { description: "디자인 토큰이 업데이트되었습니다." })}>
            성공
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.error("배포 실패", { description: "API 인증 정보를 확인하고 다시 시도해주세요." })}>
            오류
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.warning("저장하지 않은 변경사항", { description: "저장하지 않은 변경사항이 사라집니다." })}>
            경고
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.info("업데이트 가능", { description: "새 버전을 다운로드할 수 있습니다." })}>
            안내
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.loading("배포 중...", { description: "Vercel에 변경사항 반영 중" })}>
            로딩
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast("파일 저장됨", {
            action: { label: "되돌리기", onClick: () => console.log("Undo") },
          })}>
            액션 포함
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
            <AlertTitle>안내</AlertTitle>
            <AlertDescription>계정이 성공적으로 업데이트되었습니다.</AlertDescription>
          </Alert>
          <Alert
            className="border-[var(--success-300)] bg-[var(--success-50)] dark:border-[var(--success-700)] dark:bg-[var(--success-900)]"
          >
            <CheckCircle2 className="h-4 w-4 text-[var(--success-600)] dark:text-[var(--success-400)]" />
            <AlertTitle className="text-[var(--success-800)] dark:text-[var(--success-100)]">성공</AlertTitle>
            <AlertDescription className="text-[var(--success-700)] dark:text-[var(--success-200)]">
              변경사항이 저장되고 성공적으로 배포되었습니다.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>오류</AlertTitle>
            <AlertDescription>서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.</AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────────

export function PreviewPanel() {
  const [category, setCategory] = React.useState<PreviewCategory>("form");

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      <div className="flex items-center px-4 py-2 border-b border-border bg-background flex-shrink-0 overflow-x-auto">
        <div className="bg-muted text-muted-foreground inline-flex h-9 items-center justify-center rounded-lg p-1 gap-0.5">
          {PREVIEW_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`inline-flex items-center justify-center rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap transition-all ${
                category === cat.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
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
