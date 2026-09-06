# BUI Component Home Rule

**`backend.ai-ui` (BUI) is the single home for reusable `BAI*` components.**
Do not create a BAI-branded component under `react/src/**` when a BUI twin
exists or the component has no host-app dependency.

## Why

The migration-era `react/src/components/astryx-bui/` layer kept host-side
twins of BUI components (`BAIModalAstryx` vs `BAIModal`, …). Two homes meant
every call site picked one by import path, nothing enforced which was
current, and the twins drifted — FR-3518's duplicated copy control was the
worked example. FR-3533 folded the twins onto their BUI originals, promoted
the rest into BUI, and deleted the directory.

## Rules

1. **New reusable component → BUI** (`packages/backend.ai-ui/src/components/`),
   exported from the components barrel, using `useBAIi18n()` for strings
   (keys in `packages/backend.ai-ui/src/locale/`).
2. **A component stays host-side only when it genuinely depends on host-app
   context** — the host router/navigation stack (`WebUILink`,
   `useHasActiveErrorBoundary`), host jotai state, or host `resources/i18n`
   keys that make no sense in a library. `AstryxRouterLink` is the canonical
   example.
3. **Never create a same-named or same-purpose twin of a BUI component on the
   host side.** If the BUI component lacks a capability, add it to the BUI
   component (see `component-props-extension.md`), don't fork it.
4. Relay is not a reason to stay host-side: BUI has its own Relay project
   (`packages/backend.ai-ui/src/__generated__`), and the react project is
   based on it, so host queries can spread BUI fragments.

## Related

- FR-3533 — the consolidation that established this rule.
- `component-props-extension.md` — how BUI wrappers extend what they wrap.
- `destructive-confirmation.md` — the confirm-tier components, all BUI-homed.
