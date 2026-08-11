---
applyTo: "e2e/**/*.ts"
---

# E2E Test Writing Guidelines for Backend.AI WebUI

Playwright conventions for the `e2e/` suite. Read the **Selector Strategy** section before
writing a single locator — the app's DOM changed wholesale when the UI moved off Ant Design
onto Astryx, and most locator habits inherited from older specs no longer match anything.

## Read this first: `.ant-*` classes do not exist anymore

antd is not a dependency of this repository. The component system is Astryx
(`@astryxdesign/core`) plus the BUI wrappers in `packages/backend.ai-ui/`, and the form layer
is the self-hosted engine in `packages/backend.ai-ui/src/form-engine/`. Nothing renders an
`ant-` prefixed class.

- A locator like `.ant-modal`, `.ant-select-dropdown`, `.ant-table-row`,
  `.ant-table-measure-row`, `.ant-form-item-control`, `.ant-popover`, `.ant-tabs-tab-active`
  now matches **zero** elements. It does not fail loudly — it burns its whole timeout and then
  reports a generic "element not found".
- There are still ~690 such lines across ~65 files in `e2e/` (`git grep -n '\.ant-' -- e2e`).
  That is a **known cleanup backlog**, not a pattern to copy. Some of them sit in shared
  helpers, so a helper that "looks official" can still be carrying a dead selector.
- **New or edited tests must not add a single new `.ant-*` locator.** When you touch a spec or
  POM class that contains one, fix that locator in the same change rather than working around
  it.
- There is no measure row in the Astryx table, so `tr:not(.ant-table-measure-row)` is both dead
  and unnecessary — plain rows are the only rows.

Background on how the component mapping was decided lives in
`.specs/FR-3482-astryx-migration/CONVERSION-IDIOMS.md` if you need to know what a given antd
component became.

---

## Setup and how to run

Tests read their environment from `e2e/envs/.env.playwright`, loaded by `playwright.config.ts`
via dotenv with `override: true`. The file is git-ignored; copy the committed sample and edit:

```bash
cp e2e/envs/.env.playwright.sample e2e/envs/.env.playwright
```

Variables it defines (all consumed in `e2e/utils/test-util.ts`, each with a fallback default):

| Variable | Purpose |
|---|---|
| `E2E_WEBUI_ENDPOINT` | WebUI under test (default `http://127.0.0.1:9081`) → `webuiEndpoint` |
| `E2E_WEBSERVER_ENDPOINT` | Backend.AI webserver (default `http://127.0.0.1:8090`) → `webServerEndpoint` |
| `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` | superadmin account |
| `E2E_USER_EMAIL` / `E2E_USER_PASSWORD` | regular user |
| `E2E_USER2_EMAIL` / `E2E_USER2_PASSWORD` | second regular user (sharing/invitation flows) |
| `E2E_MONITOR_EMAIL` / `E2E_MONITOR_PASSWORD` | monitor account |
| `E2E_DOMAIN_ADMIN_EMAIL` / `E2E_DOMAIN_ADMIN_PASSWORD` | domain admin |
| `E2E_ADMIN_EMAIL_FOR_VISUAL` / `E2E_USER_EMAIL_FOR_VISUAL` (+ `_PASSWORD`) | visual-regression accounts; fall back to the normal admin/user pair |
| `E2E_DEFAULT_IMAGE` | container image used by session-creation specs |
| `SCREENSHOT_PATH` | output directory for screenshot specs |

`webuiEndpoint` also drives `isLocalEnvironment`; config-modification tests only run reliably
against `127.0.0.1` / `localhost` because remote deployments may cache `config.toml` before
route interception takes effect.

Running (a full Backend.AI cluster must already be up):

```bash
pnpm exec playwright test                         # everything
pnpm exec playwright test --grep @smoke           # tag subsets: @smoke / @critical / @regression
pnpm exec playwright test --grep-invert @visual   # skip visual regression
pnpm exec playwright test e2e/vfolder/            # one directory
pnpm exec playwright test e2e/auth/login.spec.ts  # one file
pnpm exec playwright test --shard=1/4             # sharded
```

