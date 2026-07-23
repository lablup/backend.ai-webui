# SessionLauncher Refactoring - Comprehensive Test Plan

## Executive Summary

This test plan documents the refactoring of duplicated session creation and termination code from `app-launcher-basic.spec.ts` and `app-launcher-launch.spec.ts` into a reusable `SessionLauncher` class utility. The goal is to create a flexible, maintainable, and resilient Page Object Model (POM) that can adapt to UI changes in the SessionLauncherPage React component.

### Current State Analysis

Both test files contain nearly identical implementations of:
- `createInteractiveSession()` - Creates interactive sessions with different image configurations
- `terminateSession()` - Terminates sessions via the session detail drawer
- `openAppLauncherModal()` - Opens the app launcher modal for a running session

The only difference is in image selection:
- `app-launcher-basic.spec.ts` - Uses default Python image (no explicit image selection)
- `app-launcher-launch.spec.ts` - Uses specific Python 3.13 image (`cr.backend.ai/stable/python:3.13-ubuntu24.04-amd64@x86_64`)

### Refactoring Objectives

1. **Eliminate Code Duplication**: Create a single source of truth for session creation and management
2. **Builder Pattern API**: Provide a fluent, chainable interface for configuring session options
3. **Resilience to UI Changes**: Use role-based and data-testid locators with smart fallbacks
4. **Error Handling**: Implement comprehensive timeout and error recovery strategies
5. **Maintainability**: Clear separation of concerns with well-documented methods
6. **Flexibility**: Support all SessionLauncherPage form fields and configurations

---

## SessionLauncher Class Design

### Class Structure

```typescript
// e2e/utils/classes/SessionLauncher.ts

import { Page, expect, Locator } from '@playwright/test';
import { navigateTo } from '../test-util';

export interface SessionLauncherConfig {
  sessionName: string;
  sessionType: 'interactive' | 'batch' | 'inference' | 'system';
  image?: string;
  resourceGroup?: string;
  resourcePreset?: string;
  batchCommand?: string;
  batchScheduleDate?: string;
  batchTimeout?: { value: number; unit: 's' | 'm' | 'h' | 'd' | 'w' };
  mountedFolders?: string[];
  ports?: number[];
  envVars?: Record<string, string>;
  skipMountWarning?: boolean;
}

/**
 * Page Object Model for SessionLauncher functionality.
 * Provides builder pattern API for creating and managing compute sessions.
 *
 * @example
 * ```typescript
 * const launcher = new SessionLauncher(page)
 *   .withSessionName('my-session')
 *   .withSessionType('interactive')
 *   .withImage('python:3.13')
 *   .withResourcePreset('minimum');
 *
 * await launcher.create();
 * await launcher.waitForRunning();
 * await launcher.terminate();
 * ```
 */
export class SessionLauncher {
  private readonly page: Page;
  private config: Partial<SessionLauncherConfig>;
  private sessionName?: string;

  constructor(page: Page) {
    this.page = page;
    this.config = {
      sessionType: 'interactive',
      resourceGroup: 'default',
      resourcePreset: 'minimum',
      skipMountWarning: true,
    };
  }

  // Builder methods return 'this' for chaining
  withSessionName(name: string): this;
  withSessionType(type: SessionLauncherConfig['sessionType']): this;
  withImage(image: string): this;
  withResourceGroup(group: string): this;
  withResourcePreset(preset: string): this;
  withBatchCommand(command: string): this;
  withBatchSchedule(scheduleDate: string): this;
  withBatchTimeout(value: number, unit: 's' | 'm' | 'h' | 'd' | 'w'): this;
  withMountedFolders(folders: string[]): this;
  withPorts(ports: number[]): this;
  withEnvVars(vars: Record<string, string>): this;
  skipMountWarning(skip: boolean): this;

  // Core action methods
  async create(): Promise<void>;
  async waitForRunning(timeout?: number): Promise<void>;
  async terminate(): Promise<void>;
  async openAppLauncher(): Promise<AppLauncherModal>;

  // Helper methods
  private async fillSessionTypeStep(): Promise<void>;
  private async fillEnvironmentStep(): Promise<void>;
  private async fillStorageStep(): Promise<void>;
  private async fillNetworkStep(): Promise<void>;
  private async reviewAndLaunch(): Promise<void>;
  private async handleMountWarningDialog(): Promise<void>;
  private async closeAppLauncherIfVisible(): Promise<void>;
  private async getSessionRow(): Promise<Locator>;
}
```

