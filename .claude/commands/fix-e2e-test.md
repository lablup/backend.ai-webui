---
description: Debug and fix failing E2E tests using Playwright MCP tools. Analyzes test failures, updates locators, and fixes test logic.
argument-hint: <test-file-path or test-name>
---

# Fix E2E Test

Debug and fix failing Playwright E2E test: `$ARGUMENTS`

## Process

### 1. Identify the Failing Test

If `$ARGUMENTS` is a file path, use it directly. If it's a test name, find the file:

```bash
npx playwright test --list | grep -i "$ARGUMENTS"
```

### 2. Run the Test to See the Failure

Use the `playwright-test-healer` agent to debug:

```
Task({
  subagent_type: "playwright-test-healer",
  prompt: "Debug and fix the failing test at [path]. Read the test file first, then run it to see the failure, then fix it."
})
```

The healer agent has access to:
- `mcp__playwright-test__test_run` — run tests
- `mcp__playwright-test__test_debug` — debug single test with trace
- `mcp__playwright-test__browser_snapshot` — capture page state
- `mcp__playwright-test__browser_generate_locator` — generate correct locators
- `mcp__playwright-test__browser_console_messages` — check for errors

### 3. Common Failure Patterns

**Locator changed** (most common after UI changes):
- Button text changed (e.g., "Create" → "Create Folder")
- Element role changed
- DOM structure changed

→ Fix: Use `browser_snapshot` to see current page state, then update locators

**Timing issues**:
- Element not yet visible when assertion runs
- Network request not yet complete

→ Fix: Add explicit `waitFor()` or increase timeout on specific assertions

**Test data conflicts**:
- Previous test didn't clean up properly
- Parallel test using same resource name

→ Fix: Ensure unique names with timestamps, add proper cleanup in afterAll

**Modal/dialog interference**:
- Notification covering the target element
- Another dialog blocking interaction

→ Fix: Use `{ force: true }` on click, or dismiss interfering elements first

### 4. Update POM Classes if Needed

If locators in Page Object Model classes need updating:
- Read `e2e/utils/classes/` for the relevant POM
- Update locator selectors to match current UI
- Verify all tests using that POM still work

### 5. Validate the Fix

```bash
# Run the specific test
npx playwright test e2e/{path}.spec.ts

# Run related tests to check for regressions
npx playwright test e2e/{domain}/

# List all tests to verify nothing broke
npx playwright test --list e2e/{domain}/
```

### 6. Format

```bash
npx prettier --write e2e/{path}.spec.ts
```
