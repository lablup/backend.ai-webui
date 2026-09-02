// FR-2503: E2E tests for Model Card Drawer and Deploy UX
// spec: e2e/.agent-output/test-plan-model-card-drawer-deploy.md
import { setupGraphQLMocks } from '../session/mocking/graphql-interceptor';
import { loginAsAdmin, modifyConfigToml, navigateTo } from '../utils/test-util';
import { MOCK_ENDPOINT_UUID } from './mocking/endpoint-detail-mock';
import { endpointListMockResponse } from './mocking/endpoint-list-mock';
import {
  MOCK_DEPLOYMENT_ID,
  modelCardDeployModalMutationMock,
  modelCardDeployModalQueryMock,
  modelCardDeployModalQuerySingleRGMock,
  modelStoreListWithMultiPresetsMock,
  modelStoreListWithNoPresetsMock,
  modelStoreListWithSinglePresetMock,
  modelCardDrawerQueryWithMultiPresetsMock,
  modelCardDrawerQueryWithNoPresetsMock,
  modelCardDrawerQueryWithSinglePresetMock,
  endpointDetailPreparingMockResponse,
  endpointDetailZeroReplicasMockResponse,
  endpointDetailTerminatedMockResponse,
  endpointDetailServiceReadyMockResponse,
  endpointDetailReadyButNoHealthyRoutesMockResponse,
  endpointDetailHealthyButNoSchedulingHistoryMockResponse,
} from './mocking/model-store-mock';
import { test, expect } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Install a persistent `model-card-v2` feature flag override via
 * `page.addInitScript`. This runs on every navigation (including full-page
 * reloads via `page.goto` / `navigateTo`), so the flag survives across
 * `setupModelStorePage`'s serving → model-store navigation hop where a plain
 * `page.evaluate` override would be wiped out by the reload that rebuilds
 * `window.backendaiclient` from scratch.
 *
 * The script patches `supports()` the moment the client object is assigned to
 * `window.backendaiclient`, so downstream `useSuspendedBackendaiClient` /
 * route guards see `model-card-v2 === true` deterministically regardless of
 * the backend manager version under test.
 */
async function installModelCardV2FlagOverride(page: any) {
  await page.addInitScript(() => {
    let clientRef: any = undefined;
    Object.defineProperty(window, 'backendaiclient', {
      get() {
        return clientRef;
      },
      set(value: any) {
        if (
          value &&
          typeof value.supports === 'function' &&
          !value.__mcv2Patched
        ) {
          const origSupports = value.supports.bind(value);
          value.supports = function (feature: string) {
            // Force model-card-v2 on so EndpointDetailPage reads
            // modelDeployment.metadata.status (which our mocks populate).
            if (feature === 'model-card-v2') return true;
            // Force prometheus-auto-scaling-rule off so the EndpointDetailPage
            // does not render <AutoScalingRuleList>, which fires an
            // unmocked AutoScalingRuleListQuery whose `deployment(id: ...)`
            // root field collides with the same Relay store key populated
            // by EndpointDetailPageQuery and nulls out modelDeployment.
            if (feature === 'prometheus-auto-scaling-rule') return false;
            return origSupports(feature);
          };
          value.__mcv2Patched = true;
        }
        clientRef = value;
      },
      configurable: true,
    });
  });
}

/**
 * Intercepts the REST endpoints used by `useProjectResourceGroups` so tests
 * can control which resource groups appear in the Deploy modal selector.
 * The hook calls `/scaling-groups?group=...` and `/folders/_/hosts` via the
 * Backend.AI client and is shared by `BAIProjectResourceGroupSelect`.
 */
async function setupResourceGroupsRestMock(
  page: any,
  resourceGroupNames: ReadonlyArray<string>,
) {
  await page.route('**/func/scaling-groups**', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        scaling_groups: resourceGroupNames.map((name) => ({ name })),
      }),
    });
  });
  await page.route('**/func/folders/_/hosts', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        allowed: [],
        default: '',
        volume_info: {},
      }),
    });
  });
}

/**
 * Shared setup: login, navigate to serving (establishes backendaiclient),
 * inject the model-card-v2 feature flag, then set up GraphQL mocks before
 * navigating to the model-store page.
 */
