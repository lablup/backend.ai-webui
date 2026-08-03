# 26.8 documentation coverage matrix

Answers [Build the 26.8 coverage matrix](issues/01-coverage-matrix.md). Scope: the 105 commits touching `react/` or `packages/backend.ai-ui/src/` since the docs content baseline `#8056` (FR-3219, 2026-06-29), produced with

```
git log --since=2026-06-29 --format='%h|%an|%s' -- react packages/backend.ai-ui/src
```

Rows are in `git log` order (newest first). Page identifiers are directory names under `packages/backend.ai-webui-docs/src/en/`, cross-checked against `src/book.config.yaml` navigation. This document is read-only with respect to the manual; nothing under `packages/backend.ai-webui-docs/src/` was modified.

## Summary

- **Total commits triaged:** 105
- **Included (user_facing = yes):** 72
- **Excluded (user_facing = no):** 33
- **Release membership:** 103 in `origin/26.8`, 2 post-cut (26.9) — `475835e25` and `b2a125f7c`, both FR-3332 (Chat). Verified with `git merge-base --is-ancestor <sha> origin/26.8`.
- **Distinct authors:** 5 (after identity dedup — see below).
- **Manual chapters affected:** 17 of 26 — `admin_menu`, `agent_summary`, `chat`, `dashboard`, `deployment`, `header`, `login`, `project_admin`, `rbac_management`, `session_page`, `sessions_all`, `sftp_to_container`, `share_vfolder`, `start`, `trouble_shooting`, `user_settings`, `vfolder`.

Confidence spread over included rows: high 44, low 10, medium 18.
Change kinds over included rows: `add` 22, `modify` 41, `remove` 2, `rename-label` 7.

## Identity map

Resolved by parsing the PR number out of every squash-merge subject and reading the PR author from the GitHub GraphQL API in one batched query (`gh api graphql`, 105 aliased `pullRequest` lookups against `lablup/backend.ai-webui`), then confirming each handle's profile name with `gh api users/<handle>`. `gh` was available and not rate-limited; no handle is guessed.

The git-author -> handle mapping is 1:1 and unanimous — every commit carrying a given git author name resolved to the same PR author, with no split.

| git author name(s) | commits | GitHub handle | GitHub profile name | how confirmed |
|---|---|---|---|---|
| `yomybaby`, `Jong Eun Lee` | 14 + 14 = **28** | `yomybaby` | Jong Eun Lee | 28/28 PRs authored by `yomybaby`; `gh api users/yomybaby` -> name "Jong Eun Lee". Both git identities share the email `jongeun@lablup.com`. **The duplicate the ticket flagged — confirmed one person.** |
| `ironAiken2`, `SungChul Hong` | 27 + 3 = **30** | `ironAiken2` | SungChul Hong | 30/30 PRs authored by `ironAiken2`; `gh api users/ironAiken2` -> name "SungChul Hong", email `sungchul@lablup.com`. |
| `agatha197`, `Sujin Kim` | 20 + 6 = **26** | `agatha197` | Sujin Kim | 26/26 PRs authored by `agatha197`; `gh api users/agatha197` -> name "Sujin Kim", email `kimsujin@lablup.com`. |
| `nowgnuesLee`, `Seungwon Lee` | 15 + 4 = **19** | `nowgnuesLee` | Seungwon Lee | 19/19 PRs authored by `nowgnuesLee`; `gh api users/nowgnuesLee` -> name "Seungwon Lee", email `seungwon@lablup.com`. |
| `Jeongseok Kang` | **2** | `rapsealk` | Jeongseok Kang | 2/2 PRs authored by `rapsealk`; `gh api users/rapsealk` -> name "Jeongseok Kang". Git email `jskang@lablup.com`. |

Total 28 + 30 + 26 + 19 + 2 = 105. The two-name pattern is a squash-merge artifact: single-author PRs keep the contributor's local git identity (real name + `@lablup.com`), multi-author PRs are attributed to the PR author's GitHub noreply identity (handle as name).

**Email caveat (does not change any mapping).** Six commits carry `kimsujin@lablup.com` as the author email while naming a different person: `194e88a35` (SungChul Hong) and `facda03d5` (Seungwon Lee). Author *name* and PR author agree in both cases, so the handle is taken from the PR author, not the email. Do not resolve identities from `%ae` on this range.

## Matrix

