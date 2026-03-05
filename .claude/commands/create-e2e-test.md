---
description: Create E2E tests for a feature or page using Playwright. Leverages existing POM classes, test utilities, and project conventions.
argument-hint: <feature-description or page-path>
---

# Create E2E Test

Create comprehensive Playwright E2E tests for: `$ARGUMENTS`

## Process

### 1. Understand the Target

Analyze what needs to be tested:
- If `$ARGUMENTS` is a page path (e.g., `/data`, `/session`), test that page's features
- If `$ARGUMENTS` is a feature description (e.g., "file upload in vfolder"), test that specific feature
- If `$ARGUMENTS` is a component name, find the component and test its user-facing behavior

### 2. Research Phase

Use the Explore agent to gather context:

```
Task({
  subagent_type: "Explore",
  prompt: "Research for E2E test creation..."
})
```

Research these areas in parallel:

**a) Existing E2E tests** — Find related tests to understand patterns:
- `e2e/**/*.spec.ts` — existing test files for the same feature area
- `e2e/utils/classes/` — available Page Object Model classes
- `e2e/utils/test-util.ts` — available helper functions (login, navigation, CRUD)
- `e2e/utils/test-util-antd.ts` — Ant Design helper functions

**b) Source code** — Understand what the feature does:
- React components implementing the feature
- UI elements (buttons, modals, forms, tables) and their labels/roles
- API calls and data flow
- i18n keys (to understand button/label text)

**c) Project conventions** — Read these files:
- `.github/instructions/e2e.instructions.md` — E2E writing guidelines
- `e2e/E2E-TEST-NAMING-GUIDELINES.md` — naming conventions
- `playwright.config.ts` — Playwright configuration

### 3. Plan the Test

Use the `playwright-test-planner` agent to create a structured test plan:

```
Task({
  subagent_type: "playwright-test-planner",
  prompt: "Create test plan for [feature]..."
})
```

The test plan must follow these conventions:

#### File Organization
- **Test file**: `e2e/{feature-domain}/{feature-action}.spec.ts`
  - Use kebab-case for file names
  - Group by feature domain: `auth/`, `vfolder/`, `session/`, `user/`, `config/`, etc.

#### Naming Conventions
- **describe blocks**: `[Feature] - [Context]` (e.g., `'File Creation in VFolder Explorer'`)
- **test names**: User-centric action format:
  - `User can [action] [when/with condition]`
  - `User cannot [action] [when/with condition]`

#### Tags
Every `test.describe` must include tags:
- Priority: `@smoke` (core paths), `@critical` (important), `@regression` (full)
- Feature: `@auth`, `@vfolder`, `@session`, `@user`, `@config`, etc.
- Type: `@functional`, `@visual`, `@integration`

#### Test Structure
```typescript
test.describe('Feature Name', { tag: ['@critical', '@feature', '@functional'] }, () => {
  test.beforeAll(async ({ browser, request }) => {
    // Setup: create test data
  });

  test.beforeEach(async ({ page, request }) => {
    await loginAsUser(page, request);  // or loginAsAdmin
  });

  test.afterAll(async ({ browser, request }) => {
    // Cleanup: delete test data
  });

  test('User can do something', async ({ page }) => {
    // 1. Navigate
    // 2. Perform action
    // 3. Assert result
  });
});
```

### 4. Create or Update Page Object Models

If needed, create or update POM classes in `e2e/utils/classes/`:

```typescript
// e2e/utils/classes/{domain}/{ClassName}.ts
import { expect, Locator, Page } from '@playwright/test';

export class ClassName {
  private readonly page: Page;
  private readonly modal: Locator; // if modal-based

  constructor(page: Page) {
    this.page = page;
    this.modal = page.getByRole('dialog').first();
  }

  // Methods for common interactions
  async waitForOpen(): Promise<void> { ... }
  async close(): Promise<void> { ... }
  async getButton(name: string): Promise<Locator> { ... }
  async verifyVisible(text: string): Promise<void> { ... }
}
```

**POM Guidelines:**
- Use semantic selectors (role-based, label-based)
- Return `Locator` objects so tests can add their own assertions
- Include `waitFor` methods for async content
- Keep methods focused on single interactions

### 5. Write the Tests

Write the test file following these rules:

**Imports:**
```typescript
import { SomePOM } from '../utils/classes/domain/SomePOM';
import {
  loginAsUser,
  navigateTo,
  createVFolderAndVerify,
  // ... other needed utilities
} from '../utils/test-util';
import { test, expect, Page } from '@playwright/test';
```

**Key patterns to follow:**
- Use `test.describe.serial()` when tests must run in order
- Use `test.describe()` (parallel) when tests are independent
- Always clean up created resources in `afterAll` or `afterEach`
- Use unique names with timestamps: `'e2e-test-' + new Date().getTime()`
- Trust Playwright auto-waiting — avoid `waitForTimeout`
- Use `{ force: true }` on click only when elements may be covered

**Available helper functions:**
- `loginAsUser(page, request)` / `loginAsAdmin(page, request)`
- `navigateTo(page, 'data')` — navigate to internal routes
- `createVFolderAndVerify(page, name, mode?, type?, permission?)`
- `moveToTrashAndVerify(page, name)` / `deleteForeverAndVerifyFromTrash(page, name)`
- `modifyConfigToml(page, request, config)` — modify app config

### 6. Validate

Run these checks:

```bash
# List tests to verify they're recognized
npx playwright test --list e2e/{path-to-test}.spec.ts

# Format
npx prettier --write e2e/{path-to-test}.spec.ts
```

### 7. Update Coverage Report

Update `e2e/E2E_COVERAGE_REPORT.md`:
- Add test file references to the relevant page section
- Update feature coverage status (❌ → ✅)
- Recalculate coverage percentages in the summary table
- Update the "Last Updated" date

### 8. Present Results

Show a summary:

```
## E2E Test Created

### Test File
- `e2e/{domain}/{name}.spec.ts` — {N} test cases

### Page Object Models
- `e2e/utils/classes/{domain}/{Class}.ts` — {new/updated}

### Test Cases
1. User can [action 1]
2. User can [action 2]
3. User cannot [action 3]
...

### Tags
@{priority} @{feature} @{type}

### To Run
npx playwright test e2e/{domain}/{name}.spec.ts
npx playwright test e2e/{domain}/{name}.spec.ts --headed  # with browser
```

## Important Rules

- **Selectors**: Prefer `getByRole()` > `getByLabel()` > `getByTestId()` > `getByText()` > CSS selectors
- **No `waitForTimeout`**: Use explicit waits (`waitForSelector`, `waitFor`) or trust auto-waiting
- **Unique data**: Always use timestamps in test data names to avoid collisions
- **Cleanup**: Always clean up test data (delete vfolders, sessions, etc.)
- **Independence**: Each test should work independently (don't rely on other tests' state)
- **i18n**: Use English locale text for selectors since tests run with English UI