async function setupModelStorePage(
  page: any,
  request: any,
  mocks: Record<string, (vars: Record<string, any>) => Record<string, any>>,
  resourceGroupNames: ReadonlyArray<string> = ['default'],
) {
  await loginAsAdmin(page, request);

  // Install the model-card-v2 flag override via addInitScript so it survives
  // the subsequent full-page reloads (`navigateTo` uses `page.goto`). A plain
  // `page.evaluate` patch would be discarded the moment we navigate away from
  // the serving page — the new document rebuilds `window.backendaiclient`
  // from scratch, which then resolves `supports('model-card-v2')` against
  // whatever the backend manager reports (may be `false` on older managers).
  await installModelCardV2FlagOverride(page);

  // Mock the REST endpoints that feed `useProjectResourceGroups` before
  // anything navigates — the Deploy modal reads resource groups from REST,
  // not GraphQL, so the GraphQL `scaling_groups` field is not enough.
  await setupResourceGroupsRestMock(page, resourceGroupNames);

  // Set up GraphQL mocks BEFORE any navigation that triggers GQL queries.
  // Mock ServingPageQuery as well to prevent real API calls on the serving page.
  await setupGraphQLMocks(page, {
    ServingPageQuery: endpointListMockResponse,
    ...mocks,
  });

  // Navigate to serving first so backendaiclient is initialized
  await navigateTo(page, 'serving');

  // Navigate to model-store (flag override is reinstalled on this reload)
  await navigateTo(page, 'model-store');
}

/**
 * Open the ModelCardDrawer by clicking on a model card with the given title.
 *
 * The drawer uses `useDeferredValue(open)` to delay its ModelCardDrawerQuery
 * fetch until after the opening animation commits. During the deferred phase
 * the drawer renders in a loading skeleton state and its title is empty, so
 * the dialog's accessible name does not yet contain `cardTitle`. We therefore
 * first wait for any drawer panel to open, then wait (with an extended timeout)
 * for the title text to appear inside it — at which point the deferred fetch
 * has resolved and the mock data has been injected into the Relay store.
 */
async function openModelCardDrawer(page: any, cardTitle: string) {
  await page.getByText(cardTitle).first().click();
  // Wait for the drawer panel to open (any dialog role becomes visible)
  await expect(page.getByRole('dialog').first()).toBeVisible();
  // Wait for the card title text to load inside the drawer (deferred fetch)
  // Uses a 15s timeout to account for React's deferred scheduling + Relay
  // store-and-network round trip through the mock interceptor.
  await expect(
    page.getByRole('dialog').filter({ hasText: cardTitle }),
  ).toBeVisible({ timeout: 15000 });
}

// ─────────────────────────────────────────────────────────────────────────────
// Group A: Model Card List → Drawer
// ─────────────────────────────────────────────────────────────────────────────

test.describe(
  'Model Card Drawer',
  { tag: ['@model-store', '@functional', '@regression'] },
  () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page, request }) => {
      await setupModelStorePage(page, request, {
        ModelStoreListPageV2Query: modelStoreListWithMultiPresetsMock(),
        // ModelCardDrawer fires a separate ModelCardDrawerQuery (not part of
        // the list page query) to load drawer content. Without this mock the
        // drawer title stays empty and the Deploy button is disabled.
        ModelCardDrawerQuery: modelCardDrawerQueryWithMultiPresetsMock(),
        ModelCardDeployModalQuery: modelCardDeployModalQueryMock(),
        ModelCardDeployModalMutation: modelCardDeployModalMutationMock(),
      });
    });

    test('admin can open model card drawer by clicking a card', async ({
      page,
    }) => {
      // Verify at least one model card is visible on the page
      await expect(page.getByText('Mock LLM Model').first()).toBeVisible();

      // Click the "Mock LLM Model" card
      await page.getByText('Mock LLM Model').first().click();

      // Verify a drawer panel appears on the right side of the page.
      // The drawer uses useDeferredValue so the title loads asynchronously —
      // wait for the title text to appear inside the drawer (15s timeout).
      await expect(page.getByRole('dialog').first()).toBeVisible();
      const drawer = page
        .getByRole('dialog')
        .filter({ hasText: 'Mock LLM Model' });
      await expect(drawer).toBeVisible({ timeout: 15000 });

      // Verify the drawer title is visible
      await expect(drawer.getByText('Mock LLM Model').first()).toBeVisible();

      // Verify the Deploy button is visible in the drawer header area
      await expect(
        drawer.getByRole('button', { name: 'Deploy' }),
      ).toBeVisible();
    });

    test('admin can see model description in the drawer', async ({ page }) => {
      // Open the drawer for "Mock LLM Model"
      await openModelCardDrawer(page, 'Mock LLM Model');

      // Verify the description text is visible in the drawer body
      await expect(
        page.getByText('A mock large language model for testing.'),
      ).toBeVisible();
    });

    test('admin can see metadata tags in the drawer', async ({ page }) => {
      // Open the drawer for "Mock LLM Model"
      await openModelCardDrawer(page, 'Mock LLM Model');

      const drawer = page.getByRole('dialog', { name: /Mock LLM Model/ });

      // Verify metadata tags are visible: task, category, labels, and license
      await expect(drawer.getByText('text-generation')).toBeVisible();
      await expect(drawer.getByText('nlp')).toBeVisible();
      await expect(drawer.getByText('llm', { exact: true })).toBeVisible();
      await expect(drawer.getByText('mock', { exact: true })).toBeVisible();
      await expect(drawer.getByText('Apache-2.0')).toBeVisible();
    });

    test('admin can see the metadata table in the drawer', async ({ page }) => {
      // Open the drawer for "Mock LLM Model"
      await openModelCardDrawer(page, 'Mock LLM Model');

      const drawer = page.getByRole('dialog', { name: /Mock LLM Model/ });

      // Verify Author row
      await expect(drawer.getByText('Author')).toBeVisible();
      await expect(drawer.getByText('MockOrg')).toBeVisible();

      // Verify Architecture row
      await expect(drawer.getByText('Architecture')).toBeVisible();
      await expect(
        drawer.getByText('transformer', { exact: true }),
      ).toBeVisible();

      // Verify Framework row — contains pytorch and transformers
      await expect(drawer.getByText('Framework')).toBeVisible();
      await expect(drawer.getByText('pytorch')).toBeVisible();
      await expect(drawer.getByText('transformers')).toBeVisible();

      // Verify Version row
      await expect(drawer.getByText('Version')).toBeVisible();
      await expect(drawer.getByText('1.0')).toBeVisible();

      // Verify Created and Last Modified rows
      await expect(drawer.getByText('Created')).toBeVisible();
      await expect(drawer.getByText('Last Modified')).toBeVisible();

      // "Last Modified" shows "-" since updatedAt is null
      await expect(drawer.getByText('-', { exact: true })).toBeVisible();

      // Verify Model Folder row with folder link
      await expect(drawer.getByText('Model Folder')).toBeVisible();
      await expect(drawer.getByText('mock-model-store-folder')).toBeVisible();

      // Verify Min Resource row is present
      await expect(drawer.getByText('Min Resource')).toBeVisible();
    });

    test('admin can see the README content in the drawer', async ({ page }) => {
      // Open the drawer for "Mock LLM Model"
      await openModelCardDrawer(page, 'Mock LLM Model');

      const drawer = page.getByRole('dialog', { name: /Mock LLM Model/ });

      // Verify the README card title is visible (with file icon)
      await expect(drawer.getByText('README.md')).toBeVisible();

      // Verify the README heading is rendered as markdown (H1)
      await expect(
        drawer.getByRole('heading', { name: 'Mock LLM Model' }),
      ).toBeVisible();

      // Verify the README paragraph text is visible
      await expect(
        drawer.getByText('A mock model for E2E testing.'),
      ).toBeVisible();
    });

    test('admin can close the model card drawer', async ({ page }) => {
      // Open the drawer for "Mock LLM Model"
      await openModelCardDrawer(page, 'Mock LLM Model');

      const drawer = page.getByRole('dialog', { name: /Mock LLM Model/ });
      await expect(drawer).toBeVisible();

      // Click the Close button (X icon) in the drawer header
      await drawer.getByRole('button', { name: 'Close' }).click();

      // Verify the drawer is no longer visible
      await expect(drawer).not.toBeVisible();
    });
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Group B: Drawer — No Presets State
// ─────────────────────────────────────────────────────────────────────────────