---

## Test Scenario 1: Basic Session Creation Flow

### Scenario: User can create interactive session with default settings

**Test Name**: `User can create interactive session using SessionLauncher with default settings`

**Prerequisites**:
- User is logged in
- Backend.AI cluster has available compute resources

**Steps**:

1. Initialize SessionLauncher with session name
```typescript
const sessionName = `e2e-test-${Date.now()}`;
const launcher = new SessionLauncher(page)
  .withSessionName(sessionName);
```

2. Create session
```typescript
await launcher.create();
```

3. Verify session appears in session list
```typescript
const sessionRow = await launcher.getSessionRow();
await expect(sessionRow).toBeVisible({ timeout: 20000 });
```

4. Wait for session to reach RUNNING status
```typescript
await launcher.waitForRunning();
```

**Expected Results**:
- Session is created successfully
- Session appears in session list table
- Session reaches RUNNING status within timeout (default: 180 seconds)
- No error dialogs or notifications appear

**Internal Flow**:
1. Navigate to `/session/start`
2. Select "Interactive" radio button
3. Fill session name input (`#sessionName`)
4. Click "Next" button
5. Fill "Resource Group" combobox with "default"
6. Fill "Resource Presets" combobox with "minimum"
7. Click "Skip to review" button
8. Wait for "Launch" button to be enabled
9. Click "Launch" button
10. Handle "No storage folder is mounted" confirmation dialog
11. Close app launcher modal if it appears
12. Wait for session row to appear in table
13. Wait for RUNNING status in session row

---

## Test Scenario 2: Session Creation with Custom Image

### Scenario: User can create interactive session with specific Python image

**Test Name**: `User can create interactive session with custom Python 3.13 image`

**Prerequisites**:
- User is logged in
- Python 3.13 image is available in the environment

**Steps**:

1. Initialize SessionLauncher with custom image
```typescript
const sessionName = `e2e-python313-${Date.now()}`;
const launcher = new SessionLauncher(page)
  .withSessionName(sessionName)
  .withImage('cr.backend.ai/stable/python:3.13-ubuntu24.04-amd64@x86_64');
```

2. Create session and wait for running
```typescript
await launcher.create();
await launcher.waitForRunning();
```

**Expected Results**:
- Session is created with Python 3.13 image
- Session reaches RUNNING status
- Correct image is displayed in session row

**Internal Flow (Image Selection)**:
1. On environment step, click "Environments" combobox
2. Fill combobox with full image name
3. Click matching option from dropdown
4. Verify image is selected (combobox displays image name)

---

## Test Scenario 3: Batch Session Creation

### Scenario: User can create batch session with startup command

**Test Name**: `User can create batch session with startup command and schedule`

**Prerequisites**:
- User is logged in
- Backend.AI cluster supports batch sessions

**Steps**:

1. Initialize SessionLauncher for batch mode
```typescript
const sessionName = `e2e-batch-${Date.now()}`;
const launcher = new SessionLauncher(page)
  .withSessionName(sessionName)
  .withSessionType('batch')
  .withBatchCommand('echo "Hello, Backend.AI!" && sleep 60')
  .withBatchSchedule(dayjs().add(2, 'minutes').toISOString());
```

2. Create session
```typescript
await launcher.create();
```

3. Verify batch configuration
```typescript
const sessionRow = await launcher.getSessionRow();
await expect(sessionRow).toContainText('batch'); // or appropriate batch indicator
```

**Expected Results**:
- Batch session is created with startup command
- Session is scheduled for future start time
- Session details show batch configuration

**Internal Flow (Batch Configuration)**:
1. On sessionType step, select "Batch" radio button
2. Fill batch command textarea (`['batch', 'command']`)
3. Enable schedule checkbox (`['batch', 'enabled']`)
4. Select schedule date using DatePicker
5. Continue to launch

---

## Test Scenario 4: Session with VFolder Mounting

### Scenario: User can create session with mounted virtual folders

**Test Name**: `User can create session with mounted VFolders`

**Prerequisites**:
- User has existing VFolders available
- VFolders are in "ready" status

**Steps**:

