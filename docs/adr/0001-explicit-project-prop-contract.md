# ADR-0001: Explicit project prop contract for leaf components

- Status: Accepted
- Date: 2026-07-29
- Issues: FR-3407 (epic), FR-3408 (first application), FR-3415 (final
  application — the `/admin/*` surface is complete)

## Context

Super admins on the admin pages (`/admin-session`, `/admin-deployments`,
`/admin-data`) still see the header's current-project selector, and its value
silently affects what those pages show and where they create things. A super
admin browsing all folders can create a folder — or launch a session, or
deploy a model — into whatever project happens to be selected in the header,
without noticing. Project-mismatch alerts fire based on a selector that is
conceptually irrelevant on pages that operate above project scope.

The root cause is that leaf components (creation modals, session-launch
buttons, mismatch alerts) read the ambient current project themselves via
`useCurrentProjectValue`. The page has no say in — and no visibility into —
which project a nested component will target.

Two alternative mechanisms were evaluated and rejected (multi-agent design
review on FR-3407):

- **React Context provider** — globally-mounted openers (e.g. the
  folder-explorer opener) sit outside every per-route element, and
  jotai-derived consumers are unreachable by Context.
- **Route-derived atom-null layer** — unnecessary once components stop
  reading ambient state; it also keeps the "invisible global" failure mode.

## Decision

Converted leaf components take a **required** prop:

```ts
project: { id: string; name: string } | null
```

and **never read the ambient current project (`useCurrentProjectValue`)
internally**. Pages decide the project context; pages become the only readers
of the ambient hook and pass `project={currentProject}` explicitly.

- **Both `id` and `name` are required** because legacy REST APIs are
  name-keyed (session creation `group_name`, preset checks) while GraphQL is
  id-keyed. Carrying both avoids ad-hoc lookups inside leaf components.
- **`null` means "no ambient project context"** (e.g. super-admin pages).
  What a component does with `null` depends on its tier:
  - **Modal tier** (creation modals): renders its own required in-modal
    project selector; the mutation targets exactly the chosen project.
  - **Button tier** (session-launching buttons): renders disabled, with a
    caller-provided reason (`noProjectTooltip`); the component itself never
    knows why the project is absent.
  - **Alert tier** (project-mismatch alerts): suppresses the
    project-comparison UI entirely.
- Because the prop is required, TypeScript forces every call site to decide
  the project context (`project={...}` or `project={null}`) — forgetting is a
  compile error, not a silent wrong-project bug.

The shared contract types live in `react/src/types/projectContext.ts`
(`ProjectContext`, `ProjectContextOrNull`, and the `toProjectContext`
narrowing helper for the loosely-typed ambient value).

## Consequences

- Behavior on non-admin pages is unchanged: general pages read
  `useCurrentProjectValue` at page level and pass it down explicitly.
- Admin pages pass `project={null}` and get visible, deliberate project
  selection instead of silently inheriting the header selection. Mistakes
  surface visibly (a selector the user must fill, a disabled button) instead
  of silently targeting the wrong project.
- Intermediate components that merely _render_ a converted leaf component and
  are not yet converted themselves may still read the ambient hook — but must
  pass the value on explicitly. Each conversion moves the ambient read one
  level closer to the page until only pages read it.
- The global current-project atom, its derived resource-group atoms for
  non-admin pages, and the imperative client `current_group` mirror are
  explicitly untouched.