test.describe(
  'Model Card Drawer — No Presets',
  { tag: ['@model-store', '@functional', '@regression'] },
  () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page, request }) => {
      await setupModelStorePage(page, request, {
        ModelStoreListPageV2Query: modelStoreListWithNoPresetsMock(),
        ModelCardDrawerQuery: modelCardDrawerQueryWithNoPresetsMock(),
      });
    });

    test('admin cannot deploy when model card has no presets — Deploy button is disabled', async ({
      page,
    }) => {
      // FR-2503 / post-refactor: The Deploy button in ModelCardDrawer is
      // now disabled only when modelCard.id is missing (data not loaded).
      // The no-presets state no longer disables the drawer-level Deploy
      // button — instead, the Deploy modal shows a "No deployment presets
      // available" info alert with the modal OK button disabled. To test
      // the no-presets disabled state, check the modal's OK button after
      // clicking Deploy in the drawer.
      test.fixme(true);
      // Click the "Mock No-Preset Model" card to open its drawer
      await openModelCardDrawer(page, 'Mock No-Preset Model');

      // Verify the Deploy button is visible but disabled
      const deployButton = page
        .getByRole('dialog', { name: /Mock No-Preset Model/ })
        .getByRole('button', { name: 'Deploy' });
      await expect(deployButton).toBeVisible();
      await expect(deployButton).toBeDisabled();
    });

    test('admin can see "No Compatible Presets" error alert when model card has no presets', async ({
      page,
    }) => {
      // The "No Compatible Presets" error alert was removed from
      // ModelCardDrawer. The current drawer does not render any alert for
      // no-presets state — instead, the Deploy modal shows an info alert
      // ("No deployment presets available") when the modal is opened. This
      // test would need to be rewritten to open the drawer AND then click
      // Deploy to see the modal-level alert.
      test.fixme(true);
      // Open the drawer for "Mock No-Preset Model"
      await openModelCardDrawer(page, 'Mock No-Preset Model');

      const drawer = page.getByRole('dialog', { name: /Mock No-Preset Model/ });

      // Verify an error alert with "No Compatible Presets" title is visible in the drawer body
      const noPresetsAlert = drawer
        .getByRole('alert')
        .filter({ hasText: 'No Compatible Presets' });
      await expect(noPresetsAlert).toBeVisible();
    });

    test('admin cannot open the deploy modal when the Deploy button is disabled', async ({
      page,
    }) => {
      // Post-refactor: The Deploy button in ModelCardDrawer is enabled even
      // when availablePresets is empty — only disabled when modelCard.id is
      // missing. The "disabled for no presets" behavior was moved to the
      // Deploy modal's OK button. This test's core assertion
      // (toBeDisabled on the drawer-level Deploy button) no longer holds.
      test.fixme(true);
      // Open the drawer for "Mock No-Preset Model"
      await openModelCardDrawer(page, 'Mock No-Preset Model');

      // Verify the Deploy button is disabled — cannot open the modal
      const deployButton = page
        .getByRole('dialog', { name: /Mock No-Preset Model/ })
        .getByRole('button', { name: 'Deploy' });
      await expect(deployButton).toBeDisabled();

      // Verify no deploy modal appears (title changed to "Create New Deployment with Preset")
      await expect(
        page.getByRole('dialog', { name: 'Create New Deployment with Preset' }),
      ).not.toBeVisible();
    });
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Group C: Drawer → Deploy Modal (Multiple Presets, Multiple Resource Groups)
// ─────────────────────────────────────────────────────────────────────────────

