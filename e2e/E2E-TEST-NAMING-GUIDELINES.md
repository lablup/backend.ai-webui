# E2E Test Naming Guidelines

## Overview

E2E tests should describe **user scenarios** and **user behaviors**, not technical implementations or system states. Test names should read like user stories that anyone (developers, QA, product managers) can understand without technical knowledge of the codebase.

## Guiding Principles

1. **User-Centric**: Focus on what the user does, not what the system does
2. **Action-Oriented**: Describe the action being tested
3. **Context-Aware**: Include relevant conditions or permissions
4. **Clear and Descriptive**: Anyone should understand what's being tested
5. **Consistent**: Follow the same pattern across all tests

## Naming Convention Format

### Test File Names

Use kebab-case with `.spec.ts` extension:

```
feature-name.spec.ts
component-behavior.spec.ts
user-workflow.spec.ts
```

**Examples:**
- ✅ `vfolder-explorer-modal.spec.ts`
- ✅ `session-creation-workflow.spec.ts`
- ✅ `user-settings-management.spec.ts`
- ❌ `vfolder.test.ts` (legacy pattern, avoid for new tests)
- ❌ `VFolderTest.ts` (wrong casing)

### Test Describe Blocks

Format: `[Component/Feature] - [Context/Category]`

```typescript
test.describe.serial('[Component/Feature] - [User Role/Category] Actions', () => {
```

**Examples:**
- ✅ `FolderExplorerModal - User VFolder Access`
- ✅ `SessionLauncher - Resource Allocation Scenarios`
- ✅ `AdminSettings - User Management`
- ❌ `VFolder` (too generic)
- ❌ `Test Suite` (meaningless)

### Individual Test Case Names

Format: `[Actor] can/cannot [action] [when/with/in condition]`

```typescript
test('[Actor] can/cannot [action] [when/with/in condition]', async ({ page }) => {
```

**Key Components:**
- **Actor**: User, Admin, Guest, Manager (based on role)
- **Action Verb**: create, delete, upload, download, view, modify, share, access, etc.
- **Object**: what is being acted upon (file, folder, session, etc.)
- **Condition**: relevant context (with/without permissions, in read-only mode, etc.)

## Good vs. Bad Examples

### ❌ Bad: System/Feature-Focused Names

These names describe system states or features, not user actions:

```typescript
// Bad - Technical implementation focus
test('Limited Permissions - Read Only VFolder', async ({ page }) => {

// Bad - Feature description, not user action
test('VFolder Creation', async ({ page }) => {

// Bad - Too vague
test('Modal Display', async ({ page }) => {

// Bad - Component name only
test('FolderExplorerModal', async ({ page }) => {

// Bad - System state description
test('Valid VFolder with Full Permissions (Read & Write)', async ({ page }) => {
```

### ✅ Good: User-Scenario-Focused Names

These names describe what users do and what they experience:

```typescript
// Good - Clear user action and expectation
test('User can view files but cannot upload to read-only VFolder', async ({ page }) => {

// Good - User scenario with condition
test('User can create a new VFolder with default settings', async ({ page }) => {

// Good - User interaction focus
test('User can open and close VFolder explorer modal', async ({ page }) => {

// Good - Multiple actions in a workflow
test('User can create folders and upload files in VFolder with write permissions', async ({ page }) => {

// Good - Permission-based scenario
test('User sees disabled upload button when accessing read-only VFolder', async ({ page }) => {

// Good - Error scenario
test('User sees error message when accessing non-existent VFolder', async ({ page }) => {

// Good - Admin-specific action
test('Admin can view all users VFolders in the explorer', async ({ page }) => {
```

## Scenario-Based Naming Templates

### Permission-Based Scenarios

```typescript
test('User can [action] in VFolder with [permission level]', async ({ page }) => {
test('User cannot [action] in VFolder with [permission level]', async ({ page }) => {
test('User sees [UI element state] when accessing VFolder with [permission level]', async ({ page }) => {
```

