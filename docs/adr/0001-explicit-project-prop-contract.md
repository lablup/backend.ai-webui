# ADR-0001: Explicit project prop contract for leaf components

- Status: Accepted
- Date: 2026-07-29
- Issues: FR-3407 (epic), FR-3408 (first application)

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
    the context via `useIsSuperAdminScopedPage()`: `null` on the admin URL
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

  Remaining follow-up (FR-3414): hide the header selector per admin route.

## Route-derived project context (`useIsSuperAdminScopedPage`)

`react/src/hooks/useIsSuperAdminScopedPage.ts` exposes
`SUPER_ADMIN_SCOPED_MENU_KEYS = ['admin-session', 'admin-deployments',
'admin-data']` and a hook that reports whether the current route is one of
the three super-admin-scoped pages (keyed off the deepest route
`handle.menuKey`, with a pathname fallback for legacy unprefixed paths).

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
