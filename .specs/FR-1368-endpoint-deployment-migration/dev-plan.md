# Endpoint → Deployment UI Migration Dev Plan

## Spec Reference

`.specs/FR-1368-endpoint-deployment-migration/spec.md`

## Epic

- **FR-1368** — Model deployment & Revision #1 ([Jira](https://lablup.atlassian.net/browse/FR-1368))
- **Spec Task**: FR-1416 — Transition from Serving page to Deployment page

## Stories and Sub-tasks

Six Stories map directly to the implementation phases declared in the spec (§구현 단계 계획 Phase 1-5 + Flow 7).
Each Story forms one PR stack on Graphite; sub-tasks inside a Story are generally sequential.

---

### Story 1: Deployment UI Phase 1 — Foundation — FR-2657

> Spec section: §Feature Flag, §URL 경로 변경 + Fallback 리디렉션, §i18n 키 추가
> PR Stack: `feat/endpoint-deployment-migration-foundation`

Foundation layer. Must land first because every downstream story consumes routes, menu keys, i18n keys, or the feature flag.

#### 1.1 Add `model-deployment-extended-filter` feature flag (26.4.3+) — FR-2663

- **Parent Story**: FR-2657
- **Changed files**: `src/lib/backend.ai-client-esm.ts`
- **Dependencies**: None
- **Review complexity**: Low

#### 1.2 Add routes for `/deployments` + `/admin-deployments` with legacy fallbacks — FR-2664

- **Parent Story**: FR-2657
- **Changed files**: `react/src/routes.tsx`, stub page files under `react/src/pages/`
- **Dependencies**: None (parallel with 1.1, 1.3)
- **Review complexity**: Medium

#### 1.3 Update sidebar menu: Serving → Deployments — FR-2665

- **Parent Story**: FR-2657
- **Changed files**: `react/src/hooks/useWebUIMenuItems.tsx`
- **Dependencies**: None (parallel with 1.1, 1.2)
- **Review complexity**: Low

#### 1.4 Add Deployment i18n keys (en.json) + propagate to 21 languages — FR-2666

- **Parent Story**: FR-2657
- **Changed files**: `resources/i18n/*.json` (22 files)
- **Dependencies**: None (parallel with 1.1, 1.2, 1.3)
- **Review complexity**: Low (mechanical translation tier, can batch together)

---

### Story 2: Deployment UI Phase 2 — Shared status/owner components — FR-2658

> Spec section: §ReplicaStatusTag 컴포넌트, §Flow 1, §Flow 6
> PR Stack: `feat/endpoint-deployment-migration-shared-components`

Shared presentational components consumed by list and detail stories.

#### 2.1 Add `ReplicaStatusTag` component + Storybook story — FR-2667

- **Parent Story**: FR-2658
- **Changed files**: `react/src/components/ReplicaStatusTag.tsx`, `react/src/components/ReplicaStatusTag.stories.tsx`
- **Dependencies**: 1.4 (FR-2666) — needs tooltip i18n keys
- **Review complexity**: Medium

#### 2.2 Add `DeploymentStatusTag` component — FR-2668

- **Parent Story**: FR-2658
- **Changed files**: `react/src/components/DeploymentStatusTag.tsx`
- **Dependencies**: 1.4 (FR-2666) — needs label i18n keys
- **Review complexity**: Low

#### 2.3 Add `DeploymentOwnerInfo` component — FR-2669

- **Parent Story**: FR-2658
- **Changed files**: `react/src/components/DeploymentOwnerInfo.tsx`
- **Dependencies**: 1.4 (FR-2666)
- **Review complexity**: Low-Medium

---

### Story 3: Deployment UI Phase 3 — Deployment list pages (user + admin) — FR-2659

> Spec section: §Flow 1, §Flow 6
> PR Stack: `feat/endpoint-deployment-migration-list-pages`

#### 3.1 Add `DeploymentList` fragment-receiving table (server-side filter/sort/paginate) — FR-2670

- **Parent Story**: FR-2659
- **Changed files**: `react/src/components/DeploymentList.tsx`
- **Dependencies**: 2.1 (FR-2667), 2.2 (FR-2668)
- **Review complexity**: High (new pattern — server-side pagination with nuqs URL state, BAIGraphQLPropertyFilter wiring)

