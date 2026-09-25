# BUI Component Home Rule

**A reusable component has one home: `@lablup/ui-common` when it is product
neutral, `backend.ai-ui` (BUI) when it depends on Backend.AI.** Do not create
a BAI-branded component under `react/src/**` when a BUI twin exists or the
component has no host-app dependency.

## Why

The migration-era `react/src/components/astryx-bui/` layer kept host-side
twins of BUI components (`BAIModalAstryx` vs `BAIModal`, …). Two homes meant
every call site picked one by import path, nothing enforced which was
current, and the twins drifted — FR-3518's duplicated copy control was the
worked example. FR-3533 folded the twins onto their BUI originals, promoted
the rest into BUI, and deleted the directory. ADR 0009 then moved the
product-neutral layer one level down, into ui-common, which several Lablup
products share.

## Rules

1. **New product-neutral component → ui-common** (the `lablup/ui-common`
   repository), with Astryx-shaped props and `uic.<Component>.<key>` strings.
   It reaches webui through the next ui-common release (a `vendor/` tarball
   until 0.2.0 is published). Moving an existing BUI component there follows
   the order in FR-4087.
2. **New component that depends on Backend.AI → BUI**
   (`packages/backend.ai-ui/src/components/`) — domain types, Relay fragments,
   `BAIClient`, BUI's i18n keys. Export it from the components barrel and use
   `useBAIi18n()` for strings (keys in `packages/backend.ai-ui/src/locale/`).
3. **When a BUI component moves to ui-common, BUI keeps a same-named `BAI*`
   adapter** that maps the frozen antd-v6 prop vocabulary onto the ui-common
   props (`component-props-extension.md`), so call sites do not change.
4. **A component stays host-side only when it genuinely depends on host-app
   context** — the host router/navigation stack (`WebUILink`,
   `useHasActiveErrorBoundary`), host jotai state, or host `resources/i18n`
   keys that make no sense in a library. `AstryxRouterLink` is the canonical
   example.
5. **Never create a same-named or same-purpose twin** of a ui-common or BUI
   component on the host side. If it lacks a capability, add it where the
   component lives, don't fork it.
6. Relay is not a reason to stay host-side: BUI has its own Relay project
   (`packages/backend.ai-ui/src/__generated__`), and the react project is
   based on it, so host queries can spread BUI fragments.

## Related

- ADR 0009 — `docs/adr/0009-ui-common-as-the-single-entry-point-to-astryx.md`.
- FR-3533 — the consolidation that established this rule.
- `component-props-extension.md` — how BUI wrappers and adapters extend what they wrap.
- `destructive-confirmation.md` — the confirm-tier components, all BUI-homed.
