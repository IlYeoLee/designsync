/**
 * DesignSync — Single source of truth for AI coding rules.
 *
 * Consumed by:
 *   1. Header.tsx  → clipboard prompt (with install section)
 *   2. save/route  → designsync-all.json readme field
 *   3. rules/route → plain-text API (setup script fetches this for .cursorrules / CLAUDE.md)
 */

const CDN = "https://designsync-omega.vercel.app";

const ICON_LIBRARY_INFO: Record<string, { name: string; pkg: string; importExample: string }> = {
  lucide: { name: "Lucide", pkg: "lucide-react", importExample: 'import { Home, Settings, User, Search, Plus, X, Check } from "lucide-react"' },
  tabler: { name: "Tabler Icons", pkg: "@tabler/icons-react", importExample: 'import { IconHome, IconSettings, IconUser, IconSearch, IconPlus, IconX, IconCheck } from "@tabler/icons-react"' },
  phosphor: { name: "Phosphor Icons", pkg: "@phosphor-icons/react", importExample: 'import { House, Gear, User, MagnifyingGlass, Plus, X, Check } from "@phosphor-icons/react"' },
  remix: { name: "Remix Icon", pkg: "@remixicon/react", importExample: 'import { RiHome2Line, RiSettings3Line, RiUserLine, RiSearchLine, RiAddLine, RiCloseLine, RiCheckLine } from "@remixicon/react"' },
  hugeicons: { name: "Hugeicons", pkg: "@hugeicons/react", importExample: 'import { HugeiconsIcon } from "@hugeicons/react"; import { Home01Icon, Settings01Icon } from "@hugeicons/core-free-icons"' },
};

export interface RulesParams {
  /** e.g. "Poppins" — omit or "" for default */
  fontFamily?: string;
  /** e.g. "Pretendard" */
  fontFamilyKo?: string;
  /** Resolved CSS value, e.g. "'Poppins', 'Pretendard', sans-serif" */
  fontSansValue?: string;
  /** Icon library id — e.g. "lucide", "tabler" */
  iconLibrary?: string;
  /** Design system slug for dynamic URLs */
  dsSlug?: string;
  /** Include the install command section (for clipboard prompt) */
  includeInstall?: boolean;
}