**Examples:**
```typescript
test('User can upload files in VFolder with write permissions', async ({ page }) => {
test('User cannot delete folders in VFolder with read-only permissions', async ({ page }) => {
test('User sees disabled create button when accessing read-only VFolder', async ({ page }) => {
```

### Workflow Scenarios

```typescript
test('User can [action1] and then [action2] in [context]', async ({ page }) => {
test('User completes [workflow name] successfully', async ({ page }) => {
```

**Examples:**
```typescript
test('User can create a VFolder and then upload files to it', async ({ page }) => {
test('User completes session creation workflow with GPU resources', async ({ page }) => {
```

### Error/Edge Case Scenarios

```typescript
test('User sees [error/message] when [error condition]', async ({ page }) => {
test('User is redirected to [location] when [condition]', async ({ page }) => {
```

**Examples:**
```typescript
test('User sees error message when accessing non-existent VFolder', async ({ page }) => {
test('User is redirected to login page when session expires', async ({ page }) => {
test('User receives validation error when creating VFolder with invalid name', async ({ page }) => {
```

### UI Interaction Scenarios

```typescript
test('User can [interact with UI element] to [achieve goal]', async ({ page }) => {
test('User sees [UI feedback] after [action]', async ({ page }) => {
```

**Examples:**
```typescript
test('User can click folder row to open explorer modal', async ({ page }) => {
test('User sees success notification after uploading file', async ({ page }) => {
test('User can use File Browser button to access advanced features', async ({ page }) => {
```

### Verification Scenarios

```typescript
test('User sees [expected data/UI] in [location]', async ({ page }) => {
test('User can verify [information] is displayed correctly', async ({ page }) => {
```

**Examples:**
```typescript
test('User sees folder name and permissions in explorer modal header', async ({ page }) => {
test('User can verify VFolder size and usage in details panel', async ({ page }) => {
```

## Role-Based Naming

Different user roles should be explicitly mentioned:

### User (Default Role)
```typescript
test('User can create personal VFolder', async ({ page }) => {
```

### Admin
```typescript
test('Admin can view all users sessions in the dashboard', async ({ page }) => {
test('Admin can modify resource limits for user groups', async ({ page }) => {
```

### Guest
```typescript
test('Guest cannot access VFolder management page', async ({ page }) => {
```

### Manager
```typescript
test('Manager can approve VFolder sharing requests', async ({ page }) => {
```

## Special Considerations

### Modal/Dialog Tests

Focus on user interaction with the modal:

```typescript
// ✅ Good
test('User can open VFolder explorer modal by clicking folder name', async ({ page }) => {
test('User can close modal using close button', async ({ page }) => {
test('User can close modal using ESC key', async ({ page }) => {

// ❌ Bad
test('Modal opens with correct header', async ({ page }) => {
test('Modal Display and Layout', async ({ page }) => {
```

### List/Table Tests

Focus on what user sees and can do:

```typescript
// ✅ Good
test('User can see all their VFolders in the data page', async ({ page }) => {
test('User can sort VFolder list by creation date', async ({ page }) => {
test('User can filter VFolders by permission type', async ({ page }) => {

// ❌ Bad
test('VFolder List Display', async ({ page }) => {
test('Table Rendering', async ({ page }) => {
```

### Form Tests

Focus on user input and submission:

```typescript
// ✅ Good
test('User can create VFolder by filling out creation form', async ({ page }) => {
test('User sees validation error when submitting empty folder name', async ({ page }) => {

// ❌ Bad
test('Form Validation', async ({ page }) => {
test('Create Form', async ({ page }) => {
```

## Test Structure Best Practices

### 1. Spec Reference Comment

Always include a reference to the test plan at the top of the file:

```typescript
// spec: FeatureName-Test-Plan.md
```

### 2. Step Comments

Use numbered comments to describe each test step in user terms:

```typescript
test('User can upload file to VFolder with write permissions', async ({ page }) => {
  // 1. Navigate to data page
  await navigateTo(page, 'data');

  // 2. Open VFolder explorer for writable folder
  const modal = await openFolderExplorer(page, folderName);

  // 3. Click upload button
  const uploadButton = await modal.getUploadButton();
  await uploadButton.click();

  // 4. Verify file upload dialog appears
  await expect(page.locator('.upload-dialog')).toBeVisible();
});
```

