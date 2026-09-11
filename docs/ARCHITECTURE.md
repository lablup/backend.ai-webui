# Architecture overview

이 문서는 현행 ADR(Architecture Decision Record)의 색인이다. 진본은 각 ADR 파일(`docs/adr/`)이며,
이 표는 새 해석을 더하지 않는다. `main`에 착지한 ADR은 발효된 결정이고, 코드는 그 결정을 따른다.

## ADR 목록

| ADR | 무엇을 정하는가 |
|---|---|
| [0001 — Explicit project prop contract for leaf components](adr/0001-explicit-project-prop-contract.md) | leaf component는 현재 project를 ambient hook에서 읽지 않고 필수 prop `project`로 받는다. page만 ambient 값을 읽어 넘기고, `null`을 받은 component는 tier마다 정한 동작을 한다. `/admin/*` 화면은 project-agnostic route로 묶이고 ESLint가 그 안에서 `useCurrentProjectValue` import를 막는다. |
| [0002 — Pin set link grammar and a single codec](adr/0002-pin-set-link-grammar-and-single-codec.md) | review overlay의 pin 여러 개는 `#bai=v3` part를 `&`로 이어 붙인 링크 하나로 나른다. 읽는 쪽은 overlay의 codec 하나뿐이고 `pnpm run review-pins` CLI로 노출되며, Claude 쪽 review skill과 Teams transport는 그 CLI를 부른다. |
| [0003 — Committed search index artifact](adr/0003-committed-search-index-artifact.md) | 전역 검색 palette의 인덱스 `react/src/generated/searchIndex.json`은 source에서 생성해 git에 커밋하고, production build는 그 커밋본을 그대로 번들한다. drift는 `scripts/verify.sh`와 `.github/workflows/typecheck.yml`이 다시 만든 뒤 `git status`로 잡고, conflict는 손으로 합치지 않고 다시 만든다. |
| [0004 — Container image meta row](adr/0004-container-image-meta-row.md) | container image 한 개의 identity를 보여주는 화면은 `BAIImageMetaRow`를 쓰고 `variant`가 `full`/`compact`/`path` 세 surface를 가른다. tag chip의 double tag 판정은 `imageNodeTagFacts`/`imageTagFacts` 두 builder에만 있고, 부분 사이 구분선은 `BAIImageMetaDivider`다. Relay fragment는 schema마다 하나씩 있는 adapter가 읽어 row에 문자열로 넘긴다. |

## 새 ADR을 적는 방법

언제 ADR이 필요한지는 `.claude/rules/adr.md`가, 파일 이름·제목·절 구성·문장 규칙·착지 전 검사는
`.claude/skills/adr-writing/` 스킬이 정한다. ADR 파일과 이 표의 한 줄과 그 결정을 따르는 코드는 한
PR로 들어간다.
