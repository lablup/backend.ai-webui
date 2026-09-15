# Architecture overview

이 문서는 현행 ADR(Architecture Decision Record)의 색인이다. 진본은 각 ADR 파일(`docs/adr/`)이며,
이 표는 새 해석을 더하지 않는다. `main`에 착지한 ADR은 발효된 결정이고, 코드는 그 결정을 따른다.

## ADR 목록

| ADR | 무엇을 정하는가 |
|---|---|
| [0001 — Explicit project prop contract for leaf components](adr/0001-explicit-project-prop-contract.md) | leaf component는 현재 project를 ambient hook에서 읽지 않고 필수 prop `project`로 받는다. page만 ambient 값을 읽어 넘기고, `null`을 받은 component는 tier마다 정한 동작을 한다. `/admin/*` 화면은 project-agnostic route로 묶이고 ESLint가 그 안에서 `useCurrentProjectValue` import를 막는다. |
| [0002 — Pin set link grammar and a single codec](adr/0002-pin-set-link-grammar-and-single-codec.md) | review overlay의 pin 여러 개는 `#bai=v3` part를 `&`로 이어 붙인 링크 하나로 나른다. 읽는 쪽은 overlay의 codec 하나뿐이고 `pnpm run review-pins` CLI로 노출되며, Claude 쪽 review skill과 Teams transport는 그 CLI를 부른다. |
| [0003 — Committed search index artifact](adr/0003-committed-search-index-artifact.md) | 전역 검색 palette의 인덱스 `react/src/generated/searchIndex.json`은 source에서 생성해 git에 커밋하고, production build는 그 커밋본을 그대로 번들한다. drift는 `scripts/verify.sh`와 `.github/workflows/typecheck.yml`이 다시 만든 뒤 `git status`로 잡고, conflict는 손으로 합치지 않고 다시 만든다. |
| [0004 — Walkthrough stops in the v3 anchor](adr/0004-walkthrough-stops-in-the-v3-anchor.md) | A Stop (한 pin이 무엇이 바뀌었고 무엇을 확인해야 하는지 담는 것)은 v3 anchor에 추가된 optional field 묶음이며 버전은 올리지 않는다. strict resolution, codec 소유의 volatile-query denylist, GitHub 댓글 65,536자 제한이 만드는 20-stop cap, `bai-review`와 분리된 `bai-walkthrough` marker, guided mode의 docs PR preview grammar 차용, 그리고 webui 소유 skill이라는 trigger를 정한다. |

## 새 ADR을 적는 방법

언제 ADR이 필요한지는 `.claude/rules/adr.md`가, 파일 이름·제목·절 구성·문장 규칙·착지 전 검사는
`.claude/skills/adr-writing/` 스킬이 정한다. ADR 파일과 이 표의 한 줄과 그 결정을 따르는 코드는 한
PR로 들어간다.