| commit | pr | fr | title | author_git | author_gh | user_facing | reason | pages | change_kind | confidence | in_26_8 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `475835e25` | #8420 | FR-3332 | refactor(FR-3332): migrate Chat deployment lookups off the legacy endpoint queries | Sujin Kim | `agatha197` | no | Internal Relay query migration (legacy `endpoint` -> `deployment` nodes); Chat labels and selection behavior unchanged. | — | — | high | no |
| `b2a125f7c` | #8298 | FR-3332 | feat(FR-3332): select chat deployments by active replica traffic status | Sujin Kim | `agatha197` | yes | Chat's model picker now lists deployments by active-replica traffic status, so which deployments appear changed. | `chat` | modify | medium | no |
| `0b92276be` | #8506 | FR-3404 | fix(FR-3404): resolve project resource-group warning state mismatches on the Fair Share page | Seungwon Lee | `nowgnuesLee` | yes | The Fair Share resource-group warning alert now tracks the selected project/domain instead of stale URL state — the warning a user sees changed. | `admin_menu` | modify | medium | yes |
| `194e88a35` | #8493 | FR-3424 | fix(FR-3424): allow user assignment on system RBAC roles for pre-26.8.0 managers | SungChul Hong | `ironAiken2` | yes | Whether user assignment is blocked on system roles is now manager-version dependent, contradicting a flat documented restriction. | `rbac_management` | modify | medium | yes |
| `facda03d5` | #8483 | FR-3406 | fix(FR-3406): keep the RBAC role detail drawer working on managers below 26.8.0 | Seungwon Lee | `nowgnuesLee` | yes | Adds a whole legacy permission/scope tab UI that renders on pre-26.8 managers — a second documented shape of the role detail drawer. | `rbac_management` | add | medium | yes |
| `81a9342c8` | #8505 | FR-3428 | fix(FR-3428): rewrite URL project segment in SwitchToProjectButton | Jong Eun Lee | `yomybaby` | yes | Switching project rewrites the `/project/<name>/…` URL segment; part of the FR-3055 scheme the manual quotes verbatim. | `header`, `session_page` | modify | low | yes |
| `bdafcf762` | #8498 | FR-3425 | fix(FR-3425): stop the scheduling-history expand mode from filtering the sub-step table | Seungwon Lee | `nowgnuesLee` | yes | Expanding a scheduling-history row now shows all sub-steps instead of a filtered subset — observable table content changed. | `sessions_all`, `deployment` | modify | medium | yes |
| `a1385c643` | #8499 | FR-3396 | fix(FR-3396): stretch SSH/SFTP connection modal so values render on one line | Sujin Kim | `agatha197` | no | Layout-only widening of the SSH/SFTP dialog; no field, label, or behavior change (screenshot-only impact, and screenshots are out of scope for this map). | — | — | low | yes |
| `fc1eedc7a` | #8488 | FR-3395 | fix(FR-3395): restore expanded-row background alignment with nested tables | agatha197 | `agatha197` | no | Pure visual regression fix restoring the previous appearance; nothing documented changes. | — | — | high | yes |
| `7ad73a892` | #8484 | FR-3405 | fix(FR-3405): resolve the property filter's selected property from current props | Sujin Kim | `agatha197` | no | Internal props-derivation fix inside the storage-permission property filter; the filter behaves as already documented. | — | — | medium | yes |
| `ea9f555a6` | #8446 | FR-3401 | fix(FR-3401): show Runtime on the deployment preset review step in edit mode | agatha197 | `agatha197` | yes | The review step of the deployment-preset edit wizard now displays the Runtime field it previously omitted. | `deployment` | modify | high | yes |
| `73d74d74e` | #8346 | FR-3350 | fix(FR-3350): keep KeyPair modal row controls in sync with the deferred dataset and deflake the my-keypair e2e suite | yomybaby | `yomybaby` | no | Race-condition fix in the My Keypair modal plus e2e deflaking; documented behavior unchanged. | — | — | medium | yes |
| `68ed7e72b` | #8429 | FR-3390 | feat(FR-3390): add experimental Import Hugging Face Model tab to Start from URL modal | yomybaby | `yomybaby` | yes | New tab inside the Start from URL modal, gated by a new toggle in User Settings > Experimental features. | `start`, `user_settings` | add | high | yes |
| `568c7fbfd` | #8421 | FR-3386 | fix(FR-3386): keep dashboard visible during interval refetch and isolate card suspensions | SungChul Hong | `ironAiken2` | yes | The Dashboard no longer blanks into a full-page skeleton on every auto-refresh tick; cards now skeleton individually. | `dashboard` | modify | medium | yes |
| `76b64ae74` | #8423 | FR-3388 | fix(FR-3388): unify URL project validation on the header project selector source | Jong Eun Lee | `yomybaby` | yes | An invalid project in the URL now falls back consistently, and the header/sidebar project list share one source — visible in the project selector. | `header` | modify | low | yes |
| `f0ac1c9d1` | #8408 | FR-3383 | feat(FR-3383): route-handle-declared access control with URL-aware roles | Jong Eun Lee | `yomybaby` | yes | Introduces a Forbidden page (replacing Page401) and hides sidebar entries by URL-scoped role — what a non-privileged user sees changed. | `login`, `trouble_shooting` | add | medium | yes |
| `aaccbd882` | #8208 | FR-3279 | refactor(FR-3279): make the router own 404 via scoped catch-alls and a route error boundary | Jong Eun Lee | `yomybaby` | yes | Unknown routes now render a scoped 404 page inside the layout instead of silently redirecting. | `trouble_shooting` | modify | low | yes |
| `eea955015` | #7755 | FR-3057 | fix(FR-3057): scope-aware 404, help-doc anchors, and invalid-project fallback | Jong Eun Lee | `yomybaby` | yes | Changes the header Help button's per-page doc anchors and the invalid-project fallback message. | `header`, `trouble_shooting` | modify | medium | yes |
| `5dbbec894` | #7751 | FR-3055 | feat(FR-3055): encode current project and scope into the URL routing scheme | Jong Eun Lee | `yomybaby` | yes | Every app URL becomes `/project/<name>/…`, `/project/<name>/admin/…` or `/admin/…`. The manual quotes `/session` (session_page.md) and `/admin-deployments/:id` (admin_menu.md) verbatim — both are now wrong. | `session_page`, `admin_menu`, `header`, `deployment` | modify | high | yes |
| `78851c36f` | #8329 | FR-3340 | fix(FR-3340): render Chat recovery form immediately and show model fetch as button loading | agatha197 | `agatha197` | yes | The Chat custom-model recovery form now appears immediately with fetch shown as button loading instead of a blocking state. | `chat` | modify | low | yes |
| `f0ab0530a` | #6668 | FR-2493 | refactor(FR-2493): centralize resource slot metadata into BAIMetaDataProvider | nowgnuesLee | `nowgnuesLee` | no | Provider/plumbing refactor; resource number and device-icon rendering is unchanged. | — | — | medium | yes |
| `ee8a18fe1` | #7747 | FR-3053 | feat(FR-3053): add text/hover overflow variant to BAITagList and adopt for table cells | yomybaby | `yomybaby` | yes | Long tag lists in the admin user table now collapse to a hover-revealed overflow instead of wrapping. | `admin_menu` | modify | low | yes |
| `d4f25c3be` | #8285 | FR-3326 | fix(FR-3326): reset Prometheus query preset modal on reopen | agatha197 | `agatha197` | yes | The Prometheus preset create/edit modal no longer retains the previous entry's values when reopened, and gained a category select. | `admin_menu` | modify | medium | yes |
| `768515e9a` | #8393 | FR-3377 | feat(FR-3377): add assignedUser and mappedScope filters to RBAC role list property filter | ironAiken2 | `ironAiken2` | yes | Two new filterable properties on the RBAC role list. | `rbac_management` | add | high | yes |
| `512d1064c` | #7955 | — | fix: Raise Node heap limit for the React production build | Jeongseok Kang | `rapsealk` | no | Build tooling only (package.json NODE_OPTIONS). | — | — | high | yes |
| `aa069b2e2` | #7879 | — | fix: use token-based color for provisioning/warming-up replica tags | Jong Eun Lee | `yomybaby` | no | Color-token swap on replica status tags; same labels and same states (screenshot-only impact). | — | — | medium | yes |
| `dc3a264ab` | #8412 | FR-3384 | fix(FR-3384): add bottom padding to reasoning-only chat message bubbles | yomybaby | `yomybaby` | no | Padding-only fix on chat message bubbles. | — | — | high | yes |
| `749d97e43` | #8395 | FR-3214 | feat(FR-3214): make the resident dev type checker opt-in | yomybaby | `yomybaby` | no | Dev-only tooling — excluded by map standing decision 3 (FR-3214). | — | — | high | yes |
| `7a447b849` | #8357 | FR-3214 | feat(FR-3214): exclude pnpm store from the dev type-check watcher to cut per-process watch FDs | nowgnuesLee | `nowgnuesLee` | no | Dev-only tooling — excluded by map standing decision 3 (FR-3214). | — | — | high | yes |
| `0f1491cbb` | #8328 | FR-3341 | fix(FR-3341): rework Chat endpoint token selector | agatha197 | `agatha197` | yes | The Chat token selector is reworked and the deployment detail token flow changed with it. | `chat`, `deployment` | modify | medium | yes |
| `9afb622cd` | #8397 | FR-3379 | style(FR-3379): unify bulk action button styles in table selection toolbars | ironAiken2 | `ironAiken2` | no | Icon-button fill/variant styling only — no label, action, or placement change (screenshot-only impact). | — | — | low | yes |
| `2bd349213` | #8356 | FR-3354 | fix(FR-3354): pause and re-anchor BAIFetchKeyButton countdown border during in-flight refresh | Sujin Kim | `agatha197` | no | Animation timing detail of the auto-refresh countdown ring; the documented auto-refresh contract is unchanged. | — | — | medium | yes |
| `a42160818` | #8363 | FR-3357 | feat(FR-3357): surface failed users via bulk-error modal in RBAC user assignment | ironAiken2 | `ironAiken2` | yes | Assigning a role to many users now reports per-user failures in a modal instead of one opaque error. | `rbac_management` | add | high | yes |
| `c447f24df` | #8360 | FR-3355 | feat(FR-3355): show 'No changes made' message on no-op RBAC permission save | ironAiken2 | `ironAiken2` | yes | New user-visible message when saving permissions without a diff. | `rbac_management` | add | high | yes |
| `66ca65c2d` | #8302 | FR-3334 | feat(FR-3334): add common bulk-error modal and preserve form state on partial bulk failure | ironAiken2 | `ironAiken2` | yes | Bulk permission edits keep form state on partial failure and show a per-item error modal. | `rbac_management` | add | high | yes |
| `8eb825856` | #8403 | FR-3376 | fix(FR-3376): clear the CHECK 2 near-duplicate backlog and promote it to default-on | yomybaby | `yomybaby` | yes | 34 English UI label respellings, e.g. Session Type, Cluster Mode / Cluster Size, Session Name, Resource Allocation, Created At, Multi Node / Single Node, Export CSV, File Name, Share Folder, Model Name, Service Name, User Name, Terms of Service, New Password. Exactly the cheap-to-miss rename class the ticket calls out. | `sessions_all`, `deployment`, `vfolder`, `share_vfolder`, `admin_menu`, `user_settings`, `login` | rename-label | high | yes |
| `629c32d97` | #6244 | FR-2403 | feat(FR-2403): add bulk deactivate action for credential user list | yomybaby | `yomybaby` | yes | New bulk-deactivate action with selection toolbar on the Credentials list. | `admin_menu` | add | high | yes |
| `c53139de1` | #8383 | FR-3371 | chore(FR-3371): upgrade nuqs to 2.9.2 and drop the local lost-update patch | Seungwon Lee | `nowgnuesLee` | no | Dependency upgrade that removes a local patch; no UI surface. | — | — | high | yes |
| `9504c1252` | #7552 | FR-2948 | feat(FR-2948): render image metadata in BAISessionNodesV2 and add v2 session tag components | ironAiken2 | `ironAiken2` | yes | The project-admin session table now renders image meta icons plus session-type and cluster-mode tags. | `project_admin`, `sessions_all` | modify | medium | yes |
| `84ec712bb` | #8367 | FR-3359 | fix(FR-3359): surface TCP connection info failures instead of bogus 127.0.0.1 SSH/SFTP dialog | ironAiken2 | `ironAiken2` | yes | A failed SSH/SFTP circuit now raises an explicit launch error instead of showing a bogus 127.0.0.1 connection dialog the manual implicitly documents. | `sftp_to_container`, `trouble_shooting` | modify | high | yes |
| `d4e7f19a8` | #7606 | FR-2981 | fix(FR-2981): detect browser language at i18n init so login screen respects locale | yomybaby | `yomybaby` | yes | The login screen now renders in the browser's language before sign-in instead of defaulting to English. | `login` | modify | high | yes |
| `24007ae83` | #8365 | FR-3358 | fix(FR-3358): patch nuqs to recover render-phase updates lost in discarded renders | yomybaby | `yomybaby` | no | Dependency patch; reverted by FR-3371 upgrade. | — | — | high | yes |
| `e713e02c6` | #8342 | FR-3348 | feat(FR-3348): pick user via v2 select and validate rate-limit max in credential modal | yomybaby | `yomybaby` | yes | The credential modal gains a searchable user select and rate-limit maximum validation. | `admin_menu` | modify | high | yes |
| `899834212` | #8352 | FR-3352 | feat(FR-3352): dev-only login pre-fill and backend-mismatch banner | Jong Eun Lee | `yomybaby` | no | Dev-only tooling — excluded by map standing decision 3 (FR-3352). | — | — | high | yes |
| `c05417a36` | #8287 | FR-3324 | feat(FR-3324): unify container log auto-refresh on AutoUpdateFetchKeyButton | yomybaby | `yomybaby` | yes | The container log modal's dedicated auto-refresh switch is removed and replaced by the shared refresh button with an interval dropdown. | `sessions_all` | modify | high | yes |
| `32156254f` | #8260 | FR-3318 | feat(FR-3318): add idle-checker reclamation status column to session list | nowgnuesLee | `nowgnuesLee` | yes | New reclamation-status column and popover on the session list; the idle-checks UI was reworked around it. | `sessions_all` | add | high | yes |
| `b5bb80673` | #8316 | FR-3338 | fix(FR-3338): resolve eslint-plugin-react-hooks 7.1.1 compiler diagnostics | nowgnuesLee | `nowgnuesLee` | no | Lint-driven mechanical refactor across many files; no behavior change. | — | — | medium | yes |
| `ef3637b1a` | #8251 | FR-3267 | feat(FR-3267): per-tab URL-persisted table state pattern for multi-tab pages | nowgnuesLee | `nowgnuesLee` | yes | Filter / sort / page state now persists per tab in the URL on multi-tab pages, so shared links land on the same view (already documented for one page in deployment_presets.md). | `admin_menu`, `user_settings`, `deployment` | modify | low | yes |
| `ec1efc887` | #5097 | FR-1943 | feat(FR-1943): migrate from use-query-params to nuqs | yomybaby | `yomybaby` | no | URL query-state library swap. Param names and semantics were preserved, so shareable links behave as documented — but the encoding layer changed under every filter/pagination URL, so this is flagged rather than silently dropped. | — | — | low | yes |
| `20fb6f3f1` | #8335 | FR-3347 | fix(FR-3347): give deployment preset startup command its own description | nowgnuesLee | `nowgnuesLee` | yes | New distinct tooltip/description text for the deployment preset Startup Command field. | `deployment` | rename-label | high | yes |
| `565c87619` | #8320 | — | test: e2e auto-heal 2026-07-19 | nowgnuesLee | `nowgnuesLee` | no | Test-only (adds a test id to a table cell). | — | — | high | yes |
| `f875626c7` | #8327 | FR-3343 | fix(FR-3343): pass open-to-public and preferred-port settings through to TensorBoard and confirmation app launches | nowgnuesLee | `nowgnuesLee` | yes | App launch options (Open to Public, preferred port) are now honored for TensorBoard and confirmation-dialog launches, where they were previously dropped. | `sessions_all` | modify | high | yes |
| `5caa22c9b` | #8319 | FR-3339 | style(FR-3339): hide the Invalidated At column on the login sessions page | nowgnuesLee | `nowgnuesLee` | yes | A column is removed from the Login Sessions table added in the same release — a removal, which means deleting docs. | `user_settings` | remove | high | yes |
| `adad09449` | #8315 | FR-3331 | fix(FR-3331): align row-action tooltips with the Edit icon | ironAiken2 | `ironAiken2` | yes | Row-action tooltips renamed to match the new Edit terminology from #8303. | `admin_menu` | rename-label | high | yes |
| `e8c476a62` | #8303 | FR-3331 | style(FR-3331): unify edit terminology and edit-action icons, switch edit-form submits to Save | ironAiken2 | `ironAiken2` | yes | 'Update' / 'Modify' become 'Edit' across admin surfaces, every edit-form submit button becomes 'Save', and 'Update Users' becomes 'Bulk Edit Users'. The rename class the ticket explicitly names. | `admin_menu`, `deployment`, `vfolder`, `rbac_management` | rename-label | high | yes |
| `fae71e6f3` | #8308 | FR-3335 | chore(FR-3335): make dev review overlay opt-in via VITE_DEV_REVIEW_OVERLAY | Jong Eun Lee | `yomybaby` | no | Dev-only tooling — excluded by map standing decision 3 (FR-3309 overlay family). | — | — | high | yes |
| `b1a6559cc` | #8301 | FR-3333 | fix(FR-3333): replace RBAC shortcut icon and add revoke warning alert in ProjectAdminSettingModal | ironAiken2 | `ironAiken2` | yes | New warning alert shown when revoking project admin authority, plus a changed shortcut icon. | `rbac_management`, `project_admin` | modify | high | yes |
| `f86503f0d` | #8268 | FR-3320 | feat(FR-3320): add RBAC role detail shortcut on project admin setting modal and block direct assignment for system roles | ironAiken2 | `ironAiken2` | yes | New shortcut into the role detail drawer, and direct assignment is now blocked for system roles. | `rbac_management`, `project_admin` | add | high | yes |
| `d685963d0` | #8264 | FR-3317 | feat(FR-3317): add one-click project admin assignment action on project page | ironAiken2 | `ironAiken2` | yes | New Project Admin setting modal reachable from the Projects list with assign / revoke actions. | `rbac_management`, `admin_menu` | add | high | yes |
| `80a02bb3d` | #8194 | FR-3273 | feat(FR-3273): add multi-scope bulk permission edit with keep-as-is semantics | ironAiken2 | `ironAiken2` | yes | Permission editing now supports selecting several scopes at once with tri-state keep-as-is semantics. | `rbac_management` | add | high | yes |
| `bce715e49` | #8192 | FR-3272 | feat(FR-3272): add scope-level permission edit modal replacing CreatePermissionModal | ironAiken2 | `ironAiken2` | yes | The documented 'Add a permission' / 'Remove a permission' flow is replaced by a scope-level edit modal. | `rbac_management` | modify | high | yes |
| `d6fc4c3c1` | #8191 | FR-3271 | feat(FR-3271): add detailed permissions tab with per-scope-type tables and grant-state tags | ironAiken2 | `ironAiken2` | yes | Role detail drawer restructured: the Scopes tab and the old Permissions tab are deleted and replaced by a detailed permissions tab with grant-state tags. The manual's 'View role scopes' section documents a tab that no longer exists. | `rbac_management` | remove | high | yes |
| `304768f9b` | #8295 | FR-3330 | chore(FR-3330): bump to 26.8.0-alpha.0 and update dependencies | yomybaby | `yomybaby` | no | Version and dependency bump. | — | — | high | yes |
| `7428a2113` | #8062 | FR-3222 | feat(FR-3222): migrate User Resource Policy page to Strawberry V2 GraphQL | nowgnuesLee | `nowgnuesLee` | yes | The User Resource Policy table is rebuilt on a new component with its own column set and filter surface. | `admin_menu` | modify | medium | yes |
| `4b8ff6e94` | #8248 | FR-3309 | feat(FR-3309): review overlay walking skeleton — pin-to-Teams round trip (dev-only Vite plugin) | Jong Eun Lee | `yomybaby` | no | Dev-only tooling — excluded by map standing decision 3 (FR-3309). | — | — | high | yes |
| `489a10f29` | #8119 | FR-3243 | feat(FR-3243): add SFTP resource group settings from the Resource Group page | agatha197 | `agatha197` | yes | The Resource Group page gains SFTP settings and a bulk 'Edit Resource Groups' modal. | `admin_menu` | add | high | yes |
| `61f0f1be2` | #8290 | FR-3328 | fix(FR-3328): refetch user list after bulk purge | yomybaby | `yomybaby` | no | Restores the already-documented behavior (list refreshes after purge); the manual was right. | — | — | high | yes |
| `67c855c91` | #8281 | FR-3325 | style(FR-3325): use token.colorError for used stroke in session statistics chart | nowgnuesLee | `nowgnuesLee` | no | Chart stroke color token swap only. | — | — | high | yes |
| `0534b5a71` | #8236 | FR-3303 | fix(FR-3303): keep chat endpoint visible while a new revision rolls out | agatha197 | `agatha197` | yes | The Chat model selector no longer drops the selected deployment mid-rollout — observable selection behavior changed. | `chat` | modify | medium | yes |
| `a4efa7d84` | #8278 | FR-3323 | fix(FR-3323): unify model mount label in custom runtime revision form | agatha197 | `agatha197` | yes | The custom runtime Add Revision form's mount label is unified on 'Mount Destination For Model Folder'; the duplicate key was deleted. | `deployment` | rename-label | medium | yes |
| `88c20b054` | #8265 | FR-3300 | feat(FR-3300): set per-consumer auto-refresh defaults by data volatility | Jong Eun Lee | `yomybaby` | yes | Different pages now arm auto-refresh at different default intervals, so the documented refresh cadence differs per page. | `dashboard`, `sessions_all`, `deployment`, `admin_menu` | modify | medium | yes |
| `e11d80acd` | #8233 | FR-3300 | feat(FR-3300): add animated countdown border to BAIFetchKeyButton auto-refresh | agatha197 | `agatha197` | yes | The refresh button gains a countdown border while auto-refresh is armed — a new affordance, not just a restyle. | `dashboard` | modify | low | yes |
| `b4d3d1319` | #7928 | FR-3147 | feat(FR-3147): enable auto-refresh interval dropdown on polling consumers | agatha197 | `agatha197` | yes | The auto-refresh interval dropdown is switched on across roughly twenty list pages — a new control on each. | `dashboard`, `sessions_all`, `deployment`, `admin_menu`, `vfolder`, `project_admin`, `agent_summary`, `user_settings` | add | high | yes |
| `25d2b2f9f` | #7927 | FR-3147 | feat(FR-3147): add opt-in auto-refresh interval dropdown to BAIFetchKeyButton | agatha197 | `agatha197` | yes | Adds the interval dropdown and its labels to the shared refresh control; surfaces to users via #7928. | `dashboard` | add | medium | yes |
| `c534ac0e7` | #8262 | FR-3319 | fix(FR-3319): add opt-in polling watcher to survive macOS fseventsd stream drops | Jong Eun Lee | `yomybaby` | no | Dev server (Vite) watcher config only. | — | — | high | yes |
| `618f01c65` | #8070 | FR-3224 | feat(FR-3224): add system announcement management to the Maintenance page | agatha197 | `agatha197` | yes | The Maintenance page gains create / edit / delete controls for the system announcement. | `admin_menu` | add | high | yes |
| `c4b74c3a2` | #8067 | FR-3223 | feat(FR-3223): allow editing the system announcement from the WebUI | agatha197 | `agatha197` | yes | The announcement banner documented on the Start page becomes editable in-product through a new editor modal. | `admin_menu`, `start` | add | high | yes |
| `055ee14dc` | #8242 | FR-3312 | docs(FR-3312): document BAIUncontrolledInput purpose in Storybook | ironAiken2 | `ironAiken2` | no | Storybook / developer documentation only. | — | — | high | yes |
| `16b86bb8a` | #8081 | FR-3226 | feat(FR-3226): add tabbed Downloads modal with CLI download & pip get-started | agatha197 | `agatha197` | yes | The user-menu 'Desktop App Download' item is replaced by a tabbed Downloads modal that also covers the CLI and pip. | `header` | modify | high | yes |
| `da4e84c37` | #8104 | FR-3239 | feat(FR-3239): refine user theme selector — product-owned built-in families and design-spec simplifications | ironAiken2 | `ironAiken2` | yes | User Settings gains a theme family / accent-color selector and the admin Branding page is simplified. | `user_settings`, `admin_menu`, `header` | modify | high | yes |
| `bbe959cdf` | #8215 | FR-3283 | style(FR-3283): clarify My Resources panel as usage and remove redundant toggle | Jong Eun Lee | `yomybaby` | yes | Panel renamed 'My Total Resources Limit' -> 'My Total Resource Usage', its description rewritten, and the Segmented limit/usage toggle removed. | `session_page`, `dashboard` | rename-label | high | yes |
| `980787ea3` | #8162 | FR-3257 | feat(FR-3257): add BAIListAlert component for list summaries in modals | nowgnuesLee | `nowgnuesLee` | yes | Delete-folder and bulk-edit-users modals now list the affected items in a collapsible alert instead of plain text. | `vfolder`, `admin_menu` | modify | low | yes |
| `6e1410fa6` | #8213 | FR-3282 | fix(FR-3282): migrate UserFolderPermissionPanelV2 filter to controlled renderInput contract | ironAiken2 | `ironAiken2` | no | Internal migration to the controlled filter contract; the rendered filter is the same as after #7940. | — | — | medium | yes |
| `64c37aa0e` | #8206 | FR-3278 | fix(FR-3278): resolve a manual image name to an image id in Add Revision | Sujin Kim | `agatha197` | yes | Manually typed image names are now resolved and validated in Add Revision, with a new error message when they do not resolve. | `deployment` | modify | high | yes |
| `b3db0a91f` | #8176 | FR-3269 | fix(FR-3269): point header help button to migrated multi-version docs URLs | agatha197 | `agatha197` | yes | The header Help button now opens version-matched manual pages on the new docs host. | `header` | modify | high | yes |
| `2307baa17` | #8172 | FR-3263 | feat(FR-3263): warn on deployment creation form that resource group cannot be changed | agatha197 | `agatha197` | yes | New warning text on the create-deployment form. | `deployment` | add | high | yes |
| `c1d1485dd` | #8178 | FR-3270 | fix(FR-3270): reset CreatePermissionModal form state by unmounting after close | ironAiken2 | `ironAiken2` | no | Superseded inside the same release: #8192 (FR-3272) deleted CreatePermissionModal entirely. | — | — | high | yes |
| `557a48f42` | #8196 | FR-3268 | feat(FR-3268): add created_at & default_for_unspecified columns to KeypairResourcePolicyList and fix concurrency translations | ironAiken2 | `ironAiken2` | yes | Two new columns on the keypair resource policy table plus corrected concurrency labels. | `admin_menu` | add | high | yes |
| `d16e53af1` | #8093 | FR-3234 | refactor(FR-3234): type BAIGraphQLPropertyFilter against real schema filter types | ironAiken2 | `ironAiken2` | no | Type-level refactor of the filter component; no rendered change. | — | — | high | yes |
| `2da43ae4b` | #8090 | FR-3232 | fix(FR-3232): make property filter Storybook stories interactive | ironAiken2 | `ironAiken2` | no | Storybook only. | — | — | high | yes |
| `201d5fe25` | #7940 | FR-3011 | feat(FR-3011): apply controlled filter to storage permission panels | ironAiken2 | `ironAiken2` | yes | Storage-permission panels switch to typed filter inputs (host / user pickers) instead of free-text conditions. | `admin_menu` | modify | medium | yes |
| `fc084effd` | #8082 | FR-3011 | feat(FR-3011): add controlled renderInput contract to BAIGraphQLPropertyFilter | ironAiken2 | `ironAiken2` | yes | Model Store and Admin Model Card filters swap the free-text storage-host input for a select. | `admin_menu`, `deployment` | modify | low | yes |
| `60cc64d84` | #8087 | FR-3230 | feat(FR-3230): add agent watcher start/stop/restart actions to AgentDetailDrawer | ironAiken2 | `ironAiken2` | yes | New agent life-cycle control modal offering watcher start / stop / restart from the agent detail drawer. | `admin_menu`, `agent_summary` | add | high | yes |
| `488c36c14` | #8155 | FR-3259 | feat(FR-3259): hide app launcher for batch sessions when hideAppsOnBatchSession is enabled | SungChul Hong | `ironAiken2` | yes | With the server config enabled, the app launcher and terminal actions disappear for batch sessions. | `sessions_all` | modify | high | yes |
| `b09984651` | #8153 | FR-3258 | feat(FR-3258): apply the renderInput (onAddCondition) custom filter-input contract to BAIPropertyFilter | ironAiken2 | `ironAiken2` | yes | The admin session list gains a project picker as a filter input instead of a free-text project condition. | `admin_menu` | modify | medium | yes |
| `b9ea22f88` | #8130 | FR-3249 | chore(FR-3249): fix stale and misleading code comments across webui | Jong Eun Lee | `yomybaby` | no | Code comments only. | — | — | high | yes |
| `0b93ac5e5` | #8118 | FR-3244 | style(FR-3244): unify admin create-button labels and refresh action-cluster gap | agatha197 | `agatha197` | yes | 'Add Credential' becomes 'Create Credential'; new 'Install Image' and 'Create Policy' labels replace generic ones across admin pages. | `admin_menu` | rename-label | high | yes |
| `f02556f73` | #8099 | FR-3237 | feat(FR-3237): confirm endpoint reachability before showing offline banner | nowgnuesLee | `nowgnuesLee` | yes | The offline banner now appears only when a /health probe confirms the endpoint is unreachable, so the false-positive banner users saw on VPNs is gone. | `trouble_shooting` | modify | low | yes |
| `a39b78dd6` | #8107 | FR-3241 | fix(FR-3241): show empty state on diagnostics page when no failed items | agatha197 | `agatha197` | yes | The Diagnostics page now shows an explicit empty state instead of a blank table. | `admin_menu` | modify | high | yes |
| `2e646430e` | #8078 | FR-3227 | fix(FR-3227): harden local wsproxy against cross-origin access and token forgery | agatha197 | `agatha197` | no | Internal security hardening of the local wsproxy token flow; failures fall back silently and session termination is unchanged. | — | — | medium | yes |
| `e29fd0e54` | #8072 | FR-3179 | fix(FR-3179): show actual allocated resources on session detail page | ironAiken2 | `ironAiken2` | yes | Session detail now shows allocated vs requested resources with a warning icon when they differ. This directly contradicts the existing FAQ entry 'Indicated resources do not match with actual allocation'. | `sessions_all`, `trouble_shooting` | modify | high | yes |
| `01c03c778` | #8064 | FR-3209 | fix(FR-3209): validate CSV password per-row instead of blocking on a missing column | agatha197 | `agatha197` | yes | Bulk create from CSV now accepts files without a password column and validates per row — the documented CSV requirements changed. | `admin_menu` | modify | high | yes |
| `f93adb674` | #8057 | FR-3216 | feat(FR-3216): add login history tab to user settings | nowgnuesLee | `nowgnuesLee` | yes | New Login History tab on the User Settings page, which the manual currently documents as having only General and Logs tabs. | `user_settings` | add | high | yes |
| `9622ed5a3` | #8054 | FR-3215 | feat(FR-3215): add login sessions tab to user settings | nowgnuesLee | `nowgnuesLee` | yes | New Login Sessions tab with a revoke action on the User Settings page. | `user_settings` | add | high | yes |
| `2a43014d4` | #8080 | — | fix: Disable container log auto-refresh interval input when auto-refresh is off | Jeongseok Kang | `rapsealk` | no | Superseded inside the same release: #8287 (FR-3324) removed the AutoRefreshSwitch this fix guarded. | — | — | medium | yes |

