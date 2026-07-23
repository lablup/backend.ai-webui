# 커스터마이징

자신의 프로젝트에서 거의 항상 재정의하고 싶을 세 가지 — **브랜드 색상**,
**로고**, **버전 목록** — 을 모두 이 예제가 보여줍니다.

## 브랜드 색상

`docs-toolkit.config.yaml`의 `branding` 아래에서 기본 브랜드 색상(과 그
호버 / 액티브 / 소프트 변형)을 재정의합니다:

```yaml
branding:
  primaryColor: "#0F766E"
  primaryColorHover: "#14B8A6"
  primaryColorActive: "#115E59"
  primaryColorSoft: "#CCFBF1"
```

이 예제는 의도적으로 티얼 팔레트를 사용해서 재정의가 적용되었는지 한눈에
구분되도록 합니다 — Backend.AI 오렌지가 보인다면 이 파일이 읽히고 있지 않은
것입니다.

> [!NOTE]
> 호버 / 액티브 / 소프트 변형은 `primaryColor`로부터 자동 유도되지 않습니다.
> 일관된 팔레트를 유지하려면 네 값을 함께 지정하세요.

## 로고

프로젝트 안 어디에든 SVG를 두고 `docs-toolkit.config.yaml`에서 가리킵니다:

```yaml
logoPath: "./assets/logo.svg"

branding:
  logoLight: "./assets/logo.svg"
  # logoDark: "./assets/logo-dark.svg"   # 생략 시 logoLight로 폴백
```

같은 파일을 커버 페이지 로고(`logoPath`)와 사이트 상단바 로고
(`branding.logoLight`)에 모두 사용할 수 있습니다.

## 로고 옆 서브 라벨

상단바의 로고 옆에 작게 렌더링되는 텍스트입니다. 단일 문자열(모든 언어에
공통)이거나 언어별 맵일 수 있습니다:

```yaml
branding:
  subLabel:
    en: "Example"
    ko: "예제"
    default: "Example"
```

## 버전

이 예제는 두 개의 항목을 선언해서 버전 셀렉터가 렌더링되게 합니다. 두 항목
모두 같은 워크스페이스 콘텐츠를 가리킵니다 — 예제는 실제 archive 브랜치를
관리하지 않습니다:

```yaml
versions:
  - label: "next"
    source:
      kind: workspace
  - label: "0.1"
    source:
      kind: workspace
    latest: true
```

실제 프로젝트에서는 안정 릴리즈를 자르고 두 번째 항목의 source를
`archive-branch` 참조로 교체합니다:

```yaml
- label: "1.0"
  source:
    kind: archive-branch
    ref: docs-archive/1.0
  latest: true
  pdfTag: "v1.0.0"
```

> [!WARNING]
> `versions[]` 전체에서 정확히 하나의 항목만 `latest: true`를 가져야 합니다.
> 0개거나 2개 이상이면 빌드가 명시적으로 실패합니다.
