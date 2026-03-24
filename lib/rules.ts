/**
 * DesignSync — Single source of truth for AI coding rules.
 *
 * Consumed by:
 *   1. Header.tsx  → clipboard prompt (with install section)
 *   2. save/route  → designsync-all.json readme field
 *   3. rules/route → plain-text API (setup script fetches this for .cursorrules / CLAUDE.md)
 */

const CDN = "https://designsync-omega.vercel.app";

export interface RulesParams {
  /** e.g. "Poppins" — omit or "" for default */
  fontFamily?: string;
  /** e.g. "Pretendard" */
  fontFamilyKo?: string;
  /** Resolved CSS value, e.g. "'Poppins', 'Pretendard', sans-serif" */
  fontSansValue?: string;
  /** Include the install command section (for clipboard prompt) */
  includeInstall?: boolean;
}

export function generateRules(params: RulesParams = {}): string {
  const {
    fontFamily,
    fontFamilyKo,
    fontSansValue,
    includeInstall = false,
  } = params;

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
  const installSection = includeInstall
    ? `## 1. 설치

아래 명령어 중 환경에 맞는 것을 실행해줘:

**macOS / Linux:**
\`\`\`bash
curl -fsSL ${CDN}/api/setup | node
\`\`\`

**Windows (PowerShell):**
\`\`\`powershell
(Invoke-WebRequest -Uri ${CDN}/api/setup -UseBasicParsing).Content | node -
\`\`\`

**또는 (Node 18+ 어디서든):**
\`\`\`bash
node -e "require('https').get('${CDN}/api/setup',r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>{require('fs').writeFileSync('.ds-setup.cjs',d);require('./.ds-setup.cjs')})})"
\`\`\`

이 명령어가 하는 일:
1. globals.css의 기존 테마(색상, 폰트, 다크모드)를 깨끗이 제거
2. DesignSync 디자인 토큰을 적용 (light/dark 모드 포함)
3. UI 컴포넌트를 설치 또는 덮어쓰기
4. .cursorrules 와 CLAUDE.md 에 디자인 규칙을 자동 생성 (매 대화 자동 로드)
5. 원본 globals.css 는 .bak 으로 백업

`
    : "";

  // -- Numbering offset --
  const n = includeInstall ? 2 : 1;

  return `${includeInstall ? "이 프로젝트에 DesignSync 디자인 시스템을 적용해줘.\n\n" : ""}**중요: 아래 규칙은 이번 작업뿐 아니라, 이 대화에서 앞으로 작성하는 모든 코드에 영구적으로 적용된다. 새로운 페이지, 컴포넌트, 기능을 만들 때도 반드시 이 디자인 시스템을 따라야 한다.**

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

### 둥글기 (border-radius)
- rounded-none, rounded-sm, rounded-md, rounded-lg, rounded-xl, rounded-full

### 그림자 (shadow)
- shadow-sm, shadow-md, shadow-lg

## ${n + 1}. 컴포넌트 (import from @/components/ui/)
- Typography: <TypographyH1> <TypographyH2> <TypographyH3> <TypographyH4> <TypographyP> <TypographyLead> <TypographyMuted> <TypographyBlockquote> <TypographyCode> <TypographyLarge> <TypographySmall>
- Button: variant="default|secondary|outline|ghost|destructive|link" size="sm|default|lg|icon"
- Card: <Card> <CardHeader> <CardTitle> <CardDescription> <CardContent> <CardFooter>
- Input, Textarea, Select, Checkbox, Switch, Slider, Label, Form
- Dialog, Sheet, Drawer, AlertDialog, Popover, Tooltip, DropdownMenu, ContextMenu
- Tabs, Accordion, Collapsible, NavigationMenu, Menubar, Sidebar
- Table, Badge, Avatar, Progress, Skeleton, Separator, ScrollArea
- Alert (variant="default|destructive"), Sonner (토스트 알림)
- Calendar, Carousel, Chart, Command, Breadcrumb, Pagination, InputOTP
- Header: <Header> <HeaderLogo> <HeaderNav> <HeaderNavLink> <HeaderActions> <HeaderMobileNav> <HeaderMobileNavLink>
- Toggle, ToggleGroup, HoverCard, AspectRatio, RadioGroup, Resizable

## ${n + 2}. 아이콘 (lucide-react)
이 프로젝트는 lucide-react 아이콘 라이브러리를 사용한다. 모든 아이콘은 반드시 lucide-react에서 import한다.
- \`import { Home, Settings, User, Search, Plus, X, Check, ChevronDown, ArrowRight, Bell, Mail, Heart, Star, Trash2, Edit, Eye, Download, Upload, Filter, Menu, LogOut, Sun, Moon } from "lucide-react"\`
- 아이콘이 필요한 모든 곳에 적극적으로 사용 (버튼, 메뉴, 네비게이션, 리스트, 상태 표시 등)
- 크기: className="w-4 h-4" (기본), "w-3.5 h-3.5" (작게), "w-5 h-5" (크게)
- ❌ 금지: react-icons, heroicons, SVG 직접 작성, 이모지로 아이콘 대체
- ❌ 금지: 아이콘 없이 텍스트만으로 UI 구성 (아이콘을 적극 활용할 것)
- 전체 아이콘 목록: https://lucide.dev/icons

## ${n + 3}. 필수 규칙 (위반 시 즉시 수정)

### 절대 금지 — 하드코딩
- ❌ bg-blue-600, bg-[#1a1a1a], text-white, text-gray-500, bg-slate-100 등 직접 색상 클래스
- ❌ text-[10px], text-[14px], h-[52px], w-[300px] 등 임의 크기 (arbitrary value)
- ❌ style={{ color: '#fff', fontSize: '14px' }} 인라인 스타일로 색상/크기/폰트 지정
- ❌ #ffffff, rgb(0,0,0), hsl(0,0%,100%) 등 하드코딩 색상값
- ❌ next/font 또는 Google Fonts <link> 태그 직접 추가 (DesignSync가 @font-face로 처리)
- ❌ gap-[13px], p-[20px] 등 토큰에 없는 임의 간격

### 반드시 사용
- ✅ 배경: bg-background, bg-card, bg-muted, bg-primary, bg-secondary, bg-accent, bg-popover, bg-destructive
- ✅ 텍스트: text-foreground, text-muted-foreground, text-primary-foreground, text-card-foreground, text-accent-foreground
- ✅ 테두리: border-border, border-input
- ✅ 폰트 크기: text-xs ~ text-5xl (토큰 매핑)
- ✅ 폰트 굵기: font-normal, font-medium, font-semibold, font-bold, font-extrabold
- ✅ 둥글기: rounded-none ~ rounded-full (토큰 radius)
- ✅ 그림자: shadow-sm, shadow-md, shadow-lg
- ✅ 링/포커스: ring-ring, focus-visible:ring-ring/50

### 컴포넌트 사용 규칙
- <h1 className="text-4xl font-bold"> 대신 → <TypographyH1> 사용
- <p className="text-muted-foreground"> 대신 → <TypographyMuted> 사용
- <code> 대신 → <TypographyCode> 사용
- <blockquote> 대신 → <TypographyBlockquote> 사용
- Button 크기는 반드시 size prop ("sm" | "default" | "lg" | "icon") — className으로 h-12, px-8 등 금지
- Input 높이는 기본값 유지 — className으로 높이 변경 금지
- 커스텀 header/aside/nav 만들지 말고 <Header>, <Sidebar>, <NavigationMenu> 사용
- 모달은 <Dialog> 또는 <Sheet> 사용 — 커스텀 모달 금지
- 토스트/알림은 <Sonner> 사용
- 아이콘만 있는 버튼에는 반드시 sr-only 텍스트 추가: <Button size="icon"><X /><span className="sr-only">닫기</span></Button>

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

${includeInstall ? `## ${n + 4}. 실행 순서
1. 위 설치 명령어를 실행해서 디자인 시스템을 적용
2. 기존 코드에서 하드코딩된 색상/크기/폰트를 위 토큰으로 전부 교체
3. 이후 새로 작성하는 모든 코드도 위 규칙을 따를 것` : ""}`.trim();
}