Config facts worth knowing (`playwright.config.ts`): `testDir` is `./e2e`, tests are
`fullyParallel`, per-test `timeout` is 180 s, `actionTimeout` is 30 s (so one stuck click cannot
eat the whole test budget), trace is captured `on-first-retry`, the only enabled project is
`chromium` with `locale: 'en-US'` — **UI strings are English**, so match English labels — and it
declares a `cleanup` teardown project that runs `e2e/global-cleanup.teardown.ts` after the
suite regardless of pass/fail. Snapshots resolve to `e2e/{testFileDir}/snapshot/{arg}{ext}`.

---

## Directory layout and naming

```
e2e/
├── auth/ user/ vfolder/ session/ serving/ environment/ agent/ project/
│   credential/ config/ dashboard/ chat/ …          # feature directories, *.spec.ts
├── visual_regression/                              # screenshot comparisons
├── envs/.env.playwright.sample                     # env template (real file git-ignored)
├── global-cleanup.teardown.ts                      # suite-wide best-effort sweep
├── seed.spec.ts                                    # skipped seed for the Playwright MCP generator
└── utils/
    ├── classes/
    │   ├── base/{BasePage,BaseModal}.ts
    │   ├── common/{StartPage,NotificationHandler}.ts
    │   ├── session/{SessionLauncher,SessionDetailPage,AppLauncherModal,SessionAPIHelper}.ts
    │   ├── user/{UserSettingModal,BulkCreateUserModal,PurgeUsersModal}.ts
    │   └── vfolder/{FolderCreationModal,FolderExplorerModal}.ts
    ├── test-util.ts          # login, navigation, vfolder flows, config/theme interception
    ├── test-util-antd.ts     # legacy filename; see the helper table below
    ├── admin-api.ts          # GraphQL admin context + API-level sweeps
    ├── cleanup-util.ts       # sweepServices / sweepVFolders / cleanupVFolderSafely
    └── feature-gate-util.ts  # skipUnlessWebUIVersion / skipUnlessClientFeature / …
```

Naming (full rules in `e2e/E2E-TEST-NAMING-GUIDELINES.md`):

- Files: kebab-case, `.spec.ts`, `{feature}-{action}.spec.ts` — `vfolder-crud.spec.ts`,
  `session-lifecycle.spec.ts`. `.test.ts` is a legacy pattern; do not create new ones.
- `test.describe` blocks: `[Component/Feature] - [Context/Category]`.
- Test cases: `[Actor] can/cannot [action] [when/with/in condition]` —
  `'user can create an interactive session with a mounted folder'`.
- Tag every describe block: priority (`@smoke` / `@critical` / `@regression`), feature
  (`@vfolder`, `@session`, …) and type (`@functional`, `@visual`, `@integration`).
- POM classes go in `e2e/utils/classes/{feature}/`, extending `BasePage` / `BaseModal`.

---

## Login and test setup

Never hand-roll the login form. `e2e/utils/test-util.ts` exports role-specific helpers, all
taking `(page, request)`:

```typescript
import { loginAsAdmin, loginAsUser, navigateTo } from '../utils/test-util';

test.beforeEach(async ({ page, request }) => {
  await loginAsAdmin(page, request);   // or loginAsUser / loginAsUser2 /
  await navigateTo(page, 'data');      // loginAsDomainAdmin / loginAsMonitor /
});                                    // loginAsCreatedAccount / loginAsVisualRegression*
```

What `login()` actually does, so you can reason about failures:

1. Calls `modifyConfigToml` to force `general.connectionMode = 'SESSION'` and blank
   `apiEndpoint`, so the login form accepts a manually entered endpoint.
2. Navigates to `webuiEndpoint`, fills **Email or Username** / **Password** by label, expands
   the **Advanced** section when the Endpoint field is hidden, fills the endpoint.