- First application: `FolderCreateModalV2` (FR-3408). Second application
  (FR-3410): `DeploymentSettingModal` (create mode embeds the selector when
  `project` is `null`), `VFolderDeployModal` (derive-from-resource tier — the
  target project comes from the folder's own ownership, with an in-modal
  selector only for user-owned folders), and `AdminModelCardSettingModal`
  (model cards are created only in the resolved model-store project; the
  ambient fallback was deleted). Third application (FR-3411):
  `ResourceAllocationFormItems` (form-fragment tier — a required **non-null**
  `project: ProjectContext`; the parent owns any selector, and the prop
  scopes the `accessible_scaling_groups` query, the resource-group select,
  and the resource limit/preset lookups) and `DeploymentAddRevisionModal`
  (derive-from-resource tier — the deployment's own `metadata.projectId` +
  `projectV2` name drive the model-folder picker, the resource form, and
  in-modal folder creation; when the project cannot be resolved, submission
  is visibly disabled instead of falling back to ambient). Fourth
  application (FR-3412): `FileBrowserButtonV2` and `SFTPServerButtonV2`
  (button tier — required `project: ProjectContextOrNull` plus
  `noProjectTooltip?`; `null` renders the button disabled with the
  caller-provided reason, non-null keys the storage-host permission lookup,
  the per-project volume-host fetch (`useVHostInfo(projectId)` replaces the
  ambient derived-atom read), and the created session to exactly that
  project). `useStartSession` gained an explicit `projectName` input that
  pins `group_name` without reusing the `owner` branch (which is coupled to
  `owner_access_key`); callers that omit it keep the ambient fallback as a
  sanctioned interim state. `FolderExplorerHeaderV2` passes the prop
  through. Fifth application (FR-3413) — the display/gating tier:
  - `SessionDetailContent` (alert tier — required
    `project: ProjectContextOrNull`; the internal ambient read and the
    "Project ID is required" throw were deleted, so session detail renders
    without any project context; the `session.NotInProject` alert renders
    only when a non-null project is passed and the session's project
    differs). `SessionDetailDrawer`, the multi-page
    `SessionDetailAndContainerLogOpenerLegacy`, `RecentlyCreatedSession`,
    and `DeploymentReplicasCard` are intermediates with a required
    pass-through: general pages narrow ambient at page level, super-admin
    pages (`/admin/session`, the scheduler page) pass `null`.
  - `DeploymentDetailPage` serves three URL spaces; as the PAGE it decides
    the context via `useIsProjectAgnosticPage()`: `null` on the admin URL
    space (no mismatch alert, no `SwitchToProjectButton` shortcut, and the
    Add-revision CTA is no longer suppressed), narrowed ambient elsewhere.
  - `EditableVFolderNameV2` and `VFolderNodeDescriptionV2` (ownership/role
    gating — required `project: ProjectContextOrNull`; rename and
    mount-permission editing are gated on the folder owner, the
    `superadmin` effective role, or a page-decided project matching the
    folder's own `ownership.projectId`; `null` simply never matches the
    project branch, so super-admin abilities no longer flicker with header
    state).
  - The globally-mounted `FolderExplorerModalV2` (see the route-derivation
    exception below) now keys `useMergedAllowedStorageHostPermission` to
    the folder's own ownership project when the folder is project-owned;
    for user-owned folders it narrows ambient only off the super-admin
    routes (interim), and the hook accepts `projectId: null` to skip the
    group-scope lookup entirely.

  Sixth and final application (FR-3414) — the route flip:

  - **Header**: the project selector block (label, `ProjectSelect`, and the
    selector-bound admin-exit confirm flow) was extracted from `WebUIHeader`
    into `WebUIHeaderProjectSelect` and is mounted only when
    `useIsProjectAgnosticPage()` is false. On the project-agnostic routes the
    block simply does not exist: nothing in the header reads or writes the
    current-project atom there, so leaving admin restores the user's previous
    selection untouched. No placeholder is rendered — the header's
    `justify="between"` layout collapses the left slot cleanly (the mobile
    menu button stays).
  - **Scope**: the flip initially covered only the three FR-3407 feature
    pages (`admin-session`, `admin-deployments`, `admin-data`). It now covers
    the whole project-agnostic `/admin/*` surface — an audit of the subtree
    found eleven further pages with no ambient current-project read anywhere
    in their render trees, so hiding the selector there has no behavioral
    consequence: `credential` (`/admin/users`), `resource-policy`,
    `scheduler`, `agent`, `project`, `settings`, `maintenance`,
    `diagnostics`, `rbac`, `branding`, `information`. Three admin keys stay
    OUT because they genuinely read ambient state: `environment` (the image
    install / resource-preset flows reach `SessionLauncherPage`) and
    `reservoir` (`ImportArtifactRevisionToFolderModal` reads AND writes the
    ambient project) — both pending a follow-up ticket — plus
    `admin-dashboard`, which is out of scope for FR-3407.
  - **Naming**: `SUPER_ADMIN_SCOPED_MENU_KEYS` /
    `useIsSuperAdminScopedPage` / `SUPER_ADMIN_SCOPED_PATHNAME_REGEX` were
    renamed to `PROJECT_AGNOSTIC_MENU_KEYS` / `useIsProjectAgnosticPage` /
    `PROJECT_AGNOSTIC_PATHNAME_REGEX`. The old name was a misnomer:
    `admin-session`, `credential` and `resource-policy` are `access: 'admin'`
    (domain admins reach them too), so the defining property is the scope the
    page operates at, not the role required to open it.
  - **`NoResourceGroupAlert`** (globally mounted in `MainLayout` — the
    sanctioned route-check exception) returns `null` on the project-agnostic
    routes: "no resource group in this project" is a project-scoped warning.
  - **Dev-mode straggler warning**: `useCurrentProjectValue` warns once per
    mount (dev builds only; dead-code eliminated in production) when it is
    read while `window.location.pathname` matches a project-agnostic surface.
    The matcher (`PROJECT_AGNOSTIC_PATHNAME_REGEX`) is **derived from**
    `PROJECT_AGNOSTIC_ROUTE_PATHS` rather than hand-written, so a newly gated
    key widens it automatically; it covers both the canonical `/admin/*`
    shape and the legacy flat shims. It stays imperative — no router hooks —
    so the hook remains usable outside router contexts.
  - **One source of truth**: the menu-key list, the key→pathname map and the
    derived regex live in the leaf module
    `react/src/helper/projectAgnosticRoutes.ts` (leaf because
    `useCurrentProject -> useRouteScope -> useCurrentProject` would otherwise
    be an import cycle). The map is written out explicitly because the menu
    key is not always the path segment — `credential` resolves to
    `/admin/users`. `projectAgnosticRoutes.test.tsx` matches every canonical
    and legacy path against the real route tree (`matchRoutes` over
    `mainLayoutChildRoutes`), so a route rename cannot silently un-gate a
    page.
  - **ESLint guardrail**: `react/eslint.config.js` forbids importing
    `useCurrentProjectValue` in the project-agnostic sources
    (`AdminSessionPage`, `AdminComputeSessionListPage`,
    `AdminVFolderNodeListPage`, `AdminDeploymentListPage`,
    `AdminDeploymentPresetListPage`, `AdminDeploymentPresetSettingPage`,
    `AdminModelCardListPage`, `PendingSessionNodeList`, `AdminUsersPage`,
    `ResourcePolicyPage`, `SchedulerPage`, `ResourcesPage`, `ProjectPage`,
    `ConfigurationsPage`, `MaintenancePage`, `DiagnosticsPage`,
    `RBACManagementPage`, `BrandingPage`, `components/Information`), pointing
    violators at this ADR. `EnvironmentPage`, `ReservoirPage`,
    `AdminDashboardPage` (all excluded from the flip) and
    `DeploymentDetailPage` (sanctioned page-level reader) are excluded.
  - **E2E** (`e2e/admin-scope/`): the selector is absent on the three admin
    routes and present on the user Data page; leaving admin restores the
    previous selection; a folder created from the admin Data page lands in
    the project chosen inside the modal.

  Seventh application (FR-3415) — the last two project-dependent admin
  pages, completing the `/admin/*` surface:

  - **Environments** (`EnvironmentPage`, `/admin/environment`) grew a visible,
    URL-persisted, page-level project selection using
    `ProjectSelectForAdminPage` (all projects of the domain — the header's
    selector lists only the projects the admin is a MEMBER of, which is the
    wrong set for an admin surface). The choice lives in the `project` search
    param (the project **id**), resolved to `{ id, name }` at page level via
    `useAccessibleProjects` — the same source the selector reads, so the URL
    and the visible option cannot disagree, and an id that no longer resolves
    falls back to the unfiltered view rather than to something arbitrary.

    **There is deliberately no default**, and none is needed: the project is an
    **optional filter over a domain-wide default**, not a precondition.
    Seeding it — from the ambient project or from "the first project" — would
    reintroduce exactly the invisible-scope bug this ADR exists to remove, and
    an empty state ("pick a project to list images") would make an admin
    surface refuse to show the domain's images until an arbitrary project was
    chosen. The list therefore always loads; the selector is `allowClear` with
    an "All projects" placeholder, and clearing it drops `?project=` from the
    URL and re-runs the query at domain scope.

    **The admin image list defaults to a DOMAIN scope — the first non-project
    `scope_id` in the app.** Every other call site passes `project:${...}`.
    `image_nodes(scope_id: ScopeField!)` is non-null, so the argument cannot be
    omitted, but `ScopeField` parses `<TYPE>:<ID>` for TYPE in
    `system | domain | project | user`
    (`src/ai/backend/manager/api/gql_legacy/fields.py:15`). Verified against a
    live manager 26.7.0 with everything else held constant: `system:` → 149
    images, `domain:default` → 149, `project:<uuid>` → 149, and the legacy
    unscoped `images` query → 149, i.e. the full set. Scope width differs only
    for non-global (project-associated) container registries, where
    `domain:<name>` ⊇ `system:` ⊇ `project:<one>`; images from global
    registries appear under every scope. Invalid forms fail loudly
    (`domain:nope` → "Domain not found").

    **`domain:<current domain>` was chosen over `system:`** for two reasons:

    1. `system:` is computed from the **caller's own project memberships** and
       has a real crash path — `IndexError` → HTTP 500 — for an admin who
       belongs to zero projects
       (`src/ai/backend/manager/models/image/row.py:1441-1443`).
    2. `/admin/environment` is `access: 'admin'`, so **domain admins** reach
       it. A domain scope matches their authority exactly, whereas `system:`
       claims a breadth the page has no business asserting.

    `admin_images_v2` exists but takes no scope argument, so it is not a
    substitute; revisit if it grows one.

    **The selector lives in the Images tab's own filter row, not in the page's
    card header.** The project narrows what that list SHOWS, which makes it a
    content-scoped control (`.claude/rules/use-bai-card.md` reserves the card
    `extra` slot for card-scoped actions and keeps filter/sort/paging controls
    in the body). It is also the only tab that needs one: Registries are
    domain-wide, and resource presets have no project dimension at all (see
    below). The page still owns the URL state and resolves the id; `ImageList`
    receives `project` plus an `onChangeProject` callback and never decides
    the project itself, so ADR-0001's contract is intact.

    The consumers below it were converted:
    - `ImageList` — required `project: ProjectContextOrNull` plus
      `onChangeProject: (project: ProjectContextOrNull) => void`; the query
      scope is `project:${project.id}` when the filter is active and
      `domain:${baiClient._config.domainName}` otherwise. `null` is an
      ordinary state, not an error: the list loads either way.
    - `ImageInstallModal` — **modal tier**, `project: ProjectContextOrNull`.
      Installing an image enqueues a batch session, which always needs a
      project, but the list is domain-wide so there is not always one to
      inherit. With `null` the modal renders its OWN required
      `ProjectSelectForAdminPage` (same pattern as `FolderCreateModalV2` and
      `DeploymentSettingModal`) and OK stays disabled until a project is
      picked; the choice is modal-session state, reset on every open. With a
      project passed it shows no selector and installs there. The install
      target is deliberately NOT borrowed from the filter when unset —
      requiring the user to change a _filter_ to enable an _action_ is the same
      implicit coupling this epic removes. Either way `group_name` comes from
      the resolved project, never `baiClient.current_group`.

    **Resource presets take no `project` prop at any tier — they have no
    project dimension.** The manager's `resource_presets` table has no
    project/group column; its only relation is to a single `ScalingGroupRow`,
    and the row model states the semantics directly: _if `scaling_group_name`
    is None, the preset is global_ (`src/ai/backend/manager/models/
resource_preset/row.py`). `data/schema.graphql` agrees —
    `CreateResourcePresetInput` carries only `resource_slots`,
    `shared_memory` and `scaling_group_name`, and the `resource_presets`
    query takes no project argument.

    Narrowing the resource-group choices by a project was therefore not an
    ambient-project leftover to be converted but a **pre-existing bug**: an
    admin editing a global preset could only pick resource groups attached to
    their own current project and could not target any other one. So
    `ResourcePresetSettingModal` and `ResourcePresetList` carry **no project
    prop at all**, and the modal lists resource groups at admin scope with
    `BAIAdminResourceGroupSelect` (the project-independent
    `resourceGroups(first, after, filter)` connection). The field stays
    `allowClear`, because an empty resource group is exactly the manager's
    global preset.

  - **Reservoir** (`ReservoirArtifactDetailPage`, `/admin/reservoir`):
    `ImportArtifactRevisionToFolderModal` is derive-from-resource tier. An
    artifact import always lands in a MODEL STORE project, so the destination
    now comes from the model-store projects the page resolved — the fragment
    became `@relay(plural: true)` and the page passes all of them instead of
    arbitrarily picking `groups[0]`, with an in-modal selector when more than
    one exists. **The "Change Project" `Popconfirm` — which called
    `useSetCurrentProject` and thus MUTATED the global project selection from
    an admin surface — is deleted**, together with the ambient read that
    decided whether to show it. With no model-store project available, the
    in-modal folder-creation button is disabled with a reason instead of
    offering to change projects.
  - **Gating**: `environment` and `reservoir` joined
    `PROJECT_AGNOSTIC_MENU_KEYS` (with their canonical and legacy paths; the
    reservoir entry is a prefix, so the `/:artifactId` child is covered).
    `admin-dashboard` is now the ONLY excluded `/admin/*` key — the page is
    unused and still reads ambient state directly.
  - **Fourth copy removed**: `e2e/admin-scope/admin-header-project-selector.spec.ts`
    had its own local `SUPER_ADMIN_ROUTES` constant covering only the original
    three routes. It now derives the list from
    `react/src/helper/projectAgnosticRoutes.ts` (a deliberate leaf module, so
    importing it into Playwright costs nothing), minus the three
    feature-flag-gated pages (`scheduler`, `rbac`, `reservoir`) that are not
    navigable on every test cluster.
  - **ESLint guardrail**: `EnvironmentPage`, `ReservoirPage` and
    `ReservoirArtifactDetailPage` moved from the excluded set into the
    restricted file list.

  A component that turns out to have **no project dimension in the backend**
  (the resource-preset editor above) belongs to no tier of this ADR: the right
  answer is to delete the project plumbing entirely, not to pick a tier for
  it. Check the manager's data model before assuming an ambient read implies a
  project-scoped resource.