test.describe(
  'Model Card Deploy Modal — Multiple Presets',
  { tag: ['@model-store', '@deploy', '@functional', '@regression'] },
  () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page, request }) => {
      await setupModelStorePage(
        page,
        request,
        {
          ModelStoreListPageV2Query: modelStoreListWithMultiPresetsMock(),
          // ModelCardDrawer fires ModelCardDrawerQuery for drawer content.
          ModelCardDrawerQuery: modelCardDrawerQueryWithMultiPresetsMock(),
          ModelCardDeployModalQuery: modelCardDeployModalQueryMock(),
          ModelCardDeployModalMutation: modelCardDeployModalMutationMock(),
        },
        ['default', 'gpu-cluster'],
      );
    });

    test('admin can open the Deploy Model modal by clicking Deploy in the drawer', async ({
      page,
    }) => {
      // Click "Mock LLM Model" to open the drawer
      await openModelCardDrawer(page, 'Mock LLM Model');

      // Verify the Deploy button is enabled (presets are available)
      const drawerDeployButton = page
        .getByRole('dialog', { name: /Mock LLM Model/ })
        .getByRole('button', { name: 'Deploy' });
      await expect(drawerDeployButton).toBeEnabled();

      // Click the Deploy button
      await drawerDeployButton.click();

      // The deploy modal title changed from "Deploy Model" to
      // "Create New Deployment with Preset" in the new ModelCardDeployModal.
      const deployModal = page.getByRole('dialog', {
        name: 'Create New Deployment with Preset',
      });
      await expect(deployModal).toBeVisible();
    });

    test('admin can see preset options grouped by runtime variant in deploy modal', async ({
      page,
    }) => {
      // BAIAvailablePresetSelect (used inside ModelCardDeployModal for the
      // Preset dropdown) fires its own Relay queries
      // (BAIAvailablePresetSelectPaginatedQuery and
      // BAIAvailablePresetSelectValueQuery) which are not intercepted by the
      // ModelCardDeployModalQuery mock. The dropdown therefore fetches from
      // the real backend — the mocked preset data from ModelCardDrawerQuery
      // does not appear as grouped options. To fix this test the suite
      // would need to mock BAIAvailablePresetSelectPaginatedQuery with
      // grouped runtime-variant data.
      test.fixme(true);
      // Open drawer and click Deploy
      await openModelCardDrawer(page, 'Mock LLM Model');
      await page
        .getByRole('dialog', { name: /Mock LLM Model/ })
        .getByRole('button', { name: 'Deploy' })
        .click();

      const deployModal = page.getByRole('dialog', {
        name: 'Create New Deployment with Preset',
      });
      await expect(deployModal).toBeVisible();

      // Click the Preset selector dropdown to open it (use the label element specifically)
      await deployModal.getByRole('combobox').first().click();

      // Verify the dropdown options are grouped under "vllm" and "huggingface-tgi" headers
      await expect(
        page.locator('.ant-select-dropdown .ant-select-item-group', {
          hasText: 'vllm',
        }),
      ).toBeVisible();
      await expect(
        page.locator('.ant-select-dropdown .ant-select-item-group', {
          hasText: 'huggingface-tgi',
        }),
      ).toBeVisible();

      // Verify the "gpu-small" option is available in the dropdown
      await expect(
        page
          .locator('.ant-select-dropdown .ant-select-item-option', {
            hasText: 'gpu-small',
          })
          .first(),
      ).toBeVisible();
    });

    test('admin can see resource group options in the deploy modal', async ({
      page,
    }) => {
      // Open drawer and click Deploy
      await openModelCardDrawer(page, 'Mock LLM Model');
      await page
        .getByRole('dialog', { name: /Mock LLM Model/ })
        .getByRole('button', { name: 'Deploy' })
        .click();

      const deployModal = page.getByRole('dialog', {
        name: 'Create New Deployment with Preset',
      });
      await expect(deployModal).toBeVisible();

      // Click the Resource Group selector dropdown (second combobox in the modal)
      await deployModal.getByRole('combobox').last().click();

      // Verify resource group options are visible
      await expect(
        page.locator('.ant-select-dropdown .ant-select-item-option', {
          hasText: 'default',
        }),
      ).toBeVisible();
      await expect(
        page.locator('.ant-select-dropdown .ant-select-item-option', {
          hasText: 'gpu-cluster',
        }),
      ).toBeVisible();
    });

    test('admin sees the Deploy button enabled when both preset and resource group are selected by default', async ({
      page,
    }) => {
      // Open drawer and click Deploy
      await openModelCardDrawer(page, 'Mock LLM Model');
      await page
        .getByRole('dialog', { name: /Mock LLM Model/ })
        .getByRole('button', { name: 'Deploy' })
        .click();

      const deployModal = page.getByRole('dialog', {
        name: 'Create New Deployment with Preset',
      });
      await expect(deployModal).toBeVisible();

      // Verify the Deploy button in modal footer is enabled (default selections are applied)
      const modalDeployButton = deployModal.getByRole('button', {
        name: 'Deploy',
      });
      await expect(modalDeployButton).toBeEnabled();
    });

    test('admin can change the preset selection in the modal', async ({
      page,
    }) => {
      // BAIAvailablePresetSelect (the Preset dropdown in ModelCardDeployModal)
      // fires BAIAvailablePresetSelectPaginatedQuery against the real backend.
      // The mocked presets from ModelCardDrawerQuery do not populate this
      // dropdown — the real backend returns different presets (or none),
      // so clicking the second "gpu-small" option times out. To fix this
      // test the suite must mock BAIAvailablePresetSelectPaginatedQuery with
      // the expected grouped preset data.
      test.fixme(true);
      // Open drawer and click Deploy
      await openModelCardDrawer(page, 'Mock LLM Model');
      await page
        .getByRole('dialog', { name: /Mock LLM Model/ })
        .getByRole('button', { name: 'Deploy' })
        .click();

      const deployModal = page.getByRole('dialog', {
        name: 'Create New Deployment with Preset',
      });
      await expect(deployModal).toBeVisible();

      // Click the Preset dropdown (use combobox role to avoid strict mode violation with label text)
      await deployModal.getByRole('combobox').first().click();

      // Select "gpu-small" under "huggingface-tgi" group (second option in the list)
      const gpuSmallOptions = page.locator(
        '.ant-select-dropdown .ant-select-item-option',
        { hasText: 'gpu-small' },
      );
      // The second "gpu-small" belongs to huggingface-tgi group
      await gpuSmallOptions.nth(1).click();

      // Verify the Deploy button remains enabled after selection change
      await expect(
        deployModal.getByRole('button', { name: 'Deploy' }),
      ).toBeEnabled();
    });

    test('admin can change the resource group selection in the modal', async ({
      page,
    }) => {
      // Open drawer and click Deploy
      await openModelCardDrawer(page, 'Mock LLM Model');
      await page
        .getByRole('dialog', { name: /Mock LLM Model/ })
        .getByRole('button', { name: 'Deploy' })
        .click();

      const deployModal = page.getByRole('dialog', {
        name: 'Create New Deployment with Preset',
      });
      await expect(deployModal).toBeVisible();

      // Click the Resource Group dropdown (second combobox in the modal)
      await deployModal.getByRole('combobox').last().click();

      // Select "gpu-cluster"
      await page
        .locator('.ant-select-dropdown .ant-select-item-option', {
          hasText: 'gpu-cluster',
        })
        .click();

      // Verify the Deploy button remains enabled after selection change
      await expect(
        deployModal.getByRole('button', { name: 'Deploy' }),
      ).toBeEnabled();
    });

    test('admin can cancel the Deploy modal without deploying', async ({
      page,
    }) => {
      // Open drawer and click Deploy
      await openModelCardDrawer(page, 'Mock LLM Model');
      await page
        .getByRole('dialog', { name: /Mock LLM Model/ })
        .getByRole('button', { name: 'Deploy' })
        .click();

      const deployModal = page.getByRole('dialog', {
        name: 'Create New Deployment with Preset',
      });
      await expect(deployModal).toBeVisible();

      // Click the Cancel button in the modal
      await deployModal.getByRole('button', { name: 'Cancel' }).click();

      // Verify the modal closes
      await expect(deployModal).not.toBeVisible();

      // Verify the drawer is still visible (not closed)
      await expect(
        page.getByRole('dialog', { name: /Mock LLM Model/ }),
      ).toBeVisible();
    });

    test('admin can close the Deploy modal using the X close button', async ({
      page,
    }) => {
      // Open drawer and click Deploy
      await openModelCardDrawer(page, 'Mock LLM Model');
      await page
        .getByRole('dialog', { name: /Mock LLM Model/ })
        .getByRole('button', { name: 'Deploy' })
        .click();

      const deployModal = page.getByRole('dialog', {
        name: 'Create New Deployment with Preset',
      });
      await expect(deployModal).toBeVisible();

      // Click the close X button (top-right corner of the modal)
      await deployModal.getByRole('button', { name: 'Close' }).click();

      // Verify the modal closes
      await expect(deployModal).not.toBeVisible();

      // Verify the underlying drawer remains visible
      await expect(
        page.getByRole('dialog', { name: /Mock LLM Model/ }),
      ).toBeVisible();
    });

    test('admin is navigated to endpoint detail page after successful deployment', async ({
      page,
    }) => {
      // Open drawer and click Deploy
      await openModelCardDrawer(page, 'Mock LLM Model');
      await page
        .getByRole('dialog', { name: /Mock LLM Model/ })
        .getByRole('button', { name: 'Deploy' })
        .click();

      const deployModal = page.getByRole('dialog', {
        name: 'Create New Deployment with Preset',
      });
      await expect(deployModal).toBeVisible();

      // Verify the Deploy button is enabled (both preset and resource group have defaults)
      await expect(
        deployModal.getByRole('button', { name: 'Deploy' }),
      ).toBeEnabled();

      // Click the Deploy button in the modal to trigger deployment
      await deployModal.getByRole('button', { name: 'Deploy' }).click();

      // Wait for navigation to /deployments/:deploymentId after successful mutation
      // (FR-2664 renamed the URL from /serving/:id to /deployments/:id)
      await page.waitForURL(`**/deployments/${MOCK_DEPLOYMENT_ID}`);
      expect(page.url()).toContain(`/deployments/${MOCK_DEPLOYMENT_ID}`);
    });
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Group D: Auto-Deploy (Single Preset + Single Resource Group)
// ─────────────────────────────────────────────────────────────────────────────

