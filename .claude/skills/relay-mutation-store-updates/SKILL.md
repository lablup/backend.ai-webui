---
name: relay-mutation-store-updates
description: >
  Use when a create/update/delete mutation completes and you must decide
  whether to refetch, when writing an `onRequestClose` handler that calls
  `updateFetchKey()`, when a setting modal handles both create and update
  behind one fragment prop, or when choosing a mutation's response selection
  set. Covers when Relay updates the normalized store automatically, when a
  manual `updater` is required, and when a refetch is genuinely the right
  answer. Related: FR-3372, FR-3170.
---

# Relay Mutation → Store Updates

The rule this skill exists to enforce:

> **A refetch after an update mutation is a bug, not a refresh.**
> Update mutations should return the changed fields so Relay updates the
> normalized store by `id`. Refetch only when **list membership** changes.

## Activation Triggers

- Writing or reviewing `onRequestClose={(success) => { if (success) updateFetchKey(); }}`
- A modal takes a nullable `*Frgmt` prop and branches create vs update inside
- Choosing the selection set of a `mutation` payload
- "The list doesn't refresh after saving" / "why is it fetching twice?"

## 1. The decision table

Ask **what changed**, not **did it succeed**.

| What the mutation changed                                             | Does the store need help? | What to do                                                                            |
| --------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------- |
| **Fields of an entity already in the store** (update)                 | No — if you select them   | Select the changed fields on the returned node. Relay merges by `id`. **No refetch.** |
| Fields of an entity, but the payload returns only `ok`/`msg` (legacy) | Yes                       | Hand-write `updater:` (see §4). **No refetch.**                                       |
| **List membership** — a new row (create)                              | Yes                       | `@appendEdge`/`@prependEdge` on the connection, or refetch the list.                  |
| **List membership** — a row removed (delete/purge)                    | Yes                       | `@deleteRecord`/`@deleteEdge`, or refetch the list.                                   |
| Server-derived fields you did not send (computed status, timestamps)  | Yes                       | Select those fields too; refetch only if the server cannot return them.               |

**Success is not the question.** `if (success) refetch()` conflates "the request
worked" with "the cache is stale". Those are different facts.

## 2. Update: fill the selection set

An update mutation must return the entity **and** every field the calling UI
reads that the mutation could have changed. Relay then merges the payload into
the normalized record by `id` — every component holding that fragment
re-renders, with zero extra network traffic.

```graphql
# ❌ Wrong — payload carries no data, so the store is stale
# and the caller is forced to refetch the whole list.
mutation UserSettingModalMutation($email: String!, $props: ModifyUserInput!) {
  modify_user(email: $email, props: $props) {
    ok
    msg
  }
}
```

```graphql
# ✅ Correct — the changed fields come back; Relay merges them by id.
mutation UserSettingModalMutation($email: String!, $props: ModifyUserInput!) {
  modify_user(email: $email, props: $props) {
    ok
    msg
    user {
      id # REQUIRED — without id Relay cannot merge into the record
      username
      full_name
      status
      role
      description
    }
  }
}
```

`id` is mandatory. Relay keys normalized records by the node id; a payload
without it is written to a detached record and merged nowhere.

Real example of getting this wrong —
`react/src/components/AutoScalingRuleEditorModalLegacy.tsx:136`:

```graphql
modify_endpoint_auto_scaling_rule_node(id: $id, props: $props) {
  ok
  msg
  rule {
    # ← no `id`!  Every field below is fetched over the wire
    metric_name
    metric_source
    threshold
    # …
  }
}
```

This pays the full network cost of returning the node and still cannot update
the UI. Adding one line (`id`) makes the whole payload useful.

**Best form** — spread the fragment the UI actually reads, so the selection set
can never drift out of sync with the component:

```graphql
mutation UserSettingModalMutation($email: String!, $props: ModifyUserInput!) {
  modify_user(email: $email, props: $props) {
    ok
    msg
    user {
      id
      ...UserNodes_user # the same fragment the list row renders
    }
  }
}
```

### The working precedent in this repo

`react/src/components/UserSettingModal.tsx` already does this correctly, and is
the model to copy. Its update mutation returns the node with every field the UI
reads (`:228-265`):

```graphql
mutation UserSettingModalUpdateMutation(
  $userId: UUID!
  $input: UpdateUserV2Input!
) {
  adminUpdateUserV2(userId: $userId, input: $input) {
    user {
      id
      basicInfo {
        email
        fullName
        username
        description
        integrationName
      }
      organization {
        domainName
        role
        resourcePolicy
        mainAccessKey
      }
      status {
        status
        statusInfo
        needPasswordChange
      }
      # …
    }
  }
}
```

…so the update path deliberately closes **without** asking for a refetch
(`:468`):

```tsx
message.success(t("environment.SuccessfullyModified"));
onRequestClose(false); // store already patched — nothing for the list to do
```

while the **create** path passes `true`, because a new row appeared that the
connection doesn't know about. Same modal, same prop, two different exits.

### ⚠️ Partial coverage is worse than refetching

Dropping the refetch is only safe if the payload covers **every field the UI
reads that the mutation could change**. A partial selection set gives you the
worst of both: no refetch _and_ no store update.

The same `UserSettingModal` demonstrates the trap. It **sends** `groupIds`
(`:448`) and its fragment **reads** `projects { edges { node { id } } }`
(`:213`) — but the mutation payload never selects `projects`. Combined with
`onRequestClose(false)`, changing a user's project membership succeeds on the
server and leaves the UI showing the old projects until a manual refresh.

Before removing a refetch, diff the two lists:

1. Fields the component's fragment reads.
2. Fields the mutation payload returns.

