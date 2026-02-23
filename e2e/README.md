# Backend.AI WebUI E2E Tests

## Overview

This directory contains End-to-End tests for Backend.AI WebUI. Tests are automated and validated using Playwright to simulate real user scenarios.

## Directory Structure

```
e2e/
├── auth/                           # Authentication tests
│   └── login.spec.ts               # Login, pre/post login, failure cases
│
├── user/                           # User management tests
│   └── user-crud.spec.ts           # User create, update, delete, Purge
│
├── vfolder/                        # Virtual folder management tests
│   ├── vfolder-crud.spec.ts        # VFolder create, update, delete, share
│   ├── vfolder-explorer-modal.spec.ts  # Folder explorer modal
│   └── vfolder-consecutive-deletion.spec.ts  # Consecutive deletion test
│
├── session/                        # Session management tests
│   ├── session-creation.spec.ts    # Session creation (Interactive/Batch)
│   └── session-lifecycle.spec.ts   # Session lifecycle
│
├── serving/                        # Service endpoint tests
│   └── endpoint-lifecycle.spec.ts  # Endpoint lifecycle
│
├── environment/                    # Environment and image management tests
│   └── environment.spec.ts         # Image list, resource limits, app management
│
├── agent/                          # Agent management tests
│   └── agent.spec.ts               # Agent list and status
│
├── maintenance/                    # Maintenance page tests
│   └── maintenance.spec.ts         # Recalculate Usage, Rescan Images
│
├── app-launcher/                   # App launcher tests
│   ├── app-launcher-basic.spec.ts  # App launcher basic interaction
│   └── app-launcher-launch.spec.ts # App launch tests
│
├── config/                         # Configuration and access control tests
│   ├── config.spec.ts              # config.toml settings
│   └── page-access-control.spec.ts # Page access control (404/401)
│
├── visual_regression/              # Visual regression tests
│   └── [existing structure]
│
└── utils/                          # Utilities
    ├── classes/                    # Page Object Model classes
    │   ├── base/
    │   │   ├── BasePage.ts
    │   │   └── BaseModal.ts
    │   ├── common/
    │   │   ├── StartPage.ts
    │   │   └── NotificationHandler.ts
    │   ├── session/
    │   │   ├── SessionLauncher.ts
    │   │   ├── SessionDetailPage.ts
    │   │   └── AppLauncherModal.ts
    │   ├── user/
    │   │   ├── UserSettingModal.ts
    │   │   ├── KeyPairModal.ts
    │   │   ├── UserInfoModal.ts
    │   │   └── PurgeUsersModal.ts
    │   ├── vfolder/
    │   │   ├── FolderCreationModal.ts
    │   │   └── FolderExplorerModal.ts
    │   ├── serving/
    │   │   └── EndpointPage.ts
    │   └── ...
    ├── test-util.ts                # Common utilities
    └── test-util-antd.ts           # Ant Design utilities
```

## Test Tags

### Execution Priority
- `@smoke` - Most critical core paths (~5 min, for PR checks)
- `@critical` - Important feature tests (~15 min, before merge)
- `@regression` - Full regression tests (~1 hour, nightly)

### Feature Areas
- `@auth` - Authentication
- `@user` - User management
- `@vfolder` - Virtual folders
- `@session` - Session management
- `@serving` - Service endpoints
- `@environment` - Environment management
- `@agent` - Agent management
- `@maintenance` - Maintenance
- `@app-launcher` - App launcher
- `@config` - Configuration and access control

### Test Types
- `@functional` - Functional tests
- `@visual` - Visual regression tests
- `@integration` - Integration tests

## Running Tests

### Run all tests
```bash
pnpm exec playwright test
```

### Run by tag
```bash
# Run smoke tests only (for PR checks)
pnpm exec playwright test --grep @smoke

# Run critical tests (before merge)
pnpm exec playwright test --grep @critical

# Run regression tests (nightly builds)
pnpm exec playwright test --grep @regression

# Run specific feature tests
pnpm exec playwright test --grep @auth
pnpm exec playwright test --grep @session
pnpm exec playwright test --grep @vfolder
pnpm exec playwright test --grep @serving
```

### Run specific directory
```bash
pnpm exec playwright test e2e/auth/
pnpm exec playwright test e2e/session/
pnpm exec playwright test e2e/vfolder/
```

### Run specific file
```bash
pnpm exec playwright test e2e/auth/login.spec.ts
pnpm exec playwright test e2e/session/session-lifecycle.spec.ts
pnpm exec playwright test e2e/serving/endpoint-lifecycle.spec.ts
```

### Exclude visual regression
```bash
pnpm exec playwright test --grep-invert @visual
```

### Parallel execution
```bash
# Run with 4 shards
pnpm exec playwright test --shard=1/4
pnpm exec playwright test --shard=2/4
pnpm exec playwright test --shard=3/4
pnpm exec playwright test --shard=4/4
```

## Writing Tests

### Page Object Model Pattern

All tests follow the Page Object Model (POM) pattern.

#### Base Classes

**BasePage** - Base class for all page classes
```typescript
import { BasePage } from '../utils/classes/base/BasePage';

export class MyPage extends BasePage {
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async verifyPageLoaded(): Promise<void> {
    const element = this.page.locator('#main-content');
    await this.waitForVisible(element);
  }
}
```

