# Post-Migration Anti-Pattern Taxonomy

> **Living document.** Updated by the post-lit-cleanup agent and team members during analysis sessions.
> When a pattern turns out to be acceptable, add it to **Exceptions**. When a new pattern is discovered, add a new entry.
>
> Last updated: 2026-02-25

---

## S1: Event-based Communication
**What:** `CustomEvent`, `dispatchEvent`, `addEventListener` for cross-component communication
**Why bad:** Bypasses React's data flow, invisible dependencies, no type safety
**Fix:** Jotai atoms for global state, callback props for parent-child
**Label:** `s1-event`

### Exceptions
- Browser-native events that React doesn't handle (e.g., `beforeunload`, `online`/`offline`) are acceptable
- Events dispatched for non-React consumers (e.g., Electron IPC bridge) are acceptable

---

## S2: Imperative State via useRef
**What:** `useRef` to track state that should trigger re-renders, synced via `useEffect`
**Why bad:** State changes don't cause re-renders, stale closures, unnecessary effects
**Fix:** Replace with `useState` or Jotai atom
**Label:** `s2-imperative-ref`

### Exceptions
- `useRef` for DOM element references is standard React — not an anti-pattern
- `useRef` for values that intentionally should NOT trigger re-renders (e.g., timer IDs, previous-value tracking) is acceptable

---

## S3: Monolithic Components
**What:** 500+ line components with multiple responsibilities
**Why bad:** Hard to test, hard to reuse, hard to understand
**Fix:** Extract sub-components, custom hooks, separate concerns
**Label:** `s3-monolithic`

### Exceptions
- Form components with many fields may legitimately be long if they represent a single cohesive form
- Page-level orchestrator components that compose many fragments can be long

---

## S4: Global Mutable State
**What:** `globalThis.*`, `window.*` property access for state sharing
**Why bad:** No reactivity, race conditions, testing nightmare
**Fix:** Jotai atoms with proper persistence if needed
**Label:** `s4-global-state`

### Exceptions
- `globalThis.isElectron` and similar environment detection flags (read-only) are acceptable
- `backendaioptions` reads during initialization before React tree mounts

---

## S5: Manual Subscription Management
**What:** `addEventListener` / `removeEventListener` in useEffect without proper cleanup
**Why bad:** Memory leaks, stale handlers, missed cleanup on unmount
**Fix:** Proper cleanup returns in useEffect, or use framework abstractions
**Label:** `s5-subscription`

### Exceptions
- Properly paired add/remove in useEffect with cleanup return is correct usage, not an anti-pattern
- Only flagged when cleanup is missing or incorrect

---

## S6: Lifecycle-Mirroring Effects
**What:** `useEffect(() => {...}, [])` that mimics `connectedCallback` with global state setup
**Why bad:** Runs once but accesses mutable globals, timing-dependent, not declarative
**Fix:** Jotai atoms for initialization, suspense for async setup
**Label:** `s6-lifecycle`

### Exceptions
- One-time analytics/tracking initialization is acceptable in `useEffect(() => { ... }, [])`
- Third-party library setup that genuinely needs to run once (e.g., Monaco editor config)

---

## S7: Excessive Prop Forwarding
**What:** 8+ setter callback props passed through component tree
**Why bad:** Prop drilling, tight coupling, refactoring pain
**Fix:** useReducer, React Context, or Jotai for shared state
**Label:** `s7-prop-forwarding`

### Exceptions
- Form components passing Ant Design's Form instance + field handlers — this is the framework's intended pattern
- Components with many props that are all consumed directly (not forwarded deeper)

---

## S8: Direct localStorage
**What:** Module-level localStorage cache, `createLocalStorageCache` singletons
**Why bad:** No reactivity, no SSR support, no cross-tab sync
**Fix:** Jotai atomWithStorage or TanStack Query persistence
**Label:** `s8-localstorage`

### Exceptions
- `useBAISettingUserState` / `useBAISettingGeneralState` already wrap localStorage with Jotai reactivity — usage of these hooks is correct
- One-time reads during initialization (before React tree)

---

## S9: Hardcoded Styling
**What:** Magic numbers, inline z-index, non-token color values, fixed pixel values
**Why bad:** Breaks theming, inconsistent with design system, hard to maintain
**Fix:** Use Ant Design tokens, theme variables, CSS custom properties
**Label:** `s9-styling`

### Exceptions
- Layout-specific pixel values (e.g., sidebar width) that are intentionally fixed
- z-index values that match Ant Design's internal z-index scale

---

## S10: Side-Effect Components
**What:** Components that return `null` but manage side effects (intervals, subscriptions)
**Why bad:** Misleading abstraction — should be a hook, not a component
**Fix:** Extract to custom hook, call from parent
**Label:** `s10-sideeffect-component`

### Exceptions
- Components that conditionally render based on side-effect results (not purely null-returning)
- Error boundary wrappers that appear to "return null" on error

---

## Changelog

| Date | Change | Context |
|------|--------|---------|
| 2026-02-25 | Initial taxonomy created | Lit-to-React migration epic #5364 complete |
| 2026-02-25 | Added exceptions to all categories | Based on team review of initial findings |
| 2026-02-25 | S1: language setting via Jotai atom is the fix, not an exception | FR-2120 triage session |