1. Initialize SessionLauncher with folder mounts
```typescript
const sessionName = `e2e-with-mount-${Date.now()}`;
const launcher = new SessionLauncher(page)
  .withSessionName(sessionName)
  .withMountedFolders(['my-data-folder', 'my-model-folder'])
  .skipMountWarning(false); // Disable skip to test mounting flow
```

2. Create session
```typescript
await launcher.create();
```

**Expected Results**:
- Session is created with VFolders mounted
- No "No storage folder is mounted" dialog appears
- Session can access mounted folders

**Internal Flow (Storage Step)**:
1. On storage step, locate VFolder table
2. For each folder name:
   - Find row with matching folder name
   - Click checkbox to select folder
3. Continue to launch
4. No mount warning dialog should appear

---

## Test Scenario 5: Session with Custom Environment Variables

### Scenario: User can create session with environment variables

**Test Name**: `User can create session with custom environment variables`

**Prerequisites**:
- User is logged in

**Steps**:

1. Initialize SessionLauncher with env vars
```typescript
const sessionName = `e2e-with-envs-${Date.now()}`;
const launcher = new SessionLauncher(page)
  .withSessionName(sessionName)
  .withEnvVars({
    'MY_API_KEY': 'test-key-123',
    'DEBUG_MODE': 'true',
    'APP_ENV': 'development'
  });
```

2. Create and verify session
```typescript
await launcher.create();
await launcher.waitForRunning();
```

**Expected Results**:
- Session is created with environment variables
- Variables are accessible inside the session

**Internal Flow (Environment Variables)**:
1. On environment step, locate EnvVarFormList component
2. For each key-value pair:
   - Click "Add" button to add new env var row
   - Fill key input field
   - Fill value input field
   - Mark as non-secret if needed
3. Continue to launch

---

## Test Scenario 6: Session Termination

### Scenario: User can terminate running session

**Test Name**: `User can terminate running session via SessionLauncher`

**Prerequisites**:
- Session is in RUNNING status
- User has permission to terminate the session

**Steps**:

1. Create session using launcher
```typescript
const sessionName = `e2e-terminate-${Date.now()}`;
const launcher = new SessionLauncher(page)
  .withSessionName(sessionName);

await launcher.create();
await launcher.waitForRunning();
```

2. Terminate session
```typescript
await launcher.terminate();
```

3. Verify termination
```typescript
const sessionRow = await launcher.getSessionRow();
const terminatedStatus = sessionRow.getByText('TERMINATED');
await expect(terminatedStatus).toBeVisible({ timeout: 20000 });
```

**Expected Results**:
- Session is terminated successfully
- Session status changes to TERMINATED
- Termination completes within timeout (default: 20 seconds)

**Internal Flow (Termination)**:
1. Navigate to Sessions page
2. Wait for session table to be visible
3. Find session row by name
4. Check if already terminated (skip if true)
5. Click session name link to open detail drawer
6. Wait for session detail drawer to appear
7. Click terminate button (has `aria-label="terminate"`)
8. Wait for confirmation modal
9. Click "Terminate" button in modal
10. Wait for modal to close
11. Close detail drawer
12. Wait for session status to change to TERMINATED

---

## Test Scenario 7: Session Creation with Port Configuration

### Scenario: User can create session with custom port configuration

**Test Name**: `User can create session with preopen ports configured`

**Prerequisites**:
- User is logged in
- Backend.AI cluster allows custom port configuration

**Steps**:

1. Initialize SessionLauncher with ports
```typescript
const sessionName = `e2e-with-ports-${Date.now()}`;
const launcher = new SessionLauncher(page)
  .withSessionName(sessionName)
  .withPorts([8080, 3000, 5000]);
```

2. Create session
```typescript
await launcher.create();
```

**Expected Results**:
- Session is created with specified ports pre-opened
- Ports are accessible from outside the session

**Internal Flow (Network Step)**:
1. On network step, locate PortSelectFormItem component
2. For each port:
   - Click "Add Port" button
   - Fill port number input
3. Continue to launch

---

## Test Scenario 8: Error Handling - Invalid Configuration

### Scenario: SessionLauncher handles validation errors gracefully

**Test Name**: `User sees validation error when creating session with invalid configuration`

**Prerequisites**:
- User is logged in

**Steps**:

