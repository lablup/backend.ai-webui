# Architecture overview

이 문서는 현행 ADR(Architecture Decision Record)의 색인이다. 진본은 각 ADR 파일(`docs/adr/`)이며,
이 표는 새 해석을 더하지 않는다. `main`에 착지한 ADR은 발효된 결정이고, 코드는 그 결정을 따른다.

## ADR 목록

| ADR | 무엇을 정하는가 |
|---|---|
| [0001 — Explicit project prop contract for leaf components](adr/0001-explicit-project-prop-contract.md) | leaf component는 현재 project를 ambient hook에서 읽지 않고 필수 prop `project`로 받는다. page만 ambient 값을 읽어 넘기고, `null`을 받은 component는 tier마다 정한 동작을 한다. `/admin/*` 화면은 project-agnostic route로 묶이고 ESLint가 그 안에서 `useCurrentProjectValue` import를 막는다. |

다음 번호는 **0002**다.

## 새 ADR을 적는 방법

- **When**: 런타임 의존성을 더하거나 빼거나 바꿀 때, 어떤 상태가 어디에 살고 누가 읽는지를 바꿀 때,
  `react/`·`packages/backend.ai-ui/`·Electron·manager API 사이의 계약을 바꿀 때, 모든 page가 따라야
  하는 routing 구조를 바꿀 때, review가 앞으로 강제할 guardrail을 들일 때 쓴다. 버그 수정과
  component 하나짜리 작업과 이미 있는 ADR을 따르는 작업에는 쓰지 않는다.
- **How**: `.claude/skills/adr-writing/` 스킬이 파일 이름, 제목, 절 구성, 문장 규칙, 착지 전 검사를
  정한다. 규칙은 그 스킬에만 있고 이 문서는 되풀이하지 않는다.
- **Where**: ADR 파일과 이 표의 한 줄과 그 결정을 따르는 코드가 한 PR로 들어간다. ADR 하나는 이 표에
  한 줄만 갖는다.
- **Retire**: 결정을 뒤집을 때는 옛 파일 맨 위에 `> superseded by NNNN` 한 줄을 달거나 파일을
  지운다. 번호는 다시 쓰지 않으므로 목록에 빈 번호가 생기는 것이 정상이다.
