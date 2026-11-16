// FR-2503: E2E tests for Model Card Drawer and Deploy UX
import { endpointListMockResponse } from '../../mocks/serving/endpoint-list-mock';
import {
  MOCK_DEPLOYMENT_ID,
  availablePresetSelectMocks,
  modelCardDeployModalMutationMock,
  modelCardDeployModalQueryMock,
  modelCardDeployModalQuerySingleRGMock,
  modelStoreListWithMultiPresetsMock,
  modelStoreListWithNoPresetsMock,
  modelStoreListWithSinglePresetMock,
  modelCardDrawerQueryWithMultiPresetsMock,
  modelCardDrawerQueryWithNoPresetsMock,
  modelCardDrawerQueryWithSinglePresetMock,
} from '../../mocks/serving/model-store-mock';
import { setupGraphQLMocks } from '../../mocks/session/graphql-interceptor';
import { createDeploymentShell } from '../../utils/deployment-fixtures';
import { createTestResources } from '../../utils/test-resources';
import {
  loginAsAdmin,
  modifyConfigToml,
  navigateTo,
} from '../../utils/test-util';
import { test, expect } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────

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
 * then set up GraphQL mocks before navigating to the model-store page.
 */
async function setupModelStorePage(
  page: any,
  request: any,
  mocks: Record<string, (vars: Record<string, any>) => Record<string, any>>,
  resourceGroupNames: ReadonlyArray<string> = ['default'],
) {
  await loginAsAdmin(page, request);

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

      // Verify the README heading is rendered as markdown (H1). Scoped to
      // level 1 — the drawer's own title is also a heading with this name.
      await expect(
        drawer.getByRole('heading', { name: 'Mock LLM Model', level: 1 }),
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

    async function openNoPresetDeployModal(page: any) {
      await openModelCardDrawer(page, 'Mock No-Preset Model');
      const drawerDeployButton = page
        .getByRole('dialog', { name: /Mock No-Preset Model/ })
        .getByRole('button', { name: 'Deploy' });
      // The drawer's Deploy stays enabled; the modal explains the empty state.
      await expect(drawerDeployButton).toBeEnabled();
      await drawerDeployButton.click();
      const deployModal = page.getByRole('dialog', {
        name: 'Create New Deployment with Preset',
      });
      await expect(deployModal).toBeVisible();
      return deployModal;
    }

    test('admin sees "No deployment presets available" in the deploy modal when the model card has no presets', async ({
      page,
    }) => {
      const deployModal = await openNoPresetDeployModal(page);

      await expect(
        deployModal
          .getByRole('status')
          .filter({ hasText: 'No deployment presets available.' }),
      ).toBeVisible();
    });

    test('admin cannot deploy from the modal when the model card has no presets', async ({
      page,
    }) => {
      const deployModal = await openNoPresetDeployModal(page);

      await expect(
        deployModal.getByRole('combobox', { name: 'Preset', exact: true }),
      ).toBeDisabled();
      await expect(
        deployModal.getByRole('button', { name: /^Resource Group/ }),
      ).toBeDisabled();
      await expect(
        deployModal.getByRole('button', { name: 'Deploy', exact: true }),
      ).toBeDisabled();
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

    let deployMutationVariables: Array<Record<string, any>> = [];

    test.beforeEach(async ({ page, request }) => {
      deployMutationVariables = [];
      await setupModelStorePage(
        page,
        request,
        {
          ModelStoreListPageV2Query: modelStoreListWithMultiPresetsMock(),
          // ModelCardDrawer fires ModelCardDrawerQuery for drawer content.
          ModelCardDrawerQuery: modelCardDrawerQueryWithMultiPresetsMock(),
          ModelCardDeployModalQuery: modelCardDeployModalQueryMock(),
          ModelCardDeployModalMutation: (vars) => {
            deployMutationVariables.push(vars);
            return modelCardDeployModalMutationMock()();
          },
          ...availablePresetSelectMocks(),
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

    test('admin can see the preset options in the deploy modal', async ({
      page,
    }) => {
      await openModelCardDrawer(page, 'Mock LLM Model');
      await page
        .getByRole('dialog', { name: /Mock LLM Model/ })
        .getByRole('button', { name: 'Deploy' })
        .click();

      const deployModal = page.getByRole('dialog', {
        name: 'Create New Deployment with Preset',
      });
      await expect(deployModal).toBeVisible();

      // The first available preset is selected by default.
      const presetSelect = deployModal.getByRole('combobox', {
        name: 'Preset',
        exact: true,
      });
      await expect(presetSelect).toContainText('gpu-small');

      await presetSelect.click();
      const presetPopup = page.getByRole('dialog', {
        name: 'Preset',
        exact: true,
      });
      await expect(presetPopup).toBeVisible();
      await expect(
        presetPopup.getByRole('option', { name: /gpu-small/ }),
      ).toBeVisible();
      await expect(
        presetPopup.getByRole('option', { name: /gpu-medium/ }),
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

      // The Resource Group select is an Astryx Selector: a button trigger
      // whose accessible name starts with its form label, plus a listbox.
      await deployModal
        .getByRole('button', { name: /^Resource Group/ })
        .click();

      // Verify resource group options are visible
      const listbox = page.getByRole('listbox');
      await expect(
        listbox.getByRole('option', { name: 'default', exact: true }),
      ).toBeVisible();
      await expect(
        listbox.getByRole('option', { name: 'gpu-cluster', exact: true }),
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
        exact: true,
      });
      await expect(modalDeployButton).toBeEnabled();
    });

    test('admin can change the preset selection in the modal', async ({
      page,
    }) => {
      await openModelCardDrawer(page, 'Mock LLM Model');
      await page
        .getByRole('dialog', { name: /Mock LLM Model/ })
        .getByRole('button', { name: 'Deploy' })
        .click();

      const deployModal = page.getByRole('dialog', {
        name: 'Create New Deployment with Preset',
      });
      await expect(deployModal).toBeVisible();

      const presetSelect = deployModal.getByRole('combobox', {
        name: 'Preset',
        exact: true,
      });
      await presetSelect.click();
      const presetPopup = page.getByRole('dialog', {
        name: 'Preset',
        exact: true,
      });
      await presetPopup.getByRole('option', { name: /gpu-medium/ }).click();
      await expect(presetPopup).toBeHidden();
      await expect(presetSelect).toContainText('gpu-medium');

      // Deploying sends the newly selected preset.
      const modalDeployButton = deployModal.getByRole('button', {
        name: 'Deploy',
        exact: true,
      });
      await expect(modalDeployButton).toBeEnabled();
      await modalDeployButton.click();
      await page.waitForURL(`**/deployments/${MOCK_DEPLOYMENT_ID}`);
      expect(deployMutationVariables.at(-1)?.input?.revisionPresetId).toBe(
        'preset-uuid-012',
      );
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

      const resourceGroupSelect = deployModal.getByRole('button', {
        name: /^Resource Group/,
      });
      await resourceGroupSelect.click();

      // Select "gpu-cluster"
      await page
        .getByRole('listbox')
        .getByRole('option', { name: 'gpu-cluster', exact: true })
        .click();
      await expect(resourceGroupSelect).toContainText('gpu-cluster');

      // Verify the Deploy button remains enabled after selection change
      await expect(
        deployModal.getByRole('button', { name: 'Deploy', exact: true }),
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
        deployModal.getByRole('button', { name: 'Deploy', exact: true }),
      ).toBeEnabled();

      // Click the Deploy button in the modal to trigger deployment
      await deployModal
        .getByRole('button', { name: 'Deploy', exact: true })
        .click();

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
// Group E: DeploymentDetailPage — Post-Deploy Banners
// ─────────────────────────────────────────────────────────────────────────────

const FAKE_REVISION_UUID = '00000000-0000-0000-0000-0000000000a1';

/** A minimal current revision, enough for the revision card to render. */
const FAKE_CURRENT_REVISION = {
  id: btoa(`ModelRevision:${FAKE_REVISION_UUID}`),
  fieldId: FAKE_REVISION_UUID,
  revisionNumber: 1,
  createdAt: '2026-01-01T00:00:00+00:00',
  revisionPresetId: null,
  clusterConfig: { mode: 'SINGLE_NODE', size: 1 },
  resourceConfig: { resourceOpts: null },
  resourceSlots: [],
  modelRuntimeConfig: {
    runtimeVariantId: '00000000-0000-0000-0000-0000000000a2',
    runtimeVariant: null,
    inferenceRuntimeConfig: null,
    environ: null,
    runtimeVariantPresetValues: [],
  },
  modelMountConfig: null,
  modelDefinition: null,
  extraMounts: [],
  imageV2: null,
};

interface DeploymentDetailPatch {
  status?: string;
  withRevision?: boolean;
  desiredReplicaCount?: number;
  runningReplicaCount?: number;
}

/**
 * Lets `DeploymentDetailPageQuery` reach the real server for a real deployment
 * shell, then overrides the fields that pick the page's top banners.
 */
async function patchDeploymentDetailQuery(
  page: any,
  patch: DeploymentDetailPatch,
) {
  await page.route('**/admin/gql', async (route: any) => {
    const query: string = route.request().postData() ?? '';
    if (!/query\s+DeploymentDetailPageQuery\b/.test(query)) {
      await route.fallback();
      return;
    }
    const response = await route.fetch();
    const json = await response.json();
    const deployment = json?.data?.deployment;
    if (deployment) {
      if (patch.status) deployment.metadata.status = patch.status;
      if (patch.withRevision)
        deployment.currentRevision = FAKE_CURRENT_REVISION;
      if (patch.desiredReplicaCount !== undefined) {
        deployment.replicaState.desiredReplicaCount = patch.desiredReplicaCount;
      }
      if (patch.runningReplicaCount !== undefined) {
        deployment.runningReplicas = { count: patch.runningReplicaCount };
      }
    }
    await route.fulfill({ response, json });
  });
}

const READY_WITH_RUNNING_REPLICA: DeploymentDetailPatch = {
  status: 'READY',
  withRevision: true,
  desiredReplicaCount: 1,
  runningReplicaCount: 1,
};

test.describe(
  'DeploymentDetailPage — Post-Deploy Banners',
  { tag: ['@deploy', '@functional', '@regression'] },
  () => {
    test.describe.configure({ mode: 'serial' });

    const resources = createTestResources();
    // Path and raw UUID of one real deployment shell (no revision) shared by the group.
    let deploymentPath = '';
    let deploymentUuid = '';
    let deploymentName = '';

    test.beforeAll(async ({ browser, request }) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      try {
        await loginAsAdmin(page, request);
        await navigateTo(page, 'deployments');
        deploymentName = resources.name('deployment', 'e2e-gh11211-banner');
        await createDeploymentShell(page, deploymentName);
        const url = new URL(page.url());
        deploymentPath = url.pathname;
        deploymentUuid = url.pathname.split('/').pop() ?? '';
      } finally {
        await context.close();
      }
    });

    test.afterAll(async () => {
      await resources.cleanup();
    });

    async function openDeploymentDetail(page: any) {
      await navigateTo(page, deploymentPath.replace(/^\//, ''));
      await expect(
        page.getByRole('heading', { level: 3, name: deploymentName }),
      ).toBeVisible({ timeout: 15000 });
    }

    const readyBanner = (page: any) =>
      page.getByRole('status').filter({ hasText: 'Deployment is ready' });
    // Banner puts the role on its text, so its action button is a sibling.
    const testInChatButton = (page: any) =>
      page.getByRole('button', { name: 'Test in Chat' });
    const warningBanner = (page: any, text: string | RegExp) =>
      page.getByRole('alert').filter({ hasText: text });

    test('admin sees the "No revision is deployed" warning on a deployment without a revision', async ({
      page,
      request,
    }) => {
      await loginAsAdmin(page, request);
      await openDeploymentDetail(page);

      await expect(
        warningBanner(page, 'No revision is deployed'),
      ).toBeVisible();
      await expect(readyBanner(page)).toBeHidden();
    });

    test('admin sees the "Deployment is ready" banner when the deployment is ready with a running replica', async ({
      page,
      request,
    }) => {
      await loginAsAdmin(page, request);
      await patchDeploymentDetailQuery(page, READY_WITH_RUNNING_REPLICA);
      await openDeploymentDetail(page);

      const banner = readyBanner(page);
      await expect(banner).toBeVisible();
      await expect(testInChatButton(page)).toBeVisible();
      await expect(warningBanner(page, 'No revision is deployed')).toBeHidden();
      await expect(warningBanner(page, /replica/i)).toBeHidden();
    });

    test('admin can open the chat page from "Test in Chat" in the ready banner', async ({
      page,
      request,
    }) => {
      await loginAsAdmin(page, request);
      await patchDeploymentDetailQuery(page, READY_WITH_RUNNING_REPLICA);
      await openDeploymentDetail(page);

      await testInChatButton(page).click();
      await page.waitForURL(`**/chat?endpointId=${deploymentUuid}`);
      expect(new URL(page.url()).searchParams.get('endpointId')).toBe(
        deploymentUuid,
      );
    });

    test('admin sees a warning instead of the ready banner when the desired replica count is 0', async ({
      page,
      request,
    }) => {
      await loginAsAdmin(page, request);
      await patchDeploymentDetailQuery(page, {
        ...READY_WITH_RUNNING_REPLICA,
        desiredReplicaCount: 0,
        runningReplicaCount: 0,
      });
      await openDeploymentDetail(page);

      await expect(
        warningBanner(page, 'The desired replica count is 0'),
      ).toBeVisible();
      await expect(readyBanner(page)).toBeHidden();
    });

    test('admin sees a warning instead of the ready banner when no replica is running', async ({
      page,
      request,
    }) => {
      await loginAsAdmin(page, request);
      await patchDeploymentDetailQuery(page, {
        ...READY_WITH_RUNNING_REPLICA,
        runningReplicaCount: 0,
      });
      await openDeploymentDetail(page);

      await expect(
        warningBanner(page, 'No replicas are available'),
      ).toBeVisible();
      await expect(readyBanner(page)).toBeHidden();
    });

    test('admin does not see the deployment warnings once the deployment is stopped', async ({
      page,
      request,
    }) => {
      await loginAsAdmin(page, request);
      await patchDeploymentDetailQuery(page, {
        status: 'STOPPED',
        desiredReplicaCount: 0,
      });
      await openDeploymentDetail(page);

      await expect(warningBanner(page, 'No revision is deployed')).toBeHidden();
      await expect(
        warningBanner(page, 'The desired replica count is 0'),
      ).toBeHidden();
      await expect(readyBanner(page)).toBeHidden();
    });

    test('admin cannot see "Test in Chat" when chat is in the menu blocklist', async ({
      page,
      request,
    }) => {
      await modifyConfigToml(page, request, { menu: { blocklist: 'chat' } });
      await loginAsAdmin(page, request);
      await patchDeploymentDetailQuery(page, READY_WITH_RUNNING_REPLICA);
      await openDeploymentDetail(page);

      const banner = readyBanner(page);
      await expect(banner).toBeVisible();
      await expect(testInChatButton(page)).toHaveCount(0);
    });
  },
);