1. Initialize SessionLauncher with invalid session name
```typescript
const launcher = new SessionLauncher(page)
  .withSessionName(''); // Empty name - invalid
```

2. Attempt to create session
```typescript
await expect(launcher.create()).rejects.toThrow();
```

**Expected Results**:
- Validation error is shown in UI
- Session creation does not proceed
- Error message is descriptive

**Error Handling Strategy**:
- Validate required fields before form submission
- Throw descriptive errors with context
- Capture and log validation errors
- Do not suppress errors silently

---

## Test Scenario 9: Error Handling - Session Stuck in PENDING

### Scenario: SessionLauncher handles timeout when session is stuck

**Test Name**: `SessionLauncher throws timeout error when session stuck in PENDING status`

**Prerequisites**:
- Backend.AI cluster has resource constraints (no available resources)

**Steps**:

1. Create session with short timeout
```typescript
const sessionName = `e2e-timeout-${Date.now()}`;
const launcher = new SessionLauncher(page)
  .withSessionName(sessionName);

await launcher.create();
```

2. Wait with timeout
```typescript
await expect(launcher.waitForRunning(30000)).rejects.toThrow('Timeout');
```

**Expected Results**:
- Timeout error is thrown after 30 seconds
- Error message indicates session is stuck in PENDING
- Session remains in session list (not deleted)

**Timeout Strategy**:
- Use Playwright's built-in timeout mechanisms
- Default timeout: 180 seconds (3 minutes)
- Allow custom timeout parameter
- Provide descriptive error messages

---

## Test Scenario 10: Error Handling - Session Already Terminated

### Scenario: SessionLauncher handles terminating already terminated session

**Test Name**: `SessionLauncher gracefully handles terminating already terminated session`

**Prerequisites**:
- Session has already been terminated

**Steps**:

1. Create and immediately terminate session
```typescript
const sessionName = `e2e-already-terminated-${Date.now()}`;
const launcher = new SessionLauncher(page)
  .withSessionName(sessionName);

await launcher.create();
await launcher.waitForRunning();
await launcher.terminate();
```

2. Attempt to terminate again
```typescript
await launcher.terminate(); // Should not throw error
```

**Expected Results**:
- No error is thrown
- Method returns gracefully
- Console log indicates session already terminated

**Error Recovery Strategy**:
- Check current status before terminating
- Skip termination if already in terminal state
- Log informational messages (not errors)
- Use `.catch(() => false)` for non-critical checks

---

## Locator Strategy and Resilience

### Primary Locator Strategy

1. **Data-testid attributes** (highest priority)
   - Most stable, explicitly set for testing
   - Example: `page.getByTestId('app-launcher-modal')`

2. **Role-based locators** (preferred)
   - Semantic, accessibility-friendly
   - Example: `page.getByRole('button', { name: 'Launch' })`

3. **Label and text matching** (fallback)
   - Based on visible text
   - Example: `page.getByText('Interactive')`

4. **CSS selectors** (last resort)
   - Most fragile, avoid when possible
   - Example: `page.locator('#sessionName')`

### Handling UI Changes

```typescript
// Example: Flexible image selection with multiple strategies
private async selectImage(image: string): Promise<void> {
  // Strategy 1: Try data-testid first
  const imageSelectByTestId = this.page.getByTestId('image-selector');
  if (await imageSelectByTestId.isVisible({ timeout: 2000 }).catch(() => false)) {
    await imageSelectByTestId.click();
    await imageSelectByTestId.fill(image);
    await this.page.getByRole('option', { name: image }).click();
    return;
  }

  // Strategy 2: Fallback to role-based locator
  const imageSelect = this.page
    .getByRole('combobox', { name: 'Environments' })
    .first();

  await imageSelect.click();
  await imageSelect.fill(image);

  // Try exact match first
  const exactOption = this.page.getByRole('option', { name: image, exact: true });
  if (await exactOption.isVisible({ timeout: 2000 }).catch(() => false)) {
    await exactOption.click();
    return;
  }

  // Fallback to partial match
  const partialOption = this.page.getByRole('option').filter({ hasText: image });
  await partialOption.first().click();
}
```

### Smart Waiting Strategies