Anything in (1) that the mutation input can change and (2) omits is a stale-UI
bug. Add it to the selection set — or keep the refetch and say why.

This is exactly why spreading the consumer's fragment beats hand-listing
fields: the compiler keeps the two lists in sync for you.

## 3. Is the node even available? Check the schema first

Most of this backend already returns the node — the frontend just isn't asking
for it. In `data/schema.graphql`:

- **41 of 50** update-class payloads (`Modify*` / `Update*`) return the entity
  (`ModifyUser → user`, `UpdateResourcePresetPayload → resourcePreset`, …).
- **9** return only `ok`/`msg` and cannot auto-update:

  `ModifyAgent`, `ModifyImage`, `ModifyKeyPair`, `ModifyKeyPairResourcePolicy`,
  `ModifyProjectResourcePolicy`, `ModifyResourcePreset`, `ModifyScalingGroup`,
  `ModifyUserResourcePolicy`, `UpdateContainerRegistryQuota`

Several of those 9 already have node-returning successors — prefer the newer
mutation when the backend version allows it:

| Legacy (`ok`/`msg` only)      | Modern replacement (returns node)    |
| ----------------------------- | ------------------------------------ |
| `ModifyKeyPairResourcePolicy` | `UpdateKeypairResourcePolicyPayload` |
| `ModifyProjectResourcePolicy` | `UpdateProjectResourcePolicyPayload` |
| `ModifyUserResourcePolicy`    | `UpdateUserResourcePolicyPayload`    |
| `ModifyResourcePreset`        | `UpdateResourcePresetPayload`        |
| `ModifyScalingGroup`          | `UpdateResourceGroupPayload`         |

Before adding a refetch, grep the payload type in `data/schema.graphql`. If it
has a node field, there is no excuse for a refetch.

## 4. Legacy `ok`/`msg` mutations: write an `updater`

When the payload genuinely cannot return the node, write the store update by
hand. This is still cheaper and more correct than refetching a whole list.

Reference implementation — `react/src/components/AgentSettingModal.tsx`:

```tsx
commitModifyAgentSetting({
  variables: { id: toLocalId(agent?.id ?? ''), props: { ... } },
  updater: (store) => {
    const agentRecord = store.get(agent?.id || '');
    if (agentRecord) {
      agentRecord.setValue(values.schedulable, 'schedulable');
      if (baiClient?.supports('admin-resource-group-select')) {
        agentRecord.setValue(values.scaling_group, 'scaling_group');
      }
    }
  },
  onCompleted(res, errors) { ... },
});
```

Its call site (`AgentNodeItems/AgentActionButtons.tsx`) correctly does **not**
refetch — it only closes:

```tsx
<AgentSettingModal
  agentNodeFrgmt={agent}
  open={openSettingModal}
  onRequestClose={() => setOpenSettingModal(false)}
/>
```

Write the `updater` **only** for fields you sent and know the server accepted
verbatim. If the server transforms a value, select it instead of guessing.

## 5. `onRequestClose` — redefine the flag as "list changed", not "succeeded"

The project convention is a single `onRequestClose(result?)` callback
(see `react-modal-drawer`). Keep the shape; fix the **meaning**.

```tsx
// ❌ Wrong — "it worked" is treated as "the cache is stale".
// Every successful edit refetches the entire list.
onRequestClose={(success) => {
  if (success) updateFetchKey();
  setOpen(false);
}}
```

```tsx
// ✅ Correct — the modal reports whether LIST MEMBERSHIP changed.
// Update path resolves via the store and never reaches updateFetchKey().
onRequestClose={(listChanged) => {
  if (listChanged) updateFetchKey();
  setOpen(false);
}}
```

Inside a modal that handles both create and update behind one nullable
fragment prop, the two paths must close differently:

```tsx
const isEditMode = !!entityFrgmt;

// update → store already merged the payload; nothing for the list to do
onCompleted: () => onRequestClose();

// create → a new row exists that the connection doesn't know about
onCompleted: () => onRequestClose(true);
```

If a modal has both paths, do not let them share one `onRequestClose(true)`
exit. That single line is the whole bug this skill exists to prevent.

## 6. Create: prefer connection directives over refetch

A refetch after create is _acceptable_ but still coarse. When the list is a
Relay connection, declare the insert instead:

```graphql
mutation ImportArtifactMutation($connectionIds: [ID!]!, ...) {
  importArtifact(...) {
    edges @appendEdge(connections: $connectionIds) {
      node { id ...ArtifactRow_artifact }
    }
  }
}
```

See `packages/backend.ai-ui/src/components/fragments/BAIImportArtifactModal.tsx`
for the working example. Note that filtering, sorting, and pagination can make
a naive append wrong — when the new row's position depends on server-side
ordering, a refetch is the honest choice. Say so in a comment rather than
leaving it ambiguous.

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

## Review Checklist

- [ ] No `if (success) updateFetchKey()` where the mutation was an **update**
- [ ] Every update mutation payload selects `id` plus the fields the UI reads
- [ ] Prefer spreading the consumer's fragment over hand-listing fields
- [ ] Schema checked (`data/schema.graphql`) before concluding a refetch is required
- [ ] Legacy `ok`/`msg`-only mutation → `updater:` written, not a refetch
- [ ] Create/update modals do not share one `onRequestClose(true)` exit
- [ ] Any surviving refetch has a comment naming why the store can't be patched

## Related

- `relay-patterns` — fragment architecture and naming conventions
- `react-modal-drawer` — the `onRequestClose` convention this skill refines
- `react-suspense-fetching` — `fetchKey` / `useUpdatableState` refresh primitive
- FR-3170 — the audit epic; FR-3372 — this analysis