## Route-derived project context (`useIsProjectAgnosticPage`)

`react/src/hooks/useIsProjectAgnosticPage.ts` re-exports
`PROJECT_AGNOSTIC_MENU_KEYS` (defined in
`react/src/helper/projectAgnosticRoutes.ts`) and exposes a hook that reports
whether the current route is one of the project-agnostic pages — keyed off
the deepest route `handle.menuKey`, with a pathname fallback for legacy
unprefixed paths.

```
admin-session  admin-deployments  admin-data  credential  environment
resource-policy  reservoir        scheduler   agent       project
settings       maintenance        diagnostics rbac        branding
information
```

Excluded: `admin-dashboard` only (out of scope — the page is unused and still
reads the ambient project directly).

Who may call it:

- **Pages** (e.g. `DeploymentDetailPage`, which serves three URL spaces from
  one component) — pages are the sanctioned ambient readers, and a
  route-scope check at page level is just another page-level input.
- **Globally-mounted components with no page parent** (e.g.
  `FolderExplorerModalV2`, mounted once at the router root) — they cannot
  receive a `project` prop from any page, so consulting the route is their
  only correct signal. This is the single sanctioned exception.

Converted **leaf components must NOT call it** — they receive the decision
via their required `project` prop. A leaf that consults the route
reintroduces the invisible-global failure mode this ADR exists to remove.

## How to comply (checklist for new/converted components)

1. Add `project: ProjectContextOrNull` as a **required** prop (import from
   `react/src/types/projectContext.ts`).
2. Delete every `useCurrentProjectValue` import/read inside the component.
3. Implement the `null` behavior for your tier (selector / disabled /
   suppressed).
4. Key any project-name-based gating off the passed (or in-modal chosen)
   project, never the ambient one.
5. At general call sites, read the ambient project at page level and pass
   `project={toProjectContext(currentProject)}`.
6. Add contract tests: (a) `project` given → no embedded selector, mutation
   variables carry exactly that project; (b) `null` → tier-specific behavior
   rendered. Test external behavior only (props in, rendered output +
   mutation variables out) — never which hooks are called.