```typescript
// Example: Wait for elements with multiple fallback checks
private async waitForSessionRow(): Promise<Locator> {
  const sessionRow = this.page
    .locator('tr')
    .filter({ hasText: this.config.sessionName! });

  // Wait for row to appear (up to 20 seconds)
  await expect(sessionRow).toBeVisible({ timeout: 20000 });

  // Verify row is fully loaded (contains expected columns)
  await expect(sessionRow.locator('td')).toHaveCount(10, { timeout: 5000 });

  return sessionRow;
}
```

### Error Recovery Patterns

```typescript
// Example: Handle optional dialogs that may or may not appear
private async handleOptionalDialog(dialogText: string): Promise<void> {
  const dialog = this.page.getByRole('dialog').filter({ hasText: dialogText });

  // Check if dialog appears (short timeout)
  const isVisible = await dialog.isVisible({ timeout: 3000 }).catch(() => false);

  if (isVisible) {
    const confirmButton = dialog.getByRole('button', { name: 'Start' });
    await confirmButton.click();
    // Wait for dialog to close
    await expect(dialog).not.toBeVisible({ timeout: 5000 });
  }

  // If dialog didn't appear, continue without error
}
```

---

## Implementation Checklist

### Phase 1: Core Implementation
- [ ] Create `SessionLauncher.ts` in `e2e/utils/classes/`
- [ ] Implement constructor and builder methods
- [ ] Implement `create()` method with all step handlers
- [ ] Implement `waitForRunning()` method
- [ ] Implement `terminate()` method
- [ ] Add TypeScript types and interfaces

### Phase 2: Locator Strategies
- [ ] Add data-testid attributes to SessionLauncherPage components
- [ ] Implement flexible locator strategies with fallbacks
- [ ] Add timeout configuration options
- [ ] Implement error recovery patterns

### Phase 3: Test Migration
- [ ] Refactor `app-launcher-basic.spec.ts` to use SessionLauncher
- [ ] Refactor `app-launcher-launch.spec.ts` to use SessionLauncher
- [ ] Verify all tests pass with new implementation
- [ ] Remove duplicate helper functions

### Phase 4: Extended Features
- [ ] Add support for batch timeout configuration
- [ ] Add support for HPC optimization settings
- [ ] Add support for cluster mode (multi-node)
- [ ] Add support for owner access key (admin feature)

### Phase 5: Documentation
- [ ] Add JSDoc comments to all public methods
- [ ] Create usage examples in documentation
- [ ] Document locator strategies and fallbacks
- [ ] Document error handling patterns

---

## Testing the SessionLauncher Class

### Unit Test Cases

1. **Constructor and Builder Methods**
```typescript
test('SessionLauncher initializes with default values', () => {
  const launcher = new SessionLauncher(page);
  expect(launcher['config'].sessionType).toBe('interactive');
  expect(launcher['config'].resourceGroup).toBe('default');
});

test('Builder methods chain correctly', () => {
  const launcher = new SessionLauncher(page)
    .withSessionName('test')
    .withImage('python:3.13')
    .withResourcePreset('medium');

  expect(launcher).toBeInstanceOf(SessionLauncher);
});
```

2. **Configuration Validation**
```typescript
test('SessionLauncher throws error for missing required fields', async () => {
  const launcher = new SessionLauncher(page);
  // No session name set
  await expect(launcher.create()).rejects.toThrow('Session name is required');
});
```

### Integration Test Cases

1. **Full Session Lifecycle**
```typescript
test('SessionLauncher handles complete session lifecycle', async ({ page }) => {
  const launcher = new SessionLauncher(page)
    .withSessionName('e2e-lifecycle-test');

  await launcher.create();
  await launcher.waitForRunning();
  await launcher.terminate();
});
```

2. **Multiple Configurations**
```typescript
test.describe('SessionLauncher Configuration Variations', () => {
  test('creates session with minimal config', async ({ page }) => { });
  test('creates session with custom image', async ({ page }) => { });
  test('creates session with VFolder mounts', async ({ page }) => { });
  test('creates batch session', async ({ page }) => { });
});
```

---

## Performance Considerations

### Optimization Strategies

1. **Parallel Waiting**: Use `Promise.all()` for independent checks
```typescript
// Wait for multiple conditions in parallel
await Promise.all([
  expect(sessionRow).toBeVisible(),
  expect(sessionRow.getByText('RUNNING')).toBeVisible()
]);
```

