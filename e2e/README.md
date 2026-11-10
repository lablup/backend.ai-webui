# Backend.AI WebUI E2E Tests

## Overview

This directory contains End-to-End tests for Backend.AI WebUI. Tests are automated and validated using Playwright to simulate real user scenarios.

## Directory Structure

The suite is laid out by the console a test acts on, then by page. The page
folder is the first path segment after the scope in `react/src/routes.tsx`
(`/admin/resource-policy` → `admin/resource-policy/`, `/project/:projectName/data`
→ `project/data/`); sub-routes such as `session/start` or `deployments/:id` stay in
their page folder, and legacy URLs count as their current route (`/serving` →
`deployments`, `/credential` → `admin/users`, `/summary` → `dashboard`). A screen
without a route is named after its surface (`project/settings`, `project/profile`,
`project/header`, `admin/header`). When a flow touches several consoles, the screen
the test acts on or checks decides; when unsure, `admin`.

```
e2e/
├── admin/<page>/            # admin console, /admin/* (AdminScopeLayout)
│   └── deployments/<tab>/   # a tab with several files gets its own folder
├── project-admin/<page>/    # /project/:projectName/admin/{dashboard,session,deployments,users}
├── project/<page>/          # user console, /project/:projectName/*
├── common/<area>/           # auth, config.toml behaviour, global search, plugins
├── mocks/ fixtures/         # GraphQL mocks and fixture files shared across folders
├── utils/                   # helpers and Page Object classes
├── envs/                    # env files (samples committed, real files git-ignored)
├── e2e-parts.ts             # E2E_PART folder rule
├── global-cleanup.teardown.ts
└── seed*.spec.ts screenshot*.ts …  # tooling specs, run in the user part
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
- `@visual` - Screenshot capture (`screenshot.test.ts`, skipped by default)
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

### Run one part (admin or user server)

`E2E_PART` narrows the `chromium` project to folders of the suite, and
`E2E_ENV_FILE` picks the env file, so the admin console specs can run against
their own server with their own accounts. One `playwright test` run talks to one
server (the endpoints and accounts in `utils/test-util.ts` are read once), so run
the admin part and the rest as separate invocations.

| `E2E_PART`                           | Runs                                                                             |
| ------------------------------------ | -------------------------------------------------------------------------------- |
| unset, `all`                         | the whole suite, as before                                                       |
| `admin`                              | `e2e/admin/`                                                                     |
| `project`, `project-admin`, `common` | that folder                                                                      |
| `user`                               | everything outside `e2e/admin/` (root-level specs included): the user server run |

Comma lists select several parts (`E2E_PART=project,project-admin`).
`E2E_ENV_FILE` defaults to `e2e/envs/.env.playwright`; with `E2E_PART=admin` it
defaults to `e2e/envs/.env.playwright.admin` when that file exists. The variable
names inside every env file are the same (`E2E_*`).

```bash
cp e2e/envs/.env.playwright.admin.sample e2e/envs/.env.playwright.admin  # admin server values
E2E_PART=user  pnpm exec playwright test --project chromium
E2E_PART=admin pnpm exec playwright test --project chromium
E2E_PART=admin E2E_ENV_FILE=e2e/envs/.env.other pnpm exec playwright test --project chromium
```

When `E2E_PART` or `E2E_ENV_FILE` is set, the config prints one
`[e2e] part=… env=… webui=<host> webserver=<host>` line to stderr. The `cleanup`
teardown runs after whichever part ran, against that part's server; keep
`--no-deps` for targeted runs on a shared server.

### Smoke run against an installed cluster

`e2e/playwright.smoke.config.ts` runs the `@smoke` subset against an already
installed WebUI with a single account — no dev fixtures, no
`.env.playwright`. It selects bare `@smoke` tests plus `@smoke-<role>` and
excludes the other role (see `E2E-TEST-NAMING-GUIDELINES.md` → "Smoke tags").

```bash
SMOKE_ROLE=admin \
E2E_WEBUI_ENDPOINT=https://webui.example.com \
E2E_ADMIN_EMAIL=admin@example.com E2E_ADMIN_PASSWORD='…' \
  pnpm e2e:smoke
# user role: SMOKE_ROLE=user + E2E_USER_EMAIL / E2E_USER_PASSWORD
# the config refuses to start when the role's endpoint or credentials are
# missing — otherwise the helpers would fall back to the dev-box defaults
# E2E_WEBSERVER_ENDPOINT: what the login form's endpoint field is filled
#   with; defaults to E2E_WEBUI_ENDPOINT (same host serves both)
# self-signed certificate: SMOKE_INSECURE_TLS=1
# reports: e2e/smoke-report/{html,results.json} (SMOKE_REPORT_DIR overrides)
# runs with a single worker: one account, one live cluster
```

Limitations: no OTP step in `login()`, so 2FA-enabled clusters are not
supported; the global `e2e-*` cleanup teardown is deliberately not wired in
(its unscoped sweep would delete customer folders whose name contains
`e2e-`), so a run killed mid-test can leave its own `e2e-`-prefixed
artifacts; a failed login leaves the password in the retained trace — treat
`smoke-report/` as sensitive.

### Run specific directory

```bash
pnpm exec playwright test e2e/common/auth/
pnpm exec playwright test e2e/project/session/
pnpm exec playwright test e2e/project/data/
```

### Run specific file

```bash
pnpm exec playwright test e2e/common/auth/login.spec.ts
pnpm exec playwright test e2e/project/session/session-lifecycle.spec.ts
pnpm exec playwright test e2e/project/deployments/deployment-lifecycle.spec.ts
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
import { MyPage } from '../utils/classes/MyPage';
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import { test, expect } from '@playwright/test';

test.describe(
  'My Feature',
  { tag: ['@critical', '@myfeature', '@functional'] },
  () => {
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
  },
);
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
   test.describe(
     'Feature Name',
     { tag: ['@priority', '@feature', '@type'] },
     () => {
       // tests
     },
   );
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
