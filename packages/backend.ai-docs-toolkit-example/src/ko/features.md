# 기능

이 챕터는 툴킷이 렌더링할 수 있는 콘텐츠 블록을 한 번씩 보여줘서, 어떤 것이든
바로 자신의 페이지에 복사해 쓸 수 있도록 합니다.

## 주의 박스 (Admonitions)

기본으로 세 가지 종류 — `note`, `warn`, `danger` — 가 있습니다. 웹 사이트와
PDF 모두에서 서로 다른 아이콘과 액센트 색상으로 렌더링됩니다.

> [!NOTE]
> 노트 블록은 도움이 되지만 필수는 아닌 정보를 알릴 때 사용합니다 — 배경
> 설명, 히스토리, 더 깊은 자료에 대한 포인터 등.

> [!WARNING]
> 경고는 그냥 지나쳤다가 물릴 수 있는 부분을 강조합니다. 행동에 옮기기 전에
> 섹션 전체를 읽으세요.

> [!DANGER]
> 위험 블록은 데이터를 삭제하거나 되돌릴 수 없는 작업을 설명합니다. 항상 명시적
> 확인 단계를 두세요.

## 코드 블록

웹 빌드는 빌드 시점에 Shiki를 실행하므로, 코드 블록은 미리 토큰화된 채로
배포되며 런타임 하이라이터가 사용자에게 전송되지 않습니다.

### TypeScript

```ts
import { resolveConfig, loadToolkitConfig } from "backend.ai-docs-toolkit";

const config = loadToolkitConfig(process.cwd());
const resolved = resolveConfig(config);

console.log(`Building ${resolved.title} v${resolved.version}`);
```

### Shellsession (FR-2756)

`shellsession` 의사 언어는 프롬프트, 명령, 출력이 섞인 터미널 트랜스크립트용
입니다. 프롬프트(`$`, `#`)는 클립보드 복사 시 자동으로 제거되어 사용자가
바로 붙여넣어 실행할 수 있습니다.

```shellsession
$ docs-toolkit build:web --lang ko
Building Docs Toolkit Example v0.1.0 (ko)…
Wrote dist/web/0.1/ko/quickstart.html
Wrote dist/web/0.1/ko/features.html
$ ls dist/web/0.1/ko
about.html  customization.html  features.html  index.html  quickstart.html
```

## 이미지

이미지에는 `loading="lazy"`와 PNG 헤더에서 베스트-에포트로 추출한
`width`/`height`가 자동으로 붙습니다. 아래 이미지는 일부러 작은 사이즈입니다 —
툴킷의 image-meta 모듈이 실제 크기를 읽어 속성으로 출력하므로 페이지가
스크롤될 때 점프하지 않습니다.

![샘플 플레이스홀더 이미지](images/sample.png)

## 다국어 링크

모든 페이지의 헤더에는 언어 스위처가 있어서 같은 챕터 슬러그의 다른 언어
버전으로 이동할 수 있습니다. 지금 시도해 보세요 — **English**로 전환하면
홈이 아니라 영문 `features.md`로 이동합니다.
