import { fetchAndResolveTokens } from "@/lib/resolve-tokens";

const CDN = "https://designsync-omega.vercel.app";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const resolved = await fetchAndResolveTokens(slug);
  if (!resolved) {
    return new Response(`Design system "${slug}" not found.`, {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Access-Control-Allow-Origin": "*" },
    });
  }

  const base = `${CDN}/r/${slug}`;

  const guide = `# DesignSync — "${slug}" 디자인 시스템 설치 가이드

이 문서는 AI 코딩 어시스턴트가 읽고 자동으로 프로젝트에 적용하기 위한 가이드입니다.
아래 규칙에 따라 현재 프로젝트의 스택을 감지하고 적절한 방법으로 설치하세요.

---

## 중요: 대부분의 프로젝트는 방법 1을 사용합니다

바이브코딩 도구(Cursor, v0, Bolt, Lovable 등)로 만든 프로젝트는 거의 100% Tailwind + React 스택입니다.
**components.json이 없더라도 Tailwind + React 프로젝트라면 먼저 shadcn을 초기화한 뒤 방법 1을 사용하세요.**

## 스택 자동 감지 규칙

현재 프로젝트의 package.json, 설정 파일을 확인하여 아래 순서대로 판단하세요:

### 1. Tailwind + React 프로젝트 (추천, 기본값)
조건: package.json에 react와 tailwindcss가 있거나, tailwind.config.* 또는 @tailwindcss/postcss가 존재
→ components.json이 없으면 먼저 초기화:
\`\`\`bash
npx shadcn@latest init
\`\`\`
→ 그 다음 DesignSync 전체 설치 (토큰 + 컴포넌트 55개):
\`\`\`bash
npx shadcn@latest add ${base}/designsync-all.json
\`\`\`
이 한 줄로 디자인 토큰, 색상, 타이포그래피, 컴포넌트가 모두 설치됩니다.
**새 프로젝트를 만들 때도 이 방법을 기본으로 사용하세요.**

### 2. SCSS 프로젝트 (React 없이 SCSS만 사용하는 경우)
조건: .scss 파일이 존재하거나 sass 의존성이 있고, React를 사용하지 않는 경우
→ SCSS 토큰 설치
\`\`\`bash
curl -o _designsync-tokens.scss ${base}/designsync-tokens.scss
\`\`\`
그리고 메인 SCSS 파일에 추가:
\`\`\`scss
@import "designsync-tokens";
\`\`\`

### 3. 순수 HTML/CSS 프로젝트 (프레임워크 없음)
조건: package.json이 없거나, React/Vue/Svelte 등 프레임워크가 없는 경우
→ CSS 변수 파일 설치
\`\`\`bash
curl -o designsync-tokens.css ${base}/designsync-tokens.css
\`\`\`
그리고 HTML <head>에 추가:
\`\`\`html
<link rel="stylesheet" href="./designsync-tokens.css">
\`\`\`

### 4. Design Token 도구 연동 (Style Dictionary, Figma Tokens 등)
→ W3C DTCG 포맷
\`\`\`bash
curl -o tokens.json ${base}/designsync-tokens.dtcg.json
\`\`\`

---

## 설치 후 사용법

모든 토큰은 CSS custom property로 제공됩니다:

### 색상
- \`var(--primary)\`, \`var(--secondary)\`, \`var(--accent)\`, \`var(--destructive)\`
- \`var(--background)\`, \`var(--foreground)\`, \`var(--border)\`, \`var(--muted)\`
- 프리미티브: \`var(--brand-500)\`, \`var(--neutral-200)\`, \`var(--error-600)\` 등

### 둥글기 (radius)
- 버튼/뱃지: \`var(--ds-button-radius)\`
- 인풋/셀렉트: \`var(--ds-input-radius)\`
- 카드/팝오버: \`var(--ds-card-radius)\`
- 다이얼로그: \`var(--ds-dialog-radius)\`
- 메뉴/탭: \`var(--ds-element-radius)\`

### 타이포그래피
- 폰트: \`var(--font-sans)\`
- 크기: \`var(--font-size-sm)\`, \`var(--font-size-base)\`, \`var(--font-size-lg)\` 등
- 굵기: \`var(--font-weight-normal)\`, \`var(--font-weight-bold)\` 등

### 그림자
- \`var(--ds-shadow-sm)\`, \`var(--ds-shadow-md)\`, \`var(--ds-shadow-lg)\`

### 다크 모드
HTML에 \`class="dark"\` 추가 시 자동 전환됩니다.

---

## 주의사항
- 색상은 oklch 색공간을 사용합니다.
- 하드코딩 색상(#fff, rgb(0,0,0)) 대신 반드시 토큰 변수를 사용하세요.
- rounded-md, rounded-lg 같은 고정 값 대신 위의 --ds-*-radius 변수를 사용하세요.
`;

  return new Response(guide, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
