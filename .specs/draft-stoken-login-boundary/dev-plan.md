# sToken Login Boundary — Dev Plan

## Parent References

| Item | Key | Link |
|---|---|---|
| Epic | **FR-2616** | https://lablup.atlassian.net/browse/FR-2616 |
| Spec Task | **FR-2618** | https://lablup.atlassian.net/browse/FR-2618 |
| Spec PR (draft) | **#6828** | branch `04-21-feat_add_stoken_login_boundary_component_spec_draft_` |
| Spec document | — | `.specs/draft-stoken-login-boundary/spec.md` (Korean) |

> This plan is English per CLAUDE.md. Sub-task acceptance references cite Korean spec section headings verbatim as stable anchors.

## Resolved Open Questions

Decisions locked for implementation. Each picks the spec's own recommendation where one exists, and defers a small set to explicit verification sub-tasks.

| # | Question | Decision | Rationale |
|---|----------|----------|-----------|
| Q1 | `tokenLogin` helper: extend vs. bypass | **(a) Extend** `helper/loginSessionAuth.ts:tokenLogin` with optional 5th arg `extraParams?: Record<string, string>`; pass through to `client.token_login(sToken, extraParams)` | Spec-recommended. Keeps `connectViaGQL` responsibility inside helper, LoginView callers unaffected. |
| Q2 | Include `loadConfigFromWebServer` in boundary? | **Exclude** | Matches current LoginView sToken path behavior. If a caller needs webserver config merge it can invoke it inside `onSuccess`. Keeps boundary narrowly focused on authentication. |
| Q3 | Endpoint resolve hook name | **(a) Rename** `useEduAppApiEndpoint` → `useResolvedApiEndpoint`; update both callers | Cosmetic debt is cheaper to pay once; avoids long-lived "Edu" prefix on a now-general hook. |
| Q4 | `errorFallback` fallthrough policy for `endpoint-unresolved` | **`errorFallback` wins for all error kinds when provided** | Predictable and simpler; EduAppLauncher needs its stepper-integrated UI even for `endpoint-unresolved`. |
| Q5 | Cookie encoding backend compatibility | **Add verification sub-task under Story 1** (read webserver source; confirm or flip default) | Not a blocker; result is "confirm current encoding choice or fall back to raw value". |
| Q6 | `concurrent-session` detection signal | **Defer**: do not attempt detection in first pass; emit `{ kind: 'unknown' }` with TODO pointing to `.specs/draft-concurrent-login-guard/` | Signal shape depends on unresolved sibling spec; premature detection risks inconsistency. |
| Q7 | `useSToken` helper hook adoption | **(a) Add the hook in Story 1**, use in both LoginView and EduAppLauncher routes | Two callers share `sToken`/`stoken` fallback + deprecation warning; the hook pays for itself immediately. |
| Q8 | EduAppLauncher sToken reuse (line 631 `get_user_credential`) | **(a) Route reads sToken, passes via prop to `EduAppLauncher`** — but first a Story 3 verification sub-task checks whether `get_user_credential` is dead code (option (d) kills plumbing entirely if so) | Verify before designing plumbing. Minimal change if dead; clean prop path if live. |

## Story Overview

| Story | Key | PR stack branch | Depends on | Parallelizable |
|---|---|---|---|---|
| 1. Introduce `STokenLoginBoundary` | **FR-2625** | `feat/stoken-login-boundary-story-1-component` | — | — |
| 2. Migrate `LoginView` sToken path | **FR-2626** | `feat/stoken-login-boundary-story-2-loginview` | FR-2625 | with Story 3 |
| 3. Migrate `EduAppLauncher` sToken path | **FR-2627** | `feat/stoken-login-boundary-story-3-eduapplauncher` | FR-2625 | with Story 2 |

Dependency graph:

```
Story 1 ──blocks──→ Story 2
Story 1 ──blocks──→ Story 3
(Story 2 ↔ Story 3 independent)
```

---

## Story 1 — Introduce `STokenLoginBoundary` component

**Jira Story**: **FR-2625**
**PR stack branch**: `feat/stoken-login-boundary-story-1-component`
**Goal**: Land the new boundary component, supporting hook(s), helper extension, and unit tests. No existing caller is migrated in this story.

### Sub-tasks

