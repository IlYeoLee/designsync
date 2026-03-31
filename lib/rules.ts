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

  const setupParam = dsSlug ? `?ds=${dsSlug}` : "";

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

**[진행 방식]** 파일별로 어떤 변경을 할지 먼저 보여주고, 변경할지 여부를 나에게 물어봐. 내가 y라고 하면 적용하고, n이면 건너뛰어. 토큰 교체(색상/간격/radius)는 자동으로 해도 되지만, 컴포넌트 교체(<button>→<Button> 등 구조가 바뀌는 것)는 반드시 먼저 물어봐.

` : ""}**[최우선 규칙] 이 프로젝트는 DesignSync 디자인 시스템 + ESLint 강제를 사용한다. 코드를 작성하거나 수정한 후 반드시 \`npx eslint src/\`을 실행하고, 에러가 0이 될 때까지 수정해라. ESLint가 잡는 것: 하드코딩 색상, 하드코딩 radius/height/padding, raw HTML 요소(<button>/<input>/<aside>/<header>/<table>/<h1>~<h6>), SVG 차트. 에러가 남아있으면 작업 완료가 아니다.**

아래는 DesignSync 규칙 상세 레퍼런스다. 위 lint 규칙과 함께 적용된다.

${installSection}## ${n}. 디자인 토큰

### 색상
${fontSection}- 시맨틱 색상: var(--primary), var(--secondary), var(--accent), var(--destructive), var(--muted), var(--background), var(--foreground), var(--border), var(--input), var(--ring), var(--card), var(--popover) 및 각 -foreground
- 사이드바 색상: var(--sidebar), var(--sidebar-foreground), var(--sidebar-primary), var(--sidebar-accent), var(--sidebar-border), var(--sidebar-ring) 및 각 -foreground
- 차트 색상: var(--chart-1) ~ var(--chart-5) — 차트/그래프에서 사용
- 프리미티브 색상 스케일: --{brand|neutral|error|success|warning}-{50|100|200|300|400|500|600|700|800|900}
  - 시맨틱 토큰으로 부족할 때만 프리미티브 참조 (예: bg-[var(--success-100)], text-[var(--error-600)])

### 폰트
- 폰트 패밀리: var(--font-sans) — 본문용, var(--font-mono) — 코드용
- DesignSync가 @font-face로 폰트를 자동 로딩한다. **next/font, Google Fonts <link> 태그를 직접 추가하지 말 것.**
- 폰트 크기: text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl, text-4xl, text-5xl
- 폰트 굵기: font-normal(400), font-medium(500), font-semibold(600), font-bold(700), font-extrabold(800)
  - font-semibold와 font-extrabold는 Typography 컴포넌트 내부에서 사용됨. 직접 사용 시 Typography 컴포넌트를 먼저 고려할 것.
- 줄 간격: leading-tight, leading-normal, leading-loose
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
- focus-visible:ring-[var(--ds-focus-ring-width)]
- ❌ focus-visible:ring-[3px] 등 직접 지정 금지

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
- Alert (variant="default|destructive"), Sonner (토스트 알림)
- Spinner: <Spinner size="sm|default|lg|xl" /> — 로딩 인디케이터
- Empty: <Empty> <EmptyIcon> <EmptyTitle> <EmptyDescription> <EmptyActions> — 빈 상태 UI
- Item: <Item> <ItemMedia> <ItemContent> <ItemTitle> <ItemDescription> <ItemActions> — 리스트 아이템
- Kbd: <Kbd>⌘</Kbd><Kbd>K</Kbd> — 키보드 단축키 표시
- DataTable: <DataTable columns={[]} data={[]} pageSize={5} /> — 정렬/페이지네이션 테이블
- DatePicker: <DatePicker value={date} onValueChange={setDate} /> — 날짜 선택 (Calendar+Popover 조합)
- Calendar, Carousel, Chart (Bar/Line/Pie/Radar/Radial), Command, Breadcrumb, Pagination, InputOTP
- Header: <Header> <HeaderLogo> <HeaderNav> <HeaderNavLink> <HeaderActions> <HeaderMobileNav> <HeaderMobileNavLink>
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

### 절대 금지 — 하드코딩
- ❌ bg-blue-600, bg-[#1a1a1a], text-white, text-gray-500, bg-slate-100 등 직접 색상 클래스
- ❌ text-[10px], text-[14px], h-[52px], w-[300px] 등 임의 크기 (arbitrary value)
- ❌ style={{ color: '#fff', fontSize: '14px' }} 인라인 스타일로 색상/크기/폰트 지정
- ❌ #ffffff, rgb(0,0,0), hsl(0,0%,100%) 등 하드코딩 색상값
- ❌ next/font 또는 Google Fonts <link> 태그 직접 추가 (DesignSync가 @font-face로 처리)
- ❌ gap-[13px], p-[20px] 등 토큰에 없는 임의 간격
- ❌ rounded-md, rounded-lg 등 직접 지정 → var(--ds-button-radius), var(--ds-card-radius) 등 사용
- ❌ h-9, h-10 등 높이 직접 지정 → var(--ds-button-h-default), var(--ds-input-h) 등 사용
- ❌ gap-4, gap-6, p-6 등 간격 직접 지정 → var(--ds-section-gap), var(--ds-card-padding) 등 사용

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

**Typography — 모든 텍스트에 적용:**
- \`<h1>\`, \`<h2>\`, \`<h3>\` → \`<TypographyH1>\`, \`<TypographyH2>\`, \`<TypographyH3>\`
- \`<p>\` → \`<TypographyP>\` 또는 \`<TypographyMuted>\`
- 큰 숫자/KPI 값 (text-2xl font-bold 등) → \`<TypographyLarge>\` 사용
- 작은 설명 텍스트 → \`<TypographySmall>\` 또는 \`<TypographyMuted>\`
- \`<code>\` → \`<TypographyCode>\`
- \`<blockquote>\` → \`<TypographyBlockquote>\`
- ❌ \`text-2xl font-bold\`, \`text-xl font-semibold\` 등 직접 조합 금지 → Typography 컴포넌트 사용

**레이아웃 — 반드시 DesignSync 컴포넌트:**
- ❌ 커스텀 \`<aside>\` 금지 → 반드시 \`<Sidebar>\` + \`<SidebarHeader>\` + \`<SidebarContent>\` + \`<SidebarMenu>\` + \`<SidebarMenuItem>\` + \`<SidebarMenuButton>\` + \`<SidebarFooter>\` 사용
- ❌ 커스텀 \`<header>\` 금지 → 반드시 \`<Header>\` + \`<HeaderLogo>\` + \`<HeaderNav>\` + \`<HeaderNavLink>\` + \`<HeaderActions>\` 사용 (Header 배경은 bg-background 단색)
- ❌ 커스텀 \`<nav>\` 금지 → \`<NavigationMenu>\` 또는 \`<Menubar>\` 사용
- ❌ 커스텀 모달 div 금지 → \`<Dialog>\` 또는 \`<Sheet>\` 사용
- ❌ 커스텀 드롭다운 div 금지 → \`<DropdownMenu>\` 사용
- ❌ 커스텀 스크롤 영역 금지 → \`<ScrollArea>\` 사용

**기타 필수 규칙:**
- Button 크기는 반드시 size prop ("sm" | "default" | "lg" | "icon") — className으로 h-12, px-8 등 금지
- Input 높이는 기본값 유지 — className으로 높이 변경 금지
- 토스트/알림은 \`<Sonner>\` 사용
- 구분선은 \`<Separator>\` 사용 (border-t 직접 사용 금지)
- 프로그레스 바는 \`<Progress value={n}>\` 사용 (커스텀 div 바 금지)
- 아이콘만 있는 버튼에는 반드시 sr-only 텍스트 추가: \`<Button size="icon"><X /><span className="sr-only">닫기</span></Button>\`

### 커스텀 UI 만들 때 (DesignSync에 없는 컴포넌트)
DesignSync에 해당 컴포넌트가 없더라도 아래 파운데이션 토큰은 **절대적으로** 지켜야 한다:
- 배경색: bg-background, bg-card, bg-muted, bg-primary, bg-secondary, bg-accent 중 선택
- 텍스트색: text-foreground, text-muted-foreground 등 시맨틱 색상만
- 테두리: border-border
- 둥글기: rounded-sm ~ rounded-xl (토큰 radius)
- 폰트 크기/굵기/줄간격: 반드시 토큰 값 사용
- 그림자: shadow-sm, shadow-md, shadow-lg
- 호버/포커스 상태: hover:bg-accent, focus-visible:ring-ring/50 등 토큰 기반
- 색상이 정말 필요하면 CSS 변수 참조: bg-[var(--brand-500)], text-[var(--success-600)] 등 프리미티브 토큰 (Tailwind arbitrary value 허용)

### 다크 모드
- 다크 모드 분기를 직접 하지 않는다. 시맨틱 토큰(bg-background, text-foreground 등)이 자동으로 light/dark를 처리한다.
- dark: 접두사로 색상을 오버라이드하지 않는다 (예: dark:bg-gray-900 금지).

### 반응형 디자인
- 모바일 퍼스트: 기본 스타일은 모바일, sm:/md:/lg:/xl: 접두사로 확장
- 주요 중단점: sm(640px), md(768px), lg(1024px), xl(1280px)
- 모바일 내비게이션: <HeaderMobileNav> 사용 (md 이하에서 Sheet으로 열림)
- 데스크톱 내비게이션: <HeaderNav> (md 이상에서 표시)

### 접근성
- 아이콘만 있는 버튼: <span className="sr-only">설명</span> 필수
- 포커스 링: focus-visible:ring-ring/50 패턴 사용
- 시맨틱 HTML: <nav>, <main>, <section>, <article>, <aside> 적절히 사용
- aria-label: 네비게이션, 모달, 중요 인터랙션에 추가

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
- focus-visible:ring-[3px] → focus-visible:ring-[var(--ds-focus-ring-width)]

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
- \`<header>\` (고정 상단바) → \`<Header> <HeaderLogo> <HeaderNav> <HeaderNavLink> <HeaderActions> <HeaderMobileNav>\`
- \`<aside>\` (사이드 메뉴) → \`<Sidebar> <SidebarHeader> <SidebarContent> <SidebarMenu> <SidebarMenuItem> <SidebarMenuButton> <SidebarFooter>\`
- \`<hr>\` 또는 구분선 → \`<Separator>\`
- 리사이즈 가능한 패널 → \`<ResizablePanelGroup> <ResizablePanel> <ResizableHandle>\`
- 비율 고정 컨테이너 → \`<AspectRatio>\`
- 스크롤 영역 → \`<ScrollArea>\`
- RTL/LTR 래퍼 → \`<DirectionProvider>\`

**내비게이션 컴포넌트:**
- border-b-2 탭 구조 → \`<Tabs> <TabsList variant="underline"> <TabsTrigger> <TabsContent>\`
- pill 탭 구조 → \`<Tabs> <TabsList variant="pill">\`
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
- 알림 배너 (bg-blue-50/green-50/red-50 + border + icon) → \`<Alert> <AlertTitle> <AlertDescription>\`
- 에러 알림 → \`<Alert variant="destructive">\`
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
2. 기존 코드의 모든 파일을 스캔하여 위 교체 패턴을 수행 — 토큰 교체는 자동으로, 컴포넌트 교체는 파일별로 먼저 보여주고 y/n 확인 후 적용
3. 이후 새로 작성하는 모든 코드도 위 규칙을 따를 것

` : ""}`.trim();
}