2. **Efficient Polling**: Use Playwright's built-in retry mechanisms
```typescript
// Let Playwright handle polling automatically
await expect(element).toBeVisible({ timeout: 30000 });
// Instead of manual polling with setInterval
```

3. **Minimize Navigation**: Reuse page context when possible
```typescript
// Instead of navigating multiple times:
// await navigateTo(page, 'session');
// await navigateTo(page, 'session/start');

// Navigate once and stay on page:
await navigateTo(page, 'session/start');
// ... perform actions ...
```

4. **Smart Timeouts**: Use appropriate timeouts for different operations
```typescript
// Quick checks: 2-5 seconds
const isVisible = await element.isVisible({ timeout: 2000 });

// Medium checks: 10-30 seconds
await expect(modal).toBeVisible({ timeout: 10000 });

// Long operations: 60-180 seconds
await launcher.waitForRunning(180000);
```

---

## Maintenance Guidelines

### When to Update SessionLauncher

1. **SessionLauncherPage UI Changes**
   - Update locator strategies if form structure changes
   - Add new builder methods for new form fields
   - Update step handlers for new wizard steps

2. **Backend.AI API Changes**
   - Update session creation parameters if API changes
   - Add support for new session types or modes
   - Update timeout strategies if session startup behavior changes

3. **Test Requirements Change**
   - Add new helper methods for new test scenarios
   - Extract common patterns into reusable methods
   - Update error handling for new failure modes

### Backward Compatibility

When making breaking changes:
1. Mark old methods as deprecated with `@deprecated` tag
2. Provide migration path in JSDoc comments
3. Keep old methods working for at least one release cycle
4. Update all consuming tests to use new API

Example:
```typescript
/**
 * @deprecated Use withImage() instead. Will be removed in v2.0.0
 */
withEnvironmentImage(image: string): this {
  console.warn('withEnvironmentImage is deprecated, use withImage() instead');
  return this.withImage(image);
}
```

---

## Success Metrics

### Quantitative Metrics

1. **Code Reduction**: Reduce duplicated code by ~80%
   - Before: ~400 lines duplicated across 2 files
   - After: ~200 lines in SessionLauncher class + ~50 lines per test file

2. **Test Reliability**: Improve test pass rate
   - Target: 95%+ success rate in CI/CD
   - Reduce flakiness from timeout issues

3. **Test Execution Time**: Maintain or improve speed
   - Session creation: < 3 minutes
   - Session termination: < 30 seconds
   - Total test suite: < 15 minutes

### Qualitative Metrics

1. **Maintainability**: Easier to update tests when UI changes
2. **Readability**: Tests are more declarative and easier to understand
3. **Reusability**: SessionLauncher can be used in other test files
4. **Flexibility**: Easy to test different session configurations

---

## Risk Assessment and Mitigation

### High Risk: Timing Issues

**Risk**: Sessions may take unpredictable time to start due to resource availability.

**Mitigation**:
- Use generous timeouts (3 minutes default)
- Allow custom timeout parameters
- Provide clear error messages on timeout
- Log intermediate states for debugging

### Medium Risk: UI Locator Changes

**Risk**: React component refactoring may break locators.

**Mitigation**:
- Prioritize data-testid attributes
- Use multiple fallback strategies
- Add data-testid to critical elements
- Regular review of locator strategies

### Medium Risk: Dialog and Modal Variations

**Risk**: Different environments may show different dialogs (mount warning, resource warnings, etc.)

**Mitigation**:
- Handle dialogs as optional
- Use short timeouts for dialog checks
- Don't fail if optional dialogs don't appear
- Log when dialogs are encountered

### Low Risk: Session State Transitions

**Risk**: Session may transition through unexpected states.

**Mitigation**:
- Check for terminal states (TERMINATED, CANCELLED, ERROR)
- Handle intermediate states gracefully
- Provide detailed status logging
- Don't assume linear state transitions

---

## Appendix A: SessionLauncherPage Form Field Reference

### Step 0: Session Type
- `sessionType`: Radio group ('interactive' | 'batch' | 'inference' | 'system')
- `sessionName`: Text input (`#sessionName`)
- `bootstrap_script`: Hidden text input