## Page index

Inverted view: each manual chapter and the rows that drive a change to it. This is the input for the per-page write tickets and their PR attribution tables.

### `admin_menu` — 27 driving row(s)

| fr | pr | author_gh | change_kind | what changed |
|---|---|---|---|---|
| FR-3404 | #8506 | `nowgnuesLee` | modify | Fair Share page resource-group warning alert now reflects the selected project/domain. |
| FR-3055 | #7751 | `yomybaby` | modify | All URLs now carry the project/scope segment; legacy paths redirect. |
| FR-3053 | #7747 | `yomybaby` | modify | Tag cells in admin tables collapse overflow behind a hover affordance. |
| FR-3326 | #8285 | `agatha197` | modify | Prometheus query preset modal resets on reopen and uses a category select. |
| FR-3376 | #8403 | `yomybaby` | rename-label | 34 English UI labels respelled (casing / hyphenation / spacing). |
| FR-2403 | #6244 | `yomybaby` | add | Credential list gains a bulk deactivate action. |
| FR-3348 | #8342 | `yomybaby` | modify | Credential modal uses a searchable user select and validates the rate-limit maximum. |
| FR-3267 | #8251 | `nowgnuesLee` | modify | Multi-tab pages persist per-tab table state in the URL. |
| FR-3331 | #8315 | `ironAiken2` | rename-label | Row-action tooltips renamed to the unified 'Edit' terminology. |
| FR-3331 | #8303 | `ironAiken2` | rename-label | 'Update'/'Modify' -> 'Edit'; edit-form submit buttons -> 'Save'; 'Update Users' -> 'Bulk Edit Users'. |
| FR-3317 | #8264 | `ironAiken2` | add | Projects list gains a one-click project admin assign/revoke modal. |
| FR-3222 | #8062 | `nowgnuesLee` | modify | User Resource Policy table rebuilt on the V2 component (new columns/filters). |
| FR-3243 | #8119 | `agatha197` | add | Resource Group page gains SFTP settings and a bulk edit modal. |
| FR-3300 | #8265 | `yomybaby` | modify | Auto-refresh default interval now varies by page according to data volatility. |
| FR-3147 | #7928 | `agatha197` | add | Auto-refresh interval dropdown enabled on the page's refresh button. |
| FR-3224 | #8070 | `agatha197` | add | Maintenance page gains system announcement management controls. |
| FR-3223 | #8067 | `agatha197` | add | System announcement is editable from the WebUI via a new editor modal. |
| FR-3239 | #8104 | `ironAiken2` | modify | User Settings gains a theme family and accent color selector; Branding page simplified. |
| FR-3257 | #8162 | `nowgnuesLee` | modify | Delete-folder and bulk-edit-users modals list affected items in a collapsible alert. |
| FR-3268 | #8196 | `ironAiken2` | add | Keypair resource policy table gains Created At and Default for Unspecified columns; concurrency labels corrected. |
| FR-3011 | #7940 | `ironAiken2` | modify | Storage permission panels use typed filter inputs (host / user pickers). |
| FR-3011 | #8082 | `ironAiken2` | modify | Model Store / Admin Model Card filters use a storage-host select instead of free text. |
| FR-3230 | #8087 | `ironAiken2` | add | Agent detail drawer gains watcher start / stop / restart actions. |
| FR-3258 | #8153 | `ironAiken2` | modify | Admin session list filter gains a project picker input. |
| FR-3244 | #8118 | `agatha197` | rename-label | Admin create-button labels unified ('Add Credential' -> 'Create Credential', 'Install Image', 'Create Policy'). |
| FR-3241 | #8107 | `agatha197` | modify | Diagnostics page shows an empty state when there are no failed items. |
| FR-3209 | #8064 | `agatha197` | modify | Bulk create from CSV no longer requires a password column; validation is per row. |