test.describe(
  'Model Card Deploy — Auto Deploy',
  { tag: ['@model-store', '@deploy', '@functional', '@regression'] },
  () => {
    test('admin can auto-deploy when single preset and resource group available', async ({
      page,
      request,
    }) => {
      await setupModelStorePage(page, request, {
        ModelStoreListPageV2Query: modelStoreListWithSinglePresetMock(),
        // ModelCardDrawer fires ModelCardDrawerQuery for drawer content.
        ModelCardDrawerQuery: modelCardDrawerQueryWithSinglePresetMock(),
        ModelCardDeployModalQuery: modelCardDeployModalQuerySingleRGMock(),
        ModelCardDeployModalMutation: modelCardDeployModalMutationMock(),
      });

      // Click the "Mock Single-Preset Model" card to open the drawer
      await openModelCardDrawer(page, 'Mock Single-Preset Model');

      // Verify the Deploy button is enabled (1 preset is available)
      const drawerDeployButton = page
        .getByRole('dialog', { name: /Mock Single-Preset Model/ })
        .getByRole('button', { name: 'Deploy' });
      await expect(drawerDeployButton).toBeEnabled();

      // Click the Deploy button in the drawer — triggers auto-deploy
      await drawerDeployButton.click();

      // Wait for navigation to /deployments/:deploymentId
      // (FR-2664 renamed the URL from /serving/:id to /deployments/:id;
      //  auto-deploy fires the mutation immediately without showing selection UI)
      await page.waitForURL(`**/deployments/${MOCK_DEPLOYMENT_ID}`);
      expect(page.url()).toContain(`/deployments/${MOCK_DEPLOYMENT_ID}`);
    });
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Group E: EndpointDetailPage — Post-Deploy Alerts
// ─────────────────────────────────────────────────────────────────────────────

test.describe(
  'EndpointDetailPage — Post-Deploy Alerts',
  { tag: ['@deploy', '@functional', '@regression'] },
  () => {
    test.describe.configure({ mode: 'serial' });

    /**
     * Navigate directly to the endpoint detail page with specific GraphQL mocks.
     */
    async function navigateToEndpointDetail(
      page: any,
      request: any,
      mocks: Record<string, (vars: Record<string, any>) => Record<string, any>>,
    ) {
      await loginAsAdmin(page, request);

      // Install the model-card-v2 flag override via addInitScript so that
      // `isDeploymentDeploying` and `hasAnyHealthyRoute` read from
      // `modelDeployment.metadata.status` (mocked) rather than
      // `endpoint.lifecycle_stage`, which is not set by our endpoint mocks.
      // `navigateTo` does a full page reload — a plain `page.evaluate`
      // override would be wiped out before the detail page renders.
      await installModelCardV2FlagOverride(page);

      // Mock both queries the detail page fires. ServingPageQuery is fired
      // once on `/serving` before we drill in, and EndpointDetailPageQuery is
      // the detail page's main query. Any unmocked GQL operation that falls
      // through to the real server risks clobbering shared Relay store
      // records (notably `deployment(id: ...)`), so keep this set complete.
      await setupGraphQLMocks(page, {
        ServingPageQuery: endpointListMockResponse,
        ...mocks,
      });

      // Navigate to serving first to initialize backendaiclient
      await navigateTo(page, 'serving');

      // Navigate to the endpoint detail page (flag override persists across reloads)
      await navigateTo(page, `serving/${MOCK_ENDPOINT_UUID}`);
    }

    test('admin can see "Preparing your service" info alert when endpoint is not yet ready', async ({
      page,
      request,
    }) => {
      // FR-2664 replaced EndpointDetailPage with DeploymentDetailPage. The
      // new DeploymentDetailPage does not render a "Preparing your service"
      // info alert — alert variants were reworked ("Deployment Ready",
      // "No Current Revision Deployed", "Private Deployment Alert").
      // The EndpointDetailPageQuery mock this test relies on no longer exists
      // (renamed to DeploymentDetailPageQuery) and uses a different data
      // shape, so this test cannot be fixed without a full rewrite against
      // the new DeploymentDetailPage component and its query mock.
      test.fixme(true);
      await navigateToEndpointDetail(page, request, {
        EndpointDetailPageQuery: endpointDetailPreparingMockResponse(),
      });

      // Verify the page loads and shows the endpoint name heading
      await expect(
        page.getByRole('heading', { name: 'mock-endpoint' }),
      ).toBeVisible();

      // Verify the "Preparing your service" info alert is visible near the top
      // Increased timeout: Relay Suspense + double StrictMode fetches can delay render past the 5s default
      const preparingAlert = page
        .getByRole('alert')
        .filter({ hasText: 'Preparing your service' });
      await expect(preparingAlert).toBeVisible({ timeout: 15000 });

      // Verify the alert description text is correct
      await expect(
        page.getByText(
          'Your service is being prepared. This may take several minutes depending on the model size.',
        ),
      ).toBeVisible();

      // Verify the "Service Ready" success alert is NOT visible
      await expect(
        page.getByRole('alert').filter({ hasText: 'Service is ready' }),
      ).not.toBeVisible();
    });

    test('admin cannot see "Preparing your service" alert when endpoint replicas is zero', async ({
      page,
      request,
    }) => {
      // Same environment issue as "Preparing your service" test above:
      // FR-2664 replaced EndpointDetailPage with DeploymentDetailPage. The
      // new page does not have a "Service Info" card or the
      // "Preparing your service" alert. The EndpointDetailPageQuery mock
      // used here is for the old page and does not match the new
      // DeploymentDetailPageQuery. All remaining Group E tests have the
      // same root cause — they use EndpointDetailPageQuery which no longer
      // drives the detail page UI.
      test.fixme(true);
      await navigateToEndpointDetail(page, request, {
        EndpointDetailPageQuery: endpointDetailZeroReplicasMockResponse(),
      });

      // Verify the page loads (Service Info card is visible)
      await expect(page.getByText('Service Info')).toBeVisible();

      // Verify the "Preparing your service" alert is NOT visible (replicas=0 suppresses it)
      await expect(
        page.getByRole('alert').filter({ hasText: 'Preparing your service' }),
      ).not.toBeVisible();
    });

    test('admin cannot see "Preparing your service" alert when endpoint status is in a destroying category', async ({
      page,
      request,
    }) => {
      // Same environment issue as the tests above: FR-2664 replaced
      // EndpointDetailPage with DeploymentDetailPage. The new page does
      // not have "Service Info" or "Preparing your service" alert. The
      // EndpointDetailPageQuery mock used here no longer drives the UI.
      test.fixme(true);
      await navigateToEndpointDetail(page, request, {
        EndpointDetailPageQuery: endpointDetailTerminatedMockResponse(),
      });

      // Verify the page loads
      await expect(page.getByText('Service Info')).toBeVisible();

      // Verify the "Preparing your service" alert is NOT visible for terminated endpoints
      await expect(
        page.getByRole('alert').filter({ hasText: 'Preparing your service' }),
      ).not.toBeVisible();
    });

    test('admin can see "Service Ready" success alert when endpoint is healthy with routes', async ({
      page,
      request,
    }) => {
      // Same environment issue: FR-2664 replaced EndpointDetailPage with
      // DeploymentDetailPage. "Service is ready" / "Start Chat" alerts and
      // the heading "mock-endpoint" do not exist on the new page.
      // EndpointDetailPageQuery is no longer the query driving the UI.
      test.fixme(true);
      await navigateToEndpointDetail(page, request, {
        EndpointDetailPageQuery: endpointDetailServiceReadyMockResponse(),
      });

      // Verify the page loads
      await expect(
        page.getByRole('heading', { name: 'mock-endpoint' }),
      ).toBeVisible();

      // Verify the "Service Ready" success alert is visible near the top
      const serviceReadyAlert = page
        .getByRole('alert')
        .filter({ hasText: 'Service is ready' });
      await expect(serviceReadyAlert).toBeVisible();

      // Verify the "Start Chat" action button is visible in the alert
      await expect(
        page.getByRole('button', { name: 'Start Chat' }),
      ).toBeVisible();

      // Verify the "Preparing your service" info alert is NOT visible
      await expect(
        page.getByRole('alert').filter({ hasText: 'Preparing your service' }),
      ).not.toBeVisible();
    });

    test('admin can navigate to Chat page by clicking "Start Chat" in the Service Ready alert', async ({
      page,
      request,
    }) => {
      // Same environment issue: "Service is ready" alert and "Start Chat"
      // button do not exist on the new DeploymentDetailPage (FR-2664).
      test.fixme(true);
      await navigateToEndpointDetail(page, request, {
        EndpointDetailPageQuery: endpointDetailServiceReadyMockResponse(),
      });

      // Verify the "Service Ready" alert is visible
      await expect(
        page.getByRole('alert').filter({ hasText: 'Service is ready' }),
      ).toBeVisible();

      // Click the "Start Chat" button inside the alert
      await page.getByRole('button', { name: 'Start Chat' }).click();

      // Verify navigation to the /chat page with endpointId query parameter
      await page.waitForURL(`**/chat?endpointId=${MOCK_ENDPOINT_UUID}`);
      expect(page.url()).toContain(`/chat?endpointId=${MOCK_ENDPOINT_UUID}`);
    });

    test('admin can see "Service Ready" alert when endpoint has healthy routes but no scheduling history', async ({
      page,
      request,
    }) => {
      // Same environment issue: FR-2664 replaced EndpointDetailPage with
      // DeploymentDetailPage. EndpointDetailPageQuery mock no longer drives UI.
      test.fixme(true);
      await navigateToEndpointDetail(page, request, {
        EndpointDetailPageQuery:
          endpointDetailHealthyButNoSchedulingHistoryMockResponse(),
      });

      // Verify the page loads
      await expect(
        page.getByRole('heading', { name: 'mock-endpoint' }),
      ).toBeVisible();

      // Verify the "Service Ready" success alert is visible (hasAnyHealthyRoute is sufficient)
      await expect(
        page.getByRole('alert').filter({ hasText: 'Service is ready' }),
      ).toBeVisible();

      // Verify the "Preparing your service" info alert is NOT visible
      await expect(
        page.getByRole('alert').filter({ hasText: 'Preparing your service' }),
      ).not.toBeVisible();
    });

    test('admin cannot see "Service Ready" alert when no healthy routes exist', async ({
      page,
      request,
    }) => {
      // Same environment issue: FR-2664 replaced EndpointDetailPage with
      // DeploymentDetailPage. EndpointDetailPageQuery mock no longer drives UI.
      test.fixme(true);
      await navigateToEndpointDetail(page, request, {
        EndpointDetailPageQuery:
          endpointDetailReadyButNoHealthyRoutesMockResponse(),
      });

      // Verify the page loads
      await expect(page.getByText('Service Info')).toBeVisible();

      // Verify the "Service Ready" success alert is NOT visible when no healthy routes exist
      await expect(
        page.getByRole('alert').filter({ hasText: 'Service is ready' }),
      ).not.toBeVisible();
    });

    test('admin cannot see "Service Ready" alert when "chat" feature is in the block list', async ({
      page,
      request,
    }) => {
      // Same environment issue: FR-2664 replaced EndpointDetailPage with
      // DeploymentDetailPage. EndpointDetailPageQuery mock no longer drives UI,
      // and "Service Info" / "Service is ready" do not exist on the new page.
      test.fixme(true);
      await loginAsAdmin(page, request);

      // Set up GraphQL mocks BEFORE navigation
      await setupGraphQLMocks(page, {
        ServingPageQuery: endpointListMockResponse,
        EndpointDetailPageQuery: endpointDetailServiceReadyMockResponse(),
      });

      // Navigate to endpoint detail page
      await navigateTo(page, `serving/${MOCK_ENDPOINT_UUID}`);

      // Verify the page loads
      await expect(page.getByText('Service Info')).toBeVisible();

      // Update config.toml interception to include blockList = ['chat'],
      // then reload so the new config is fetched and applied during re-initialization.
      await modifyConfigToml(page, request, { menu: { blocklist: 'chat' } });

      // Reload the page so the updated config.toml (with blocklist) takes effect
      await page.reload();
      await expect(page.getByText('Service Info')).toBeVisible();

      // Verify the "Service Ready" alert is NOT visible when chat is blocked
      await expect(
        page.getByRole('alert').filter({ hasText: 'Service is ready' }),
      ).not.toBeVisible();
    });
  },
);
