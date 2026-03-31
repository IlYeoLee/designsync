"use client";

import * as React from "react";
import { toast } from "sonner";
import { ko } from "date-fns/locale";
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, XAxis, YAxis, Area, AreaChart, Radar, RadarChart, PolarGrid, PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";

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
import { TypographyH1, TypographyH2, TypographyH3, TypographyH4, TypographyP, TypographyBlockquote, TypographyCode, TypographyLead, TypographyLarge, TypographySmall, TypographyMuted, TypographyTable, TypographyTr, TypographyTh, TypographyTd, TypographyList } from "@/registry/new-york/ui/typography";

// C-category components
import { DataTable } from "@/registry/new-york/ui/data-table";
import { DatePicker } from "@/registry/new-york/ui/date-picker";

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

import { getIconMap } from "@/lib/icon-map";

type PreviewCategory = "form" | "overlay" | "navigation" | "display" | "feedback";

const PREVIEW_CATEGORIES: { id: PreviewCategory; label: string }[] = [
  { id: "form", label: "Form" },
  { id: "overlay", label: "Overlay" },
  { id: "navigation", label: "Navigation" },
  { id: "display", label: "Display" },
  { id: "feedback", label: "Feedback" },
];

// ─── Form ──────────────────────────────────────────────────────────────────────

type IconMap = ReturnType<typeof getIconMap>;