### `agent_summary` — 2 driving row(s)

| fr | pr | author_gh | change_kind | what changed |
|---|---|---|---|---|
| FR-3147 | #7928 | `agatha197` | add | Auto-refresh interval dropdown enabled on the page's refresh button. |
| FR-3230 | #8087 | `ironAiken2` | add | Agent detail drawer gains watcher start / stop / restart actions. |

### `chat` — 4 driving row(s)

| fr | pr | author_gh | change_kind | what changed |
|---|---|---|---|---|
| FR-3332 | #8298 | `agatha197` | modify | Chat deployment picker lists deployments by active replica traffic status. |
| FR-3340 | #8329 | `agatha197` | modify | Chat custom-model recovery form renders immediately; model fetch shows as button loading. |
| FR-3341 | #8328 | `agatha197` | modify | Chat endpoint token selector reworked; deployment detail token generation flow updated. |
| FR-3303 | #8236 | `agatha197` | modify | Chat keeps the selected deployment visible while a new revision rolls out. |

### `dashboard` — 6 driving row(s)

| fr | pr | author_gh | change_kind | what changed |
|---|---|---|---|---|
| FR-3386 | #8421 | `ironAiken2` | modify | Dashboard stays on screen during auto-refresh; individual cards show their own loading skeleton. |
| FR-3300 | #8265 | `yomybaby` | modify | Auto-refresh default interval now varies by page according to data volatility. |
| FR-3300 | #8233 | `agatha197` | modify | Refresh button shows a countdown border while auto-refresh is armed. |
| FR-3147 | #7928 | `agatha197` | add | Auto-refresh interval dropdown enabled on the page's refresh button. |
| FR-3147 | #7927 | `agatha197` | add | Shared refresh button gains the auto-refresh interval dropdown and its labels. |
| FR-3283 | #8215 | `yomybaby` | rename-label | 'My Total Resources Limit' renamed to 'My Total Resource Usage'; limit/usage toggle removed. |