#### 3.2 Add `DeploymentListPage` (user) — owns `myDeployments` query — FR-2671

- **Parent Story**: FR-2659
- **Changed files**: `react/src/pages/DeploymentListPage.tsx`
- **Dependencies**: 3.1 (FR-2670), 1.2 (FR-2664)
- **Review complexity**: Medium

#### 3.3 Add `AdminDeploymentListPage` + admin-only filters/columns (26.4.3+) — FR-2672

- **Parent Story**: FR-2659
- **Changed files**: `react/src/pages/AdminDeploymentListPage.tsx`, extends `DeploymentList` admin mode
- **Dependencies**: 3.1 (FR-2670), 2.3 (FR-2669), 1.2 (FR-2664)
- **Review complexity**: Medium

#### 3.4 Remove legacy `ServingPage` and `EndpointList` / `EndpointStatusTag` — FR-2673

- **Parent Story**: FR-2659
- **Changed files (delete)**: `react/src/pages/ServingPage.tsx`, `react/src/components/EndpointList.tsx`, `react/src/components/EndpointStatusTag.tsx`
- **Dependencies**: 3.2 (FR-2671), 3.3 (FR-2672) — must wait until both new pages are live
- **Review complexity**: Low (mechanical deletion)

---

### Story 4: Deployment UI Phase 4 — Deployment Launcher (create + edit) — FR-2660

> Spec section: §Flow 2, §Flow 4, §폼 필드 매핑
> PR Stack: `feat/endpoint-deployment-migration-launcher`

#### 4.1 Add `DeploymentLauncherPageContent` — multi-step form body — FR-2674

- **Parent Story**: FR-2660
- **Changed files**: `react/src/components/DeploymentLauncherPageContent.tsx`
- **Dependencies**: 1.4 (FR-2666) transitively via Phase 1
- **Review complexity**: High (new multi-step form, nuqs URL sync, antd v6 Steps API)

#### 4.2 Add `DeploymentLauncherPage` (create/edit entry) + GQL mutations — FR-2675

- **Parent Story**: FR-2660
- **Changed files**: `react/src/pages/DeploymentLauncherPage.tsx`; delete `react/src/pages/ServiceLauncherPage.tsx`, `react/src/components/ServiceLauncherPageContent.tsx`
- **Dependencies**: 4.1 (FR-2674), 1.2 (FR-2664)
- **Review complexity**: High

---

### Story 5: Deployment UI Phase 5 — Detail page with tabs, Drawer, and Rollback — FR-2661

> Spec section: §Flow 3, §Flow 5
> PR Stack: `feat/endpoint-deployment-migration-detail-page`

#### 5.1 Add `DeploymentConfigurationSection` (Overview card + Edit button) — FR-2676

- **Parent Story**: FR-2661
- **Changed files**: `react/src/components/DeploymentConfigurationSection.tsx`
- **Dependencies**: None internal; *related to* 4.2 (FR-2675) because the Edit button target must exist
- **Review complexity**: Medium

#### 5.2 Add `DeploymentReplicasTab` + Replica detail Drawer — FR-2677

- **Parent Story**: FR-2661
- **Changed files**: `react/src/components/DeploymentReplicasTab.tsx`
- **Dependencies**: 2.1 (FR-2667)
- **Review complexity**: High

#### 5.3 Add `DeploymentRevisionHistoryTab` + Rollback flow — FR-2678

- **Parent Story**: FR-2661
- **Changed files**: `react/src/components/DeploymentRevisionHistoryTab.tsx`
- **Dependencies**: None internal
- **Review complexity**: Medium

#### 5.4 Add `DeploymentAccessTokensTab` (list + create + delete) — FR-2679

- **Parent Story**: FR-2661
- **Changed files**: `react/src/components/DeploymentAccessTokensTab.tsx`
- **Dependencies**: None internal
- **Review complexity**: Medium

#### 5.5 Add `DeploymentAutoScalingTab` (wrap existing `AutoScalingRuleList`) — FR-2680

