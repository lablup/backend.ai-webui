# Decision-gate templates

Patterns for `AskUserQuestion` calls in the docs-lead workflow. Read this when
you are about to surface a decision gate to the user and need a template
matching the situation.

## Rules for every option

- **Label**: very short (≤12 chars where possible). Action-y. Avoid full
  sentences.
- **Description**: one sentence. Must cover *scope* (which files/sections),
  *worker chain* (which workers will run), and *live-app need* (yes/no).
- **Order**: highest-priority / recommended option first, with "(Recommended)"
  suffix in the label.
- **Number**: 2 minimum, 4 maximum. If you have more candidates, bundle the
  lower-priority ones into one "기타 N건 일괄 처리" option.
- **Always include an escape hatch** for the user to ask for more detail
  before deciding (e.g., "전체 lint 리포트 먼저 보여줘") when there are
  more than 5 underlying findings.
- **Language match.** Reply in the language the user is using (usually
  Korean for this team's day-to-day requests). Artifact names — issue keys,
  file paths, PR titles, worker output filenames — stay in English regardless.

## Gate 1 — Top-level priority queue (Step 4)

After lint + state load + queue build. Example for a typical day:

```yaml
question: "다음 docs 작업 중 어디부터 진행할까요?"
header: "우선순위"
multiSelect: false
options:
  - label: "PR #<N> 반영 (Recommended)"
    description: "feat(FR-XXXX) docs 미반영. <area1> + <area2> 영향. 4개 언어. 스크린샷 <N>장 필요(라이브 앱)."
  - label: "용어 drift 일괄"
    description: "TERMINOLOGY 위반 <N>건. en만. planner→writer→reviewer, 스크린샷 불필요."
  - label: "th parity 갭"
    description: "th에 누락된 H2 <N>개. writer만 호출. 스크린샷 불필요."
  - label: "리포트 먼저 보기"
    description: "결정 보류, 전체 lint 리포트 출력."
```

If the queue has only one item and the next step is mutation (writer /
screenshot-capturer): **do not add a redundant top-level Gate 1.** Proceed
in prose ("The only item is X; running planner next") and rely on the
per-worker confirmation gates (Gate 2 before writer, Gate 3 before
screenshot-capturer). Top-level gates are for branching points, not status
announcements — see `anti-patterns.md` → "Asking for confirmation when there
is nothing to confirm."

If the queue is empty: do not call `AskUserQuestion` at all — report "no
work needed" and stop.

## Gate 2 — Plan confirmation (after planner, Step 5a → 5b)

```yaml
question: "<topic> plan을 확인했습니다. 다음 단계는?"
header: "Plan 결정"
multiSelect: false
options:
  - label: "Writer 호출 (Recommended)"
    description: "plan대로 진행. en → ko → ja → th 순으로 작성."
  - label: "Plan 수정"
    description: "어디를 바꿀지 알려주세요 (scope / sections / screenshots / languages)."
  - label: "보류"
    description: "docs-state에 deferred로 기록하고 중단."
```

Plan summary (4 bullets max — files, new sections, screenshots, languages) MUST
appear in the same turn as this question, immediately above it. Do not ask
without showing the summary first.

## Gate 3 — Live-app readiness (before screenshot-capturer, Step 5c)

```yaml
question: "스크린샷 캡처는 라이브 앱이 필요합니다. 지금 진행할까요?"
header: "스크린샷"
multiSelect: false
options:
  - label: "지금 캡처"
    description: "앱이 실행 중이면 진행 (보통 https://*.localhost:1355). 캡처 완료 후 reviewer로."
  - label: "나중에 캡처"
    description: "writer가 남긴 TODO 마커 유지, reviewer 단계로 바로 이동."
  - label: "건너뛰기 (별도 PR)"
    description: "이번 topic에선 캡처 생략, 스크린샷용 별도 후속 PR로 분리."
```

If writer already left no TODO markers and plan listed zero screenshots, skip
this gate entirely.

## Gate 4 — Continue or stop (Step 6)

```yaml
question: "<topic> 완료. 다음 큐 항목으로 계속할까요?"
header: "계속"
multiSelect: false
options:
  - label: "다음 항목 진행"
    description: "<next-topic-summary>"
  - label: "여기서 중단"
    description: "docs-state에 기록 완료. 나머지는 다음 번에."
```

If queue is now empty after the completed topic: do not call this gate. Just
report "큐가 비었습니다. 다음 invocation 때 다시 진단하겠습니다." and stop.

## Anti-patterns

- **Too-concrete examples in the prompt context window.** When generating the
  actual options, derive them from current state — do not paste templates
  verbatim. Templates here are *shape* not *content*.
- **Skipping the recommended marker.** "(Recommended)" matters; it sets user
  expectation and reduces decision fatigue.
- **Hiding live-app requirement in option description.** It must be in the
  description — users who skim labels still see it in the description column
  before clicking.
- **Asking for confirmation when there is nothing to confirm.** If the queue
  has one item with one obvious next step, say what you're going to do in
  prose and proceed. Decision gates exist for branching points, not for
  status announcements.