**BaseModal** - Base class for all modal classes
```typescript
import { BaseModal } from '../utils/classes/base/BaseModal';

export class MyModal extends BaseModal {
  async waitForModalOpen(): Promise<void> {
    const modal = this.page.getByRole('dialog');
    await this.waitForVisible(modal);
  }

  async waitForModalClose(): Promise<void> {
    const modal = this.page.getByRole('dialog');
    await this.waitForHidden(modal);
  }
}
```

### Test Example

```typescript
import { test, expect } from '@playwright/test';
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import { MyPage } from '../utils/classes/MyPage';

test.describe('My Feature', { tag: ['@critical', '@myfeature', '@functional'] }, () => {
  let myPage: MyPage;

  test.beforeEach(async ({ page, request }) => {
    await loginAsAdmin(page, request);
    await navigateTo(page, 'mypage');
    myPage = new MyPage(page);
    await myPage.verifyPageLoaded();
  });

  test('Should do something', async () => {
    // Test implementation
    await myPage.doSomething();
    expect(await myPage.getSomething()).toBe('expected');
  });
});
```

### File Naming Convention

- All test files use `.spec.ts` extension
- Use kebab-case
- Follow feature-action format: `{feature}-{action}.spec.ts`
  - Examples: `user-crud.spec.ts`, `session-lifecycle.spec.ts`

## Current Implementation Status

### Completed

#### Base Infrastructure
- Feature-based directory structure (auth, user, vfolder, session, serving, etc.)
- Base POM classes (BasePage, BaseModal)
- Consistent tag strategy (@smoke, @critical, @regression)
- Standardized naming conventions

#### Authentication (@auth)
- Login tests
- Login failure cases

#### User Management (@user)
- User CRUD tests
- User Purge tests

#### VFolder Management (@vfolder)
- VFolder CRUD tests
- VFolder sharing tests
- Folder explorer modal tests
- Consecutive deletion tests

#### Session Management (@session)
- SessionDetailPage POM class
- SessionLauncher POM class
- Session creation tests (Interactive/Batch)
- Session lifecycle tests
  - Create, monitor, terminate interactive session
  - Batch session auto-completion
  - Container logs viewing
  - Resource usage monitoring
  - Status transition validation
  - Bulk operation constraints

#### Serving/Endpoint Management (@serving)
- EndpointPage POM class
- Endpoint lifecycle tests
  - Endpoint creation
  - Configuration updates
  - Status monitoring
  - Lifecycle stage filtering
  - Deletion workflow
  - Environment variable configuration
  - Validation error handling

#### App Launcher (@app-launcher)
- App launcher basic interaction tests
- App launch tests

#### Environment Management (@environment)
- Image list rendering
- Resource limit modification
- App management

#### Agent Management (@agent)
- Agent list tests

#### Maintenance (@maintenance)
- Recalculate Usage tests
- Rescan Images tests

#### Configuration (@config)
- config.toml settings tests
- Page access control tests (404/401)

## Backend.AI Domain Constraints

Consider Backend.AI domain constraints when writing tests:

### Session Constraints
- Sessions are **immutable after termination** (TERMINATED/CANCELLED state)
- **No pause/restart** - only terminate is available
- Only RUNNING sessions can be selected for bulk operations
- State transitions: PENDING → PREPARING → RUNNING → TERMINATED

### VFolder Constraints
- **Only READY state can be mounted**
- Pipeline folders cannot be deleted/restored
- Only DELETE_PENDING state can be restored
- Permission-based operation control (delete_vfolder, update_attribute)

### Resource Constraints
- **3-tier resource policy** (Keypair → User → Project)
- Only activated scaling groups can be selected
- Image minimum resource requirements must be met

### RBAC Constraints
- Role-based permissions: superadmin, admin, monitor, user
- UI visibility and operation restrictions per role

## Contributing

Follow these guidelines when writing new tests:

1. **Directory Structure**: Place tests in appropriate feature directories
   - Authentication: `auth/`
   - User management: `user/`
   - Virtual folders: `vfolder/`
   - Session management: `session/`
   - Service endpoints: `serving/`
   - Environment management: `environment/`
   - Agents: `agent/`
   - Maintenance: `maintenance/`
   - App launcher: `app-launcher/`
   - Configuration: `config/`

2. **File Naming Convention**:
   - Use `.spec.ts` extension (not `.test.ts`)
   - Use kebab-case
   - Follow feature-action format: `{feature}-{action}.spec.ts`

3. **Add Tags**: Add appropriate tags to all `test.describe` blocks
   ```typescript
   test.describe('Feature Name', { tag: ['@priority', '@feature', '@type'] }, () => {
     // tests
   });
   ```
   - Priority: `@smoke`, `@critical`, `@regression`
   - Feature: `@auth`, `@user`, `@vfolder`, `@session`, etc.
   - Type: `@functional`, `@visual`, `@integration`

4. **POM Pattern**: All tests follow Page Object Model pattern
   - Inherit from base classes (`BasePage`, `BaseModal`)
   - Write reusable methods
   - Encapsulate locators in POM classes

5. **Cleanup**: Include cleanup logic after tests (`afterEach`, `afterAll`)

6. **Domain Constraints**: Adhere to Backend.AI domain constraints

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Test Fixtures](https://playwright.dev/docs/test-fixtures)