- **Parent Story**: FR-2661
- **Changed files**: `react/src/components/DeploymentAutoScalingTab.tsx`
- **Dependencies**: None internal
- **Review complexity**: Low

#### 5.6 Add `DeploymentDetailPage` (header + Overview + 4 tabs + URL tab sync) — FR-2681

- **Parent Story**: FR-2661
- **Changed files**: `react/src/pages/DeploymentDetailPage.tsx`
- **Dependencies**: 5.1 (FR-2676), 5.2 (FR-2677), 5.3 (FR-2678), 5.4 (FR-2679), 5.5 (FR-2680), 2.2 (FR-2668), 1.2 (FR-2664)
- **Review complexity**: High

#### 5.7 Remove legacy `EndpointDetailPage` + related Endpoint components — FR-2682

- **Parent Story**: FR-2661
- **Changed files (delete)**: `react/src/pages/EndpointDetailPage.tsx`, `react/src/components/EndpointOwnerInfo.tsx`, `EndpointDiagnosticsSection.tsx`, `EndpointTokenGenerationModal.tsx`
- **Dependencies**: 5.6 (FR-2681)
- **Review complexity**: Low

---

### Story 6: Flow 7 — Quick Deploy from model folder (`useDeploymentLauncher`) — FR-2662

> Spec section: §Flow 7
> PR Stack: `feat/endpoint-deployment-migration-quick-deploy`

#### 6.1 Add `useDeploymentLauncher` hook (GQL-based Quick Deploy) — FR-2683

- **Parent Story**: FR-2662
- **Changed files**: `react/src/hooks/useDeploymentLauncher.ts`
- **Dependencies**: 1.1 (FR-2663) — needs feature flag for version gating
- **Review complexity**: High

#### 6.2 Migrate Deploy button sites to `[Deploy | ▼]` split button using `useDeploymentLauncher` — FR-2684

- **Parent Story**: FR-2662
- **Changed files**: Every call site of `useModelServiceLauncher` (hunt with `rg`), likely model card / model folder components
- **Dependencies**: 6.1 (FR-2683), 4.2 (FR-2675) — launcher page must accept `?model=` pre-fill param, 1.2 (FR-2664) — new route
- **Review complexity**: Medium

---

## PR Stack Strategy

Six PR stacks — one per Story — most of which can run in parallel once Story 1 lands.

| Stack | Story | Sub-tasks (sequential within stack) | Runs after |
|-------|-------|-------------------------------------|------------|
| 1 | Foundation | 1.1 · 1.2 · 1.3 · 1.4 (can all be one PR if reviewer OK — mechanical tier) | — |
| 2 | Shared Components | 2.1 · 2.2 · 2.3 | Stack 1 |
| 3 | List Pages | 3.1 · 3.2 · 3.3 · 3.4 | Stack 2 |
| 4 | Launcher | 4.1 · 4.2 | Stack 1 (parallel with Stack 2/3) |
| 5 | Detail Page | 5.1 · 5.2 · 5.3 · 5.4 · 5.5 · 5.6 · 5.7 | Stack 2 |
| 6 | Quick Deploy | 6.1 · 6.2 | Stack 1; 6.2 blocked by Stack 4 (4.2) |

Within Stack 5, subtasks 5.1 – 5.5 can each be separate PRs or folded into 5.6 depending on reviewer preference; current decomposition keeps them as independent sub-tasks so reviewers can approve tab-by-tab.

## Dependency Graph