### `deployment` — 14 driving row(s)

| fr | pr | author_gh | change_kind | what changed |
|---|---|---|---|---|
| FR-3425 | #8498 | `nowgnuesLee` | modify | Expanded scheduling-history rows show the full sub-step table. |
| FR-3401 | #8446 | `agatha197` | modify | Deployment preset review step shows Runtime when editing. |
| FR-3055 | #7751 | `yomybaby` | modify | All URLs now carry the project/scope segment; legacy paths redirect. |
| FR-3341 | #8328 | `agatha197` | modify | Chat endpoint token selector reworked; deployment detail token generation flow updated. |
| FR-3376 | #8403 | `yomybaby` | rename-label | 34 English UI labels respelled (casing / hyphenation / spacing). |
| FR-3267 | #8251 | `nowgnuesLee` | modify | Multi-tab pages persist per-tab table state in the URL. |
| FR-3347 | #8335 | `nowgnuesLee` | rename-label | Deployment preset Startup Command field gets its own description text. |
| FR-3331 | #8303 | `ironAiken2` | rename-label | 'Update'/'Modify' -> 'Edit'; edit-form submit buttons -> 'Save'; 'Update Users' -> 'Bulk Edit Users'. |
| FR-3323 | #8278 | `agatha197` | rename-label | Custom runtime Add Revision mount label unified to 'Mount Destination For Model Folder'. |
| FR-3300 | #8265 | `yomybaby` | modify | Auto-refresh default interval now varies by page according to data volatility. |
| FR-3147 | #7928 | `agatha197` | add | Auto-refresh interval dropdown enabled on the page's refresh button. |
| FR-3278 | #8206 | `agatha197` | modify | Add Revision resolves manually entered image names to an image id, with a new error message. |
| FR-3263 | #8172 | `agatha197` | add | Create-deployment form warns that the resource group cannot be changed later. |
| FR-3011 | #8082 | `ironAiken2` | modify | Model Store / Admin Model Card filters use a storage-host select instead of free text. |

### `header` — 7 driving row(s)

| fr | pr | author_gh | change_kind | what changed |
|---|---|---|---|---|
| FR-3428 | #8505 | `yomybaby` | modify | Switching project rewrites the project segment of the URL. |
| FR-3388 | #8423 | `yomybaby` | modify | Header project selector and URL project validation share one accessible-projects source. |
| FR-3057 | #7755 | `yomybaby` | modify | Help button anchors are scope-aware; invalid-project URLs show a guided fallback. |
| FR-3055 | #7751 | `yomybaby` | modify | All URLs now carry the project/scope segment; legacy paths redirect. |
| FR-3226 | #8081 | `agatha197` | modify | User menu Desktop App Download replaced by a tabbed Downloads modal (app / CLI / pip). |
| FR-3239 | #8104 | `ironAiken2` | modify | User Settings gains a theme family and accent color selector; Branding page simplified. |
| FR-3269 | #8176 | `agatha197` | modify | Help button opens version-matched manual URLs. |