### Step 0b: Batch Configuration (if sessionType === 'batch')
- `['batch', 'command']`: Textarea (required)
- `['batch', 'enabled']`: Checkbox for schedule
- `['batch', 'scheduleDate']`: DatePicker (ISO string)
- `['batch', 'timeoutEnabled']`: Checkbox for timeout
- `['batch', 'timeout']`: Number input
- `['batch', 'timeoutUnit']`: Select ('s' | 'm' | 'h' | 'd' | 'w')

### Step 0c: Owner Setter (admin/superadmin only)
- `['owner', 'enabled']`: Checkbox
- `['owner', 'accesskey']`: Text input
- `['owner', 'domainName']`: Text input
- `['owner', 'email']`: Text input
- `['owner', 'project']`: Text input
- `['owner', 'resourceGroup']`: Text input

### Step 1: Environments
- `['environments', 'image']`: Image select (complex component)
- `['environments', 'customizedTag']`: Custom tag input
- `envvars`: Array of {variable, value, secret}

### Step 1b: Resource Allocation
- `resourceGroup`: Combobox
- `allocationPreset`: Combobox
- `['resource', 'cpu']`: Number input
- `['resource', 'mem']`: Number input with unit
- `['resource', 'accelerator']`: Number input
- `['resource', 'acceleratorType']`: Select
- `['resource', 'shmem']`: Number input with unit
- `num_of_sessions`: Number input
- `agent`: Array select

### Step 1c: HPC Optimization
- `['hpcOptimization', 'autoEnabled']`: Switch
- `['hpcOptimization', 'OMP_NUM_THREADS']`: Number input
- `['hpcOptimization', 'OPENBLAS_NUM_THREADS']`: Number input

### Step 2: Storage (if not inference mode)
- `mount_ids`: Array of VFolder IDs (checkboxes in table)
- `mount_id_map`: Map of mount paths

### Step 3: Network
- `ports`: Array of port numbers

### Step 4: Review
- Read-only preview of all configurations

---

## Appendix B: Example Usage Patterns

### Pattern 1: Minimal Configuration
```typescript
const launcher = new SessionLauncher(page)
  .withSessionName('quick-test');

await launcher.create();
await launcher.waitForRunning();
await launcher.terminate();
```

### Pattern 2: Custom Image with Resources
```typescript
const launcher = new SessionLauncher(page)
  .withSessionName('python-ml')
  .withImage('python:3.13-ml')
  .withResourcePreset('gpu-large');

await launcher.create();
```

### Pattern 3: Batch Job with Schedule
```typescript
const launcher = new SessionLauncher(page)
  .withSessionName('nightly-job')
  .withSessionType('batch')
  .withBatchCommand('python train.py')
  .withBatchSchedule(dayjs().add(1, 'day').startOf('day').toISOString())
  .withBatchTimeout(2, 'h');

await launcher.create();
```

### Pattern 4: Development Environment
```typescript
const launcher = new SessionLauncher(page)
  .withSessionName('dev-env')
  .withImage('ubuntu:22.04')
  .withMountedFolders(['project-code', 'shared-data'])
  .withPorts([8080, 3000, 5000])
  .withEnvVars({
    'NODE_ENV': 'development',
    'API_URL': 'http://localhost:8080'
  });

await launcher.create();
await launcher.waitForRunning();
const modal = await launcher.openAppLauncher();
```

---

## Appendix C: Error Messages Reference

### Validation Errors
- `"Session name is required"` - Missing session name
- `"Session type must be one of: interactive, batch, inference, system"` - Invalid session type
- `"Batch command is required for batch sessions"` - Missing batch command
- `"Resource preset not found"` - Invalid preset name

### Timeout Errors
- `"Timeout waiting for session to reach RUNNING status"` - Session stuck in PENDING
- `"Timeout waiting for session row to appear"` - Session creation may have failed
- `"Timeout waiting for session to terminate"` - Termination taking too long

### UI Errors
- `"Session type step not loaded"` - Form not initialized
- `"Launch button not found or disabled"` - Form validation failed
- `"Session row not found after creation"` - Navigation or timing issue

### Network Errors
- `"Failed to load session list"` - API request failed
- `"Failed to create session"` - Backend error during creation
- `"Failed to terminate session"` - Backend error during termination

---

**Document Version**: 1.0
**Last Updated**: 2026-01-12
**Author**: E2E Test Automation Team
**Status**: Approved for Implementation
