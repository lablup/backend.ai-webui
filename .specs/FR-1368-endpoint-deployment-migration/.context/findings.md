# FR-1368 Implementation Findings

## Wave 1 (2026-04-22)

### i18n namespace decision (FR-2666)
Per the Jira issue wording (not the spec's modelService.* suggestion), the foundation adds keys under **`deployment.*`** and **`replicaStatus.*`** (flat namespaces).
- 143 keys added to `resources/i18n/en.json`.
- Other 21 languages will be filled via `/fw:i18n` later.
- Downstream: all status tags/form fields/tabs must reference `deployment.*` / `replicaStatus.*`, NOT `modelService.*`.

### Routes decision (FR-2664)
- `/admin-serving/:serviceId` redirects to `/deployments/:serviceId` (shared detail page for admin + user), NOT a separate `/admin-deployments/:serviceId`. Admin list is at `/admin-deployments` only.
- Legacy launcher paths `/service/start` and `/service/update/:endpointId` preserved until FR-2675 launcher lands.
- Stub pages use `'use memo'` directive and render TODO placeholders.

### Menu hook follow-on (FR-2665)
- `StartPage.tsx` had a typed `requiredMenuKey: MenuKeys = 'serving'` that had to be updated to `'deployments'` alongside the hook change (MenuKeys type narrows).

### Graphite quirks (common across Wave 1)
- Worktree `pnpm install` generates `pnpm-lock.worktree-<id>.yaml`. `gt create --all` picks it up → filter it before creating.
- Agent worktree branches are not tracked in Graphite metadata. Run `gt track --parent main` before first `gt submit`.

## PR Index
| Sub-task | PR | Branch |
|----------|----|--------|
| FR-2663 | [#6904](https://github.com/lablup/backend.ai-webui/pull/6904) | 04-22-feat_fr-2663_... |
| FR-2664 | [#6907](https://github.com/lablup/backend.ai-webui/pull/6907) | 04-22-feat_fr-2664_... |
| FR-2665 | [#6905](https://github.com/lablup/backend.ai-webui/pull/6905) | 04-22-feat_fr-2665_... |
| FR-2666 | [#6906](https://github.com/lablup/backend.ai-webui/pull/6906) | 04-22-feat_fr-2666_... |
