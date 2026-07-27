---
name: relay-mutation-store-updates
description: >
  Use when writing `if (success) updateFetchKey()`, an `onRequestClose`
  handler, or any refetch after a mutation; when a setting modal handles both
  create and update behind one fragment prop; when choosing a mutation's
  response selection set; or when debugging "the list doesn't refresh after
  saving" / "why is it fetching twice". Covers when Relay patches the
  normalized store on its own, when a manual `updater` is required, and when
  a refetch is genuinely right.
---

# Relay Mutation → Store Updates

The rule this skill exists to enforce:

> **A refetch after an update mutation is a bug, not a refresh.**
> Update mutations should return the changed fields so Relay patches the
> normalized store by `id`. Refetch only when **list membership** changes.

`react-async-actions` §6 states the same hierarchy in brief. This skill is the
detailed treatment: how to tell the cases apart, and what to do in each.

## Activation Triggers

- Writing or reviewing `onRequestClose={(success) => { if (success) updateFetchKey(); }}`
- A modal takes a nullable `*Frgmt` prop and branches create vs update inside
- Choosing the selection set of a `mutation` payload
- "The list doesn't refresh after saving" / "why is it fetching twice?"

## 1. The decision table

Ask **what changed**, not **did it succeed**.

| What the mutation changed                                            | What to do                                                                            |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Fields of an entity already in the store** (update)                | Select the changed fields on the returned node. Relay merges by `id`. **No refetch.** |
| Same, but the payload returns only `ok`/`msg` (legacy)               | Hand-write `updater:` (§4). **No refetch.**                                           |
| **List membership** — a row added (create)                           | `@appendEdge`/`@prependEdge` on the connection, or refetch the list (§6).             |
| **List membership** — a row removed (delete/purge)                   | `@deleteRecord`/`@deleteEdge`, or refetch the list.                                   |
| Server-derived fields you did not send (computed status, timestamps) | Select those too; refetch only if the server cannot return them (§7).                 |

## 2. Update: fill the selection set

An update mutation must return the entity **and** every field the calling UI
reads that the mutation could have changed. Relay merges the payload into the
normalized record by `id`, and every component holding that fragment
re-renders — with no extra network traffic.

```graphql
# ❌ Payload carries no data, so the store goes stale
# and the caller is forced to requery the whole list.
modify_user(email: $email, props: $props) {
  ok
  msg
}
```

```graphql
# ✅ Spread the fragment the UI actually reads, so the selection set
# cannot drift out of sync with the component.
modify_user(email: $email, props: $props) {
  ok
  msg
  user {
    id
    ...YourListRow_user # ← the fragment your list row already renders
  }
}
```

If the consumer has no reusable fragment, hand-list every field the UI reads —
including `id`. **`id` is mandatory**: Relay keys normalized records by node id,
so a payload without it is written to a detached record and merged nowhere.
`AutoScalingRuleEditorModalLegacy.tsx` gets this wrong — it returns all eight
`rule` fields but omits `id`, paying full network cost for zero store update.

### ⚠️ Partial coverage is worse than refetching

Dropping the refetch is only safe if the payload covers **every field the UI
reads that the mutation could change**. A partial selection set gives you the
worst of both: no refetch _and_ no store update.

`UserSettingModal` demonstrates the trap. It **sends** `groupIds` and its
fragment **reads** `projects { edges { node { id } } }`, but the mutation
payload never selects `projects` — and the update path skips the refetch.
Changing a user's project membership succeeds on the server and leaves the UI
showing the old projects until a manual refresh.

Before removing a refetch, diff the two lists:

1. Fields the component's fragment reads.
2. Fields the mutation payload returns.

Anything in (1) that the mutation input can change and (2) omits is a stale-UI
bug. Add it to the selection set — or keep the refetch and say why.

## 3. Is the node even available? Check the schema first

Most of this backend already returns the node; the frontend just isn't asking
for it. Before concluding a refetch is required, grep the payload type in
`data/schema.graphql` — if it has a node field, there is no excuse.

A handful of legacy mutations return only `ok`/`msg`. Several already have
node-returning successors — prefer the newer one when the backend version
allows it:

| Legacy (`ok`/`msg` only)      | Modern replacement (returns node)    |
| ----------------------------- | ------------------------------------ |
| `ModifyKeyPairResourcePolicy` | `UpdateKeypairResourcePolicyPayload` |
| `ModifyProjectResourcePolicy` | `UpdateProjectResourcePolicyPayload` |
| `ModifyUserResourcePolicy`    | `UpdateUserResourcePolicyPayload`    |
| `ModifyResourcePreset`        | `UpdateResourcePresetPayload`        |
| `ModifyScalingGroup`          | `UpdateResourceGroupPayload`         |

`ModifyAgent`, `ModifyImage`, and `ModifyKeyPair` have no successor — use §4.

## 4. Legacy `ok`/`msg` mutations: write an `updater`

When the payload genuinely cannot return the node, write the store update by
hand. Still cheaper and more correct than requerying a whole list.

Reference implementation — `react/src/components/AgentSettingModal.tsx`:

```tsx
commitModifyAgentSetting({
  variables: { id: toLocalId(agent?.id ?? ""), props: { ... } },
  updater: (store) => {
    const agentRecord = store.get(agent?.id || "");
    if (agentRecord) {
      agentRecord.setValue(values.schedulable, "schedulable");
      if (baiClient?.supports("admin-resource-group-select")) {
        agentRecord.setValue(values.scaling_group, "scaling_group");
      }
    }
  },
  onCompleted(res, errors) { ... },
});
```

Its call site (`AgentNodeItems/AgentActionButtons.tsx`) correctly does **not**
refetch — it only closes.

Write the `updater` only for fields you sent and know the server accepted
verbatim. If the server transforms a value, select it instead of guessing.

## 5. Keep `success` honest — decide the refetch at the call site

`onRequestClose(success: boolean)` means **the mutation succeeded**. Pass it
truthfully.

Do **not** pass `false` after a successful update to suppress a refetch.
`false` already means "cancelled", so overloading it makes the two
indistinguishable to the caller — anything the caller later wants to do on
success (a toast, clearing a selection, closing a drawer) silently stops
firing after updates. `UserSettingModal` currently does this; it is a bug to
copy from, not a pattern.

**The fragment prop is the discriminator.** A setting modal that handles both
paths takes a nullable `*Frgmt` — null means create, non-null means update.
That prop is passed by the caller, so the caller can branch on it without any
signature change:

```tsx
onRequestClose={(success) => {
  if (success && entityFrgmt === null) {
    refetch();   // create → a new row exists; update → the store is already patched
  }
  // …close/reset state
}}
```

Applied to a real call site — one instance serving both paths:

```tsx
<ResourcePresetSettingModal
  resourcePresetFrgmt={editingResourcePreset}
  open={!!editingResourcePreset || isCreating}
  onRequestClose={(success) => {
    // read the fragment BEFORE the resets below; the handler closes over the
    // render-time value, so check first and reset after.
    if (success && !editingResourcePreset) {
      startRefetchTransition(() => updateResourcePresetsFetchKey());
    }
    setEditingResourcePreset(null);
    setIsCreating(false);
  }}
/>
```

When the caller renders **separate instances** for create and edit — as
`AdminUserManagement` does with `userSettingFrgmt={selectedUser}` and
`={null}` — the branch collapses: the edit instance simply never refetches.

```tsx
<UserSettingModal
  userSettingFrgmt={selectedUserForSettingModal}
  onRequestClose={() => {
    setSelectedUserForSettingModal(null);
    // no refetch: the update mutation returns the node and Relay patches it
  }}
/>
```

If a caller genuinely cannot know, enrich the result rather than lying about
success — `ContainerRegistryEditorModal` already passes
`onOk('create' | 'modify')`.

## 6. Create: prefer connection directives over refetch

A refetch after create is acceptable but coarse. When the list is a Relay
connection, declare the insert instead:

```graphql
artifactRevisions {
  edges @appendEdge(connections: $connectionIds) {
    node {
      id # required here too — the new record must be identifiable
      status
    }
  }
}
```

See `packages/backend.ai-ui/src/components/fragments/BAIImportArtifactModal.tsx`
for the working example. Filtering, sorting, and pagination can make a naive
append wrong — when the new row's position depends on server-side ordering, a
refetch is the honest choice. Say so in a comment rather than leaving it
ambiguous.

## 7. When a refetch IS correct

Do not over-rotate. Refetch when:

- **List membership changed** and the connection cannot be patched correctly
  (server-side ordering/filtering decides position).
- The mutation has **side effects on other entities** the payload doesn't cover
  (e.g. changing a resource policy recomputes several users' quotas).
- **Aggregates** shown alongside the list (counts, totals, usage) are computed
  server-side.
- **Bulk mutations** where per-record payloads are impractical.

In each case, leave a one-line comment naming the reason. An unexplained
refetch reads as the anti-pattern.

## Enforcement

There is none — this skill and code review are the only guardrail, across ~149
`updateFetchKey()` call sites in `react/src`. A lint rule was considered and
deliberately left out of scope (FR-3372). If that decision is revisited, the
landing spot already exists: `react/eslint.config.js` uses `no-restricted-syntax`
with an AST selector for the CSP `<style>` ban, and the
`onRequestClose={(success) => { if (success) updateFetchKey(); }}` shape is
matchable the same way.

## Review Checklist

- [ ] No `if (success) updateFetchKey()` where the mutation was an **update**
- [ ] Every update mutation payload selects `id` plus the fields the UI reads
- [ ] Prefer spreading the consumer's fragment over hand-listing fields
- [ ] Schema checked (`data/schema.graphql`) before concluding a refetch is required
- [ ] Legacy `ok`/`msg`-only mutation → `updater:` written, not a refetch
- [ ] `success` is passed truthfully; the refetch decision lives at the call site
- [ ] Any surviving refetch has a comment naming why the store can't be patched

## Related

- `react-async-actions` — §6 refetch hierarchy; this skill is its detailed form
- `relay-patterns` — fragment architecture and naming conventions
- `react-modal-drawer` — the `onRequestClose` convention
- `react-suspense-fetching` — `fetchKey` / `useFetchKey` refresh primitive
- FR-3170 — the audit epic; FR-3372 — this analysis