3. Submits up to 3 times with a 5 s gap — a busy shared backend can transiently reject a valid
   login. Success is `[data-testid="user-dropdown-button"]` appearing. On rejection it probes
   `POST {endpoint}/server/login` from a throwaway request context and logs the real status, so
   check the test output before assuming a frontend bug.

Related helpers: `logout(page)`, `navigateTo(page, path)` (resolves against `webuiEndpoint` —
never hardcode a URL), `notFoundPageHeading(page)` / `forbiddenPageHeading(page)` for the
route-level 404 / 401 screens (they render text, not images).

`e2e/seed.spec.ts` is a permanently skipped scaffold: it logs in via `loginAsUser` and gives
the Playwright MCP generator a live authenticated page to record against. Use it as a starting
point for generated flows; do not turn it into a real test.

---

## Selector Strategy

### Priority ladder

1. **Role + accessible name** — the default. Works because the Astryx primitives render real
   semantics: dialogs are native `<dialog>` elements, tables are real `<table>`/`<thead>`/
   `<tbody>`, selectors are `combobox` + `option`.

   ```typescript
   page.getByRole('button', { name: 'Create Folder' });
   page.getByRole('dialog', { name: 'Create a new storage folder' });
   page.getByRole('row', { name: `VFolder Identicon ${folderName}` });
   page.getByRole('columnheader', { name: 'Status' });
   page.getByRole('tab', { name: 'Trash' });
   page.getByRole('option', { name: 'Python 3.11', exact: true });
   ```

2. **Label / accessible-name lookups** for form controls and icon buttons.

   ```typescript
   page.getByLabel('Email or Username');
   folderRow.getByRole('button', { name: 'Move to trash bin' }); // action title, not icon name
   ```

   Icon-only buttons take their accessible name from the action's title or an explicit
   `aria-label`, **not** from the lucide icon (most glyphs are `aria-hidden`). If
   `{ name: 'delete' }` does not match, look up what the component passes as the title.

3. **`data-testid`** for things with no stable text — about 90 exist across the app.
   Established ones: `user-dropdown-button`, `webui-breadcrumb`, `bai-notification-stack`,
   `notification-title`, `notification-description`, `vfolder-filter`, `app-launcher-modal`,
   `create-folder-button`. Adding a new one to a component is fair game when no semantic anchor
   exists — prefer that over reaching for a CSS class.

4. **`data-bai-*` structural hooks** — the form engine's presentational shell exposes a stable
   attribute at every level (`packages/backend.ai-ui/src/form-engine/FormItemVisual.tsx`):

   | Attribute | Meaning |
   |---|---|
   | `[data-bai-form-item]` | the form item root |
   | `[data-bai-form-item-label]` | the `<label>` |
   | `[data-bai-form-item-required]` | present when the item is required |
   | `[data-bai-form-item-control]` / `[data-bai-form-item-control-input]` | the control column / input wrapper |
   | `[data-bai-form-item-explain]`, `…-explain-error`, `…-explain-warning` | validation messages |
   | `[data-bai-form-item-extra]` | the `extra` slot |

   The notification stack exposes `[data-testid="bai-notification-stack"]` with one
   `[data-notification-key]` per notice.

5. **Text** for unique, stable copy: `page.getByText('Successfully left the shared folder')`.

6. **CSS** only as a last resort, and only against a class the repo itself owns (e.g.
   `bai-table-astryx-*`) or a plain structural selector such as `tbody tr`. Never against a
   framework-internal class, and never position-based (`div:nth-child(4) > …`).

### What replaced what