### 3. Helper Function Names

Helper functions should also use user-centric naming:

```typescript
// ✅ Good - Action-based names
const openFolderExplorer = async (page: Page, folderName: string) => {
const loginAsUser = async (page: Page) => {
const createVFolderAndVerify = async (page: Page, name: string) => {

// ❌ Bad - Technical names
const initModal = async (page: Page) => {
const doLogin = async (page: Page) => {
const vfolderCreate = async (page: Page) => {
```

## Common Mistakes to Avoid

### ❌ Avoid Technical Jargon in Test Names

```typescript
// Bad
test('FolderExplorerModal component renders correctly', async ({ page }) => {
test('API call returns 200 status', async ({ page }) => {
test('Redux state updates after action dispatch', async ({ page }) => {

// Good
test('User sees folder details when opening explorer modal', async ({ page }) => {
test('User successfully loads folder list', async ({ page }) => {
test('User sees updated folder name after editing', async ({ page }) => {
```

### ❌ Avoid "Should" Prefix

While grammatically correct, it's redundant in test names:

```typescript
// Acceptable but verbose
test('User should be able to upload files', async ({ page }) => {

// Better - More concise
test('User can upload files to VFolder', async ({ page }) => {
```

### ❌ Avoid Implementation Details

```typescript
// Bad - Mentions implementation
test('GraphQL mutation creates VFolder successfully', async ({ page }) => {
test('React component state updates correctly', async ({ page }) => {

// Good - Focuses on user outcome
test('User creates VFolder successfully', async ({ page }) => {
test('User sees updated folder list after creation', async ({ page }) => {
```

### ❌ Avoid Ambiguous Names

```typescript
// Bad - Too vague
test('Test folder operations', async ({ page }) => {
test('Check permissions', async ({ page }) => {

// Good - Specific and clear
test('User can create, rename, and delete folders in VFolder', async ({ page }) => {
test('User cannot modify files in read-only VFolder', async ({ page }) => {
```

## Migration Guide for Existing Tests

When updating existing tests to follow these guidelines:

1. **Read the test body** to understand what user action is being tested
2. **Identify the actor** (User, Admin, etc.)
3. **Identify the action** (create, delete, view, etc.)
4. **Identify the context** (with permissions, in modal, etc.)
5. **Rewrite the name** using the template: `[Actor] can/cannot [action] [condition]`

### Example Migration

**Before:**
```typescript
test.describe.serial('FolderExplorerModal - VFolder Access and Permissions', () => {
  test('Valid VFolder with Full Permissions (Read & Write)', async ({ page }) => {
    // Test body...
  });

  test('Limited Permissions - Read Only VFolder', async ({ page }) => {
    // Test body...
  });
});
```

**After:**
```typescript
test.describe.serial('FolderExplorerModal - User VFolder Access', () => {
  test('User can create folders and upload files in VFolder with write permissions', async ({ page }) => {
    // Test body...
  });

  test('User can view files but cannot upload to read-only VFolder', async ({ page }) => {
    // Test body...
  });
});
```

## Benefits of User-Scenario Naming

1. **Clarity**: Anyone can understand what's being tested
2. **Documentation**: Test names serve as living documentation
3. **Communication**: Better communication with non-technical stakeholders
4. **Maintenance**: Easier to identify which tests need updating when features change
5. **Test Coverage**: Easier to spot gaps in test coverage
6. **AI Integration**: AI agents can better understand test intent and generate meaningful tests

## Smoke tags

The **`@smoke`** family identifies specs that are part of the post-install smoke
suite run by the `backend.ai-webui-smoke-cli` tool (Epic FR-2871). Smoke specs
are a curated subset of the full e2e suite that a Field-Ops engineer can run
against a freshly installed Backend.AI cluster to verify the WebUI is
functional — within 5–10 minutes, using only one account, against an endpoint
that may be air-gapped.