#### 1.1 Generalize endpoint resolve hook
- **Key**: **FR-2628**
- **Files**: `react/src/hooks/useEduAppApiEndpoint.ts` → `react/src/hooks/useResolvedApiEndpoint.ts`; update all import sites (`react/src/components/EduAppLauncher*` and any stories/tests).
- **Approach**: Rename file + export, strip "Edu-only" wording from JSDoc, keep `cachedEndpoint` / `inflightPromise` module-scope caching behavior unchanged.
- **Acceptance mapping**: spec "엔드포인트 resolve 훅", Acceptance Criteria "엔드포인트 resolve" bullets.
- **Dependencies**: none.
- **Review complexity**: Low (mechanical rename).

#### 1.2 Extend `tokenLogin` helper with optional `extraParams`
- **Key**: **FR-2629**
- **Files**: `react/src/helper/loginSessionAuth.ts`
- **Approach**: Change signature to `tokenLogin(client, sToken, cfg, endpoints, extraParams?: Record<string, string>)`. Pass `extraParams ?? {}` to `client.token_login`. Existing LoginView caller remains valid (fifth arg defaults).
- **Acceptance mapping**: spec "Risks & Open Questions" Q1 resolution; component Acceptance Criteria "`extraParams`가 `client.token_login`의 두 번째 인자로 그대로 전달된다".
- **Dependencies**: none.
- **Review complexity**: Low.

#### 1.3 Add `useSToken` helper hook (nuqs)
- **Key**: **FR-2630**
- **Files**: `react/src/hooks/useSToken.ts` (new)
- **Approach**: Follow spec section "공용 helper hook 제안" literally — `useQueryState('sToken', parseAsString)` + `useQueryState('stoken', parseAsString)`, prefer canonical key, emit `useBAILogger` `.warn` once per session when only `stoken` provided, return `[effective, clear]` tuple where `clear` nulls both keys.
- **Acceptance mapping**: spec "URL 파라미터 파싱 규약 (nuqs)"; acceptance "호출자 코드(`routes.tsx` 또는 페이지 컴포넌트)가 nuqs로 `sToken`을 읽고, `onSuccess` 콜백에서 setter로 URL에서 `sToken`을 제거한다".
- **Dependencies**: none.
- **Review complexity**: Low.

#### 1.4 Implement `STokenLoginBoundary` component (core)
- **Key**: **FR-2631**
- **Files**: `react/src/components/STokenLoginBoundary.tsx` (new)
- **Approach**: Follow spec "컴포넌트 설계" and "내부 동작 시퀀스" strictly: Props API exactly as in spec, state machine `idle → resolving-endpoint → cookie → client → ping → token-login → gql → success` (internal naming flexible); use `useResolvedApiEndpoint` (1.1); call the extended `tokenLogin` (1.2) + `connectViaGQL`; dispatch `backend-ai-connected` exactly once on final success; guard StrictMode double-fire with `useRef` started flag; do NOT import `useLoginOrchestration`. No `window.location` / `URLSearchParams` / `window.history` / `document.location` references anywhere in the file. `errorFallback` wins for all kinds when provided (Q4). `concurrent-session` not detected in first pass (Q6) — generic errors map to `{ kind: 'unknown' }`. Use `'use memo'` directive.
- **Acceptance mapping**: spec "컴포넌트 설계", "내부 동작 시퀀스", "멱등성과 재시도", Acceptance Criteria "컴포넌트 자체" + "URL 파싱 금지 불변 조건".
- **Dependencies**: 1.1 (blocks), 1.2 (blocks).
- **Review complexity**: **High** (novel async control flow + StrictMode/race invariants).

#### 1.5 Default fallback and error card UI
- **Key**: **FR-2632**
- **Files**: `react/src/components/STokenLoginBoundary.tsx` (same file as 1.4, staged separately), `resources/i18n/*.json` (per i18n skill), `packages/backend.ai-ui/src/locale/*.json` only if a BAI-UI primitive is extended
- **Approach**: Use `BAICard` (prefer BAI components over Ant Design). Retry button uses `BAIButton` with `action` prop (auto loading state). Copy-details button serializes `{ kind, cause }` to JSON and writes to clipboard. i18n keys grouped under `component.STokenLoginBoundary.*`. Fallback "connecting" card also renders through `BAICard` for visual consistency.
- **Acceptance mapping**: spec "에러 처리 & 기본 에러 카드 UI".
- **Dependencies**: 1.4 (blocks).
- **Review complexity**: Medium (new UI + i18n, straightforward patterns).