| Dead locator | Use instead |
|---|---|
| `.ant-modal`, `.ant-modal-content`, `.ant-modal-confirm` | `page.getByRole('dialog')`, narrowed with `{ name }` or `.filter({ hasText })` |
| `.ant-modal-title`, `.ant-modal-confirm-title` | `dialog.getByRole('heading')` |
| `.ant-drawer`, `.ant-drawer-content-wrapper` | `page.getByRole('dialog')` (drawers are dialogs too) |
| `.ant-table`, `.ant-table-content`, `.ant-table-tbody` | `page.getByRole('table')`, or scope through the surrounding card/testid |
| `.ant-table-row`, `tr:not(.ant-table-measure-row)` | `page.getByRole('row', { name })`, or `tbody tr` when counting |
| `.ant-table-cell` | `row.getByRole('cell')` |
| `.ant-table-thead th` | `page.getByRole('columnheader', { name })` |
| `.ant-select`, `.ant-select-dropdown` | `page.getByRole('combobox')` → the listbox opens as `option` roles |
| `.ant-select-item-option` | `page.getByRole('option', { name, exact: true })` |
| `.ant-form-item-row`, `.ant-form-item-control` | `getFormItemControlByLabel(page, 'Label')` / `[data-bai-form-item]` |
| `.ant-tabs-tab-active` | `page.getByRole('tab', { selected: true })` or assert `aria-selected` |
| `.ant-popover`, `.ant-popconfirm` | the confirm button by name: `page.getByRole('button', { name: 'Confirm' })` |
| `.ant-message-notice-wrapper`, `.ant-notification-notice` | `[data-testid="bai-notification-stack"] [data-notification-key]`, or `page.getByRole('alert')` |
| `.anticon-*`, `svg[data-icon="…"]` | the button's accessible name (`getByRole('button', { name })`) |
| `.ant-card`, `.ant-card-head-title` | `page.getByRole('heading', { name })` plus a scoping testid |
| `.ant-list-item` | `page.getByRole('listitem')`, filtered by text |

---

## Common patterns

### Dialogs (modals and drawers)

```typescript
const modal = page.getByRole('dialog').filter({ hasText: 'Create a new storage folder' });
await expect(modal).toBeVisible();
// Scope by form item when the control's own accessible name is not wired to the label.
await modal
  .locator('[data-bai-form-item]')
  .filter({ has: page.locator('[data-bai-form-item-label]', { hasText: 'Folder Name' }) })
  .getByRole('textbox')
  .fill('e2e-my-folder');
await modal.getByRole('button', { name: 'Create' }).click();
await expect(modal).toBeHidden({ timeout: 30000 });
```

### Form items

```typescript
import { getFormItemControlByLabel } from '../utils/test-util-antd';

const location = getFormItemControlByLabel(page, 'Location');
await location.getByRole('combobox').click();
await page.getByRole('option', { name: 'local:volume1', exact: true }).click();
```

`getFormItemControlByLabel` is `[data-bai-form-item]` filtered by its
`[data-bai-form-item-label]` text, returning `[data-bai-form-item-control-input]` — no antd
fallback remains in it.

### Selectors / comboboxes

```typescript
// Prefer the accessible name when the control exposes one; otherwise scope through the
// form item (or a testid) and take the single combobox inside it.
const selector = getFormItemControlByLabel(page, 'Environments / Version').getByRole('combobox');
await selector.click();
await selector.fill('python');                       // typeahead filtering
await page.getByRole('option', { name: /python/ }).first().click();
```

### Tables

```typescript
const row = page.getByRole('row', { name: `VFolder Identicon ${folderName}` });
await expect(row).toBeVisible();
await row.getByRole('button', { name: 'Move to trash bin' }).click();

// Sorting / column lookup
await page.getByRole('columnheader', { name: 'Status' }).click();

// Emptiness / counting
await expect(page.locator('tbody tr').filter({ hasText: folderName })).toHaveCount(0);
```

### Notifications and toasts

```typescript
const notice = page
  .locator('[data-testid="bai-notification-stack"] [data-notification-key]')
  .first();
await expect(notice.getByTestId('notification-title')).toContainText('Folder created');
await notice.getByRole('button', { name: 'Dismiss' }).click();  // Astryx Banner's dismiss
```

Dismiss stray notices before clicking anything they overlap — the stack intercepts pointer
events (`FolderCreationModal.dismissOverlappingNotifications()` is the reference implementation).

### Property filters (PowerSearch)