function FormPreview({ icons }: { icons: IconMap }) {
  const [sliderVal, setSliderVal] = React.useState([50]);
  const [checked, setChecked] = React.useState(false);
  const [switched, setSwitched] = React.useState(false);
  const [otpValue, setOtpValue] = React.useState("");
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [comboValue, setComboValue] = React.useState("");
  const [comboMultiValue, setComboMultiValue] = React.useState<string[]>([]);
  const [datePickerValue, setDatePickerValue] = React.useState<Date>();

  return (
    <div className="flex flex-col gap-[var(--ds-section-gap)]">
      {/* Buttons */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Buttons</h3>
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
        <div className="flex flex-wrap gap-2 mt-2">
          <Button><icons.mail className="w-4 h-4" /> 메일 보내기</Button>
          <Button variant="outline"><icons.download className="w-4 h-4" /> 다운로드</Button>
          <Button variant="secondary"><icons.plus className="w-4 h-4" /> 추가</Button>
          <Button size="icon" variant="outline"><icons.settings className="w-4 h-4" /><span className="sr-only">설정</span></Button>
          <Button size="icon" variant="ghost"><icons.heart className="w-4 h-4" /><span className="sr-only">좋아요</span></Button>
        </div>
      </div>

      <Separator />

      {/* Input + Label */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Input</h3>
        <div className="flex flex-col gap-[var(--ds-internal-gap)] max-w-sm">
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
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Input OTP</h3>
        <div className="flex flex-col gap-[var(--ds-internal-gap)]">
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
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Controls</h3>
        <div className="flex flex-col gap-[var(--ds-internal-gap)]">
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
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Slider</h3>
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
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">캘린더</h3>
        <Calendar
          mode="single"
          locale={ko}
          selected={date}
          onSelect={setDate}
          className="rounded-[var(--ds-card-radius)] border border-border w-fit"
        />
      </div>

      <Separator />

      {/* DatePicker */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Date Picker</h3>
        <div className="flex flex-col max-w-sm gap-[var(--ds-internal-gap)]">
          <Label>날짜 선택</Label>
          <DatePicker
            value={datePickerValue}
            onValueChange={setDatePickerValue}
            placeholder="날짜를 선택하세요"
          />
          {datePickerValue && (
            <p className="text-xs text-muted-foreground">
              선택된 날짜: {datePickerValue.toLocaleDateString("ko-KR")}
            </p>
          )}
        </div>
      </div>

      <Separator />

      {/* Combobox */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Combobox</h3>
        <div className="flex flex-col gap-[var(--ds-section-gap)] max-w-sm">
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
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Button Group</h3>
        <ButtonGroup>
          <Button variant="outline">왼쪽</Button>
          <Button variant="outline">가운데</Button>
          <Button variant="outline">오른쪽</Button>
        </ButtonGroup>
      </div>

      <Separator />

      {/* Field */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Field</h3>
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
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Input Group</h3>
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
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Spinner</h3>
        <div className="flex items-center gap-[var(--ds-section-gap)]">
          <Spinner size="sm" />
          <Spinner />
          <Spinner size="lg" />
          <Spinner size="xl" />
        </div>
      </div>

      <Separator />

      {/* NativeSelect */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Native Select</h3>
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
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Kbd</h3>
        <div className="flex items-center gap-[var(--ds-section-gap)]">
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

function OverlayPreview({ icons }: { icons: IconMap }) {
  return (
    <div className="flex flex-col gap-[var(--ds-section-gap)]">
      {/* Drawer */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Drawer</h3>
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
              <div className="p-[var(--ds-card-padding)] flex flex-col gap-[var(--ds-internal-gap)]">
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
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Command</h3>
        <Command className="rounded-[var(--ds-card-radius)] border border-border shadow-md max-w-sm">
          <CommandInput placeholder="명령어 또는 검색..." />
          <CommandList>
            <CommandEmpty>결과가 없습니다.</CommandEmpty>
            <CommandGroup heading="추천">
              <CommandItem>
                <icons.calendar className="mr-2 h-4 w-4" />
                <span>캘린더</span>
              </CommandItem>
              <CommandItem>
                <icons.smile className="mr-2 h-4 w-4" />
                <span>이모지 검색</span>
              </CommandItem>
              <CommandItem>
                <icons.calculator className="mr-2 h-4 w-4" />
                <span>계산기</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="설정">
              <CommandItem>
                <icons.user className="mr-2 h-4 w-4" />
                <span>프로필</span>
                <CommandShortcut>⌘P</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <icons.settings className="mr-2 h-4 w-4" />
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
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Context Menu</h3>
        <ContextMenu>
          <ContextMenuTrigger>
            <div className="flex h-20 w-full max-w-sm items-center justify-center rounded-[var(--ds-element-radius)] border border-dashed border-border text-sm text-muted-foreground cursor-default select-none">
              여기를 우클릭
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-48">
            <ContextMenuLabel>작업</ContextMenuLabel>
            <ContextMenuSeparator />
            <ContextMenuItem>
              <icons.fileText className="mr-2 h-4 w-4" />
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
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Dialog</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">열기</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>프로필 편집</DialogTitle>
              <DialogDescription>프로필을 수정하세요. 완료 후 저장을 눌러주세요.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-[var(--ds-internal-gap)] py-2">
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
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Alert Dialog</h3>
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
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Sheet</h3>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">열기</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>프로필 편집</SheetTitle>
              <SheetDescription>프로필을 수정하세요. 완료 후 저장을 눌러주세요.</SheetDescription>
            </SheetHeader>
            <div className="flex-1 flex flex-col gap-[var(--ds-internal-gap)] px-[var(--ds-card-padding)]">
              <div className="space-y-1.5">
                <Label>이름</Label>
                <Input placeholder="이름을 입력하세요" />
              </div>
              <div className="space-y-1.5">
                <Label>사용자 이름</Label>
                <Input placeholder="@username" />
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
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Dropdown Menu</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">메뉴 <icons.chevronDown className="ml-2 h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            <DropdownMenuLabel>내 계정</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <icons.user className="mr-2 h-4 w-4" /> 프로필 <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <icons.settings className="mr-2 h-4 w-4" /> 설정 <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">로그아웃</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Separator />

      {/* Popover */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Popover</h3>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">열기</Button>
          </PopoverTrigger>
          <PopoverContent className="w-72">
            <div className="flex flex-col gap-[var(--ds-internal-gap)]">
              <h4 className="text-sm font-medium">크기</h4>
              <p className="text-xs text-muted-foreground">레이어 크기를 설정하세요.</p>
              <div className="grid grid-cols-3 items-center gap-[var(--ds-section-gap)]">
                <Label className="text-right text-xs">너비</Label>
                <Input defaultValue="100%" className="col-span-2 h-7 text-xs" />
              </div>
              <div className="grid grid-cols-3 items-center gap-[var(--ds-section-gap)]">
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
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Tooltip</h3>
        <TooltipProvider>
          <div className="flex gap-[var(--ds-section-gap)]">
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
                  <icons.settings className="h-4 w-4" />
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
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Hover Card</h3>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="link" className="text-sm p-0 h-auto">@designsync</Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-64">
            <div className="flex gap-[var(--ds-section-gap)]">
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
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Collapsible</h3>
        <CollapsibleDemo icons={icons} />
      </div>

      <Separator />

      {/* Select */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Select</h3>
        <div className="flex flex-wrap gap-[var(--ds-section-gap)]">
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
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Radio Group</h3>
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
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Toggle & Toggle Group</h3>
        <div className="flex flex-col gap-[var(--ds-internal-gap)]">
          <div className="flex gap-2">
            <Toggle variant="outline" aria-label="Bold"><icons.bold className="h-4 w-4" /></Toggle>
            <Toggle variant="outline" aria-label="Italic"><icons.italic className="h-4 w-4" /></Toggle>
            <Toggle variant="outline" aria-label="Underline"><icons.underline className="h-4 w-4" /></Toggle>
          </div>
          <ToggleGroup type="single" variant="outline" defaultValue="center">
            <ToggleGroupItem value="left" aria-label="Left"><icons.alignLeft className="h-4 w-4" /></ToggleGroupItem>
            <ToggleGroupItem value="center" aria-label="Center"><icons.alignCenter className="h-4 w-4" /></ToggleGroupItem>
            <ToggleGroupItem value="right" aria-label="Right"><icons.alignRight className="h-4 w-4" /></ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <Separator />

      {/* ScrollArea */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Scroll Area</h3>
        <ScrollArea className="h-36 w-64 rounded-[var(--ds-card-radius)] border border-border p-3">
          <div className="flex flex-col gap-[var(--ds-internal-gap)]">
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
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Aspect Ratio</h3>
        <div className="w-64">
          <AspectRatio ratio={16 / 9} className="rounded-[var(--ds-element-radius)] overflow-hidden bg-muted border border-border">
            <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
              16 / 9
            </div>
          </AspectRatio>
        </div>
      </div>
    </div>
  );
}

function CollapsibleDemo({ icons }: { icons: IconMap }) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-72 flex flex-col gap-[var(--ds-internal-gap)]">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">즐겨찾기</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
            <icons.chevronsUpDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
      </div>
      <div className="rounded-[var(--ds-card-radius)] border border-border px-3 py-2 text-xs font-mono">@radix-ui/primitives</div>
      <CollapsibleContent className="flex flex-col gap-[var(--ds-internal-gap)]">
        <div className="rounded-[var(--ds-card-radius)] border border-border px-3 py-2 text-xs font-mono">@radix-ui/colors</div>
        <div className="rounded-[var(--ds-card-radius)] border border-border px-3 py-2 text-xs font-mono">@stitches/react</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ─── Navigation ────────────────────────────────────────────────────────────────

function SidebarPreview({ icons }: { icons: IconMap }) {
  const [open, setOpen] = React.useState(true);
  return (
    <div>
      <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Sidebar</h3>
      <div className="flex rounded-[var(--ds-card-radius)] border border-border overflow-hidden h-72">
        <div className={`bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ${open ? "w-52" : "w-0 border-r-0 overflow-hidden"}`}>
          {/* Logo + Close */}
          <div className="flex items-center justify-between px-3 py-3 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[var(--ds-element-radius)] bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-xs font-bold">DS</span>
              </div>
              <span className="text-sm font-semibold text-sidebar-foreground whitespace-nowrap">DesignSync</span>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded-[var(--ds-element-radius)] hover:bg-sidebar-accent text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors">
              <icons.panelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* Menu */}
          <div className="flex-1 flex flex-col px-2 py-2 gap-0.5 overflow-y-auto">
            <div className="px-2 py-1">
              <span className="text-[10px] font-semibold text-sidebar-foreground/50 uppercase tracking-wider">메뉴</span>
            </div>
            {[
              { icon: icons.dashboard, label: "대시보드", active: true },
              { icon: icons.fileText, label: "문서", active: false },
              { icon: icons.calendar, label: "캘린더", active: false },
            ].map(({ icon: Icon, label, active }) => (
              <div key={label} className={`flex items-center gap-2 px-2 py-1.5 rounded-[var(--ds-element-radius)] text-xs cursor-default transition-colors ${active ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"}`}>
                <Icon className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">{label}</span>
              </div>
            ))}

            <Separator className="my-2 bg-sidebar-border" />

            <div className="px-2 py-1">
              <span className="text-[10px] font-semibold text-sidebar-foreground/50 uppercase tracking-wider">시스템</span>
            </div>
            {[
              { icon: icons.settings, label: "설정", active: false },
              { icon: icons.bell, label: "알림", active: false },
            ].map(({ icon: Icon, label, active }) => (
              <div key={label} className={`flex items-center gap-2 px-2 py-1.5 rounded-[var(--ds-element-radius)] text-xs cursor-default transition-colors ${active ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"}`}>
                <Icon className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">{label}</span>
              </div>
            ))}
          </div>

          {/* User */}
          <div className="border-t border-sidebar-border px-3 py-2.5 flex items-center gap-2">
            <Avatar className="w-7 h-7">
              <AvatarFallback className="text-[10px]">김</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">김도현</p>
              <p className="text-[10px] text-sidebar-foreground/50 truncate">kim@designsync.io</p>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-background p-4">
          {!open && (
            <button onClick={() => setOpen(true)} className="mb-3 p-1.5 rounded-[var(--ds-card-radius)] border border-border hover:bg-accent transition-colors">
              <icons.panelLeft className="w-4 h-4" />
            </button>
          )}
          <p className="text-xs font-medium text-foreground mb-1">메인 콘텐츠</p>
          <p className="text-xs text-muted-foreground">사이드바를 닫고 열어보세요.</p>
        </div>
      </div>
    </div>
  );
}

function NavigationPreview({ icons }: { icons: IconMap }) {
  return (
    <div className="flex flex-col gap-[var(--ds-section-gap)]">
      {/* Header */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Header</h3>
        <div className="rounded-[var(--ds-card-radius)] border border-border overflow-hidden">
          <Header>
            <HeaderLogo href="#">
              <div className="w-6 h-6 rounded-[var(--ds-element-radius)] bg-primary flex items-center justify-center">
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
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Menubar</h3>
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
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Navigation Menu</h3>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>시작하기</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-[var(--ds-section-gap)] p-4 w-[300px]">
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
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Breadcrumb</h3>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#"><icons.home className="w-3.5 h-3.5" /></BreadcrumbLink>
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

      {/* Tabs — Pill variant */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Tabs (Pill)</h3>
        <Tabs defaultValue="account">
          <TabsList variant="pill">
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

      {/* Tabs — Underline variant */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Tabs (Underline)</h3>
        <Tabs defaultValue="overview">
          <TabsList variant="underline">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="analytics">분석</TabsTrigger>
            <TabsTrigger value="reports">리포트</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-3">
            <p className="text-sm text-muted-foreground">프로젝트 개요가 여기에 표시됩니다.</p>
          </TabsContent>
          <TabsContent value="analytics" className="mt-3">
            <p className="text-sm text-muted-foreground">분석 데이터가 여기에 표시됩니다.</p>
          </TabsContent>
          <TabsContent value="reports" className="mt-3">
            <p className="text-sm text-muted-foreground">리포트가 여기에 표시됩니다.</p>
          </TabsContent>
        </Tabs>
      </div>

      <Separator />

      {/* Sidebar Preview (with toggle) */}
      <SidebarPreview icons={icons} />

      <Separator />

      {/* Pagination */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Pagination</h3>
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

const PIE_DATA = [
  { name: "디자인", value: 35 },
  { name: "개발", value: 40 },
  { name: "마케팅", value: 15 },
  { name: "기획", value: 10 },
];

const PIE_COLORS = [
  "var(--brand-500)",
  "var(--success-500)",
  "var(--warning-500)",
  "var(--error-500)",
];

const pieChartConfig = {
  design: { label: "디자인", color: "var(--brand-500)" },
  dev: { label: "개발", color: "var(--success-500)" },
  marketing: { label: "마케팅", color: "var(--warning-500)" },
  planning: { label: "기획", color: "var(--error-500)" },
} satisfies ChartConfig;

const AREA_DATA = [
  { month: "1월", value: 40 },
  { month: "2월", value: 30 },
  { month: "3월", value: 55 },
  { month: "4월", value: 45 },
  { month: "5월", value: 65 },
  { month: "6월", value: 80 },
];

const areaChartConfig = {
  value: { label: "방문자", color: "var(--brand-500)" },
} satisfies ChartConfig;

const RADAR_DATA = [
  { subject: "디자인", score: 85 },
  { subject: "개발", score: 90 },
  { subject: "마케팅", score: 70 },
  { subject: "기획", score: 80 },
  { subject: "분석", score: 75 },
  { subject: "운영", score: 65 },
];

const radarChartConfig = {
  score: { label: "역량", color: "var(--brand-500)" },
} satisfies ChartConfig;

const RADIAL_DATA = [
  { name: "완료", value: 75, fill: "var(--brand-500)" },
];

const radialChartConfig = {
  value: { label: "완료율", color: "var(--brand-500)" },
} satisfies ChartConfig;

const ICON_SHOWCASE_KEYS: (keyof ReturnType<typeof getIconMap>)[] = [
  "home", "settings", "user", "search", "plus", "x",
  "check", "chevronDown", "arrowRight", "bell", "mail", "heart",
  "star", "trash", "edit", "eye", "download", "upload",
  "filter", "menu", "logout", "sun", "moon", "zap",
];

const DATA_TABLE_DATA = [
  { name: "김수현", email: "suhyun@example.com", role: "디자이너", status: "활성" },
  { name: "이준호", email: "junho@example.com", role: "개발자", status: "활성" },
  { name: "왕서연", email: "seoyeon@example.com", role: "매니저", status: "자리비움" },
  { name: "박지민", email: "jimin@example.com", role: "디자이너", status: "활성" },
  { name: "최도윤", email: "doyun@example.com", role: "개발자", status: "비활성" },
  { name: "정하늘", email: "haneul@example.com", role: "마케팅", status: "활성" },
  { name: "강민서", email: "minseo@example.com", role: "기획", status: "자리비움" },
  { name: "윤채원", email: "chaewon@example.com", role: "개발자", status: "활성" },
];

function ProgressSkeletonPreview() {
  const [progress, setProgress] = React.useState(0);
  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 2;
      });
    }, 100);
    return () => clearInterval(timer);
  }, []);
  return (
    <div>
      <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Progress & Skeleton</h3>
      <div className="flex flex-col gap-[var(--ds-internal-gap)] max-w-sm">
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>업로드 진행률</span><span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
        <div className="flex flex-col gap-[var(--ds-internal-gap)]">
          <Skeleton className="h-4 w-full animate-pulse" />
          <Skeleton className="h-4 w-4/5 animate-pulse" />
          <Skeleton className="h-4 w-3/5 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function DisplayPreview({ icons }: { icons: IconMap }) {
  return (
    <div className="flex flex-col gap-[var(--ds-section-gap)]">
      {/* Typography */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Typography</h3>
        <div className="flex flex-col gap-[var(--ds-internal-gap)] max-w-lg">
          <TypographyH1 style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 'var(--font-weight-extrabold)' }}>Heading 1</TypographyH1>
          <TypographyH2 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-semibold)' }}>Heading 2</TypographyH2>
          <TypographyH3 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-semibold)' }}>Heading 3</TypographyH3>
          <TypographyH4 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-semibold)' }}>Heading 4</TypographyH4>
          <TypographyLead style={{ fontSize: 'var(--font-size-xl)' }}>리드 문단은 조금 더 큰 텍스트로 섹션을 소개합니다.</TypographyLead>
          <TypographyP style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-normal)', lineHeight: 'var(--line-height-normal)' }}>일반 본문 텍스트입니다. 빠른 갈색 여우가 게으른 개를 뛰어넘었습니다.</TypographyP>
          <TypographyBlockquote style={{ fontSize: 'var(--font-size-base)', lineHeight: 'var(--line-height-relaxed)' }}>
            &ldquo;디자인은 어떻게 보이는가가 아니라, 어떻게 작동하는가이다.&rdquo; &mdash; 스티브 잡스
          </TypographyBlockquote>
          <TypographyCode style={{ fontSize: 'var(--font-size-sm)' }}>npm install @designsync/ui</TypographyCode>
          <TypographyLarge style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>Large 텍스트</TypographyLarge>
          <TypographySmall style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>Small 텍스트 — 작은 보조 정보</TypographySmall>
          <TypographyMuted style={{ fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height-normal)' }}>보조 정보를 위한 흐린 텍스트입니다.</TypographyMuted>

          <TypographyList>
            <li>순서 없는 리스트 항목 1</li>
            <li>순서 없는 리스트 항목 2</li>
            <li>순서 없는 리스트 항목 3</li>
          </TypographyList>

          <TypographyList ordered>
            <li>순서 있는 리스트 항목 1</li>
            <li>순서 있는 리스트 항목 2</li>
            <li>순서 있는 리스트 항목 3</li>
          </TypographyList>

          <TypographyTable>
            <thead>
              <TypographyTr>
                <TypographyTh>항목</TypographyTh>
                <TypographyTh>설명</TypographyTh>
                <TypographyTh className="text-right">값</TypographyTh>
              </TypographyTr>
            </thead>
            <tbody>
              <TypographyTr>
                <TypographyTd>Primary</TypographyTd>
                <TypographyTd>메인 브랜드 색상</TypographyTd>
                <TypographyTd className="text-right">brand-600</TypographyTd>
              </TypographyTr>
              <TypographyTr>
                <TypographyTd>Background</TypographyTd>
                <TypographyTd>페이지 배경</TypographyTd>
                <TypographyTd className="text-right">neutral-50</TypographyTd>
              </TypographyTr>
              <TypographyTr>
                <TypographyTd>Destructive</TypographyTd>
                <TypographyTd>삭제/위험 액션</TypographyTd>
                <TypographyTd className="text-right">error-600</TypographyTd>
              </TypographyTr>
            </tbody>
          </TypographyTable>
        </div>
      </div>

      <Separator />

      {/* Empty */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Empty</h3>
        <Empty>
          <EmptyIcon><icons.fileText /></EmptyIcon>
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
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Item</h3>
        <div className="rounded-[var(--ds-card-radius)] border border-border divide-y divide-border">
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
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Chart — Bar</h3>
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
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Chart — Line</h3>
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

      {/* Chart — Pie */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Chart — Pie</h3>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">팀 구성 비율</CardTitle>
            <CardDescription>부서별 인원 분포</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={pieChartConfig} className="h-48 w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={PIE_DATA}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {PIE_DATA.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Chart — Area */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Chart — Area</h3>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">월간 방문자</CardTitle>
            <CardDescription>2024년 상반기 추이</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={areaChartConfig} className="h-48 w-full">
              <AreaChart data={AREA_DATA}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-500)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--brand-500)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={2} fill="url(#areaGradient)" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Chart — Radar */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Chart — Radar</h3>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">팀 역량 분석</CardTitle>
            <CardDescription>부서별 역량 점수</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={radarChartConfig} className="h-56 w-full">
              <RadarChart data={RADAR_DATA} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Radar dataKey="score" stroke="var(--color-score)" fill="var(--color-score)" fillOpacity={0.3} strokeWidth={2} />
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Chart — Radial */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Chart — Radial</h3>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">프로젝트 진행률</CardTitle>
            <CardDescription>전체 완료 비율</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={radialChartConfig} className="h-48 w-full">
              <RadialBarChart
                data={RADIAL_DATA}
                innerRadius="60%"
                outerRadius="80%"
                startAngle={180}
                endAngle={0}
                cx="50%"
                cy="60%"
              >
                <RadialBar dataKey="value" cornerRadius={8} />
                <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-2xl font-bold">
                  75%
                </text>
                <text x="50%" y="65%" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-xs">
                  완료
                </text>
              </RadialBarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Carousel */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Carousel</h3>
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
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Resizable</h3>
        <ResizablePanelGroup direction="horizontal" className="rounded-[var(--ds-card-radius)] border border-border h-56 max-w-lg">
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

      {/* Avatar */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Avatar</h3>
        <div className="flex items-center gap-[var(--ds-section-gap)]">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="text-xs">김</AvatarFallback>
          </Avatar>
          <Avatar className="w-10 h-10">
            <AvatarFallback>수현</AvatarFallback>
          </Avatar>
          <Avatar className="w-12 h-12">
            <AvatarFallback className="text-lg">이</AvatarFallback>
          </Avatar>
          <Avatar className="w-8 h-8">
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">DS</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <Separator />

      {/* Badge */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Badge</h3>
        <div className="flex flex-wrap gap-2">
          <Badge>기본</Badge>
          <Badge variant="secondary">보조</Badge>
          <Badge variant="outline">외곽선</Badge>
          <Badge variant="destructive">삭제</Badge>
        </div>
      </div>

      <Separator />

      {/* Separator */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Separator</h3>
        <div className="flex flex-col gap-[var(--ds-internal-gap)]">
          <div>
            <p className="text-xs text-muted-foreground mb-2">가로 구분선</p>
            <Separator />
          </div>
          <div className="flex items-center gap-[var(--ds-section-gap)] h-8">
            <span className="text-xs text-foreground">항목 1</span>
            <Separator orientation="vertical" />
            <span className="text-xs text-foreground">항목 2</span>
            <Separator orientation="vertical" />
            <span className="text-xs text-foreground">항목 3</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Cards & Badges */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Card & Badges</h3>
        <Card className="max-w-sm shadow-md">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-[var(--ds-section-gap)]">
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
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Table</h3>
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

      {/* DataTable */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Data Table</h3>
        <DataTable
          columns={[
            { key: "name", header: "이름", sortable: true },
            { key: "email", header: "이메일" },
            { key: "role", header: "역할" },
            {
              key: "status",
              header: "상태",
              render: (value) => (
                <Badge
                  variant={
                    value === "활성"
                      ? "default"
                      : value === "비활성"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {String(value)}
                </Badge>
              ),
            },
          ]}
          data={DATA_TABLE_DATA}
          pageSize={5}
        />
      </div>

      <Separator />

      {/* Accordion */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Accordion</h3>
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
      <ProgressSkeletonPreview />

      <Separator />

      {/* Icons */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Icons</h3>
        <div className="grid grid-cols-6 gap-[var(--ds-section-gap)]">
          {ICON_SHOWCASE_KEYS.map((key) => {
            const Icon = icons[key];
            return (
              <div key={key} className="flex flex-col items-center gap-1.5 p-2 rounded-[var(--ds-element-radius)] hover:bg-muted transition-colors">
                <Icon className="w-5 h-5 text-foreground" />
                <span className="text-[10px] text-muted-foreground">{key}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Feedback ──────────────────────────────────────────────────────────────────

function FeedbackPreview({ icons }: { icons: IconMap }) {
  return (
    <div className="flex flex-col gap-[var(--ds-section-gap)]">
      {/* Sonner */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Sonner Toast</h3>
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
        <h3 className="text-sm font-medium text-foreground mb-[var(--ds-internal-gap)]">Alert</h3>
        <div className="flex flex-col gap-[var(--ds-internal-gap)]">
          <Alert>
            <icons.info className="h-4 w-4" />
            <AlertTitle>안내</AlertTitle>
            <AlertDescription>계정이 성공적으로 업데이트되었습니다.</AlertDescription>
          </Alert>
          <Alert variant="success">
            <icons.checkCircle className="h-4 w-4" />
            <AlertTitle>성공</AlertTitle>
            <AlertDescription>
              변경사항이 저장되고 성공적으로 배포되었습니다.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <icons.alertCircle className="h-4 w-4" />
            <AlertTitle>오류</AlertTitle>
            <AlertDescription>서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.</AlertDescription>
          </Alert>
          <Alert variant="warning">
            <icons.alertCircle className="h-4 w-4" />
            <AlertTitle>경고</AlertTitle>
            <AlertDescription>저장하지 않은 변경사항이 있습니다. 계속하면 사라집니다.</AlertDescription>
          </Alert>
          <Alert variant="info">
            <icons.info className="h-4 w-4" />
            <AlertTitle>정보</AlertTitle>
            <AlertDescription>새 버전이 출시되었습니다. 업데이트 후 이용해주세요.</AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────────

export function PreviewPanel({ iconLibrary = "lucide" }: { iconLibrary?: string }) {
  const [category, setCategory] = React.useState<PreviewCategory>("form");
  const icons = getIconMap(iconLibrary);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      <div className="border-b border-[color:var(--divider)] bg-background flex-shrink-0 overflow-x-auto">
        <div className="flex items-center gap-0 px-[var(--ds-card-padding)]">
          {PREVIEW_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                category === cat.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-[var(--ds-card-padding)]">
        <div className="max-w-2xl mx-auto">
          {category === "form" && <FormPreview icons={icons} />}
          {category === "overlay" && <OverlayPreview icons={icons} />}
          {category === "navigation" && <NavigationPreview icons={icons} />}
          {category === "display" && <DisplayPreview icons={icons} />}
          {category === "feedback" && <FeedbackPreview icons={icons} />}
        </div>
      </div>
    </div>
  );
}