#### 1.6 Unit tests — state transitions, event-once, URL-free
- **Key**: **FR-2633**
- **Files**: `react/src/components/__tests__/STokenLoginBoundary.test.tsx` (new)
- **Approach**: Mock `globalThis.BackendAIClient` / `BackendAIClientConfig`, mock `useResolvedApiEndpoint`. Assert:
  - Each `STokenLoginError.kind` transition (inject failure at each stage).
  - `document.dispatchEvent('backend-ai-connected')` called exactly once across success path; zero times across failure; still exactly once after retry-then-success sequence.
  - Cookie value is `encodeURIComponent(sToken)`.
  - Retry invokes the sequence again without duplicate events.
  - Children never mount until success; use render spy.
  - No `window.location` / `URLSearchParams` / `window.history` mocking needed (grep test below enforces this is possible).
- **Acceptance mapping**: Acceptance Criteria "컴포넌트 자체" + "URL 파싱 금지 불변 조건".
- **Dependencies**: 1.4 (blocks), 1.5 (blocks — to assert error card renders).
- **Review complexity**: Medium.

#### 1.7 CI grep rule: forbid URL-related APIs in boundary
- **Key**: **FR-2634**
- **Files**: `scripts/verify.sh` or a small dedicated script under `scripts/`; optional ESLint custom rule if simpler
- **Approach**: Add a step that greps `react/src/components/STokenLoginBoundary.tsx` (and any sub-module under `STokenLoginBoundary/` if extracted) for forbidden tokens: `window.location`, `window.history`, `document.location`, `URLSearchParams`. Fail the build on match. Document the rule near the top of the boundary file with a comment referencing the spec.
- **Acceptance mapping**: Acceptance "grep / ESLint custom rule로 검증 가능".
- **Dependencies**: 1.4 (blocks).
- **Review complexity**: Low.

#### 1.8 Verify Manager/Webserver cookie decoding (Q5)
- **Key**: **FR-2635**
- **Files**: No code change expected. Findings captured in sub-task Jira comment and, if a policy flip is needed, rolled into a follow-up under 1.4.
- **Approach**: Read Backend.AI Manager / Webserver source (external repo) to confirm the `sToken` cookie value is `decodeURIComponent`-ed before comparison / lookup. If it is NOT, revise 1.4 to set the cookie unencoded and update the spec's Pitfall #3. If it is, close the sub-task with a comment citing the file/line.
- **Acceptance mapping**: spec Pitfall #3, Open Question 5.
- **Dependencies**: can run in parallel with 1.4, must complete before Story 2/3 merge.
- **Review complexity**: Low (investigation only).

### Story 1 internal dependency graph

```
1.1 ─┐
     ├─→ 1.4 ─→ 1.5 ─→ 1.6
1.2 ─┘          └─→ 1.7
1.3 (parallel)
1.8 (investigation, parallel)
```

---

## Story 2 — Migrate `LoginView` sToken path

**Jira Story**: **FR-2626**
**PR stack branch**: `feat/stoken-login-boundary-story-2-loginview`
**Goal**: Route `/` and `/interactive-login` wrap their subtrees with `STokenLoginBoundary` when `sToken` is present; delete the duplicated sToken branch inside `LoginView`.

### Sub-tasks

#### 2.1 Wrap `/` and `/interactive-login` routes with `STokenLoginBoundary`
- **Key**: **FR-2636**
- **Files**: `react/src/routes.tsx`
- **Approach**: In the `Component` of `/` and `/interactive-login`, call `useSToken()`; conditionally wrap the existing `DefaultProvidersForReactRoot` subtree with `STokenLoginBoundary` only when `sToken` is truthy (scenario A in spec "사용 패턴"). `errorFallback` not supplied — built-in card is correct for LoginView. Pass an `onSuccess` placeholder that is fleshed out in 2.2.
- **Acceptance mapping**: spec 사용 패턴 시나리오 A.
- **Dependencies**: Story 1 (blocks).
- **Review complexity**: Medium (route-level plumbing, shell wrapping).

