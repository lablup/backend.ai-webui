# Session Template Management UI Dev Plan

## Spec Reference
`.specs/session-template-management/spec.md`

## Sub-tasks (Implementation Order)

### 1. SessionTemplate types and useSessionTemplates hook - #5837
- **Changed files**: `react/src/hooks/useSessionTemplates.ts` (new)
- **Dependencies**: None
- **Expected PR size**: M (~150 lines)
- **Description**: Define TypeScript interfaces for the SessionTemplate data model and create a custom hook wrapping the Backend.AI client SDK REST API. The SDK's `SessionTemplate` class only has `list()`, so create/update/delete will use `baiClient.newSignedRequest()` directly with `useTanMutation`. List uses `useTanQuery` with `baiClient.sessionTemplate.list()`.

### 2. SessionTemplateList component with BAITable - #5838
- **Changed files**: `react/src/components/SessionTemplateList.tsx` (new)
- **Dependencies**: Sub-task 1 (#5837 blocks #5838)
- **Expected PR size**: M (~200 lines)
- **Description**: Table component using `BAITable` with columns for Name, ID, Image, Session Type, Resources (via `ResourceNumbersOfSession`), Domain, Project, Owner Email, Created At. No server-side filtering/pagination (backend API returns all templates). Optional client-side name filtering. Delete uses `BAIConfirmModalWithInput` (requires typing template name to confirm, since deletion is irreversible). Prefer BAI components over antd equivalents. Follows `ImageList.tsx` patterns.

### 3. SessionTemplateSettingModal for create/edit - #5839
- **Changed files**: `react/src/components/SessionTemplateSettingModal.tsx` (new)
- **Dependencies**: Sub-task 1 (#5837 blocks #5839)
- **Expected PR size**: L (~300 lines)
- **Description**: BAIModal with Form for creating and editing session templates. Includes domain selector (fetched from `baiClient.domain.list()`), project selector (dependent on domain), user email input, session type selector, image input, and resource allocation inputs with units/steps fetched from server resource slots API (NOT hardcoded — e.g., CPU: 1 core step, fGPU: 0.1 step). Reference Session Launcher for resource allocation UI patterns. Edit mode pre-populates from existing template data. Prefer BAI components over antd equivalents.

### 4. Integrate as new tab in AdminSessionPage - #5840
- **Changed files**: `react/src/pages/AdminSessionPage.tsx`
- **Dependencies**: Sub-task 2 (#5838 blocks #5840), Sub-task 3 (#5839 blocks #5840)
- **Expected PR size**: S (~40 lines)
- **Description**: Add a `session-templates` tab to the existing `AdminSessionPage` (`/admin-session`). The page already uses `nuqs` (`useQueryStates` with `parseAsString`) for URL-persisted tab state, so the new tab is accessible via `/admin-session?tab=session-templates` and survives page refresh. Compose `SessionTemplateList` and `SessionTemplateSettingModal` inside the new tab panel. No new route or menu entry needed — inherits admin-session access control.

### 5. i18n keys for session template UI - #5841
- **Changed files**: `resources/i18n/en.json` + all 22 language files
- **Dependencies**: Sub-task 4 (#5840 blocks #5841)
- **Expected PR size**: M (~100 lines across files)
- **Description**: Add all i18n keys under `sessionTemplate.*` namespace and `webui.menu.SessionTemplates`. Keys cover: page title, column headers, form labels, resource types, action titles, success/error notifications, validation messages. Copy English values to all other language files as fallback.

### 6. E2E Playwright tests for session template CRUD - #5842
- **Changed files**: `e2e/session-template/session-template.spec.ts` (new)
- **Dependencies**: Sub-task 4 (#5840 blocks #5842), Sub-task 5 (#5841 blocks #5842)
- **Expected PR size**: M (~200 lines)
- **Description**: Playwright tests covering: list rendering, create template via form + API verification, edit template + API verification, delete with `BAIConfirmModalWithInput` confirmation + API verification, form validation errors. Uses `loginAsAdmin` utility, cleans up test templates in `afterEach`. Tags: `@regression`, `@session-template`, `@functional`.

## PR Stack Strategy
- Stack 1: #5837 -> #5838 -> #5840 (hook -> list -> page)
- Stack 2: #5837 -> #5839 -> #5840 (hook -> modal -> page, parallel with stack 1 after #5837)
- Stack 3: #5840 -> #5841 -> #5842 (page -> i18n -> e2e, sequential)

## Dependency Graph
```
#5837 (types + hook)
  |--- blocks ---> #5838 (list component)
  |                   |--- blocks ---> #5840 (page + route + menu)
  |--- blocks ---> #5839 (modal component)   |
                      |--- blocks ----------->|
                                              |--- blocks ---> #5841 (i18n)
                                              |                   |--- blocks ---> #5842 (e2e tests)
                                              |--- blocks --------------------------->|
```

## Wave Execution Plan
- **Wave 1**: #5837 (types + hook)
- **Wave 2**: #5838 (list), #5839 (modal) — parallel
- **Wave 3**: #5840 (page + route + menu)
- **Wave 4**: #5841 (i18n)
- **Wave 5**: #5842 (e2e tests)

## Key Implementation Notes

1. **SDK limitation**: The `SessionTemplate` class in `src/lib/backend.ai-client-esm.ts` only has `list()`. For create/update/delete, use `baiClient.newSignedRequest(METHOD, url, body)` and `baiClient._wrapWithPromise(rqst)` directly.

2. **Component priority**: Always prefer BAI package components over antd equivalents (BAIModal > Modal, BAIButton > Button, BAIFlex, BAITable, BAIConfirmModalWithInput, etc.).

3. **No server-side filtering/pagination**: Backend `GET /template/session/` returns all templates with no query param support for filtering or pagination. Only `all` (bool, superadmin) and `group_id` (defined but unused in handler) exist. Client-side filtering by name may be added if needed.

4. **Resource display**: Use `ResourceNumbersOfSession` component (from `SessionLauncherPage`) for displaying resource allocations, NOT raw Tags.

5. **Resource allocation units**: Resource input units/steps must be fetched from the server (resource slots API), NOT hardcoded. CPU: 1 core step, fGPU: 0.1 step, memory: GiB/MiB — but actual values come from backend. Reference Session Launcher UI.

6. **Delete confirmation**: Use `BAIConfirmModalWithInput` (requires typing template name) instead of simple `modal.confirm`, since deletion is irreversible.

7. **Admin-only access**: The tab goes in `AdminSessionPage`, which is only visible to admin and superadmin users. No additional role check needed.

8. **Template payload structure**: The create API expects `template` as a JSON string of an array: `JSON.stringify([templateDetails])`. The update API expects the template object directly.

## Risks
- The SDK `SessionTemplate` class may need extending if direct `newSignedRequest` calls prove problematic with auth/signing. Mitigation: follow EduAppLauncher pattern which also uses direct client calls.
- E2E tests require a running Backend.AI cluster with session template API support. Tests should be skippable if the API is unavailable.
