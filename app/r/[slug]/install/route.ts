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

## 스택 자동 감지 규칙

현재 프로젝트의 package.json, 설정 파일을 확인하여 아래 순서대로 판단하세요:

### 1. shadcn/ui 프로젝트 (components.json 존재)
→ shadcn 레지스트리로 설치 (토큰 + 컴포넌트 전체)
\`\`\`bash
npx shadcn@latest add ${base}/designsync-all.json
\`\`\`

### 2. Tailwind CSS 프로젝트 (tailwind.config.* 또는 @tailwindcss/postcss 존재)
→ CSS 토큰만 설치
\`\`\`bash
curl -o designsync-tokens.css ${base}/designsync-tokens.css
\`\`\`
그리고 프로젝트의 메인 CSS 파일(globals.css 등) 최상단에 추가:
\`\`\`css
@import "./designsync-tokens.css";
\`\`\`

### 3. SCSS 프로젝트 (.scss 파일 존재 또는 sass 의존성)
→ SCSS 토큰 설치
\`\`\`bash
curl -o _designsync-tokens.scss ${base}/designsync-tokens.scss
\`\`\`
그리고 메인 SCSS 파일에 추가:
\`\`\`scss
@import "designsync-tokens";
\`\`\`

### 4. 순수 CSS 프로젝트 (위 해당 없음)
→ CSS 변수 파일 설치
\`\`\`bash
curl -o designsync-tokens.css ${base}/designsync-tokens.css
\`\`\`
그리고 HTML <head>에 추가:
\`\`\`html
<link rel="stylesheet" href="./designsync-tokens.css">
\`\`\`

### 5. Design Token 도구 연동 (Style Dictionary, Figma Tokens 등)
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