#### 2.2 Move `postConnectSetup` side effects to route-level `onSuccess`
- **Key**: **FR-2637**
- **Files**: `react/src/routes.tsx` (same route `Component` as 2.1), `react/src/components/LoginView.tsx` (only where `postConnectSetup` was exported from; keep function usable for non-sToken path)
- **Approach**: Extract or call into `postConnectSetup(client)` from the `onSuccess` callback: `last_login` / `login_attempt` counters, `clearSavedLoginInfo`, `setPluginApiEndpoint`, localStorage `backendaiwebui.api_endpoint` persistence using `client._config.endpoint` (spec Pitfall #8), `main-layout-ready` wait + panel close, finally `clear()` from `useSToken()` to strip `sToken`/`stoken` from URL. Do NOT import `useLoginOrchestration` into the route Component.
- **Acceptance mapping**: spec "마이그레이션 계획 Story 2", Pitfall #8.
- **Dependencies**: 2.1 (blocks).
- **Review complexity**: **High** (state ordering, Pitfall #8 closure rule, main-layout-ready signal).

#### 2.3 Remove `connectUsingSession` sToken branch in `LoginView`
- **Key**: **FR-2638**
- **Files**: `react/src/components/LoginView.tsx` (current lines 455–490 range — verify exact range at implementation time; line numbers drift)
- **Approach**: Delete the sToken branch inside `connectUsingSession()` and any internal URL parsing specific to sToken. The normal ID/PW path remains unchanged. `useLoginOrchestration` continues to own multi-tab / auto-logout / config gating for the non-sToken path.
- **Acceptance mapping**: Acceptance "마이그레이션 후 `LoginView.tsx`에서 `connectUsingSession()` 내 sToken 분기가 제거되며…".
- **Dependencies**: 2.1 (blocks), 2.2 (blocks — so onSuccess captures all side effects first).
- **Review complexity**: Medium (deletion, but must confirm no hidden callers).

#### 2.4 E2E regression — LoginView sToken entry
- **Key**: **FR-2639**
- **Files**: `e2e/` (add or extend existing sToken entry scenario — confirm presence first)
- **Approach**: Playwright scenario: visit `/?sToken=<valid>`; assert login completes, URL no longer contains `sToken` after success, MainLayout renders. Add negative case: `/?sToken=<invalid>` shows error card with Retry.
- **Acceptance mapping**: Acceptance "Story 2 적용 후 LoginView의 sToken 진입 시나리오가 기존 E2E 테스트…를 통과한다".
- **Dependencies**: 2.1, 2.2, 2.3 (blocks).
- **Review complexity**: Medium.

### Story 2 internal dependency graph

```
2.1 ─→ 2.2 ─→ 2.3 ─→ 2.4
```

---

## Story 3 — Migrate `EduAppLauncher` sToken path

**Jira Story**: **FR-2627**
**PR stack branch**: `feat/stoken-login-boundary-story-3-eduapplauncher`
**Goal**: Route `/edu-applauncher` and `/applauncher` always wrap their subtree with `STokenLoginBoundary`; delete `_token_login` and manual `backend-ai-connected` dispatch; handle Pitfall #8 (`get_user_credential(sToken)` at line 631) via the resolved strategy.

### Sub-tasks

#### 3.1 Verify `get_user_credential(sToken)` liveness (Q8 prerequisite)
- **Key**: **FR-2640**
- **Files**: Investigation only; findings captured in Jira sub-task comment.
- **Approach**: Check whether `backendaiclient.eduApp.get_user_credential` is implemented in the backend.ai client library (`src/lib/backend.ai-client-esm.ts` or equivalent) AND whether any Backend.AI Manager endpoint currently responds. If method is missing or routinely 404s, the code at `react/src/components/EduAppLauncher.tsx:631` is dead — switch plan to **option (d)**: delete the call entirely in 3.3 and skip the sToken prop plumbing. If live, proceed with **option (a)**: pass sToken as prop to `EduAppLauncher` in 3.2.
- **Acceptance mapping**: spec Pitfall #8, Open Question 8.
- **Dependencies**: Story 1 (blocks — needs the decision before 3.2/3.3 scope).
- **Review complexity**: Low (investigation).

#### 3.2 Wrap `/edu-applauncher` and `/applauncher` routes with `STokenLoginBoundary`
- **Key**: **FR-2641**
- **Files**: `react/src/routes.tsx`, `react/src/components/EduAppLauncher.tsx` (small surface: accept optional `sToken` prop if 3.1 resolves to option (a))
- **Approach**: Always wrap (scenario B). Read `sToken` via `useSToken()`, collect `extraParams` with `useQueryStates` (exclude `sToken`/`stoken`), pass both to `STokenLoginBoundary`. Provide `errorFallback` that renders a stepper-integrated error step (reuse existing `EduAppErrorStep` or equivalent). `onSuccess` clears `sToken`/`stoken` from URL only (other keys preserved — spec Pitfall #7). If 3.1 resolved to option (a), pass `sToken` prop through to `EduAppLauncher`; if option (d), skip the prop.
- **Acceptance mapping**: spec 사용 패턴 시나리오 B.
- **Dependencies**: 3.1 (blocks), Story 1 (blocks).
- **Review complexity**: **High** (stepper UI integration, Q8 branch).

#### 3.3 Remove `_token_login` and manual `backend-ai-connected` dispatch
- **Key**: **FR-2642**
- **Files**: `react/src/components/EduAppLauncher.tsx`
- **Approach**: Delete `_token_login()` method (current lines 201–237). Delete the manual `document.dispatchEvent(new CustomEvent('backend-ai-connected'...))` call (current ~line 787 — verify). Delete URL parsing for `sToken`/`stoken` inside the component. If 3.1 resolved to option (d), also delete the `get_user_credential(sToken)` block (currently lines ~628–644) — confirm tests/fixtures don't reference the call.
- **Acceptance mapping**: Acceptance "`EduAppLauncher.tsx`에서 `_token_login()` 메서드와 수동 `backend-ai-connected` 디스패치가 제거된다".
- **Dependencies**: 3.2 (blocks).
- **Review complexity**: Medium.

#### 3.4 E2E regression — EduApp entry with / without `session_id`
- **Key**: **FR-2643**
- **Files**: `e2e/` (extend existing EduApp scenarios)
- **Approach**: Two scenarios: `/edu-applauncher?sToken=<valid>&app=jupyter&session_id=<existing>` (session reuse path) and `/edu-applauncher?sToken=<valid>&app=jupyter` (session create path). Both must succeed with no regression. Add new assertion: URL no longer contains `sToken` after success (behavior change vs. old impl). Negative: invalid sToken surfaces the stepper-integrated error step.
- **Acceptance mapping**: Acceptance "Story 3 적용 후 EduAppLauncher의 sToken 진입 시나리오(세션 ID 있음·없음)가 회귀 없이 통과한다".
- **Dependencies**: 3.2 (blocks), 3.3 (blocks).
- **Review complexity**: Medium.

### Story 3 internal dependency graph

```
3.1 ─→ 3.2 ─→ 3.3 ─→ 3.4
```

---

## Full Dependency Graph (cross-story)

```
Story 1
 ├─ 1.1 ─┐
 │       ├─→ 1.4 ─→ 1.5 ─→ 1.6
 ├─ 1.2 ─┘          └─→ 1.7
 ├─ 1.3 (parallel)
 └─ 1.8 (investigation, parallel to 1.4)
        │
        ▼
Story 2 (blocked by Story 1)
 2.1 ─→ 2.2 ─→ 2.3 ─→ 2.4

Story 3 (blocked by Story 1; parallel with Story 2)
 3.1 ─→ 3.2 ─→ 3.3 ─→ 3.4
```

Wave estimate for `/batch-implement`:
- **Wave 1** (Story 1): 1.1, 1.2, 1.3, 1.8 in parallel; then 1.4; then 1.5 and 1.7 in parallel; then 1.6.
- **Wave 2** (Story 2 and Story 3 in parallel): 2.1 → 2.2 → 2.3 → 2.4, and 3.1 → 3.2 → 3.3 → 3.4.

## Risks & Notes

- **Pitfall #8 closure discipline**: 2.2's `onSuccess` must read `client._config.endpoint` (not a captured `apiEndpoint` closure) when writing localStorage. Reviewer should grep the diff for `apiEndpoint` / `endpoint` identifiers in the onSuccess body.
- **StrictMode double-fire**: 1.4's internal `useRef` started flag must survive React 19 StrictMode dev double-effect. Unit test in 1.6 should render under StrictMode wrapper and assert event-once holds.
- **Concurrent-session deferred**: When the sibling `.specs/draft-concurrent-login-guard/` lands, a follow-up sub-task will extend `STokenLoginError` with the real `concurrent-session` detection. Not in scope here.
- **Behavior change in Story 3**: URL `sToken` is now stripped on success (previously retained). Release notes for the EduApp entry should call this out — partner platforms that inspected the URL post-entry must be notified.
- **Q5 verification outcome risks re-work on 1.4**: If Manager/Webserver expects raw cookie values, 1.4's `encodeURIComponent` becomes incorrect and must be flipped before Story 2/3 merge. 1.8 is the gate.
- **`useSToken` logger choice**: Use `useBAILogger` per React instructions; do not use `console.*`.
- **`loadConfigFromWebServer` not included (Q2)**: If a future SSO entry point requires it, the caller can invoke it from `onSuccess`. Document this in the component's JSDoc so it's discoverable.

## Out of Scope

- `useLoginOrchestration` responsibilities (multi-tab sync, auto-logout, config gating) stay in `LoginView`.
- Normal ID/PW login extraction.
- `concurrent-session` detection and its modal UX (tracked in `.specs/draft-concurrent-login-guard/`).
- Storybook stories for the new component (can be added as a follow-up).
- Directory rename `.specs/draft-stoken-login-boundary/` → `.specs/FR-2616-stoken-login-boundary/` (follow-up per metadata.json `notes`).
- Backend.AI Manager server changes.
