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
- **Prefer "no null state" over the Modal tier when the surface that can
  reach the component is itself always project-scoped.** The in-modal
  selector exists for components an oversight surface can legitimately open
  without a project. When creation is offered *only* from project-scoped
  menus, `null` is not a reachable state and modelling it invites a silent
  wrong-project path plus dead selector UI. In that case make the prop a
  non-null `ProjectContext` — expressed as a props union when the same
  component also serves a mode that needs no project — and have the page that
  lacks a project decline to offer the action instead. FR-3410 applied this
  to both deployment-creation modals; see below.

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
- First application: `FolderCreateModalV2` (FR-3408) — Modal tier, with the
  in-modal selector for `null`.
- Second application (FR-3410), all three of which turned out **not** to need
  the Modal tier, because a deployment is always created inside one project
  and creation is offered only from project-scoped menus:
  - `DeploymentSettingModal` — props union: an edit-only call site passes a
    non-null `deploymentFrgmt` and no `project` at all; a project-scoped call
    site must pass a non-null `project`. No in-modal selector, and no
    "missing project" error path to reach.
  - `VFolderDeployModal` — required non-null `project`, taken from the page.
    The folder's own owning project is deliberately not consulted: a
    mismatch between the two on a project-type folder is a reporting concern
    (a possible future non-blocking alert), not a targeting one. A page
    without a project context does not offer the deploy action at all.
  - `AdminModelCardSettingModal` — model cards are created only in the
    resolved model-store project; the ambient fallback was deleted.
- Subsequent tickets convert session-launch buttons and mismatch alerts
  (FR-3411/3412), then hide the header selector per admin route.

## How to comply (checklist for new/converted components)

1. Decide first whether `null` is reachable at all. Enumerate the surfaces
   that can open the component: if every one of them is project-scoped, take
   a **non-null `project: ProjectContext`** (a props union if the component
   also serves a project-less mode) and skip to step 2. Otherwise add
   `project: ProjectContextOrNull` as a **required** prop. Both import from
   `react/src/types/projectContext.ts`.
2. Delete every `useCurrentProjectValue` import/read inside the component.
3. If you kept `ProjectContextOrNull`, implement the `null` behavior for your
   tier (selector / disabled / suppressed). If you took a non-null project,
   make the surface that lacks one stop offering the action instead — never
   add a runtime "no project" error path that the types already exclude.
4. Key any project-name-based gating off the passed (or in-modal chosen)
   project, never the ambient one.
5. At general call sites, read the ambient project at page level and pass
   `project={toProjectContext(currentProject)}`.
6. Add contract tests: (a) `project` given → no embedded selector, mutation
   variables carry exactly that project; (b) if the component accepts `null`,
   that tier-specific behavior is rendered. Test external behavior only
   (props in, rendered output + mutation variables out) — never which hooks
   are called.