### `login` — 3 driving row(s)

| fr | pr | author_gh | change_kind | what changed |
|---|---|---|---|---|
| FR-3383 | #8408 | `yomybaby` | add | Access-denied routes render a Forbidden page; sidebar entries are filtered by URL-scoped role. |
| FR-3376 | #8403 | `yomybaby` | rename-label | 34 English UI labels respelled (casing / hyphenation / spacing). |
| FR-2981 | #7606 | `yomybaby` | modify | Login screen respects the browser language before sign-in. |

### `project_admin` — 4 driving row(s)

| fr | pr | author_gh | change_kind | what changed |
|---|---|---|---|---|
| FR-2948 | #7552 | `ironAiken2` | modify | Session tables render image metadata icons and v2 session type / cluster mode tags. |
| FR-3333 | #8301 | `ironAiken2` | modify | Revoking project admin shows a warning alert; RBAC shortcut icon changed. |
| FR-3320 | #8268 | `ironAiken2` | add | Project admin modal links to role detail; system roles cannot be assigned directly. |
| FR-3147 | #7928 | `agatha197` | add | Auto-refresh interval dropdown enabled on the page's refresh button. |

### `rbac_management` — 13 driving row(s)

| fr | pr | author_gh | change_kind | what changed |
|---|---|---|---|---|
| FR-3424 | #8493 | `ironAiken2` | modify | User assignment on system roles is allowed again when the manager is older than 26.8.0. |
| FR-3406 | #8483 | `nowgnuesLee` | add | Legacy permission/scope tabs render in the role detail drawer on managers below 26.8.0. |
| FR-3377 | #8393 | `ironAiken2` | add | Role list property filter gains Assigned User and Mapped Scope. |
| FR-3357 | #8363 | `ironAiken2` | add | Bulk role assignment reports per-user failures in an error modal. |
| FR-3355 | #8360 | `ironAiken2` | add | Saving permissions with no changes shows a 'No changes made.' message. |
| FR-3334 | #8302 | `ironAiken2` | add | Partial bulk-permission failures preserve the form and list failures in a modal. |
| FR-3331 | #8303 | `ironAiken2` | rename-label | 'Update'/'Modify' -> 'Edit'; edit-form submit buttons -> 'Save'; 'Update Users' -> 'Bulk Edit Users'. |
| FR-3333 | #8301 | `ironAiken2` | modify | Revoking project admin shows a warning alert; RBAC shortcut icon changed. |
| FR-3320 | #8268 | `ironAiken2` | add | Project admin modal links to role detail; system roles cannot be assigned directly. |
| FR-3317 | #8264 | `ironAiken2` | add | Projects list gains a one-click project admin assign/revoke modal. |
| FR-3273 | #8194 | `ironAiken2` | add | Permissions can be edited across multiple scopes at once with keep-as-is semantics. |
| FR-3272 | #8192 | `ironAiken2` | modify | 'Add a permission' modal replaced by a scope-level permission edit modal. |
| FR-3271 | #8191 | `ironAiken2` | remove | Role detail drawer: Scopes tab and old Permissions tab removed, replaced by a detailed permissions tab. |

### `session_page` — 3 driving row(s)

| fr | pr | author_gh | change_kind | what changed |
|---|---|---|---|---|
| FR-3428 | #8505 | `yomybaby` | modify | Switching project rewrites the project segment of the URL. |
| FR-3055 | #7751 | `yomybaby` | modify | All URLs now carry the project/scope segment; legacy paths redirect. |
| FR-3283 | #8215 | `yomybaby` | rename-label | 'My Total Resources Limit' renamed to 'My Total Resource Usage'; limit/usage toggle removed. |

### `sessions_all` — 10 driving row(s)

| fr | pr | author_gh | change_kind | what changed |
|---|---|---|---|---|
| FR-3425 | #8498 | `nowgnuesLee` | modify | Expanded scheduling-history rows show the full sub-step table. |
| FR-3376 | #8403 | `yomybaby` | rename-label | 34 English UI labels respelled (casing / hyphenation / spacing). |
| FR-2948 | #7552 | `ironAiken2` | modify | Session tables render image metadata icons and v2 session type / cluster mode tags. |
| FR-3324 | #8287 | `yomybaby` | modify | Container log auto-refresh switch replaced by the shared refresh button + interval dropdown. |
| FR-3318 | #8260 | `nowgnuesLee` | add | Session list gains a reclamation status column with an idle-check popover. |
| FR-3343 | #8327 | `nowgnuesLee` | modify | Open-to-public and preferred-port options apply to TensorBoard and confirmation app launches. |
| FR-3300 | #8265 | `yomybaby` | modify | Auto-refresh default interval now varies by page according to data volatility. |
| FR-3147 | #7928 | `agatha197` | add | Auto-refresh interval dropdown enabled on the page's refresh button. |
| FR-3259 | #8155 | `ironAiken2` | modify | App launcher and terminal actions are hidden for batch sessions when hideAppsOnBatchSession is set. |
| FR-3179 | #8072 | `ironAiken2` | modify | Session detail shows allocated vs requested resources with a mismatch warning. |

### `sftp_to_container` — 1 driving row(s)

| fr | pr | author_gh | change_kind | what changed |
|---|---|---|---|---|
| FR-3359 | #8367 | `ironAiken2` | modify | SSH/SFTP launch failures now surface as errors rather than a bogus 127.0.0.1 dialog. |

### `share_vfolder` — 1 driving row(s)

| fr | pr | author_gh | change_kind | what changed |
|---|---|---|---|---|
| FR-3376 | #8403 | `yomybaby` | rename-label | 34 English UI labels respelled (casing / hyphenation / spacing). |

### `start` — 2 driving row(s)

| fr | pr | author_gh | change_kind | what changed |
|---|---|---|---|---|
| FR-3390 | #8429 | `yomybaby` | add | New experimental 'Import Hugging Face Model' tab in the Start from URL modal, plus its User Settings toggle. |
| FR-3223 | #8067 | `agatha197` | add | System announcement is editable from the WebUI via a new editor modal. |

### `trouble_shooting` — 6 driving row(s)

| fr | pr | author_gh | change_kind | what changed |
|---|---|---|---|---|
| FR-3383 | #8408 | `yomybaby` | add | Access-denied routes render a Forbidden page; sidebar entries are filtered by URL-scoped role. |
| FR-3279 | #8208 | `yomybaby` | modify | Unknown routes render a scoped 404 page inside the app layout. |
| FR-3057 | #7755 | `yomybaby` | modify | Help button anchors are scope-aware; invalid-project URLs show a guided fallback. |
| FR-3359 | #8367 | `ironAiken2` | modify | SSH/SFTP launch failures now surface as errors rather than a bogus 127.0.0.1 dialog. |
| FR-3237 | #8099 | `nowgnuesLee` | modify | Offline banner appears only after a /health probe confirms unreachability. |
| FR-3179 | #8072 | `ironAiken2` | modify | Session detail shows allocated vs requested resources with a mismatch warning. |

### `user_settings` — 8 driving row(s)

| fr | pr | author_gh | change_kind | what changed |
|---|---|---|---|---|
| FR-3390 | #8429 | `yomybaby` | add | New experimental 'Import Hugging Face Model' tab in the Start from URL modal, plus its User Settings toggle. |
| FR-3376 | #8403 | `yomybaby` | rename-label | 34 English UI labels respelled (casing / hyphenation / spacing). |
| FR-3267 | #8251 | `nowgnuesLee` | modify | Multi-tab pages persist per-tab table state in the URL. |
| FR-3339 | #8319 | `nowgnuesLee` | remove | Invalidated At column removed from the Login Sessions table. |
| FR-3147 | #7928 | `agatha197` | add | Auto-refresh interval dropdown enabled on the page's refresh button. |
| FR-3239 | #8104 | `ironAiken2` | modify | User Settings gains a theme family and accent color selector; Branding page simplified. |
| FR-3216 | #8057 | `nowgnuesLee` | add | New Login History tab on User Settings. |
| FR-3215 | #8054 | `nowgnuesLee` | add | New Login Sessions tab on User Settings, with session revoke. |

### `vfolder` — 4 driving row(s)

| fr | pr | author_gh | change_kind | what changed |
|---|---|---|---|---|
| FR-3376 | #8403 | `yomybaby` | rename-label | 34 English UI labels respelled (casing / hyphenation / spacing). |
| FR-3331 | #8303 | `ironAiken2` | rename-label | 'Update'/'Modify' -> 'Edit'; edit-form submit buttons -> 'Save'; 'Update Users' -> 'Bulk Edit Users'. |
| FR-3147 | #7928 | `agatha197` | add | Auto-refresh interval dropdown enabled on the page's refresh button. |
| FR-3257 | #8162 | `nowgnuesLee` | modify | Delete-folder and bulk-edit-users modals list affected items in a collapsible alert. |

