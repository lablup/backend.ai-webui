# 0031 — Visual regression tests for backend.ai-ui stories

## Summary

> 낯선 용어는 문서 맨 아래 [용어](#용어)에 모아 두었다.

- `packages/backend.ai-ui`의 모든 Storybook story는 Vitest browser mode로 Chromium에서 렌더링되고, commit된 screenshot([baseline](#용어))과 비교된다. story는 `no-vrt` tag로 비교에서 빠진다.
- baseline은 `mcr.microsoft.com/playwright:v<version>-noble` container에서 `linux/amd64`로 만든 것만 유효하다. `<version>`은 BUI의 정확한 `playwright` pin이다. `-linux.png`로 끝나는 파일만 commit한다.
- `Vitest visual (backend.ai-ui)` workflow는 BUI source, Storybook 설정, font, `pnpm-workspace.yaml`, `pnpm-lock.yaml`을 건드리는 모든 PR에서 같은 container로 비교를 실행하고, 실패하면 diff 이미지를 올린다.
- BUI story의 모양을 바꾸는 PR은 다시 만든 baseline을 같은 PR에 commit한다. `@lablup/ui-common` pin bump도 여기에 포함된다.
- baseline은 Git LFS에 저장하고, 기본 clone은 이 파일들을 pointer file로 받는다. `scripts/visual-test.sh`와 workflow는 test를 실행하기 전에 `scripts/pull-visual-baselines.sh`로 pointer를 이미지로 바꾼다. 이는 사용자 매뉴얼의 이미지만 LFS로 추적한다고 정한 ADR 0029 §1을 넓힌다.

## Context

- **What changes pictures**: BUI는 `@lablup/ui-common`을 통해 Astryx를 렌더링한다(ADR 0009). ui-common pin bump, theme token 수정, wrapper refactor는 lint, `tsc`, jsdom Vitest suite가 모두 통과하는 동안에도 component의 모양을 바꿀 수 있다.
- **What exists**: BUI에는 story 파일이 약 110개, story가 약 600개 있다. 이 결정 전에는 두 commit 사이에서 이들의 렌더링을 비교하는 것이 없었다.
- **Repository size**: baseline은 PNG 파일 약 590개, 6.7 MB다. `playwright` bump나 ui-common pin bump는 이 파일을 모두 다시 만들 수 있고, 일반 Git blob이면 매번 다시 만든 파일이 모든 clone의 history에 남는다.
- **Why a container**: font rasterization과 antialiasing은 운영체제와 CPU architecture마다 다르므로, 한 host에서 찍은 screenshot은 다른 host에서 찍은 것과 맞지 않는다. lablup/ui-common은 같은 문제를 고정된 Playwright container로 풀었고(lablup/ui-common#153), 이 결정은 그 설정을 옮겨 온다.

## 설계도

```mermaid
flowchart LR
  stories["src/**/*.stories.tsx"]
  sbvite[".storybook/vite.config.ts"]
  config["vitest.visual.config.ts<br/>storybookTest plugin"]
  setup["test/visual/setup.ts<br/>고정된 Date, animation 없음"]
  chromium["Playwright container의 Chromium"]
  baselines["test/visual/__screenshots__/**/*-linux.png<br/>commit됨, Git LFS"]
  diffs[".vitest-attachments<br/>visual-diffs artifact"]
  stories -- "story마다 test 하나" --> config
  sbvite -- "plugin과 alias, merge됨" --> config
  setup -- "afterEach screenshot" --> config
  config -- "렌더링" --> chromium
  chromium -- "toMatchScreenshot" --> baselines
  chromium -- "불일치 시 (side effect)" --> diffs
```

## Decision

### 1. 별도 Vitest config가 story를 browser에서 실행한다

- **Files**: `packages/backend.ai-ui/vitest.visual.config.ts`는 `@storybook/addon-vitest`의 `storybookTest`와 `@vitest/browser-playwright`를 쓰고, viewport는 1200 × 900, time zone은 `UTC`, locale은 `en-US`이다. `no-vrt` tag는 제외한다. `vitest.config.ts`의 jsdom suite는 바뀌지 않고, `pnpm run vitest`는 visual test를 실행하지 않는다.
- **Storybook-only Vite config**: `.storybook/vite.config.ts`는 story에 필요한 plugin(annotation mode compiler를 쓰는 React, Relay, SVGR, `./__generated__` alias)을 가진다. `.storybook/main.ts`의 `builder.viteConfigPath`가 이 파일을 가리키므로, Storybook은 더 이상 library build config인 `vite.config.ts`를 읽지 않는다. visual config도 같은 파일을 merge한다.
- **Setup**: `test/visual/setup.ts`는 `Date`만 가짜로 고정하고(2026-01-15T12:00:00Z), transition과 animation을 끄고, DOM이 600 ms 동안 바뀌지 않을 때까지(최대 5 s) 기다리고, font를 기다린 뒤, story가 그린 영역만 찍는다.
- **Fonts**: `preview-head.html`이 연결하는 `resources/fonts`의 local font는 그대로 쓴다. image는 generic family인 `monospace`, `sans-serif`, `serif`를 실행마다 다른 font로 resolve하므로, config는 `FONTCONFIG_FILE`을 `test/visual/fonts.conf`로 설정하고, 이 파일이 세 family를 Liberation Mono, Liberation Sans, Liberation Serif에 묶는다.

### 2. container가 baseline의 유일한 출처다

- **Pin**: `playwright`는 BUI의 정확한 devDependency이고, root의 `@playwright/test`가 resolve하는 버전과 같다. 그래서 e2e suite와 visual test가 같은 browser build를 쓴다. `@vitest/browser`와 `@vitest/browser-playwright`는 설치된 `vitest`와 같은 버전으로 정확히 pin한다.
- **Script**: `scripts/visual-test.sh`(`pnpm run test:visual:docker`, 다시 만들 때는 `-u`)는 `mcr.microsoft.com/playwright:v<pin>-noble`을 `linux/amd64`로 실행한다. 이 script는 checkout마다 이름이 다른 named volume에 `--filter "backend.ai-ui..."`로 설치하므로, host의 `node_modules`를 덮어쓰지 않는다.
- **Git**: `.gitignore`는 `*-linux.png`를 뺀 모든 screenshot을 무시하므로, host 실행이 자기 platform의 그림을 commit할 수 없다.

### 3. CI는 같은 container에서 비교를 실행한다

- **Workflow**: `.github/workflows/vitest-visual-backend-ai-ui.yml`은 `container: mcr.microsoft.com/playwright:v<pin>-noble`에서 실행된다. 한 step은 그 tag가 BUI의 `playwright` pin과 다르면 실패한다. 실패하면 job은 `.vitest-attachments`를 `visual-diffs` artifact로 올린다.
- **Gate**: `ci-gate.yml`은 head commit의 모든 `pull_request` workflow를 기다리므로, 새 workflow를 거기에 등록할 필요가 없다.

### 4. 안정될 수 없는 story에는 `no-vrt` tag를 붙인다

- **Rule**: 그림이 `Math.random`이나 setup이 기다리지 않는 timer에 달린 story는 `tags: ['no-vrt']`를 받는다. 어느 페이지도 렌더하지 않는 PoC component(`BAISessionCrowdScene`, `BAISessionPinwheelMeadow`)도 `meta`에 한 번 붙여 뺀다. `Date`가 고정되어 있으므로 날짜에는 tag가 필요 없다.

### 5. baseline은 Git LFS에 저장한다

- **Rule**: 루트 `.gitattributes`는 `packages/backend.ai-ui/test/visual/__screenshots__/**/*.png filter=lfs diff=lfs merge=lfs -text`를 가진다. `.lfsconfig`는 매뉴얼 경로 옆에 `packages/backend.ai-ui/test/visual/__screenshots__/**`를 `lfs.fetchexclude`로 더하므로, 기본 clone은 그곳에 pointer file을 둔다. [ADR 0029](0029-user-manual-images-in-git-lfs.ko.md)의 commit check와 pre-push hook은 이 파일들에도 그대로 적용된다.
- **Pull**: `scripts/pull-visual-baselines.sh`는 pointer file인 baseline이 없으면 바로 끝난다. 있으면 screenshot 디렉터리 하나에 대해 `lfs.fetchexclude`를 덮어쓰고 `git lfs pull`을 실행하며, pointer file이 남으면 실패한다. git-lfs가 없으면 Linux x86_64에서는 `.github/scripts/lfs/install-git-lfs.sh`로 고정된 release를 설치하고, 다른 곳에서는 설치 안내를 보여 주고 멈춘다.
- **Callers**: container에 git-lfs가 없으므로 `visual-test.sh`는 `docker run` 전에 host에서 이 script를 실행한다. workflow는 checkout 뒤 container 안에서 실행한다.
- **Rewrite**: `-u`는 원본 PNG 파일을 쓰고, `git add` 때 LFS clean filter가 이를 pointer로 바꾼다.
- **Pointer left in place**: baseline이 아직 pointer file인 test는 실패한다. Vitest가 이를 PNG로 decode하지 못하기 때문이다.

## 대안과 기각 사유

- **Host screenshots per platform**: `-darwin`과 `-linux` baseline을 나란히 commit한다. 장점은 local 실행이 빠르다는 것이다. 모든 시각적 변경에 두 대의 machine에서 만든 baseline 두 벌이 필요하고, macOS 버전끼리도 렌더링이 다르므로 기각한다.
- **A hosted service (Chromatic and similar)**: 장점은 diff를 검토하는 UI다. container와 artifact가 이미 다루는 일에 외부 service와 account를 더하므로 기각한다.
- **Reuse `pull-docs-images.sh`**: script 하나로 둘 다 받을 수 있다. 이 script의 source root, cache 집계, fork fallback은 매뉴얼을 위한 것이고, baseline에는 디렉터리 하나에 대한 `git lfs pull` 한 번이면 되므로 기각한다.
- **`actions/checkout` with `lfs: true`**: Playwright container에는 git-lfs가 없고, `visual-test.sh`는 `actions/checkout`이 아닌 host checkout에서 실행되므로 기각한다.
- **Bump BUI to Vitest 5 to match ui-common**: Vitest 4.1에 이미 browser mode와 `toMatchScreenshot`이 있고, `@storybook/addon-vitest` 10.6이 Vitest 4를 받으므로 기각한다.

## Consequences

- **Caught at review**: BUI component의 시각적 변경은, ui-common pin bump가 가져온 것을 포함해, diff 이미지가 붙은 채로 PR을 실패시키고, 다시 만든 baseline이 diff에서 변경을 보여 준다.
- **Local cost**: baseline을 다시 만들려면 Docker가 필요하고, Apple Silicon에서는 container가 emulation으로 실행되어 host 실행보다 몇 배 느리다.
- **Coverage limit**: 기본 theme(Backend.AI WebUI, light, `en`)만 비교한다. dark mode, neutral theme, 다른 locale은 비교하지 않는다.
- **Upgrade cost**: `playwright` bump는 workflow의 container tag를 바꾸고 모든 baseline을 다시 만든다.
- **git-lfs required**: `visual-test.sh`를 실행하고 다시 만든 baseline을 commit하려면 host에 git-lfs가 있어야 한다. 없으면 다시 만든 baseline이 원본 바이트로 commit되고, pre-push hook이 push를 거부하며 `lfs-pointer-check`가 실패한다.

## 출처

- GitHub: #11094. 참조 구현: lablup/ui-common#153.
- 2026-11-10 결정.
- 관련: [ADR 0009](0009-ui-common-as-the-single-entry-point-to-astryx.ko.md), [ADR 0029](0029-user-manual-images-in-git-lfs.ko.md).

## 용어

| 용어     | 뜻                                                                                                 |
| -------- | -------------------------------------------------------------------------------------------------- |
| baseline | baseline은 story 하나의 commit된 기준 screenshot이며, test 실행은 새 screenshot을 이것과 비교한다. |
| `no-vrt` | `no-vrt`는 story를 visual regression test에서 빼는 Storybook tag다.                                |
