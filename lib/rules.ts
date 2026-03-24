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
3. 48개 UI 컴포넌트를 설치 또는 덮어쓰기
4. .cursorrules 와 CLAUDE.md 에 디자인 규칙을 자동 생성 (매 대화 자동 로드)
5. 원본 globals.css 는 .bak 으로 백업

`
    : "";

  // -- Numbering offset: install section is "1.", so tokens starts at "2." when install is present --
  const n = includeInstall ? 2 : 1;

  return `${includeInstall ? "이 프로젝트에 DesignSync 디자인 시스템을 적용해줘.\n\n" : ""}**중요: 아래 규칙은 이번 작업뿐 아니라, 이 대화에서 앞으로 작성하는 모든 코드에 영구적으로 적용된다. 새로운 페이지, 컴포넌트, 기능을 만들 때도 반드시 이 디자인 시스템을 따라야 한다.**

${installSection}## ${n}. 디자인 토큰 (모든 스타일링의 유일한 기본 단위)
${fontSection}- 색상: var(--primary), var(--secondary), var(--accent), var(--destructive), var(--muted), var(--background), var(--foreground), var(--border), var(--input), var(--ring), var(--card), var(--popover) 및 각 -foreground
- 폰트: var(--font-sans)
- 폰트 크기: var(--font-size-xs), var(--font-size-sm), var(--font-size-base), var(--font-size-lg), var(--font-size-xl), var(--font-size-2xl), var(--font-size-3xl), var(--font-size-4xl)
- 폰트 굵기: var(--font-weight-normal), var(--font-weight-medium), var(--font-weight-bold)
- 줄 간격: var(--line-height-tight), var(--line-height-normal), var(--line-height-loose)
- 둥글기: var(--radius)
- 그림자: shadow-sm, shadow-md, shadow-lg

## ${n + 1}. 컴포넌트 (import from @/components/ui/)
- Typography: <TypographyH1> <TypographyH2> <TypographyH3> <TypographyH4> <TypographyP> <TypographyLead> <TypographyMuted>
- Button: variant="default|secondary|outline|ghost|destructive|link" size="sm|default|lg|icon"
- Card: <Card> <CardHeader> <CardTitle> <CardDescription> <CardContent> <CardFooter>
- Input, Textarea, Select, Checkbox, Switch, Slider, Label, Form
- Dialog, Sheet, Drawer, AlertDialog, Popover, Tooltip, DropdownMenu, ContextMenu
- Tabs, Accordion, Collapsible, NavigationMenu, Menubar, Sidebar
- Table, Badge, Avatar, Progress, Skeleton, Separator, ScrollArea
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
- ❌ font-semibold, leading-relaxed 등 토큰에 정의되지 않은 유틸리티
- ❌ style={{ color: '#fff', fontSize: '14px' }} 인라인 스타일로 색상/크기/폰트 지정
- ❌ #ffffff, rgb(0,0,0), hsl(0,0%,100%) 등 하드코딩 색상값

### 반드시 사용
- ✅ 배경: bg-background, bg-card, bg-muted, bg-primary, bg-secondary, bg-accent, bg-popover, bg-destructive
- ✅ 텍스트: text-foreground, text-muted-foreground, text-primary-foreground, text-card-foreground, text-accent-foreground
- ✅ 테두리: border-border, border-input
- ✅ 폰트 크기: text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl, text-4xl (토큰 매핑)
- ✅ 폰트 굵기: font-normal, font-medium, font-bold (토큰에 정의된 것만)
- ✅ 둥글기: rounded-sm, rounded-md, rounded-lg, rounded-xl (토큰 radius)
- ✅ 그림자: shadow-sm, shadow-md, shadow-lg
- ✅ 링: ring-ring

### 컴포넌트 사용 규칙
- <h1 className="text-4xl font-bold"> 대신 → <TypographyH1> 사용
- <p className="text-muted-foreground"> 대신 → <TypographyMuted> 사용
- Button 크기는 반드시 size prop ("sm" | "default" | "lg" | "icon") — className으로 h-12, px-8 등 금지
- Input 높이는 기본값 유지 — className으로 높이 변경 금지
- 커스텀 header/aside/nav 만들지 말고 <Header>, <Sidebar>, <NavigationMenu> 사용
- 모달은 <Dialog> 또는 <Sheet> 사용 — 커스텀 모달 금지
- 토스트/알림은 <Sonner> 사용

### 커스텀 UI 만들 때 (DesignSync에 없는 컴포넌트)
DesignSync에 해당 컴포넌트가 없더라도 아래 파운데이션 토큰은 **절대적으로** 지켜야 한다:
- 배경색: bg-background, bg-card, bg-muted, bg-primary, bg-secondary, bg-accent 중 선택
- 텍스트색: text-foreground, text-muted-foreground 등 시맨틱 색상만
- 테두리: border-border
- 둥글기: rounded-sm ~ rounded-xl (토큰 radius)
- 폰트 크기/굵기/줄간격: 반드시 토큰 값 사용
- 그림자: shadow-sm, shadow-md, shadow-lg
- 호버/포커스 상태: hover:bg-accent, focus:ring-ring 등 토큰 기반
- 색상이 정말 필요하면 CSS 변수 참조: var(--brand-500), var(--neutral-200) 등 프리미티브 토큰 사용 (Tailwind arbitrary value [var(--brand-500)] 허용)

### 다크 모드
- 다크 모드 분기를 직접 하지 않는다. 시맨틱 토큰(bg-background, text-foreground 등)이 자동으로 light/dark를 처리한다.
- dark: 접두사로 색상을 오버라이드하지 않는다 (예: dark:bg-gray-900 금지).

${includeInstall ? `## ${n + 4}. 실행 순서
1. 위 설치 명령어를 실행해서 디자인 시스템을 적용
2. 기존 코드에서 하드코딩된 색상/크기/폰트를 위 토큰으로 전부 교체
3. 이후 새로 작성하는 모든 코드도 위 규칙을 따를 것` : ""}`.trim();
}
