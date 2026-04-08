# FR-2470 EduAppLauncher React Refactoring — Dev Plan

## Spec Reference
`.specs/FR-2470-edu-applauncher-refactor/spec.md`

## Parent
- Jira: [FR-2470](https://lablup.atlassian.net/browse/FR-2470) — "Fix EduAppLauncher issues introduced during React migration"
- GitHub: [lablup/backend.ai-webui#6426](https://github.com/lablup/backend.ai-webui/issues/6426)

## Decomposition Rationale

`EduAppLauncher.tsx` is a single component with intertwined concerns (endpoint init, auth, session lookup/creation, proxy connection, notification, UI). Every sub-task in this plan touches that same file, so parallelism is not available — the work forms one linear Graphite stack. We split along the smallest set of lines where each PR is independently mergeable and where the review burden stays manageable.

Two nice-to-haves from the spec are folded into existing tasks because splitting them would create tiny, coupled PRs:
- Deleting `appLauncherProxy.ts` is folded into FR-2485 (same diff area; all call-sites are being removed in that PR).
- Session-creation error classification is split between FR-2484 (classify in the state machine) and FR-2487 (render in the card UI) because the logical surface lives in different layers.

One important context discovery: `DefaultProvidersForReactRoot` already wraps `EduAppLauncherPage` in `RelayEnvironmentProvider` and antd `App`, so no separate "set up Relay environment" sub-task is needed. The real blocker is endpoint/client initialization happening before Relay queries suspend.

## Sub-tasks (Implementation Order)

### 1. FR-2483 — Resolve apiEndpoint empty-value and client initialization for EduAppLauncherPage
- **Jira**: [FR-2483](https://lablup.atlassian.net/browse/FR-2483)
- **GitHub**: [#6453](https://github.com/lablup/backend.ai-webui/issues/6453)
- **Scope**: Fix the root-cause blocker where `EduAppLauncherPage` calls `useApiEndpoint()` but has never gone through login, so `apiEndpoint` resolves to an empty string. Resolve endpoint from `config.toml` at page level and ensure the Backend.AI client is initialized before any downstream Relay query runs.
- **Changed files**: `react/src/pages/EduAppLauncherPage.tsx`, `react/src/components/EduAppLauncher.tsx`
- **Dependencies**: None
- **Review complexity**: High (touches suspense-sensitive initialization ordering)
- **Spec acceptance mapping**:
  - Technical Requirements #1 — `apiEndpoint` never empty
  - Must-Have: endpoint initialization with `wsproxy.proxyURL`
  - Out of Scope: `_token_login` untouched

### 2. FR-2484 — Migrate EduAppLauncher session lookup/creation to Relay with staged state machine
- **Jira**: [FR-2484](https://lablup.atlassian.net/browse/FR-2484)
- **GitHub**: [#6454](https://github.com/lablup/backend.ai-webui/issues/6454)
- **Scope**: Replace REST-based session lookup (`computeSession.list`) with a Relay `useLazyLoadQuery` over `ComputeSessionNode` so the returned fragment ref can be passed to `useBackendAIAppLauncher` in the next sub-task. Refactor `EduAppLauncher` into a staged state machine (auth → session → launch) with explicit session-creation error classification (resource shortage, missing template, 408 timeout, duplicate image session, other).
- **Changed files**: `react/src/components/EduAppLauncher.tsx`, `react/src/__generated__/EduAppLauncher*.graphql.ts` (generated)
- **Dependencies**: FR-2483 (blocks)
- **Review complexity**: High (new Relay surface + state machine + error classification)
- **Spec acceptance mapping**:
  - Technical Requirements #3 and #4 — session lookup via Relay, fragment data available
  - Acceptance Criteria: 5-bucket session-creation error classification (rendering is FR-2487)
  - Preserves existing token auth / reuse / creation flow

### 3. FR-2485 — Integrate useBackendAIAppLauncher hook and delete appLauncherProxy.ts
- **Jira**: [FR-2485](https://lablup.atlassian.net/browse/FR-2485)
- **GitHub**: [#6455](https://github.com/lablup/backend.ai-webui/issues/6455)
- **Scope**: Replace the standalone `openWsproxy` / `connectToProxyWorker` utilities with `useBackendAIAppLauncher().launchAppWithNotification`, feeding it the `ComputeSessionNode` fragment ref from FR-2484. Delete `appLauncherProxy.ts` since EduAppLauncher is its only consumer (verified via grep).
- **Changed files**: `react/src/components/EduAppLauncher.tsx`, `react/src/helper/appLauncherProxy.ts` (deleted)
- **Dependencies**: FR-2484 (blocks)
- **Review complexity**: Medium (straightforward call-site replacement; hook already handles proxy version detection correctly with `scaling_group` / `project_id` from the fragment)
- **Spec acceptance mapping**:
  - Technical Requirements #2 and #4 — no more `openWsproxy` / `connectToProxyWorker` calls; hook used directly with fragment
  - Nice-to-Have: `appLauncherProxy.ts` deletion

### 4. FR-2486 — Replace CustomEvent notifications with useSetBAINotification and remove NotificationForAnonymous
- **Jira**: [FR-2486](https://lablup.atlassian.net/browse/FR-2486)
- **GitHub**: [#6456](https://github.com/lablup/backend.ai-webui/issues/6456)
- **Scope**: Remove the `CustomEvent('add-bai-notification')` workaround and the `NotificationForAnonymous` bridge in favor of the native `useSetBAINotification` hook.
- **Changed files**: `react/src/components/EduAppLauncher.tsx`, `react/src/pages/EduAppLauncherPage.tsx`, `react/src/components/MainLayout/MainLayout.tsx` (conditional: only if `NotificationForAnonymous` has no other consumers)
- **Dependencies**: FR-2485 (blocks)
- **Review complexity**: Low-Medium (mechanical notification shape change; the caveat is auditing remaining `NotificationForAnonymous` consumers — at planning time, `MainLayout.tsx` uses it internally as a Suspense fallback)
- **Spec acceptance mapping**:
  - Technical Requirements #5 and #6 — all notifications via `upsertNotification`; no `dispatchEvent('add-bai-notification')` in `EduAppLauncher.tsx`
  - Must-Have: remove `NotificationForAnonymous` dependency from `EduAppLauncherPage`

### 5. FR-2487 — Add step-based card UI with error rendering and new-window completion state
- **Jira**: [FR-2487](https://lablup.atlassian.net/browse/FR-2487)
- **GitHub**: [#6457](https://github.com/lablup/backend.ai-webui/issues/6457)
- **Scope**: Render a centered Ant Design `Card` with `Steps` (인증 확인 → 세션 확인/생성 → 앱 실행) that visualizes progress, per-step errors, and the final completion state. Map classified session-creation errors from FR-2484 to per-step messages. Map service-port-missing errors from the hook to an 앱 실행 step error. Open the launched app in a new window (`window.open(..., '_blank')`), leaving the original page on the completion message.
- **Changed files**: `react/src/components/EduAppLauncher.tsx`, possibly `resources/i18n/*.json` (only minimal additions per spec Out-of-Scope constraint)
- **Dependencies**: FR-2486 (blocks)
- **Review complexity**: Medium (new UI, but patterns are standard antd components; bulk of logic is already in place from prior sub-tasks)
- **Spec acceptance mapping**:
  - UI/UX Acceptance Criteria (all 5)
  - Technical Acceptance: error classification rendering
  - Technical Acceptance: `service_ports` missing message
  - Must-Have: new window + completion state

## Dependency Graph

```
FR-2483 ──blocks──▶ FR-2484 ──blocks──▶ FR-2485 ──blocks──▶ FR-2486 ──blocks──▶ FR-2487
(apiEndpoint      (Relay state       (hook integration    (notification       (card UI +
 + client init)    machine)           + delete proxy)      migration)          error render)
```

## PR Stack Strategy

Single Graphite stack on top of `main`:

```
feat/fr-2470-edu-applauncher
├── fr-2483 (apiEndpoint + client init)
├── fr-2484 (Relay + state machine)
├── fr-2485 (hook integration + appLauncherProxy deletion)
├── fr-2486 (notification migration)
└── fr-2487 (card UI + error rendering)
```

No parallelism is possible because every sub-task edits `EduAppLauncher.tsx`. Batch-implement waves are purely sequential:

- **Wave 1**: FR-2483
- **Wave 2**: FR-2484
- **Wave 3**: FR-2485
- **Wave 4**: FR-2486
- **Wave 5**: FR-2487

## Risks and Notes

- **Suspense ordering** (FR-2483 + FR-2484): Relay `useLazyLoadQuery` will suspend; the Backend.AI client must be ready and `_token_login` must have succeeded before the component mounts. If this is handled purely in `useEffect`, the Relay query will fire with an unauthenticated client. Consider a gating wrapper that only mounts the querying child after auth resolves.
- **Session reuse path**: The existing "reuse RUNNING session with matching image + service port" logic uses REST `computeSession.list` because it needs paginated filtering. Fully converting this to Relay may expand the scope unnecessarily. FR-2484 allows keeping the REST prefilter as long as the final `ComputeSessionNode` is queried via Relay for fragment delivery.
- **`NotificationForAnonymous` callers** (FR-2486): `MainLayout.tsx` itself renders `NotificationForAnonymous` inside its own `Suspense` fallback. Do not delete the export unless that usage is also removed or confirmed unused. FR-2486 description allows conditional handling.
- **Error classification source** (FR-2484 → FR-2487): Classifying errors in FR-2484 without rendering them means the intermediate state between those PRs still uses notifications. Both PRs remain independently mergeable because the legacy notification path keeps working in FR-2484.
- **Open questions from spec "확인 필요 사항"**: SSH/VS Code Desktop support and Edu API runtime state are explicitly out of scope; no sub-task addresses them.

## Out of Scope (not planned)

Per spec "범위 밖":
- `_token_login` logic changes
- Session template creation logic changes
- URL parameter scheme changes
- Full `globalThis.backendaiclient` initialization refactor
- i18n key restructuring (minimal additions allowed)
- EduAppLauncher URL generation
- Modal-based apps (SSH, VS Code Desktop)