export function generateRules(params: RulesParams = {}): string {
  const {
    fontFamily,
    fontFamilyKo,
    fontSansValue,
    iconLibrary = "lucide",
    dsSlug,
    includeInstall = false,
  } = params;



  const iconInfo = ICON_LIBRARY_INFO[iconLibrary] || ICON_LIBRARY_INFO.lucide;
  const otherIconLibs = Object.values(ICON_LIBRARY_INFO)
    .filter((lib) => lib.pkg !== iconInfo.pkg)
    .map((lib) => lib.pkg)
    .join(", ");

  // -- Dynamic font line --
  let fontLine = "";
  if (fontSansValue) {
    fontLine = `- 폰트 스택: ${fontSansValue}`;
  } else if (fontFamily && fontFamily !== "Geist") {
    const parts = [fontFamily, fontFamilyKo].filter(Boolean);
    fontLine = `- 폰트 스택: ${parts.map((f) => `'${f}'`).join(", ")}, sans-serif`;
  }
  const fontSection = fontLine ? `${fontLine}\n` : "";

  // -- Install section (only in clipboard prompt) --
  const tokensCssUrl = dsSlug ? `${CDN}/r/${dsSlug}/designsync-tokens.css` : "";
  const installSection = includeInstall
    ? `## 1. 설치

아래 명령어를 실행해줘 (한 줄이면 끝):

\`\`\`bash
${dsSlug ? `DESIGNSYNC_SLUG=${dsSlug} ` : ""}npm install github:IlYeoLee/designsync-ui && node node_modules/@ilyeolee/designsync-ui/designsync-migrate.mjs src
\`\`\`

이 명령어가 자동으로 하는 일:
1. UI 컴포넌트 60개 설치${dsSlug ? `
2. 디자인 토큰 실시간 연동 (@import url 자동 삽입)` : ``}
3. .cursorrules + CLAUDE.md 디자인 규칙 생성
${tokensCssUrl ? `
설치 후 DesignSync 웹에서 디자인 토큰을 수정하고 저장하면 프로젝트에 즉시 반영된다.
` : ""}
`
    : "";

  // -- Numbering offset --
  const n = includeInstall ? 2 : 1;

  return `${includeInstall ? `이 프로젝트에 DesignSync 디자인 시스템을 적용해줘.

**[진행 방식 — 엄수]**
매 턴마다 위반 항목을 딱 하나만 골라서 아래 형식으로 보여줘:

> 📍 파일경로:줄번호 — 위반 내용 (규칙 이름)
> before: 기존 코드
> after: 수정 코드
> 이 수정을 적용할까요? (y/n)

- 내가 y → 즉시 수정 → **대기하지 말고 곧바로 다음 위반 스캔 → 다음 항목 제시**
- 내가 n → 건너뛰고 → **대기하지 말고 곧바로 다음 위반 스캔 → 다음 항목 제시**
- 모든 위반 처리 후 → **재검토 1회 강제**: "재검토 중..." 출력 후 전체 코드를 다시 스캔하여 빠진 위반이 있으면 이어서 제시, 없으면 "✅ 위반 없음 확인" 출력 후 종료

❌ 금지: 여러 위반을 한꺼번에 보여주기 / "이 파일에 N개 있습니다" 목록 출력 / 일괄 수정 제안 / 내가 "계속해" 라고 말하기를 기다리는 것

` : ""}**[최우선 규칙] 이 프로젝트는 DesignSync 디자인 시스템 + ESLint 강제를 사용한다. 코드를 작성하거나 수정한 후 반드시 \`npx eslint src/\`을 실행하고, 에러가 0이 될 때까지 수정해라. ESLint가 잡는 것: 하드코딩 색상, 하드코딩 radius/height/padding, raw HTML 요소(<button>/<input>/<aside>/<header>/<table>/<h1>~<h6>), SVG 차트. 에러가 남아있으면 작업 완료가 아니다.**

**[커스텀 컴포넌트 강제 규칙 — DS 컴포넌트가 없어도 토큰은 반드시 사용]**
DesignSync에 해당 컴포넌트가 없다고 해서 하드코딩 색상/크기를 써도 되는 게 아니다. 커스텀으로 만드는 모든 UI도 아래 토큰을 **예외 없이** 사용해야 한다. 이걸 어기면 DesignSync 웹에서 색상/폰트를 바꿔도 해당 컴포넌트만 혼자 동떨어진 스타일로 남게 된다.
- 배경: bg-background / bg-card / bg-popover — surface 위계에 맞게 선택
- 텍스트: text-foreground / text-muted-foreground / text-primary-foreground 등 시맨틱만
- 테두리: border-border(일반) / border-input(폼) / border-[color:var(--card-border)](카드) / border-[color:var(--error-border)](오류)
- 구분선: bg-[color:var(--divider)] — border-t 직접 사용 금지
- 선택 상태: bg-[color:var(--selected)] text-[color:var(--selected-foreground)]
- 둥글기: rounded-[var(--ds-button-radius)] / rounded-[var(--ds-element-radius)] / rounded-[var(--ds-input-radius)] / rounded-[var(--ds-card-radius)]
- 호버: hover:bg-accent hover:text-accent-foreground
- 포커스(폼): focus:border-ring focus:ring-ring/50 focus:ring-[var(--ds-focus-ring-width)]
- 포커스(버튼): focus-visible:ring-ring/50
- ❌ 시맨틱 토큰에 없는 색상이 필요하면 프리미티브(--brand-600 등) 직접 참조 금지 → 새 시맨틱 토큰 추가 먼저 제안할 것

**[사이드바 강제 규칙 — 절대 예외 없음]**
사이드바가 있는 페이지는 반드시 \`<SidebarProvider>\` + \`<Sidebar>\` + \`<SidebarInset>\` 구조를 사용해야 한다. ❌ \`<aside>\` 직접 사용 금지. ❌ div로 사이드바 커스텀 구현 금지.
레이아웃 필수 패턴:
\`\`\`tsx
<SidebarProvider>
  <Sidebar>...</Sidebar>
  <SidebarInset className="min-w-0 flex-1">  {/* ← w-full 절대 금지, min-w-0 필수 */}
    <div className="min-w-0 overflow-x-hidden"> {/* ← 직속 자식 필수 */}
      ...
    </div>
  </SidebarInset>
</SidebarProvider>
\`\`\`
- \`<SidebarInset>\`에 \`w-full\` **절대 금지** (flex-1과 충돌 → 사이드바 열릴 때 콘텐츠 뷰포트 밖으로 밀림)
- \`<SidebarInset>\` 직속 자식에 반드시 \`min-w-0 overflow-x-hidden\` — flex shrink 허용 필수
- 사이드바 레이아웃 내 모든 flex/grid 컨테이너에 \`min-w-0\` 추가
- 페이지 내부 음수 마진(\`-mx-*\`) 스티키 header 금지

아래는 DesignSync 규칙 상세 레퍼런스다. 위 lint 규칙과 함께 적용된다.

${installSection}## ${n}. 디자인 토큰

### 테두리·선 토큰 (자주 혼동 — 반드시 구분해서 사용)
| 토큰 | 용도 | 사용 클래스 예시 |
|---|---|---|
| border | 일반 UI 테두리 (chip, toggle, table, card 외곽 등) | border-border |
| card-border | 카드·패널 전용 테두리 (transparent 설정으로 테두리 없애고 면으로만 구분 가능) | border-[color:var(--card-border)] |
| input | 폼 요소 테두리 (Input, Select, Textarea, Checkbox 등) | border-input |
| divider | 섹션 구분선 (Separator 컴포넌트) | bg-[color:var(--divider)] |
| ring | 포커스 링 색 (focus-visible 상태) | focus-visible:ring-ring/50 |
| error-border | 오류 상태 테두리 | border-[color:var(--error-border)] |
| success-border | 성공 상태 테두리 | border-[color:var(--success-border)] |
| warning-border | 경고 상태 테두리 | border-[color:var(--warning-border)] |

❌ 절대 금지: border-gray-200, border-zinc-300 등 하드코딩 색상으로 테두리 → 반드시 위 토큰 사용

### 색상
${fontSection}- **surface 위계 (반드시 지킴)**: background(페이지 배경) < card(카드·컴포넌트) < popover(드롭다운·모달·시트)
  - 페이지 배경: bg-background
  - 카드·패널·인풋영역: bg-card
  - 드롭다운·팝오버·다이얼로그·시트·드로어: bg-popover
- 주요 시맨틱 색상:
  - primary/primary-foreground — 주 액션 버튼, 브랜드 강조
  - secondary/secondary-foreground — 2차 액션, 흐린 배경 영역
  - accent/accent-foreground — hover 상태 하이라이트
  - selected/selected-foreground — 선택된 항목 배경 (nav active, list selection)
  - muted/muted-foreground — 비활성·설명 텍스트, 흐린 배경
  - destructive/destructive-foreground — 삭제·오류 액션 버튼
  - success/success-foreground — 성공 상태 배경·텍스트
  - warning/warning-foreground — 경고 상태 배경·텍스트
  - info/info-foreground — 정보 상태 배경·텍스트
  - icon/icon-muted — 아이콘 색 (기본/비활성)
  - divider — 섹션 구분선
- 차트 색상: var(--chart-1) ~ var(--chart-5) — 차트/그래프에서 사용
- 사이드바 색상 (⚠️ 수동 적용 필요): var(--sidebar), var(--sidebar-foreground), var(--sidebar-primary), var(--sidebar-accent), var(--sidebar-border), var(--sidebar-ring)
- ❌ 프리미티브 색상 스케일 직접 참조 금지 (--success-100, --error-600 등)
  - 시맨틱 토큰(success, success-foreground, success-border 등)이 이미 커버하므로 프리미티브 우회 불필요
  - 시맨틱 토큰으로 해결이 안 되면 새 시맨틱 토큰 추가를 먼저 제안할 것

### 폰트 — 절대 금지 목록 (위반 시 즉시 수정)
- ❌ \`import { ... } from "next/font/..."\` 또는 \`@next/font\` — **절대 금지**. DesignSync가 @font-face로 자동 처리한다.
- ❌ \`<link href="fonts.googleapis.com/...">\` 등 Google Fonts 직접 로딩 — **절대 금지**
- ❌ \`style={{ fontFamily: '...' }}\` 인라인 fontFamily 지정 — **절대 금지**
- ❌ \`text-[14px]\`, \`text-[10px]\`, \`text-[1.25rem]\` 등 arbitrary 폰트 크기 — **절대 금지**
- ❌ \`className="font-['Pretendard']"\` 등 폰트 직접 지정 — **절대 금지**
- 폰트 패밀리: var(--font-sans) — 본문용 (Tailwind \`font-sans\` 자동 매핑), var(--font-mono) — 코드용
- 폰트 크기: text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl, text-4xl (이 토큰들은 DesignSync DS 설정값에 자동 매핑됨)
- 폰트 굵기: font-normal(400), font-medium(500), font-semibold(600), font-bold(700), font-extrabold(800)
- 줄 간격: leading-tight, leading-normal, leading-relaxed, leading-loose
- 코드/모노: font-mono 클래스 사용 (var(--font-mono)에 매핑)

### 간격 (spacing)
- 토큰: gap-1(4px), gap-2(8px), gap-3(12px), gap-4(16px), gap-5(20px), gap-6(24px), gap-8(32px), gap-10(40px), gap-12(48px), gap-16(64px)
- p-*, m-*, px-*, py-*, mx-*, my-* 등도 동일한 스케일 사용
- ❌ gap-[13px], p-[20px] 등 임의 간격 금지 — 토큰 스케일 값 사용

### 밀도/스타일 프리셋 (매우 중요)
이 프로젝트의 모든 크기/둥글기/패딩은 CSS 변수로 제어된다. **새로 만드는 모든 컴포넌트도 반드시 이 변수를 사용해야 한다.**

**둥글기 — rounded-md, rounded-lg, rounded-xl 직접 사용 절대 금지:**
- 버튼/뱃지/토글: rounded-[var(--ds-button-radius)]
- 메뉴/사이드바/스켈레톤/탭/툴팁: rounded-[var(--ds-element-radius)]
- 인풋/셀렉트/텍스트영역: rounded-[var(--ds-input-radius)]
- 카드/팝오버/드롭다운/알럿: rounded-[var(--ds-card-radius)]
- 다이얼로그/시트/드로어: rounded-[var(--ds-dialog-radius)]

**높이:**
- 버튼 기본: h-[var(--ds-button-h-default)], sm: h-[var(--ds-button-h-sm)], lg: h-[var(--ds-button-h-lg)]
- 인풋: h-[var(--ds-input-h)]
- ❌ h-8, h-9, h-10, h-12 등 직접 높이 지정 금지

**패딩:**
- 카드/다이얼로그/시트 패딩: p-[var(--ds-card-padding)]
- 섹션 간격: gap-[var(--ds-section-gap)]
- 내부 간격: gap-[var(--ds-internal-gap)]
- ❌ p-6, p-4, gap-4 등 구조적 패딩 직접 지정 금지 (gap-2 이하의 미세 아이콘 간격은 예외)

**포커스 링:**
- Input / Textarea / Select 등 폼 요소: \`focus:border-ring focus:ring-ring/50 focus:ring-[var(--ds-focus-ring-width)]\`
  ❌ \`focus-visible:\` **절대 금지** — 마우스/터치 클릭 시 테두리 반응 없음 (키보드 Tab에서만 발동)
- 버튼·링크 등 기타 요소: \`focus-visible:ring-ring/50\` (키보드 전용이 맞음)
- ❌ ring-[3px] 등 픽셀 직접 지정 금지 → \`ring-[var(--ds-focus-ring-width)]\`

### 둥글기 (border-radius)
- rounded-none, rounded-sm, rounded-md, rounded-lg, rounded-xl, rounded-full

### 그림자 (shadow)
- shadow-sm, shadow-md, shadow-lg

## ${n + 1}. 컴포넌트 (import from @/components/ui/)
- Typography: <TypographyH1> <TypographyH2> <TypographyH3> <TypographyH4> <TypographyP> <TypographyLead> <TypographyMuted> <TypographyBlockquote> <TypographyCode> <TypographyLarge> <TypographySmall> <TypographyTable> <TypographyTr> <TypographyTh> <TypographyTd> <TypographyList>
- Button: variant="default|secondary|outline|ghost|destructive|link" size="sm|default|lg|icon"
- ButtonGroup: <ButtonGroup> orientation="horizontal|vertical" — 버튼 그룹 묶기
- Card: <Card> <CardHeader> <CardTitle> <CardDescription> <CardContent> <CardFooter>
- Input, Textarea, Select, NativeSelect, Checkbox, Switch, Slider, Label, Form
- Combobox: <Combobox options={[]} value={} onValueChange={} /> — 단일/멀티 자동완성 셀렉트
- Field: <Field> <FieldDescription> <FieldError> — 폼 필드 래퍼 (라벨+설명+에러)
- InputGroup: <InputGroup> <InputGroupAddon> — 인풋에 좌우 addon 추가
- Dialog, Sheet, Drawer, AlertDialog, Popover, Tooltip, DropdownMenu, ContextMenu
- Tabs, Accordion, Collapsible, NavigationMenu, Menubar, Sidebar
- Table, Badge, Avatar, Progress, Skeleton, Separator, ScrollArea
- Alert (variant="default|destructive|success|warning|info"), Sonner (토스트 알림)
- Spinner: <Spinner size="sm|default|lg|xl" /> — 로딩 인디케이터
- Empty: <Empty> <EmptyIcon> <EmptyTitle> <EmptyDescription> <EmptyActions> — 빈 상태 UI
- Item: <Item> <ItemMedia> <ItemContent> <ItemTitle> <ItemDescription> <ItemActions> — 리스트 아이템
- Kbd: <Kbd>⌘</Kbd><Kbd>K</Kbd> — 키보드 단축키 표시
- DataTable: <DataTable columns={[]} data={[]} pageSize={5} /> — 정렬/페이지네이션 테이블
- DatePicker: <DatePicker value={date} onValueChange={setDate} /> — 날짜 선택 (Calendar+Popover 조합)
- Calendar, Carousel, Chart (Bar/Line/Pie/Radar/Radial), Command, Breadcrumb, Pagination, InputOTP
- Header / NavBar (동일 컴포넌트, 두 이름 모두 사용 가능): <Header>=<NavBar>, <HeaderLogo>=<NavBarLogo>, <HeaderNav>=<NavBarNav>, <HeaderNavLink>=<NavBarNavLink>, <HeaderActions>=<NavBarActions>, <HeaderMobileNav>=<NavBarMobileNav>, <HeaderMobileNavLink>=<NavBarMobileNavLink>
  - \`showSidebarTrigger\` prop: 사이드바가 있는 레이아웃에서 Header 좌측에 SidebarTrigger 아이콘 자동 배치 — \`<Header showSidebarTrigger>\`
  - \`title\` prop (HeaderLogo): 텍스트 타이틀만 표시할 때 children 대신 사용 — \`<HeaderLogo href="/" title="대시보드" />\`
- Toggle (variant="default|outline"), ToggleGroup (variant="outline"으로 테두리 표시), HoverCard, AspectRatio, RadioGroup, Resizable
- Direction: <DirectionProvider direction="ltr|rtl"> — RTL/LTR 지원

## ${n + 2}. 아이콘 (${iconInfo.name})
이 프로젝트는 **${iconInfo.name}** (\`${iconInfo.pkg}\`) 아이콘 라이브러리를 사용한다. 모든 아이콘은 반드시 이 라이브러리에서 import한다.
- \`${iconInfo.importExample}\`
- 아이콘이 필요한 모든 곳에 적극적으로 사용 (버튼, 메뉴, 네비게이션, 리스트, 상태 표시 등)
- 크기: className="w-4 h-4" (기본), "w-3.5 h-3.5" (작게), "w-5 h-5" (크게)
- ❌ 금지: ${otherIconLibs}, react-icons, heroicons, SVG 직접 작성, 이모지로 아이콘 대체
- ❌ 금지: 아이콘 없이 텍스트만으로 UI 구성 (아이콘을 적극 활용할 것)

### JSX 사용 예제 (핵심 컴포넌트)
\`\`\`tsx
// Button
<Button>확인</Button>
<Button variant="outline" size="sm">취소</Button>
<Button variant="destructive"><Trash className="w-4 h-4" />삭제</Button>

// Card
<Card><CardHeader><CardTitle>제목</CardTitle><CardDescription>설명</CardDescription></CardHeader><CardContent>내용</CardContent><CardFooter><Button>저장</Button></CardFooter></Card>

// Dialog
<Dialog><DialogTrigger asChild><Button variant="outline">열기</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>제목</DialogTitle></DialogHeader>내용<DialogFooter><Button>확인</Button></DialogFooter></DialogContent></Dialog>

// Form Input
<Field><Label>이름</Label><Input placeholder="입력하세요" /><FieldDescription>설명 텍스트</FieldDescription></Field>

// Select
<Select><SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger><SelectContent><SelectItem value="a">옵션 A</SelectItem></SelectContent></Select>

// DatePicker
<DatePicker value={date} onValueChange={setDate} placeholder="날짜 선택" />

// Table
<Table><TableHeader><TableRow><TableHead>이름</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>값</TableCell></TableRow></TableBody></Table>

// Tabs
<Tabs defaultValue="tab1"><TabsList><TabsTrigger value="tab1">탭1</TabsTrigger></TabsList><TabsContent value="tab1">내용</TabsContent></Tabs>

// Empty State
<Empty><EmptyIcon><Search className="w-10 h-10" /></EmptyIcon><EmptyTitle>결과 없음</EmptyTitle><EmptyDescription>검색어를 변경해보세요</EmptyDescription></Empty>

// Chart (recharts 기반 — SVG 직접 작성 절대 금지)
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ResponsiveContainer } from "recharts"

const chartConfig = { revenue: { label: "매출", color: "var(--chart-1)" }, users: { label: "사용자", color: "var(--chart-2)" } }
<ChartContainer config={chartConfig} className="h-[300px] w-full">
  <BarChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="revenue" fill="var(--color-revenue)" /></BarChart>
</ChartContainer>
// LineChart도 동일 패턴: <LineChart data={data}><Line type="monotone" dataKey="users" stroke="var(--color-users)" /></LineChart>
// PieChart: <PieChart><Pie data={data} dataKey="value" cx="50%" cy="50%" /><ChartTooltip /></PieChart>
// ❌ 금지: SVG 직접 작성, canvas, d3.js — 반드시 recharts + ChartContainer 사용
\`\`\`

## ${n + 3}. 필수 규칙 (위반 시 즉시 수정)

### 절대 금지 — raw HTML 요소
- ❌ \`<button>\` → 반드시 \`<Button>\` 사용 (import from @/components/ui/button)
- ❌ \`<input>\` → 반드시 \`<Input>\` 사용 (type="date"는 \`<DatePicker>\`)
- ❌ \`<textarea>\` → 반드시 \`<Textarea>\` 사용
- ❌ \`<select>\` → 반드시 \`<Select>\` 또는 \`<NativeSelect>\` 사용
- ❌ \`<label>\` → 반드시 \`<Label>\` 사용
- ❌ \`<table>\` → 반드시 \`<Table>\` 컴포넌트 사용
- ❌ \`<h1>~<h6>\` → 반드시 \`<TypographyH1>~<TypographyH4>\` 사용
- ❌ 커스텀 모달 div → 반드시 \`<Dialog>\` 또는 \`<Sheet>\` 사용
- ❌ 커스텀 드롭다운 div → 반드시 \`<DropdownMenu>\` 또는 \`<Select>\` 사용
- ❌ SVG로 차트/그래프 직접 그리기 → 반드시 \`<ChartContainer>\` + recharts 사용
- ❌ canvas, d3.js, chart.js → 반드시 recharts + \`<ChartContainer>\` 사용

### 절대 금지 — 하드코딩 (ESLint가 전부 잡음, 0 에러 필수)
- ❌ bg-blue-600, bg-[#1a1a1a], text-white, text-gray-500, bg-slate-100 등 직접 색상 클래스
- ❌ text-[10px], text-[14px], h-[52px] 등 arbitrary 크기 — \`w-[300px]\` 레이아웃 너비 예외
- ❌ style={{ color: '#fff', fontSize: '14px', fontFamily: '...' }} 인라인 색상/크기/폰트
- ❌ #ffffff, rgb(0,0,0), hsl(0,0%,100%) 등 하드코딩 색상값
- ❌ next/font, @next/font, Google Fonts \`<link>\` 태그 직접 추가
- ❌ gap-[13px], p-[20px] 등 토큰에 없는 임의 간격
- ❌ rounded-md, rounded-lg, rounded-xl 등 직접 지정 → var(--ds-*-radius) 사용
- ❌ h-8, h-9, h-10, h-12 등 높이 직접 지정 → var(--ds-button-h-*), var(--ds-input-h) 사용
- ❌ gap-4, gap-6, p-6, p-4 등 구조적 간격 직접 지정 → var(--ds-section-gap), var(--ds-card-padding) 사용
- ❌ dark:bg-*, dark:text-* 등 다크 모드 직접 분기 — 시맨틱 토큰이 자동 처리

### 반드시 사용
- ✅ 배경: bg-background, bg-card, bg-muted, bg-primary, bg-secondary, bg-accent, bg-popover, bg-destructive
- ✅ 텍스트: text-foreground, text-muted-foreground, text-primary-foreground, text-card-foreground, text-accent-foreground
- ✅ 테두리: border-border, border-input
- ✅ 폰트 크기: text-xs ~ text-5xl (토큰 매핑)
- ✅ 폰트 굵기: font-normal, font-medium, font-semibold, font-bold, font-extrabold
- ✅ 둥글기: rounded-none ~ rounded-full (토큰 radius)
- ✅ 그림자: shadow-sm, shadow-md, shadow-lg
- ✅ 링/포커스: ring-ring, focus-visible:ring-ring/50

### 컴포넌트 사용 규칙 (예외 없이 반드시 준수)

**Typography — 모든 텍스트 요소에 예외 없이 적용:**
- ❌ \`<h1>~<h6>\` raw HTML → 반드시 \`<TypographyH1>~<TypographyH4>\`
- ❌ \`<p>\` raw HTML → 반드시 \`<TypographyP>\`, \`<TypographyMuted>\`, \`<TypographyLead>\` 중 선택
- ❌ \`<code>\` raw HTML → \`<TypographyCode>\`
- ❌ \`<blockquote>\` raw HTML → \`<TypographyBlockquote>\`
- ❌ \`<ul>\`, \`<ol>\` raw HTML → \`<TypographyList>\`
- ❌ \`text-2xl font-bold\`, \`text-xl font-semibold\`, \`text-lg font-medium\` 등 크기+굵기 직접 조합 — **절대 금지** → Typography 컴포넌트 사용
- ❌ \`text-gray-*\`, \`text-zinc-*\`, \`text-slate-*\` 등 hardcode 텍스트 색 — **절대 금지**
- 큰 숫자/KPI: \`<TypographyLarge>\` 또는 \`<TypographyH3>\`
- 설명·부제목: \`<TypographyMuted>\` 또는 \`<TypographySmall>\`
- 키보드 단축키: \`<Kbd>⌘</Kbd><Kbd>K</Kbd>\`

**레이아웃 — 반드시 DesignSync 컴포넌트:**
- ❌ 커스텀 \`<header>\` 금지 → 반드시 \`<Header>\`(또는 동일한 \`<NavBar>\`) + \`<HeaderLogo>\` + \`<HeaderNav>\` + \`<HeaderNavLink>\` + \`<HeaderActions>\` 사용 (Header=NavBar, HeaderLogo=NavBarLogo 등 두 이름 모두 동일)
- 사이드바가 있는 레이아웃의 Header: 반드시 \`showSidebarTrigger\` prop 추가 — \`<Header showSidebarTrigger>\` → 좌측에 SidebarTrigger 아이콘 자동 삽입, 별도 \`<SidebarTrigger />\` 직접 삽입 금지
- ❌ 커스텀 \`<nav>\` 금지 → \`<NavigationMenu>\` 또는 \`<Menubar>\` 사용
- ❌ 커스텀 모달 div 금지 → \`<Dialog>\` 또는 \`<Sheet>\` 사용
- ❌ 커스텀 드롭다운 div 금지 → \`<DropdownMenu>\` 사용
- ❌ 커스텀 스크롤 영역 금지 → \`<ScrollArea>\` 사용
- ⚠️ \`<Sidebar>\` 관련 토큰(sidebar-*)은 자동 마이그레이션되지 않으므로 수동으로 적용할 것
- ❌ \`<aside>\` 직접 사용 금지 → 반드시 \`<Sidebar>\` 사용 (상단 사이드바 강제 규칙 참고)

**카드/패널 — 자주 틀리는 부분:**
- 카드 컴포넌트: 반드시 \`<Card>\`+\`<CardHeader>\`+\`<CardContent>\`+\`<CardFooter>\` 사용 — 배경은 bg-card 자동 적용
- ❌ 카드를 div + bg-white/bg-gray-50/bg-zinc-900으로 구현 금지
- 카드 테두리 색은 card-border 토큰으로 제어됨 (border 토큰과 별개) — 직접 지정 금지

**알림 상태 표시 — variant 필수:**
- 에러 알림: \`<Alert variant="destructive">\` — 빨간 배경, error-border 테두리
- 성공 알림: \`<Alert variant="success">\` — 초록 배경, success-border 테두리
- 경고 알림: \`<Alert variant="warning">\` — 노란 배경, warning-border 테두리
- 정보 알림: \`<Alert variant="info">\` — 브랜드 배경
- ❌ 알림에 bg-red-50, bg-green-100 등 하드코딩 색상 금지 → 반드시 variant 사용

**내비게이션 active 상태:**
- active 링크: \`active\` prop 전달 → selected/selected-foreground 토큰 자동 적용
- ❌ active 상태에 bg-blue-100, text-blue-700 등 직접 지정 금지

**기타 필수 규칙:**
- Button 크기는 반드시 size prop ("sm" | "default" | "lg" | "icon") — className으로 h-12, px-8 등 금지
- Input 높이는 기본값 유지 — className으로 높이 변경 금지
- 토스트/알림은 \`<Sonner>\` 사용
- 구분선은 \`<Separator>\` 사용 (border-t 직접 사용 금지)
- 프로그레스 바는 \`<Progress value={n}>\` 사용 (커스텀 div 바 금지)
- 아이콘만 있는 버튼에는 반드시 sr-only 텍스트 추가: \`<Button size="icon"><X /><span className="sr-only">닫기</span></Button>\`

### 커스텀 UI 만들 때 (DesignSync에 없는 컴포넌트)
DesignSync에 해당 컴포넌트가 없더라도 아래 파운데이션 토큰은 **절대적으로** 지켜야 한다:
- 배경색: surface 위계에 맞게 — bg-background(페이지), bg-card(패널), bg-popover(드롭다운/오버레이) 중 선택
- 텍스트색: text-foreground, text-muted-foreground 등 시맨틱 색상만
- 테두리: border-border (일반), border-input (폼), border-[color:var(--card-border)] (카드), border-[color:var(--error-border)] (오류) 등 목적별 구분
- 구분선: bg-[color:var(--divider)] (border-t 직접 사용 금지)
- 선택 상태: bg-[color:var(--selected)] text-[color:var(--selected-foreground)]
- 아이콘: text-[color:var(--icon)] (기본), text-[color:var(--icon-muted)] (비활성)
- 둥글기: rounded-[var(--ds-button-radius)] / rounded-[var(--ds-element-radius)] / rounded-[var(--ds-input-radius)] / rounded-[var(--ds-card-radius)] 중 용도에 맞게
- 그림자: shadow-sm, shadow-md, shadow-lg
- 호버 상태: hover:bg-accent hover:text-accent-foreground
- 포커스 상태 (폼 요소): focus:border-ring focus:ring-ring/50 focus:ring-[var(--ds-focus-ring-width)]
- 포커스 상태 (버튼·기타): focus-visible:border-ring focus-visible:ring-ring/50
- 시맨틱 토큰으로 커버 안 되는 색상이 필요하면, 프리미티브 직접 참조 대신 새 시맨틱 토큰 추가를 제안할 것

### 다크 모드
- 다크 모드 분기를 직접 하지 않는다. 시맨틱 토큰(bg-background, text-foreground 등)이 자동으로 light/dark를 처리한다.
- dark: 접두사로 색상을 오버라이드하지 않는다 (예: dark:bg-gray-900 금지).

### 반응형 디자인
- 모바일 퍼스트: 기본 스타일은 모바일, sm:/md:/lg:/xl: 접두사로 확장
- 주요 중단점: sm(640px), md(768px), lg(1024px), xl(1280px)
- 모바일 내비게이션: <HeaderMobileNav> (= <NavBarMobileNav>) 사용 (md 이하에서 Sheet으로 열림)
- 데스크톱 내비게이션: <HeaderNav> (= <NavBarNav>) (md 이상에서 표시)

### 접근성
- 아이콘만 있는 버튼: \`<span className="sr-only">설명</span>\` 필수
- 포커스 링: 폼 요소는 \`focus:\`, 버튼/링크는 \`focus-visible:\` (접근성 표준)
- 시맨틱 HTML: \`<nav>\`, \`<main>\`, \`<section>\`, \`<article>\` 적절히 사용 — \`<aside>\` 금지 (Sidebar 컴포넌트로 대체)
- aria-label: 네비게이션, 모달, 중요 인터랙션에 추가
- ❌ \`<aside>\` 직접 사용 금지 — 반드시 \`<Sidebar>\` + SidebarProvider 구조 사용

### Next.js 패턴
- 링크: <a> 대신 next/link의 <Link> 사용
- 이미지: <img> 대신 next/image의 <Image> 사용
- "use client": 이벤트 핸들러, useState, useEffect가 필요한 컴포넌트에만 추가
- 서버 컴포넌트: 데이터 fetch, 메타데이터는 서버 컴포넌트에서 처리

## ${n + 4}. 자동 교체 패턴 (기존 코드 리팩터링)

**기존 코드에 하드코딩된 스타일이 있으면, 아래 매핑을 참고하여 즉시 전부 교체하라. 유저가 별도로 요청하지 않아도 자동 수행한다. 커스텀 HTML도 가능하면 DesignSync 컴포넌트로 교체한다.**

### 토큰 교체
- bg-blue-600, bg-indigo-600, bg-[주요색] → bg-primary
- bg-white, bg-gray-50, bg-[#fafafa] → bg-background
- bg-gray-100, bg-slate-100 → bg-muted
- bg-gray-900, bg-[#111] → bg-card (다크모드 자동)
- bg-red-600, bg-red-500 → bg-destructive
- bg-blue-50, bg-indigo-50 → bg-accent
- text-gray-900, text-[#111], text-black → text-foreground
- text-gray-500, text-gray-400 → text-muted-foreground
- text-white (primary 위) → text-primary-foreground
- text-blue-600 → text-primary
- text-red-600 → text-destructive
- border-gray-200, border-gray-100, border-[#e5e5e5] → border-border
- border-[#ddd], border-gray-300 → border-input
- rounded-xl, rounded-lg (카드) → rounded-[var(--ds-card-radius)]
- rounded-md (버튼) → rounded-[var(--ds-button-radius)]
- rounded-md (인풋) → rounded-[var(--ds-input-radius)]
- rounded-md (메뉴/사이드바) → rounded-[var(--ds-element-radius)]
- h-9, h-10 (버튼) → h-[var(--ds-button-h-default)]
- h-8 (작은 버튼) → h-[var(--ds-button-h-sm)]
- h-9 (인풋) → h-[var(--ds-input-h)]
- p-6, p-5 (카드) → p-[var(--ds-card-padding)]
- gap-4, gap-6 (섹션) → gap-[var(--ds-section-gap)]
- focus-visible:ring-[3px] (버튼) → focus-visible:ring-[var(--ds-focus-ring-width)]
- focus-visible:border-ring focus-visible:ring-ring/50 (인풋) → focus:border-ring focus:ring-ring/50 focus:ring-[var(--ds-focus-ring-width)]

### 컴포넌트 교체 (61개 전체 매핑)

**폼 컴포넌트:**
- \`<button className="bg-blue/bg-primary...">\` → \`<Button>\`
- \`<button className="border...">\` → \`<Button variant="outline">\`
- \`<button className="bg-red/destructive...">\` → \`<Button variant="destructive">\`
- \`<button className="bg-secondary...">\` → \`<Button variant="secondary">\`
- \`<button className="ghost/투명...">\` → \`<Button variant="ghost">\`
- \`<a className="underline...">\` → \`<Button variant="link">\`
- 버튼 그룹 (인접 버튼 묶음) → \`<ButtonGroup>\`
- \`<input type="text/email/password">\` → \`<Input>\`
- \`<textarea>\` → \`<Textarea>\`
- \`<select>\` → \`<NativeSelect>\` 또는 \`<Select>\`
- \`<input type="checkbox">\` → \`<Checkbox>\`
- 커스텀 토글 스위치 (rounded-full + translate) → \`<Switch>\`
- \`<input type="range">\` → \`<Slider>\`
- \`<input type="radio">\` 그룹 → \`<RadioGroup>\`
- \`<label>\` → \`<Label>\`
- 폼 필드 (label + input + 설명) → \`<Field> <FieldDescription>\`
- input + 좌우 addon → \`<InputGroup> <InputGroupAddon>\`
- 자동완성 select → \`<Combobox>\`
- 날짜 선택 → \`<DatePicker>\`
- OTP 입력 → \`<InputOTP>\`
- 달력 → \`<Calendar>\`
- \`<form>\` → \`<Form>\` (react-hook-form 사용 시)

**레이아웃 컴포넌트:**
- 카드 구조 (border + rounded + padding + shadow) → \`<Card> <CardHeader> <CardTitle> <CardDescription> <CardContent> <CardFooter>\`
- \`<header>\` (고정 상단바) → \`<Header> <HeaderLogo> <HeaderNav> <HeaderNavLink> <HeaderActions> <HeaderMobileNav>\` / 사이드바 레이아웃이면 \`<Header showSidebarTrigger>\`
- \`<aside>\` (사이드 메뉴) → \`<Sidebar> <SidebarHeader> <SidebarContent> <SidebarMenu> <SidebarMenuItem> <SidebarMenuButton> <SidebarFooter>\`
- \`<hr>\` 또는 구분선 → \`<Separator>\`
- 리사이즈 가능한 패널 → \`<ResizablePanelGroup> <ResizablePanel> <ResizableHandle>\`
- 비율 고정 컨테이너 → \`<AspectRatio>\`
- 스크롤 영역 → \`<ScrollArea>\`
- RTL/LTR 래퍼 → \`<DirectionProvider>\`

**내비게이션 컴포넌트:**
- border-b-2 탭 구조 → \`<Tabs> <TabsList variant="underline"> <TabsTrigger> <TabsContent>\`
- pill 탭 구조 → \`<Tabs> <TabsList variant="pill">\`
- ❌ 커스텀 탭 구현 금지 (Button + activeTab state + 조건부 스타일) → 무조건 \`<Tabs><TabsList><TabsTrigger><TabsContent>\`로 교체. CSS 셀렉터 기반 tabClass 변수도 전부 삭제. 탭 버튼에 \`<Button>\` 쓸 경우 반드시 variant="ghost" 지정, 미지정 시 bg-primary(파란색) 버튼으로 깨짐.
- ❌ 커스텀 scale 애니메이션 금지 (animate-in, scale-95, scale-100, opacity-0→1, transition-all duration-* 조합) → 전부 제거. DS 컴포넌트(Dialog/Popover/DropdownMenu 등)가 자체 애니메이션을 처리한다.
- 아코디언/접기 구조 → \`<Accordion> <AccordionItem> <AccordionTrigger> <AccordionContent>\`
- 접기/펼치기 → \`<Collapsible> <CollapsibleTrigger> <CollapsibleContent>\`
- 상단 네비게이션 메뉴 → \`<NavigationMenu>\`
- 메뉴바 → \`<Menubar>\`
- 경로 표시 → \`<Breadcrumb>\`
- 페이지네이션 → \`<Pagination>\`

**오버레이 컴포넌트:**
- fixed + bg-black/50 + 모달 → \`<Dialog> <DialogContent> <DialogHeader> <DialogTitle> <DialogDescription> <DialogFooter>\`
- 사이드에서 슬라이드 → \`<Sheet> <SheetContent> <SheetHeader> <SheetTitle>\`
- 아래서 올라오는 모달 → \`<Drawer> <DrawerContent> <DrawerHeader>\`
- 확인/취소 모달 → \`<AlertDialog> <AlertDialogContent> <AlertDialogAction> <AlertDialogCancel>\`
- 클릭 시 팝업 → \`<Popover> <PopoverTrigger> <PopoverContent>\`
- 호버 시 팝업 → \`<Tooltip> <TooltipTrigger> <TooltipContent>\`
- 클릭 드롭다운 메뉴 → \`<DropdownMenu> <DropdownMenuTrigger> <DropdownMenuContent> <DropdownMenuItem>\`
- 우클릭 컨텍스트 메뉴 → \`<ContextMenu> <ContextMenuTrigger> <ContextMenuContent> <ContextMenuItem>\`
- 호버 카드 → \`<HoverCard> <HoverCardTrigger> <HoverCardContent>\`
- 커맨드 팔레트 (Cmd+K) → \`<Command> <CommandInput> <CommandList> <CommandItem>\`

**피드백 컴포넌트:**
- 알림 배너 → \`<Alert variant="default|destructive|success|warning|info"> <AlertTitle> <AlertDescription>\`
- 에러 → \`variant="destructive"\`, 성공 → \`variant="success"\`, 경고 → \`variant="warning"\`, 정보 → \`variant="info"\`
- 토스트 알림 → Sonner \`toast()\`
- 프로그레스 바 (bg-gray-200 + bg-blue-600 bar) → \`<Progress value={n}>\`
- 로딩 스켈레톤 (animate-pulse + bg-gray) → \`<Skeleton>\`
- 스피너 → \`<Spinner>\`
- 빈 상태 (아이콘 + 제목 + 설명) → \`<Empty> <EmptyIcon> <EmptyTitle> <EmptyDescription> <EmptyActions>\`

**데이터 컴포넌트:**
- \`<table>\` → \`<Table> <TableHeader> <TableRow> <TableHead> <TableBody> <TableCell>\`
- 정렬/페이지네이션 테이블 → \`<DataTable columns={} data={}>\`
- 상태 뱃지 (rounded-full + bg-색상 + text-색상) → \`<Badge>\` 또는 \`<Badge variant="secondary/outline/destructive">\`
- 아바타 (rounded-full + 이니셜/이미지) → \`<Avatar> <AvatarFallback>\`
- 토글 버튼 → \`<Toggle variant="outline">\`
- 토글 그룹 (인접 토글 묶음) → \`<ToggleGroup> <ToggleGroupItem>\`
- 캐러셀/슬라이더 → \`<Carousel> <CarouselContent> <CarouselItem>\`
- 차트 → \`<ChartContainer> <ChartTooltip>\` + recharts

**텍스트 컴포넌트:**
- \`<h1>\` → \`<TypographyH1>\`
- \`<h2>\` → \`<TypographyH2>\`
- \`<h3>\` → \`<TypographyH3>\`
- \`<h4>\` → \`<TypographyH4>\`
- \`<p>\` (일반) → \`<TypographyP>\`
- \`<p>\` (큰 텍스트) → \`<TypographyLead>\`
- \`<p>\` (흐린 텍스트) → \`<TypographyMuted>\`
- \`<blockquote>\` → \`<TypographyBlockquote>\`
- \`<code>\` → \`<TypographyCode>\`
- 큰 텍스트 → \`<TypographyLarge>\`
- 작은 텍스트 → \`<TypographySmall>\`
- \`<table>\` (타이포그래피) → \`<TypographyTable> <TypographyTr> <TypographyTh> <TypographyTd>\`
- \`<ul>/<ol>\` → \`<TypographyList>\`
- 키보드 단축키 → \`<Kbd>\`
- 리스트 아이템 (미디어+제목+설명) → \`<Item> <ItemMedia> <ItemContent> <ItemTitle> <ItemDescription> <ItemActions>\`

${includeInstall ? `## ${n + 5}. 실행 순서

1. 위 설치 명령어를 실행해서 디자인 시스템을 적용
2. 설치 완료 후 즉시 \`npx eslint src/\`를 실행
3. **[스캔→제시→수정 루프]** 위반 항목을 하나씩 찾아 위 진행 방식대로 y/n을 받아 수정 — y든 n이든 즉시 다음 위반을 찾아 제시 (내가 먼저 말하기를 기다리지 말 것)
4. 모든 위반 처리 후 **재검토 1회 강제**: "재검토 중..." 출력 → 전체 재스캔 → 남은 위반 있으면 루프 계속, 없으면 \`npx eslint src/\` 실행하여 에러 0 확인
5. 에러 0 확인 후 "✅ DesignSync 적용 완료" 출력
6. 이후 새로 작성하는 모든 코드도 위 규칙을 따를 것

` : ""}`.trim();
}
