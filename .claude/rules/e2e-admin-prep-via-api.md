# Admin-Side E2E Preparation Goes Through the API

When an e2e flow in the user console or on the project admin pages needs admin-side state (a user or keypair, a project, a resource group, a test-only resource policy or role), the test creates it and cleans it up through the API. It never clicks through admin console pages to prepare or clean up.

## Why

Clicking through admin pages to set up another flow's test is slow and brittle: a change to an unrelated admin page breaks the user console spec, and a failed setup leaves state behind that the next run trips over. An API helper is fast, fails loudly, and pairs every create with a delete.

## Where the line is

The admin console is the `path: 'admin'` subtree under `AdminScopeLayout` in `react/src/routes.tsx` (route scope `admin`, entered through "Switch to Admin Console"), plus the old flat URLs that now redirect there (`/credential`, `/environment`, `/agent`, `/admin-serving` and so on). Its specs live in `e2e/admin/<page>/`.

- **Specs of the admin console itself** (`e2e/admin/<page>/`) act on the admin pages as usual: those pages are what they test. This rule is about preparation for other flows.
- **User console and project admin specs** (`e2e/project/<page>/`, `e2e/project-admin/<page>/`, `e2e/common/<area>/`) do their admin-side preparation and cleanup through the API. The project admin pages `/project/:projectName/admin/*` belong to the user console despite the `admin` in the URL.
- **A flow that sets something up in the admin console and checks its effect elsewhere** is placed by the screen it checks. When the check is in the user console, the admin-side setup is preparation and goes through the API.

## Rules

1. **Use the helpers in `e2e/utils/`**: `admin-api.ts` (`createAdminApiContext`, `gqlAdmin`, `createProjectViaApi`, `createResourceGroupViaApi`, the `purge*ViaApi` and `delete*ViaApi` family), `test-resources.ts` (`createTestResources`), `resource-preset-fixtures.ts`, `deployment-fixtures.ts`, `cleanup-util.ts`. In `e2e-agent/`, use `e2e-agent/utils/`.
2. **Add a missing helper next to the existing ones**, with its delete counterpart, registered for cleanup (`test-resources.ts` or `afterEach`/`afterAll`), and named with the usual `e2e-` prefix (`test-agent-*` for `e2e-agent/` users).
3. **The API does not make global changes allowed.** Cluster or domain settings, the `default` or shared resource policies, image registration, rescan or alias, shared resource groups and RBAC stay forbidden through the API too (`.claude/rules/e2e-no-global-state.md`). A flow that needs one is left out with the reason.
4. **Moving an existing spec's admin-page preparation to the API while fixing it is encouraged.** Keep its assertions as they are.
