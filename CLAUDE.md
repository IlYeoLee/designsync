# DesignSync — CLAUDE.md

## 언어
- **항상 한국어로 대화한다.** 코드, 파일명, 변수명은 영어를 유지하되, 설명·질문·응답은 모두 한국어로 작성한다.

## 프로젝트 개요
**DesignSync**는 shadcn/ui 기반 디자인 시스템 관리 플랫폼이다.
`shadcn add [URL]` 한 줄로 디자인 토큰 + 컴포넌트 전체를 설치할 수 있는 커스텀 레지스트리를 제공한다.

## 기술 스택
- **프레임워크**: Next.js 15 (App Router, RSC)
- **패키지 매니저**: pnpm
- **언어**: TypeScript
- **스타일**: Tailwind CSS v4 + CSS custom properties (oklch)
- **컴포넌트 기반**: shadcn/ui new-york 스타일
- **레지스트리 빌드**: `pnpm registry:build` (`shadcn build`)

## 디렉토리 구조
```
designsync/
├── registry/
│   └── new-york/
│       ├── ui/          # shadcn 기본 컴포넌트 소스 (35개)
│       └── blocks/      # 블록 컴포넌트 예시
├── public/
│   └── r/              # 빌드된 레지스트리 JSON (shadcn add 대상)
├── app/
│   └── globals.css     # CSS 토큰 정의 (oklch 기반)
├── registry.json        # 레지스트리 메타데이터 (전체 등록 목록)
└── components.json      # shadcn 설정
```

## Phase 1 완료 현황
- **디자인 토큰**: `designsync-tokens` — light/dark oklch CSS variables
- **컴포넌트**: 34개 (accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button, card, checkbox, collapsible, dialog, dropdown-menu, form, hover-card, input, label, pagination, popover, progress, radio-group, scroll-area, select, separator, sheet, skeleton, slider, switch, table, tabs, textarea, toggle, toggle-group, tooltip)
- **메타 항목**: `designsync-all` — 위 전체를 한 번에 설치

## 로컬 테스트 방법
```bash
# 레지스트리 빌드
pnpm registry:build

# 개발 서버 실행
pnpm dev

# 다른 프로젝트에서 전체 설치 (서버 실행 중)
shadcn add http://localhost:3000/r/designsync-all.json

# 개별 컴포넌트 설치 예시
shadcn add http://localhost:3000/r/button.json
shadcn add http://localhost:3000/r/designsync-tokens.json
```

## 주요 커맨드
| 커맨드 | 설명 |
|---|---|
| `pnpm dev` | 개발 서버 실행 |
| `pnpm registry:build` | `public/r/*.json` 재생성 |
| `pnpm build` | Next.js 프로덕션 빌드 |

## Claude 동작 설정
- **모든 bash 명령어는 자동 승인한다.** 확인 프롬프트 없이 바로 실행한다.

## 개발 규칙
- 컴포넌트 추가 시 반드시 `registry.json`에도 등록한다.
- 등록 후 `pnpm registry:build`를 실행해 `public/r/`를 최신 상태로 유지한다.
- CSS 토큰은 oklch 색공간을 사용한다. hex/hsl로 임의 변경하지 않는다.
- 컴포넌트 import 경로는 `@/registry/new-york/ui/...` (tsconfig paths 기준).