`BAIPropertyFilter` / `BAIGraphQLPropertyFilter` are Astryx `PowerSearch`: one combobox that,
on picking a field, opens an edit popover whose value control is named **Value** (a `textbox`
committed with **Apply**, or a `combobox` committed by picking an option). Committed filters
are tokens whose remove control is `aria-label="Remove {Field}: {operator} {value}"`. Use the
helpers rather than re-deriving this: `selectPropertyFilter(page, 'Name', value, testId?)`,
`removeSearchButton(page, name)`, `clearAllFilters(page)`.

### Refresh-and-retry instead of long waits

List pages do not refetch on their own, so a mutation that the backend applies late will never
show up no matter how long you wait on the DOM. `test-util.ts` pairs short assertion windows
with an explicit refetch — `getTableRefreshButton(page)` locates the `BAIFetchKeyButton` by its
native `title="Refresh"` attribute (the lucide `RotateCw` icon has no accessible name), and the
`*AndVerify` vfolder helpers poll through it. Reuse those helpers; if you need the pattern
elsewhere, copy the shape (assert with a ~2.5 s window, click refresh, retry) rather than
raising a timeout to 30 s.

### Config and theme interception

```typescript
await modifyConfigToml(page, request, { environments: { showNonInstalledImages: true } });
await page.reload();
```

`modifyConfigToml` fetches the real `config.toml` once through a throwaway browser context,
deep-merges your keys (explicit `undefined` deletes), caches the result per page and serves it
via `page.route('**/config.toml**')`. Repeated calls accumulate. `modifyThemeJson(page, request,
themeConfig)` does the same for `/resources/theme.json`. Both need a reload to take effect and
are only reliable when `isLocalEnvironment` is true.

---

## Anti-patterns

1. **`.ant-*` anything.** See the top of this file.
2. **`waitForTimeout` as a synchronization tool.** Playwright auto-waits for actionability on
   `click` / `fill` / `check` / `selectOption` / `hover`. For state that is not
   element-visibility, use `expect.poll()`. Short fixed delays are tolerable only as a last
   resort for stabilization, never as a polling loop.
3. **`waitForLoadState('networkidle')`.** Discouraged by Playwright upstream; it causes flaky
   runs and unexpected context closures. Assert on a real readiness signal instead
   (`await expect(page.getByRole('heading', { name: 'Data' })).toBeVisible()`). Older specs
   still call it — remove it when you touch them.
4. **Visibility checks with fallback branches.** `if (await x.isVisible()) … else <other path>`
   and `try { click } catch { continue }` hide real regressions. Let the test fail fast. (The
   deliberate exceptions are the best-effort cleanup sweeps, which are *supposed* to skip
   unavailable resources.)
5. **Hardcoded URLs.** Use `navigateTo(page, 'data')` or a POM's `goto()`.
6. **Positional selectors** — `div:nth-child(4) > …`, `.nth(1)` on an action button. Row action
   buttons are located by accessible name so a layout change cannot silently retarget them.
7. **Asserting on styling.** Test what the user can do (`toBeEnabled`, `toBeVisible`, text),
   not which classes an element carries.
8. **Waiting on a toast as proof of success.** Toasts are transient. Assert the durable
   consequence (the row disappeared, the API returned 2xx) instead; several helpers explicitly
   await the network response (`page.waitForResponse`) and throw with the status body.

---

## Test isolation, cleanup, and shared state

- Each test must stand alone: log in and navigate in `beforeEach`, never rely on ordering.
- Use `test.describe.configure({ mode: 'serial' })` only when tests genuinely share one
  expensive resource; prefer `afterEach` cleanup for isolated tests and `afterAll` for a
  shared one.
- **Name every created resource with an `e2e-` prefix** and a unique suffix. The suite-wide
  teardown (`e2e/global-cleanup.teardown.ts`, wired as the `cleanup` project) sweeps leftover
  `e2e-*` vfolders and services after the run, and `e2e/utils/cleanup-util.ts` /
  `e2e/utils/admin-api.ts` provide `sweepVFolders`, `sweepServices`, `cleanupVFolderSafely`,
  `sweepProfileTestUsersViaApi`, `sweepLeftoverDeploymentsViaApi`.