```
                        ┌────────────────────────────────────────────────┐
                        │   Story 1 — Foundation (FR-2657)               │
                        │   FR-2663 (flag) · FR-2664 (routes) ·          │
                        │   FR-2665 (menu) · FR-2666 (i18n)              │
                        └────────────┬──────────────┬────────────────────┘
                                     │              │
                          ┌──────────┘              └──────────────────┐
                          ▼                                            ▼
                ┌─────────────────────┐                       ┌──────────────────────┐
                │ Story 2 — Shared    │                       │ Story 6.1 (FR-2683)  │
                │ (FR-2667, 2668,     │                       │ useDeploymentLauncher│
                │  2669)              │                       └──────────┬───────────┘
                └──────┬─────┬────────┘                                  │
                       │     │                                           │
           ┌───────────┘     └────────────────────┐                      │
           ▼                                      ▼                      │
 ┌───────────────────────┐             ┌───────────────────────┐         │
 │ Story 3 — List Pages  │             │ Story 5 — Detail      │         │
 │ FR-2670 (list table)  │             │ FR-2676 (Overview)    │         │
 │ │                     │             │ FR-2677 (Replicas)    │         │
 │ ├──► FR-2671 (user)   │             │ FR-2678 (History)     │         │
 │ └──► FR-2672 (admin)  │             │ FR-2679 (Tokens)      │         │
 │         │             │             │ FR-2680 (AutoScaling) │         │
 │         ▼             │             │         │             │         │
 │      FR-2673 cleanup  │             │         ▼             │         │
 └───────────────────────┘             │ FR-2681 (page)        │         │
                                       │         │             │         │
                                       │         ▼             │         │
                                       │ FR-2682 cleanup       │         │
                                       └───────────────────────┘         │
                                                                         │
                                       ┌───────────────────────┐         │
                                       │ Story 4 — Launcher    │         │
                                       │ FR-2674 (content)     │         │
                                       │         │             │         │
                                       │         ▼             │         │
                                       │ FR-2675 (page) ───────┼─────────┤
                                       └───────────────────────┘         │
                                                                         ▼
                                                            ┌───────────────────────┐
                                                            │ Story 6.2 (FR-2684)   │
                                                            │ Split-button callers  │
                                                            └───────────────────────┘
```

### Execution waves (for `/batch-implement`)

Assuming all sub-tasks in a story can be stacked in one PR stack and waves represent sequential gating:

- **Wave 1 (no blockers)**: FR-2663, FR-2664, FR-2665, FR-2666 — Foundation parallel batch.
- **Wave 2**: FR-2667, FR-2668, FR-2669 (shared components) — parallel. FR-2674 (launcher content) — parallel with wave 2. FR-2683 (Quick Deploy hook) — parallel with wave 2.
- **Wave 3**: FR-2670 (list table), FR-2675 (launcher page), FR-2676-2680 (detail sub-components).
- **Wave 4**: FR-2671 (user list page), FR-2672 (admin list page), FR-2681 (detail page).
- **Wave 5**: FR-2673 (list cleanup), FR-2682 (detail cleanup), FR-2684 (split-button migration).

## Open Questions / Risks

1. **Legacy `useModelServiceLauncher` during migration window**: Spec §Flow 7 says "keep old hook as fallback for <26.4.2 backends". Current plan treats 26.4.2+ as hard minimum (§개요). Need to confirm whether fallback is actually required, or if we can delete the old hook immediately after 6.2. **Defer to user confirmation in Story 6.**
2. **Stub pages in Sub-task 1.2**: Creating temporary stub pages so the route PR is mergeable introduces a transient "blank page" state on `/deployments` until Phase 3 lands. If that's unacceptable, 1.2 should be merged together with 3.2 and 5.6 in a single mega-PR — but that violates "single focus per PR". Current plan favors merge-ability; reviewers should be aware.
3. **Access Tokens tab (5.4) scope**: Spec says "reference old EndpointTokenGenerationModal logic, re-implement fresh". If the new GQL schema for `accessTokens` mutations is still in flux, this sub-task may need a spike first. **Flag for investigation before work starts.**
4. **AutoScalingRuleList reuse (5.5)**: Spec §범위 외 says existing `AutoScalingRuleList` is already Deployment-API based. Quick verification pass needed to confirm — if any adjustment is required, 5.5 grows in scope.
5. **DOMAIN/PROJECT/RESOURCE_GROUP sorters (Story 3.3)**: Available only on 26.4.3+. Confirm gating UI is acceptable (sort arrows disappear) vs. always-on (compat error). Spec leans toward feature-flag gate via `baiClient.supports('model-deployment-extended-filter')`.

## Change Log

- 2026-04-22: Initial dev plan generated from spec (post PR-review feedback). 22 sub-tasks across 6 stories created in Jira with dependency links.