## Reviewer index

Page -> deduped GitHub handles to add as reviewers on that page's PR (map standing decision 2: reviewers are *every* driving author).

| page | reviewers | count |
|---|---|---|
| `admin_menu` | `agatha197`, `ironAiken2`, `nowgnuesLee`, `yomybaby` | 4 |
| `agent_summary` | `agatha197`, `ironAiken2` | 2 |
| `chat` | `agatha197` | 1 |
| `dashboard` | `agatha197`, `ironAiken2`, `yomybaby` | 3 |
| `deployment` | `agatha197`, `ironAiken2`, `nowgnuesLee`, `yomybaby` | 4 |
| `header` | `agatha197`, `ironAiken2`, `yomybaby` | 3 |
| `login` | `yomybaby` | 1 |
| `project_admin` | `agatha197`, `ironAiken2` | 2 |
| `rbac_management` | `ironAiken2`, `nowgnuesLee` | 2 |
| `session_page` | `yomybaby` | 1 |
| `sessions_all` | `agatha197`, `ironAiken2`, `nowgnuesLee`, `yomybaby` | 4 |
| `sftp_to_container` | `ironAiken2` | 1 |
| `share_vfolder` | `yomybaby` | 1 |
| `start` | `agatha197`, `yomybaby` | 2 |
| `trouble_shooting` | `ironAiken2`, `nowgnuesLee`, `yomybaby` | 3 |
| `user_settings` | `agatha197`, `ironAiken2`, `nowgnuesLee`, `yomybaby` | 4 |
| `vfolder` | `agatha197`, `ironAiken2`, `nowgnuesLee`, `yomybaby` | 4 |

Union across all pages: `agatha197`, `ironAiken2`, `nowgnuesLee`, `yomybaby` (4 people).

## Excluded

All 33 commits triaged as not requiring a manual change, with the call for each. Every one also appears in the Matrix above with `user_facing = no`.

| commit | pr | fr | title | author_gh | why excluded |
|---|---|---|---|---|---|
| `475835e25` | #8420 | FR-3332 | refactor(FR-3332): migrate Chat deployment lookups off the legacy endpoint queries | `agatha197` | Internal Relay query migration (legacy `endpoint` -> `deployment` nodes); Chat labels and selection behavior unchanged. |
| `a1385c643` | #8499 | FR-3396 | fix(FR-3396): stretch SSH/SFTP connection modal so values render on one line | `agatha197` | Layout-only widening of the SSH/SFTP dialog; no field, label, or behavior change (screenshot-only impact, and screenshots are out of scope for this map). |
| `fc1eedc7a` | #8488 | FR-3395 | fix(FR-3395): restore expanded-row background alignment with nested tables | `agatha197` | Pure visual regression fix restoring the previous appearance; nothing documented changes. |
| `7ad73a892` | #8484 | FR-3405 | fix(FR-3405): resolve the property filter's selected property from current props | `agatha197` | Internal props-derivation fix inside the storage-permission property filter; the filter behaves as already documented. |
| `73d74d74e` | #8346 | FR-3350 | fix(FR-3350): keep KeyPair modal row controls in sync with the deferred dataset and deflake the my-keypair e2e suite | `yomybaby` | Race-condition fix in the My Keypair modal plus e2e deflaking; documented behavior unchanged. |
| `f0ab0530a` | #6668 | FR-2493 | refactor(FR-2493): centralize resource slot metadata into BAIMetaDataProvider | `nowgnuesLee` | Provider/plumbing refactor; resource number and device-icon rendering is unchanged. |
| `512d1064c` | #7955 | — | fix: Raise Node heap limit for the React production build | `rapsealk` | Build tooling only (package.json NODE_OPTIONS). |
| `aa069b2e2` | #7879 | — | fix: use token-based color for provisioning/warming-up replica tags | `yomybaby` | Color-token swap on replica status tags; same labels and same states (screenshot-only impact). |
| `dc3a264ab` | #8412 | FR-3384 | fix(FR-3384): add bottom padding to reasoning-only chat message bubbles | `yomybaby` | Padding-only fix on chat message bubbles. |
| `749d97e43` | #8395 | FR-3214 | feat(FR-3214): make the resident dev type checker opt-in | `yomybaby` | Dev-only tooling — excluded by map standing decision 3 (FR-3214). |
| `7a447b849` | #8357 | FR-3214 | feat(FR-3214): exclude pnpm store from the dev type-check watcher to cut per-process watch FDs | `nowgnuesLee` | Dev-only tooling — excluded by map standing decision 3 (FR-3214). |
| `9afb622cd` | #8397 | FR-3379 | style(FR-3379): unify bulk action button styles in table selection toolbars | `ironAiken2` | Icon-button fill/variant styling only — no label, action, or placement change (screenshot-only impact). |
| `2bd349213` | #8356 | FR-3354 | fix(FR-3354): pause and re-anchor BAIFetchKeyButton countdown border during in-flight refresh | `agatha197` | Animation timing detail of the auto-refresh countdown ring; the documented auto-refresh contract is unchanged. |
| `c53139de1` | #8383 | FR-3371 | chore(FR-3371): upgrade nuqs to 2.9.2 and drop the local lost-update patch | `nowgnuesLee` | Dependency upgrade that removes a local patch; no UI surface. |
| `24007ae83` | #8365 | FR-3358 | fix(FR-3358): patch nuqs to recover render-phase updates lost in discarded renders | `yomybaby` | Dependency patch; reverted by FR-3371 upgrade. |
| `899834212` | #8352 | FR-3352 | feat(FR-3352): dev-only login pre-fill and backend-mismatch banner | `yomybaby` | Dev-only tooling — excluded by map standing decision 3 (FR-3352). |
| `b5bb80673` | #8316 | FR-3338 | fix(FR-3338): resolve eslint-plugin-react-hooks 7.1.1 compiler diagnostics | `nowgnuesLee` | Lint-driven mechanical refactor across many files; no behavior change. |
| `ec1efc887` | #5097 | FR-1943 | feat(FR-1943): migrate from use-query-params to nuqs | `yomybaby` | URL query-state library swap. Param names and semantics were preserved, so shareable links behave as documented — but the encoding layer changed under every filter/pagination URL, so this is flagged rather than silently dropped. |
| `565c87619` | #8320 | — | test: e2e auto-heal 2026-07-19 | `nowgnuesLee` | Test-only (adds a test id to a table cell). |
| `fae71e6f3` | #8308 | FR-3335 | chore(FR-3335): make dev review overlay opt-in via VITE_DEV_REVIEW_OVERLAY | `yomybaby` | Dev-only tooling — excluded by map standing decision 3 (FR-3309 overlay family). |
| `304768f9b` | #8295 | FR-3330 | chore(FR-3330): bump to 26.8.0-alpha.0 and update dependencies | `yomybaby` | Version and dependency bump. |
| `4b8ff6e94` | #8248 | FR-3309 | feat(FR-3309): review overlay walking skeleton — pin-to-Teams round trip (dev-only Vite plugin) | `yomybaby` | Dev-only tooling — excluded by map standing decision 3 (FR-3309). |
| `61f0f1be2` | #8290 | FR-3328 | fix(FR-3328): refetch user list after bulk purge | `yomybaby` | Restores the already-documented behavior (list refreshes after purge); the manual was right. |
| `67c855c91` | #8281 | FR-3325 | style(FR-3325): use token.colorError for used stroke in session statistics chart | `nowgnuesLee` | Chart stroke color token swap only. |
| `c534ac0e7` | #8262 | FR-3319 | fix(FR-3319): add opt-in polling watcher to survive macOS fseventsd stream drops | `yomybaby` | Dev server (Vite) watcher config only. |
| `055ee14dc` | #8242 | FR-3312 | docs(FR-3312): document BAIUncontrolledInput purpose in Storybook | `ironAiken2` | Storybook / developer documentation only. |
| `6e1410fa6` | #8213 | FR-3282 | fix(FR-3282): migrate UserFolderPermissionPanelV2 filter to controlled renderInput contract | `ironAiken2` | Internal migration to the controlled filter contract; the rendered filter is the same as after #7940. |
| `c1d1485dd` | #8178 | FR-3270 | fix(FR-3270): reset CreatePermissionModal form state by unmounting after close | `ironAiken2` | Superseded inside the same release: #8192 (FR-3272) deleted CreatePermissionModal entirely. |
| `d16e53af1` | #8093 | FR-3234 | refactor(FR-3234): type BAIGraphQLPropertyFilter against real schema filter types | `ironAiken2` | Type-level refactor of the filter component; no rendered change. |
| `2da43ae4b` | #8090 | FR-3232 | fix(FR-3232): make property filter Storybook stories interactive | `ironAiken2` | Storybook only. |
| `b9ea22f88` | #8130 | FR-3249 | chore(FR-3249): fix stale and misleading code comments across webui | `yomybaby` | Code comments only. |
| `2e646430e` | #8078 | FR-3227 | fix(FR-3227): harden local wsproxy against cross-origin access and token forgery | `agatha197` | Internal security hardening of the local wsproxy token flow; failures fall back silently and session termination is unchanged. |
| `2a43014d4` | #8080 | — | fix: Disable container log auto-refresh interval input when auto-refresh is off | `rapsealk` | Superseded inside the same release: #8287 (FR-3324) removed the AutoRefreshSwitch this fix guarded. |
## Flags

