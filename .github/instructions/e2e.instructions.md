---
applyTo: "e2e/**/*.ts"
---

# E2E Test Writing Guidelines for Backend.AI WebUI

This document provides guidelines for writing effective and maintainable E2E tests using Playwright in the Backend.AI WebUI project.

## Table of Contents

- [Core Principles](#core-principles)
- [Playwright Auto-Waiting](#playwright-auto-waiting)
- [Page Object Pattern](#page-object-pattern)
- [Selector Strategy](#selector-strategy)
- [Common Patterns](#common-patterns)
- [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
- [Example Test Structure](#example-test-structure)

---

## Core Principles

### 1. Trust Playwright's Auto-Waiting

Playwright has built-in auto-waiting for all actions. **You almost never need `waitForTimeout`.**

```typescript
// ❌ BAD: Unnecessary timeout
await page.click('button');
await page.waitForTimeout(1000);
await page.fill('input', 'text');

// ✅ GOOD: Playwright waits automatically
await page.click('button');        // Waits until clickable
await page.fill('input', 'text');  // Waits until enabled
```

**When Playwright waits automatically:**
- Element is visible
- Element is enabled
- Element is stable (no animations)
- Element is not obscured by other elements

**Only use explicit waits for:**
- Waiting for new elements to appear in DOM: `waitForSelector()`
- Waiting for network requests: `waitForResponse()`
- Waiting for page navigation: `waitForURL()`

### 2. Use Semantic Selectors

Prefer semantic selectors that reflect user interaction:

```typescript
// ✅ BEST: Role-based selectors (accessibility-friendly)
await page.getByRole('button', { name: 'Start Session' });
await page.getByRole('textbox', { name: 'Email' });
await page.getByLabel('Environments / Version');

// ✅ GOOD: Test IDs for unique elements
await page.getByTestId('user-dropdown-button');

// ⚠️ USE SPARINGLY: CSS selectors (fragile)
await page.locator('.ant-select-dropdown');

// ❌ AVOID: Complex CSS selectors (breaks easily)
await page.locator('div:nth-child(4) > .rc-virtual-list-holder');
```

### 3. Use Page Object Pattern

Encapsulate page interactions in reusable classes:

```typescript
// ✅ GOOD: Page Object Pattern
import { StartPage } from './utils/classes/StartPage';

test('should start session', async ({ page }) => {
  const startPage = new StartPage(page);
  await startPage.goto();

  const card = startPage.getInteractiveSessionCard();
  const button = startPage.getStartButtonFromCard(card);
  await button.click();
});

// ❌ BAD: Direct selectors in test
test('should start session', async ({ page }) => {
  await page.goto('http://localhost:9081/start');
  await page.getByRole('button', { name: 'Start Session' }).first().click();
});
```

---

## Playwright Auto-Waiting

### Built-in Waiting Behaviors

All Playwright actions have built-in waiting:

| Action | Auto-Waits For |
|--------|----------------|
| `click()` | Actionable (visible, enabled, stable, not obscured) |
| `fill()` | Editable (visible, enabled, not readonly) |
| `type()` | Editable |
| `selectOption()` | Visible and enabled |
| `check()` / `uncheck()` | Actionable |
| `hover()` | Visible and stable |

### Explicit Waits (Use When Necessary)

```typescript
// ✅ Wait for element to appear
await page.waitForSelector('.modal', { state: 'visible' });

// ✅ Wait for element to disappear
await page.waitForSelector('.loading', { state: 'hidden' });

// ✅ Wait for element to be attached to DOM
await element.waitFor({ state: 'attached' });

// ✅ Wait for network response
await page.waitForResponse(response =>
  response.url().includes('/api/images')
);

// ✅ Wait for URL change
await page.waitForURL('**/dashboard');
```

### Timeout Configuration

```typescript
// Default timeout is sufficient for most cases
await page.click('button'); // 30s timeout by default

// Override only when necessary
await page.waitForSelector('.slow-element', {
  timeout: 15000 // 15 seconds
});

// For flaky tests, investigate root cause instead of increasing timeout
```

---

## Page Object Pattern

### Directory Structure

```
e2e/
├── utils/
│   ├── classes/
│   │   ├── StartPage.ts
│   │   ├── SessionLauncherModal.ts
│   │   └── FolderCreationModal.ts
│   ├── test-util.ts
│   └── test-util-antd.ts
└── *.test.ts
```

### Example Page Object Class

```typescript
// e2e/utils/classes/StartPage.ts
import { Locator, Page } from '@playwright/test';

export class StartPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(): Promise<void> {
    await getMenuItem(this.page, 'Start').click();
  }

  private getCardByTitle(title: string): Locator {
    return this.page.locator(`.bai_grid_item:has-text("${title}")`);
  }

  getInteractiveSessionCard(): Locator {
    return this.getCardByTitle('Start Interactive Session');
  }

  getBatchSessionCard(): Locator {
    return this.getCardByTitle('Start Batch Session');
  }

  getStartButtonFromCard(card: Locator): Locator {
    return card.getByRole('button', { name: 'Start' });
  }
}
```

### Using Page Objects in Tests

```typescript
import { StartPage } from './utils/classes/StartPage';

test('should create interactive session', async ({ page }) => {
  await loginAsAdmin(page);

  // Use page object
  const startPage = new StartPage(page);
  await startPage.goto();

  const card = startPage.getInteractiveSessionCard();
  const button = startPage.getStartButtonFromCard(card);
  await button.click();

  // Continue with test...
});
```

---

## Selector Strategy

### Priority Order (Best to Worst)

1. **Role-based selectors** (Best for accessibility)
   ```typescript
   page.getByRole('button', { name: 'Submit' })
   page.getByRole('textbox', { name: 'Email' })
   page.getByRole('checkbox', { name: 'Remember me' })
   ```

2. **Label selectors** (Good for form fields)
   ```typescript
   page.getByLabel('Username')
   page.getByLabel('Password')
   ```

3. **Test ID selectors** (Good for unique elements)
   ```typescript
   page.getByTestId('user-dropdown-button')
   page.getByTestId('submit-form')
   ```

4. **Text selectors** (Good for unique text)
   ```typescript
   page.getByText('Welcome back')
   page.getByText('Settings', { exact: true })
   ```

5. **CSS selectors** (Use sparingly)
   ```typescript
   page.locator('.ant-select-dropdown')
   page.locator('tbody tr:not(.ant-table-measure-row)')
   ```

### Ant Design Specific Selectors

```typescript
// ✅ Wait for dropdown to appear
await page.waitForSelector('.ant-select-dropdown', { state: 'visible' });

// ✅ Exclude hidden measure rows in tables
const rows = page.locator('tbody tr:not(.ant-table-measure-row)');

// ✅ Find specific Ant Design components
await page.locator('.ant-modal').waitFor({ state: 'visible' });
```

### Handling Dynamic Content

```typescript
// ✅ Wait for element to be attached before reading
await row.waitFor({ state: 'attached', timeout: 5000 });
const text = await row.textContent({ timeout: 3000 });

// ✅ Retry pattern for flaky selectors
for (let i = 0; i < 10; i++) {
  try {
    const text = await element.textContent({ timeout: 3000 });
    if (text && text.trim()) {
      // Found valid content
      break;
    }
  } catch (e) {
    continue; // Try next element
  }
}
```

---

## Common Patterns

### Login Pattern

```typescript
// Reusable login utility
export async function loginAsAdmin(page: Page) {
  await page.goto(webuiEndpoint);
  await page.getByLabel('Email or Username').fill('admin@lablup.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.getByRole('textbox', { name: 'Endpoint' }).fill(webServerEndpoint);
  await page.getByLabel('Login', { exact: true }).click();
  await page.waitForSelector('[data-testid="user-dropdown-button"]');
}

// Usage in tests
test('should access dashboard', async ({ page }) => {
  await loginAsAdmin(page);
  // Test continues...
});
```

### Modal Interaction Pattern

```typescript
// Wait for modal to open
const modal = page.locator('.ant-modal');
await modal.waitFor({ state: 'visible' });

// Interact with modal content
await modal.getByLabel('Folder Name').fill('my-folder');
await modal.getByRole('button', { name: 'Create' }).click();

// Wait for modal to close
await modal.waitFor({ state: 'hidden' });
```

### Table Interaction Pattern

```typescript
// Get all data rows (excluding measure rows)
const rows = page.locator('tbody tr:not(.ant-table-measure-row)');

// Wait for at least one row
await rows.first().waitFor({ state: 'visible' });

// Iterate through rows
const rowCount = await rows.count();
for (let i = 0; i < rowCount; i++) {
  const row = rows.nth(i);
  const cell = row.locator('td').nth(2);
  const text = await cell.textContent();

  if (text?.includes('target')) {
    await row.click();
    break;
  }
}
```

### Dropdown Selection Pattern

```typescript
// Open dropdown
await page.getByLabel('Select Environment').click({ force: true });

// Wait for dropdown options to appear
await page.waitForSelector('.ant-select-dropdown', { state: 'visible' });

// Select an option
const options = page.locator('.ant-select-item-option');
await options.filter({ hasText: 'Python 3.11' }).click();

// Or search and select
await page.getByLabel('Select Environment').fill('python');
await options.first().click();
```

### Configuration Change Pattern

```typescript
// Modify config
const requestConfig = {
  environments: {
    showNonInstalledImages: true,
  },
};
await modifyConfigToml(page, request, requestConfig);

// Reload to apply changes
await page.reload();

// Verify changes took effect
// ... test logic
```

---

## Anti-Patterns to Avoid

### ❌ 1. Using `waitForTimeout`

```typescript
// ❌ BAD: Arbitrary wait
await page.click('button');
await page.waitForTimeout(2000); // Don't do this!
await page.fill('input', 'text');

// ✅ GOOD: Trust auto-waiting or use explicit waits
await page.click('button');
await page.fill('input', 'text'); // Automatically waits

// ✅ GOOD: Explicit wait for specific condition
await page.click('button');
await page.waitForSelector('.result', { state: 'visible' });
```

### ❌ 2. Fragile CSS Selectors

```typescript
// ❌ BAD: Position-based selector
await page.locator('div:nth-child(4) > div > div:nth-child(2)').click();

// ✅ GOOD: Semantic selector
await page.getByRole('button', { name: 'Submit' }).click();

// ✅ GOOD: Test ID
await page.getByTestId('submit-button').click();
```

### ❌ 3. Hardcoded URLs

```typescript
// ❌ BAD: Hardcoded URL
await page.goto('http://127.0.0.1:9081/start');

// ✅ GOOD: Use Page Object
const startPage = new StartPage(page);
await startPage.goto();

// ✅ GOOD: Use constant
await page.goto(`${webuiEndpoint}/start`);
```

### ❌ 4. Not Handling Race Conditions

```typescript
// ❌ BAD: Assuming element exists immediately
const text = await page.locator('.result').textContent();

// ✅ GOOD: Wait for element first
await page.locator('.result').waitFor({ state: 'visible' });
const text = await page.locator('.result').textContent();

// ✅ BETTER: Use assertion with auto-retry
await expect(page.locator('.result')).toContainText('Success');
```

### ❌ 5. Testing Implementation Details

```typescript
// ❌ BAD: Testing CSS classes
await expect(page.locator('.btn-primary.active')).toBeVisible();

// ✅ GOOD: Testing user-visible behavior
await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();
```

### ❌ 6. Copy-Paste Without Understanding

```typescript
// ❌ BAD: Complex clipboard manipulation
await context.grantPermissions(['clipboard-read', 'clipboard-write']);
const text = await page.evaluateHandle(() => navigator.clipboard.readText());
const clipboardContent = await text.jsonValue();

// ✅ GOOD: Directly verify what you need
const imageName = await cell.textContent();
expect(imageName).toContain('python');
```

---

## Example Test Structure

### Complete Test Example

```typescript
import { test, expect } from '@playwright/test';
import { loginAsAdmin, webuiEndpoint } from './utils/test-util';
import { StartPage } from './utils/classes/StartPage';

test.describe('Session Creation', () => {
  test('user can create interactive session with uninstalled images', async ({
    page,
    request
  }) => {
    // Step 1: Setup - Enable showNonInstalledImages
    const requestConfig = {
      environments: {
        showNonInstalledImages: true,
      },
    };
    await modifyConfigToml(page, request, requestConfig);
    await loginAsAdmin(page);

    // Step 2: Navigate to Environments page
    await page.getByRole('group').getByText('Environments', { exact: true }).click();

    // Wait for table to load
    await page.waitForSelector('table tbody tr:not(.ant-table-measure-row)', {
      state: 'visible',
      timeout: 15000,
    });

    // Sort by Status column
    const statusHeader = page.getByRole('columnheader', { name: 'Status' });
    await statusHeader.click();

    // Find uninstalled image
    const allRows = page.locator('tbody tr:not(.ant-table-measure-row)');
    await allRows.first().waitFor({ state: 'visible', timeout: 10000 });

    let uninstalledImageName: string | null = null;
    const rowCount = await allRows.count();

    for (let i = 0; i < Math.min(rowCount, 15); i++) {
      const row = allRows.nth(i);
      await row.waitFor({ state: 'attached', timeout: 5000 });

      const statusCell = row.locator('td').nth(1);

      try {
        const statusText = await statusCell.textContent({ timeout: 3000 });

        if (!statusText || statusText.trim() === '') {
          const imageCell = row.locator('td').nth(2);
          const imageText = await imageCell.textContent({ timeout: 3000 });

          if (imageText) {
            uninstalledImageName = imageText.replace(/복사|Copy/g, '').trim();
            break;
          }
        }
      } catch (e) {
        continue;
      }
    }

    expect(uninstalledImageName).toBeTruthy();
    const imageName = uninstalledImageName;

    // Step 3: Navigate to Start page and open session launcher
    const startPage = new StartPage(page);
    await startPage.goto();

    const interactiveSessionCard = startPage.getInteractiveSessionCard();
    const startButton = startPage.getStartButtonFromCard(interactiveSessionCard);
    await startButton.click();

    // Navigate to Environments & Resource step
    await page.getByRole('button', { name: '2 Environments & Resource' }).click();

    // Open environment selector
    const environmentSelector = page.getByLabel('Environments / Version');
    await environmentSelector.click({ force: true });

    // Wait for dropdown
    await page.waitForSelector('.ant-select-dropdown', {
      state: 'visible',
      timeout: 5000,
    });

    // Verify options are visible
    const dropdownOptions = page.locator('.ant-select-dropdown .ant-select-item-option');
    const optionCountEnabled = await dropdownOptions.count();
    expect(optionCountEnabled).toBeGreaterThan(0);

    // Verify environment is searchable
    const environmentMatch = imageName?.match(/\/([^/:]+):/);
    const environmentName = environmentMatch ? environmentMatch[1] : null;

    if (environmentName) {
      await environmentSelector.fill(environmentName);
      const searchResults = await dropdownOptions.count();
      expect(searchResults).toBeGreaterThan(0);
    }

    // Close launcher
    await page.keyboard.press('Escape');

    // Step 4: Verify disabled state
    requestConfig.environments.showNonInstalledImages = false;
    await modifyConfigToml(page, request, requestConfig);
    await page.reload();

    // Go to session launcher again
    await startPage.goto();
    const interactiveSessionCard2 = startPage.getInteractiveSessionCard();
    const startButton2 = startPage.getStartButtonFromCard(interactiveSessionCard2);
    await startButton2.click();

    await page.getByRole('button', { name: '2 Environments & Resource' }).click();

    await page.getByLabel('Environments / Version').click({ force: true });
    await page.waitForSelector('.ant-select-dropdown', {
      state: 'visible',
      timeout: 5000,
    });

    // Verify fewer options when disabled
    const dropdownOptionsDisabled = page.locator('.ant-select-dropdown .ant-select-item-option');
    const optionCountDisabled = await dropdownOptionsDisabled.count();
    expect(optionCountDisabled).toBeLessThan(optionCountEnabled);

    if (environmentName) {
      await page.getByLabel('Environments / Version').fill(environmentName);
      const searchResults = await dropdownOptionsDisabled.count();
      expect(searchResults).toBeLessThanOrEqual(optionCountEnabled);
    }
  });
});
```

---

## Test Maintenance Tips

### 1. Keep Tests Independent

Each test should be able to run independently:

```typescript
// ✅ GOOD: Each test sets up its own state
test.beforeEach(async ({ page }) => {
  await loginAsAdmin(page);
});

test('test A', async ({ page }) => {
  // Test A logic
});

test('test B', async ({ page }) => {
  // Test B logic - doesn't depend on test A
});
```

### 2. Use Descriptive Test Names

```typescript
// ❌ BAD: Vague name
test('test 1', async ({ page }) => { ... });

// ✅ GOOD: Descriptive name
test('user can create interactive session with Python 3.11', async ({ page }) => { ... });

// ✅ GOOD: With tags
test('user can filter images by architecture', { tag: ['@images', '@filter'] },
  async ({ page }) => { ... }
);
```

### 3. Add Comments for Complex Logic

```typescript
// Find the first row where the status cell is empty (uninstalled image)
// Uninstalled images have no status badge, so the cell will be empty
const allRows = page.locator('tbody tr:not(.ant-table-measure-row)');

for (let i = 0; i < rowCount; i++) {
  const statusCell = row.locator('td').nth(1); // Status column is 2nd cell
  const statusText = await statusCell.textContent();

  // Empty status = uninstalled
  if (!statusText || statusText.trim() === '') {
    // Found uninstalled image...
  }
}
```

### 4. Regular Refactoring

When you notice patterns repeating:
1. Extract to utility functions
2. Create Page Object classes
3. Update existing tests to use new patterns

---

## Debugging Tips

### 1. Use Headed Mode

```bash
pnpm exec playwright test --headed
```

### 2. Use Debug Mode

```bash
pnpm exec playwright test --debug
```

### 3. Take Screenshots on Failure

```typescript
test('my test', async ({ page }) => {
  try {
    // Test logic
  } catch (error) {
    await page.screenshot({ path: 'screenshot-error.png' });
    throw error;
  }
});
```

### 4. Use Playwright Inspector

```bash
PWDEBUG=1 pnpm exec playwright test
```

### 5. Check Console Logs

```typescript
page.on('console', msg => console.log('PAGE LOG:', msg.text()));
page.on('pageerror', error => console.log('PAGE ERROR:', error));
```

---

## Summary

### Key Takeaways

1. **Trust Playwright's auto-waiting** - Almost never use `waitForTimeout`
2. **Use semantic selectors** - Prefer role-based and label-based selectors
3. **Follow Page Object Pattern** - Encapsulate page logic in classes
4. **Write readable tests** - Use descriptive names and add comments
5. **Handle dynamic content** - Wait for specific conditions, not arbitrary timeouts
6. **Keep tests independent** - Each test should run in isolation
7. **Regular refactoring** - Extract common patterns into utilities

### When in Doubt

- Check [Playwright Documentation](https://playwright.dev/)
- Look at existing test examples in `/e2e` directory
- Use explicit waits (`waitForSelector`) instead of timeouts
- Prefer user-facing selectors over implementation details
- Write tests that reflect actual user behavior

---

## Additional Resources

- [Playwright Auto-Waiting Documentation](https://playwright.dev/docs/actionability)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Selectors Guide](https://playwright.dev/docs/selectors)
- [Page Object Pattern](https://playwright.dev/docs/pom)
