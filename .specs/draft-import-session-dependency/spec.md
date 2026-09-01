# Session Dependency Display Spec

## Overview

Add dependency visibility features (detail view display, session list column) so that session dependency relationships created by the backend are properly surfaced to users.

## Requirements

### Must Have

- [ ] **R1: Session detail dependency display** -- Add "Depends On" and "Depended By" sections in `SessionDetailContent.tsx` to show session dependency relationships using the `dependees` and `dependents` GraphQL fields (available since Backend.AI v24.09.0).
- [ ] **R2: Session list Dependencies column** -- Add an optional "Dependencies" column in `SessionNodes.tsx` (hidden by default, togglable via table settings) that shows dependency relationships using tooltip-tagged session names.
- [ ] **R3: Backend version gating** -- Register the `session-dependency` feature flag for Backend.AI v24.09.0+ in `backend.ai-client-esm.ts`. Dependency-related UI elements use `@since(version: "24.09.0")` GraphQL directives and `baiClient.supports('session-dependency')` checks.
- [ ] **R4: Support dependencies in session creation API** -- Add `dependencies` field support to `useStartSession` hook and `SessionResources` type, so that callers (current or future) can pass session dependencies when creating sessions.

## User Stories

- As a **user viewing session details**, I want to see "Depends On" and "Depended By" relationships for sessions that have dependencies, so that I understand why sessions are linked.
- As a **user viewing the session list**, I want to optionally enable a "Dependencies" column to see dependency relationships at a glance.

## Acceptance Criteria

- [ ] **AC1:** The session detail view for a session with dependees shows them under "Depends On" with clickable links that navigate to the dependent session's detail.
- [ ] **AC2:** The session detail view for a session with dependents shows them under "Depended on by" with clickable links.
- [ ] **AC3:** The session list has an optional "Dependencies" column (hidden by default) that can be enabled via table settings. It shows dependency tags with tooltips.
- [ ] **AC4:** On backends older than v24.09.0, dependency-related fields are not queried and dependency UI elements are not shown.

## Out of Scope

- **Automatic import-flow session dependency** -- Automatically creating an interactive session that depends on a batch import session is deferred to a future iteration.
- **Backend API changes** -- No changes to the Backend.AI server or GraphQL schema are required.

## Files Affected

| File | Action |
|------|--------|
| `react/src/components/SessionDetailContent.tsx` | Add `dependees`/`dependents` GraphQL fields and display sections |
| `react/src/components/SessionNodes.tsx` | Add optional Dependencies column |
| `react/src/hooks/useStartSession.tsx` | Add `dependencies` field support |
| `react/src/pages/SessionLauncherPage.tsx` | Add `dependencies` to `SessionResources` type |
| `src/lib/backend.ai-client-esm.ts` | Register `session-dependency` feature flag for v24.09.0+ |
| `resources/i18n/*.json` (22 files) | Add new i18n keys for dependency display |

## Related Issues

- FR-1741 (GitHub #4732): Original issue -- set up session dependencies between import batch sessions and interactive sessions