Judgement calls and open items that a human may want to reverse. Per map standing decision 5
(no triage gate) none of these blocks the per-page write tickets — they are recorded so the calls
are auditable.

### F1. The cosmetic-only exclusion rule (7 rows) — the most reversible call here

A consistent line was drawn: **a change that alters only colour, padding, fill, or line-wrapping,
with no change to any label, field, state, control, or behaviour, is `user_facing = no`.** The
justification is that its only documentation impact is stale screenshots, and *screenshot capture is
explicitly out of scope for this map*. Rows excluded on this rule:

| commit | fr | what it restyled |
|---|---|---|
| `fc1eedc7a` | FR-3395 | expanded-row background alignment in nested tables |
| `a1385c643` | FR-3396 | SSH/SFTP connection modal width (values wrap -> one line) |
| `aa069b2e2` | — | provisioning / warming-up replica tag colours |
| `dc3a264ab` | FR-3384 | reasoning-only chat bubble bottom padding |
| `9afb622cd` | FR-3379 | bulk-action icon button fill / variant in selection toolbars |
| `2bd349213` | FR-3354 | auto-refresh countdown ring pause/re-anchor animation |
| `67c855c91` | FR-3325 | session statistics chart "used" stroke colour |

If the screenshot effort later wants a driving-commit list rather than a pixel diff, this table is
that list — promote these seven into the matrix at that point. `a1385c643` (`sftp_to_container`) and
`9afb622cd` (`admin_menu`, `project_admin`, `vfolder`) are the two most defensible to promote,
because the manual shows those exact toolbars and dialogs.

### F2. Routing and error pages have no home chapter

Six rows change what URL a user is on or what they see when a route fails, and **no chapter in
`src/en/` documents routing or error pages**. `book.config.yaml` has no such entry either.

- `5dbbec894` FR-3055 — the whole URL scheme becomes `/project/<name>/…` / `/admin/…`
- `eea955015` FR-3057, `aaccbd882` FR-3279 — scope-aware 404
- `f0ac1c9d1` FR-3383 — new Forbidden page replacing Page401
- `76b64ae74` FR-3388, `81a9342c8` FR-3428 — URL project-segment validation and rewriting

They were placed on the chapters whose text they *falsify* rather than dropped. Two concrete,
verified breakages:

- `session_page/session_page.md:38` — "The personal Sessions page (`/session`) …"
- `admin_menu/admin_menu.md:365` — "its own dedicated route at `/admin-deployments/:id`"

**Open call for a human:** whether 26.8 gets a short new chapter (URLs, scopes, 404/403) or the two
quoted paths are simply corrected in place. Corrected-in-place is the cheaper default and is what
the page assignments above assume. A new chapter would need a `book.config.yaml` nav entry in all
four languages, which is outside what the per-page PRs are scoped to do.

### F3. Removals — docs to delete, not add

Map "Not yet specified" asks whether any removals landed. **They did — six.**

| commit | fr | what was removed | page |
|---|---|---|---|
| `d6fc4c3c1` | FR-3271 | Role detail drawer's **Scopes tab** and old **Permissions tab** deleted (`RoleScopeTab.tsx`, `RolePermissionTab.tsx`, `CreatePermissionModal.tsx`) | `rbac_management` |
| `bce715e49` | FR-3272 | the "Add a permission" modal flow, replaced by a scope-level edit modal | `rbac_management` |
| `5caa22c9b` | FR-3339 | **Invalidated At** column on the Login Sessions table | `user_settings` |
| `bbe959cdf` | FR-3283 | the Segmented limit/usage toggle on the My Resources panel | `session_page`, `dashboard` |
| `c05417a36` | FR-3324 | the container log modal's dedicated **Auto refresh** switch | `sessions_all` |
| `16b86bb8a` | FR-3226 | the **Desktop App Download** modal, replaced by a tabbed Downloads modal | `header` |

`rbac_management` carries the sharpest one: the manual's `## View role scopes` section documents a
tab that no longer exists. That section is a delete, and the surrounding cross-references and any
images under `src/images/` referenced only from it need checking at write time.

### F4. `rbac_management` is effectively a rewrite, not a patch

13 driving rows, of which FR-3271 / FR-3272 / FR-3273 together restructure the role detail drawer
end to end (`## Manage permissions`, `### Add a permission`, `### Remove a permission`,
`## View role scopes` all become wrong), plus FR-3406 and FR-3424 add *manager-version-conditional*
behaviour — the drawer renders legacy tabs against managers below 26.8.0. The page will need an
explicit "on managers older than 26.8.0 …" note, a pattern the manual does not currently use
anywhere. Worth sizing this page's write ticket separately from the others.

### F5. `admin_menu` fan-in — 27 rows on one 1655-line chapter

By far the largest bucket, and it violates the map's "disjoint file sets, zero conflicts" premise
only in the sense that one PR will be very large, not that PRs will collide. Consider whether the
`admin_menu` write ticket is split by section (users/credentials, resource policies, resource
groups, maintenance/announcements, diagnostics, Prometheus presets) rather than by file. That is a
slicing decision the map has not made.

### F6. `agent_summary` placement is uncertain

`agent_summary/agent_summary.md` is 29 lines with a single `## Columns` section. The two rows routed
there (`60cc64d84` FR-3230 agent watcher actions, `b4d3d1319` FR-3147 auto-refresh dropdown) more
plausibly belong to `admin_menu` `## Manage agent nodes`. Both rows are already listed on
`admin_menu` too, so nothing is lost if the `agent_summary` PR turns out to be a no-op — but do not
open that PR before confirming the drawer is reachable from the Agent Summary page.

### F7. `ec1efc887` (FR-1943, nuqs migration) — excluded, but the one exclusion worth a second look

Migrating every URL-state hook from `use-query-params` to `nuqs` preserved parameter names and
semantics, so shareable links behave as documented. But it rewrote the encoding layer under *every*
filter/sort/pagination URL in the app, and `deployment/deployment_presets.md:130` explicitly promises
"You can share a link to a specific preset's detail view, and the recipient lands on the same
screen." Nothing observed suggests that promise broke. Confidence `low`; if anyone can spot-check
one shared filter URL against 26.7, that closes it.

### F8. Post-cut commits must be held out of the back-port

`475835e25` and `b2a125f7c` (both FR-3332, Chat) are **not** ancestors of `origin/26.8`. `b2a125f7c`
is the only *included* post-cut row, and it is the only row on the `chat` page that is not in 26.8 —
so `chat`'s PR mixes 26.8 and 26.9 content. Either drop that row from the 26.8 `chat` PR, or keep it
and make sure the out-of-scope back-port to the `26.8` branch strips it. Recorded here because the
back-port effort is out of scope and will not re-derive this.

### F9. Low-confidence rows (10)

Included deliberately under "a false positive costs a paragraph of review": `81a9342c8` (FR-3428),
`76b64ae74` (FR-3388), `aaccbd882` (FR-3279), `78851c36f` (FR-3340), `ee8a18fe1` (FR-3053),
`ef3637b1a` (FR-3267), `e11d80acd` (FR-3300), `980787ea3` (FR-3257), `fc084effd` (FR-3011),
`f02556f73` (FR-3237). Five of them cluster on routing (F2) and two on the auto-refresh family; the
rest are single-component visual affordances whose reader impact is a sentence at most.

### F10. Two rows delete existing manual claims rather than extend them

- `e29fd0e54` (FR-3179) makes the session detail page show allocated vs requested resources with a
  mismatch warning. `trouble_shooting/trouble_shooting.md` has an admin FAQ entry titled
  **"Indicated resources do not match with actual allocation"** — that entry's premise is now handled
  in-product and the section likely shrinks or is rewritten to point at the new warning.
- `84ec712bb` (FR-3359) replaces the bogus `127.0.0.1` SSH/SFTP dialog with an explicit error. The
  **"SFTP disconnection"** troubleshooting entry should be re-read against the new error messages
  (`ProxyNotReady`, `ProxyDirectTCPNotSupported`, `InvalidRedirectURL`).

### F11. `deployment` is a two-file chapter

`src/en/deployment/` holds both `deployment.md` (788 lines) and `deployment_presets.md` (160 lines),
and `book.config.yaml` navigates only `deployment/deployment.md` — `deployment_presets.md` is not in
the nav for any language. Four of the 14 `deployment` rows (FR-3401, FR-3347, and the preset parts of
FR-3055 and FR-3267) land on the un-navigated file. Flagging both facts: the write ticket must say
which file, and someone should decide whether `deployment_presets.md` belongs in the nav at all.