### Tags

| Tag | Meaning |
|-----|---------|
| `@smoke` | Base smoke set. Included in every run. |
| `@smoke-admin` | Requires admin role. Skipped when running as a regular user. |
| `@smoke-user` | Requires user-level access only. Admin accounts can run these too. |

> `@smoke-any` and `@smoke-extended` are intentionally **not** part of the
> MVP taxonomy. The first turned out unworkable in practice (every e2e
> helper hard-codes a role via `loginAsAdmin` / `loginAsUser`, so no
> describe is genuinely role-agnostic at the helper level), and the second
> requires a `--profile` flag the CLI does not implement yet.

These are **additive metadata** — existing tags (`@critical`, `@regression`,
`@functional`, etc.) are preserved. Existing CI jobs that grep by other tags
are unaffected.

### Rules for smoke specs

A spec is only eligible for an `@smoke*` tag if it satisfies **all** of the
following:

1. **Single account.** The entire `describe` block must run with one logged-in
   account. Specs that call `loginAsUser2`, `loginAsCreatedAccount`, or
   otherwise switch identities mid-test are **not** smoke candidates. (Those
   belong in the full e2e suite.)
2. **Self-cleanup.** Any resource the spec creates (vfolder, session, user)
   must be cleaned up in `afterEach` / `afterAll`, even on failure. Smoke runs
   happen against customer clusters — leftover artifacts are not acceptable.
3. **Bounded runtime.** Each tagged describe must finish in under ~2 minutes,
   so the whole smoke run stays within the 5–10 minute envelope.
4. **No visual regression.** Pixel diffs and screenshot comparisons depend on
   theme and viewport assumptions that vary across customer installs.
   `@smoke*` specs must rely on role/text/data-testid selectors and value
   assertions only.
5. **No outbound dependencies.** Smoke runs on air-gapped hosts. Specs must
   not call `fetch('https://...')` for any host other than the WebUI endpoint
   itself.
6. **Describe-level tags apply to every nested test.** A describe that
   mixes `loginAsAdmin` and `loginAsUser` is **not** taggable as smoke at
   the describe level — split the describe so each one uses a single
   account, then tag only the role-uniform half. This keeps rule 1
   ("single account") consistent with the role tags.

### How to apply

Add the tag to the existing `tag: [...]` array on the outermost
`test.describe` you want to include. Do not replace existing tags.

```typescript
// Before
test.describe(
  'Login',
  { tag: ['@auth', '@functional'] },
  () => { /* ... */ },
);

// After — added @smoke and @smoke-admin (beforeEach uses loginAsAdmin)
test.describe(
  'Login',
  {
    tag: ['@auth', '@functional', '@smoke', '@smoke-admin'],
  },
  () => { /* ... */ },
);
```

A spec without a `tag:` option needs one added — never strip existing tags.

### Coverage targets (MVP)

The initial smoke set covers the highest-signal flows:

- Login / authentication → `@smoke-admin` (`loginAsAdmin`)
- Dashboard render (admin describe only; user-role checks live in a sibling describe without `@smoke*`) → `@smoke-admin`
- VFolder basic CRUD → `@smoke-user`
- Agent list (admin signal) → `@smoke-admin`

Session lifecycle is intentionally **not** in the MVP smoke set: its
scenarios use 240s timeouts and `test.fixme(no agents)` skips, which
violates the bounded-runtime rule. A trimmed-down session smoke
scenario is tracked as a follow-up.

Pick **quality over quantity**: do not tag every spec in a folder. The smoke
suite's value is its short runtime and high signal-to-noise ratio.

## References

- Playwright Best Practices: https://playwright.dev/docs/best-practices
- BDD (Behavior-Driven Development) naming conventions
- User Story format: "As a [role], I can [action] so that [benefit]"
- WebUI Smoke CLI spec: `.specs/FR-2871-webui-smoke-cli/spec.md`

---

**Last Updated**: 2026-05-12
**Applies to**: All E2E tests in `/e2e` directory, especially AI-generated tests using Playwright MCP server
