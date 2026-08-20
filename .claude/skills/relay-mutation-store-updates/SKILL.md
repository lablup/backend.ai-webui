---
name: relay-mutation-store-updates
description: >
  Use when writing `if (success) updateFetchKey()`, an `onRequestClose`
  handler, or any refetch after a mutation; when a setting modal handles both
  create and update behind one fragment prop; when choosing a mutation's
  response selection set; or when debugging "the list doesn't refresh after
  saving" / "why is it fetching twice". Covers when Relay patches the
  normalized store on its own, and when a refetch is genuinely the right
  answer.
---

# Relay Mutation → Store Updates

The rule this skill exists to enforce:

> **A refetch after an update mutation is a bug, not a refresh.**
> Update mutations should return the changed fields so Relay patches the
> normalized store by `id`. Refetch only when **list membership** changes.

This skill is the detailed treatment: how to tell the cases apart, and what
to do in each.

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
| Same, but a changed field is in the list's **filter/orderBy**        | **Still no refetch — patch the row.** The row may stop matching the active filter, and that is accepted (§7): the user should see the values they just edited on the row they touched, and every list carries a manual refresh (`BAIFetchKeyButton`) for re-evaluating the predicate. |
| Same, but the payload returns only `ok`/`msg` (legacy)               | Keep the refetch and comment why (§4). Nothing to merge.                              |
| **List membership** — a row added or removed (create/delete)         | Refetch the list (§6). Don't patch the connection.                                    |
| Server-derived fields you did not send (computed status, timestamps) | Select those too; refetch only if the server cannot return them (§7).                 |

**Policy inverted during the FR-3378 review (2026-08-20).** The original rule
kept the refetch whenever a changed field overlapped the list's filter/orderBy
(28 of the 33 audited call sites). That eviction-first stance is retired: a row
that no longer matches the active predicate staying visible — showing exactly
what was just edited — is the intended UX, and the manual refresh button is the
sanctioned way to re-run the predicate. Rows under a stale filter are a feature
here, not a leak.

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

If the consumer has no reusable fragment, hand-list every field the UI reads.
Relay keys normalized records by node id, but on types that implement `Node`
the compiler adds `id` to the network operation automatically — writing it
explicitly is a readability convention, not a correctness requirement. The
real gaps are always missing **fields**, not a missing `id`.

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

## 4. Legacy `ok`/`msg` mutations: keep the refetch

A handful of mutations (`ModifyAgent`, `ModifyImage`, `ModifyKeyPair`,
`ModifyScalingGroup`, and the three `Modify*ResourcePolicy`) return only
`ok`/`msg`. There is nothing for Relay to merge, so **keep the refetch and move
on** — that is the accepted answer, not a gap to close. Leave a one-line
comment saying the payload carries no node.

Do not open a migration to their node-returning successors as part of an
unrelated change: it drags in backend version compatibility for little gain.
If you are already rewriting one of these call sites for another reason and a
successor exists (e.g. `ModifyResourcePreset` → `UpdateResourcePresetPayload`),
using it is a bonus, not a requirement.

Writing an `updater` by hand is also possible but rarely worth it. One
component does this today — `react/src/components/AgentSettingModal.tsx`:

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

Its call site (`AgentNodeItems/AgentActionButtons.tsx`) correspondingly does
**not** refetch — it only closes. Leave that one as it is.

If you do write an `updater`, cover only fields you sent and know the server
accepted verbatim. If the server transforms a value, you cannot guess it —
keep the refetch instead.

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
The caller passes that prop, so it can branch on it with no signature change:
`if (success && entityFrgmt === null) refetch()`. Create adds a row the
connection doesn't know about; update has already been patched into the store.

One instance serving both paths:

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
`={null}` — the branch collapses. But run the filter/orderBy check (§1)
before dropping the edit instance's refetch: `AdminUserManagement`'s list
filters on `status` unconditionally and this modal edits `status`, so its
edit path **keeps** the refetch — patching the row would leave it visible on
the wrong status tab under a stale predicate.

If a caller genuinely cannot know, enrich the result rather than lying about
success — `ContainerRegistryEditorModal` already passes
`onOk('create' | 'modify')`.

## 6. Create and delete: refetch

**Refetch the list. Don't patch the connection.**

Connection directives (`@appendEdge`, `@deleteRecord`) look like the tidy
answer, but they break under pagination: appending to a page-sized connection
pushes rows past the cursor boundary, so the client's idea of the list drifts
from the server's. Add sorting and filtering — where the new row's position is
decided server-side — and a client-side insert is simply guessing.

One component uses `@appendEdge` today
(`packages/backend.ai-ui/src/components/fragments/BAIImportArtifactModal.tsx`).
Treat it as an exception that predates this rule, not a pattern to copy.

## 7. When an update may refetch too

Create and delete are settled by §6. An **update** may also legitimately
refetch when:

- ~~A changed field is in the list query's filter or orderBy~~ — **no longer a
  reason to refetch** (policy inverted 2026-08-20, see §1): the patched row
  staying visible under a stale predicate is accepted, because the user should
  see their edit in place and can re-run the filter with the manual refresh.
- The mutation has **side effects on other entities** the payload doesn't cover
  (e.g. changing a resource policy recomputes several users' quotas).
- **Aggregates** shown alongside the list (counts, totals, usage) are computed
  server-side.
- **Bulk mutations** where per-record payloads are impractical.

Leave a one-line reason in these cases. After an update, an unexplained refetch
reads as the anti-pattern.

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
- [ ] No refetch added *because* a changed field is a filter/orderBy property — stale-under-filter is accepted; the manual refresh covers re-evaluation
- [ ] Every update mutation payload selects the fields the UI reads
- [ ] Prefer spreading the consumer's fragment over hand-listing fields
- [ ] Schema checked (`data/schema.graphql`) before concluding a refetch is required
- [ ] Legacy `ok`/`msg`-only mutation → refetch kept, with a comment saying why
- [ ] `success` is passed truthfully; the refetch decision lives at the call site
- [ ] Create/delete refetch the list — no `@appendEdge`/`@deleteRecord` added
- [ ] A refetch after an **update** has a comment naming why the store can't be patched

## Related

- `.specs/FR-3372-refetch-after-mutation/spec.md` — the remediation spec this skill distills
- FR-3170 — the audit epic; FR-3372 — this analysis