- Track created resources in a variable and clean up in `afterEach`, wrapped in try/catch —
  never assume creation succeeded.
- Skip rather than fail when the target deployment lacks a feature:
  `skipUnlessWebUIVersion`, `skipUnlessClientFeature`, `skipUnlessClientConfig`,
  `skipUnlessAllowedVFolderType` from `e2e/utils/feature-gate-util.ts`.

---

## Utility reference

`e2e/utils/test-util.ts` — `webuiEndpoint`, `webServerEndpoint`, `isLocalEnvironment`,
`userInfo`, `login` + the `loginAs*` family, `logout`, `navigateTo`,
`notFoundPageHeading` / `forbiddenPageHeading`, `selectPropertyFilter`, `removeSearchButton`,
`clearAllFilters`, `getTableRefreshButton`, `getVFolderRow`, `verifyVFolder`,
`createVFolderAndVerify`, `moveToTrashAndVerify`, `deleteForeverAndVerifyFromTrash`,
`restoreVFolderAndVerify`, `shareVFolderAndVerify`, `leaveSharedFolderAndVerify`,
`acceptAllInvitationAndVerifySpecificFolder`, `modifyConfigToml`, `modifyThemeJson`.

`e2e/utils/test-util-antd.ts` — the filename is historical; treat it as "shared DOM helpers".

| Helper | State |
|---|---|
| `getFormItemControlByLabel(page, label)` | current — `[data-bai-form-item]` based |
| `getNotificationMessageBox(page)` / `getNotificationDescriptionBox(page)` | current — testid based |
| `getMenuItem(page, name)` | current — `getByRole('link', { exact: true })` |
| `checkActiveTab(tabs, name)` | **stale** (`.ant-tabs-tab-active`) — use `getByRole('tab', { selected: true })` |
| `getTableHeaders(locator)` / `findColumnIndex(table, title)` | **stale** (`.ant-table-thead th`) — use `getByRole('columnheader')` |
| `getCardItemByCardTitle(page, title)` | **stale** (`.ant-card`) — scope by heading or testid |

Fix a stale helper (and its call sites) when your change depends on it; do not build new tests
on one.

---

## Debugging

```bash
pnpm exec playwright test --headed        # watch the run
pnpm exec playwright test --debug         # step through with the Inspector
PWDEBUG=1 pnpm exec playwright test       # same, via env var
pnpm exec playwright show-report          # the HTML report (written on every run)
pnpm exec playwright show-trace <trace>   # traces are captured on first retry
```

```typescript
page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
page.on('pageerror', (error) => console.log('PAGE ERROR:', error));
```

When a locator times out, check whether it is a dead `.ant-*` selector **before** suspecting a
product bug — that is by far the most common cause of a failure in an untouched old spec.

---

## E2E coverage report maintenance

`e2e/E2E_COVERAGE_REPORT.md` is a living record of which pages and features have coverage.
Update it whenever you add, remove, or rename test files, add cases to an existing file, or add
a Page Object class:

1. In the affected page's feature table, flip `❌` → `✅`, fill in the test name and test-file
   reference, and update that section's `**Coverage: …**` line.
2. Recalculate the row in the **Coverage Summary** table (Covered count, `❌ 0%` / `🔶 N%` /
   `✅ 100%`), the **Total** row, and the `**Overall: X / Y features covered (Z%)**` line.
3. Update the **Coverage Matrix (Quick Reference)** status for the affected routes.
4. Prune or re-prioritize **Priority Recommendations**.
5. Update **Test Infrastructure** when you add POM classes or shared utilities.
6. Bump the **Last Updated** date.

---

## Additional resources

- `e2e/README.md` — directory map, tag strategy, POM base classes
- `e2e/E2E-TEST-NAMING-GUIDELINES.md` — naming rules in full
- [Playwright actionability / auto-waiting](https://playwright.dev/docs/actionability)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
- [Locators](https://playwright.dev/docs/locators) · [Page Object Model](https://playwright.dev/docs/pom)
