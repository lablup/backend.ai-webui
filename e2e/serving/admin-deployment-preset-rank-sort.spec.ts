// Covers the Rank column added to Admin Settings > Deployments > Deployment
// Presets in #9639 (FR-3914), which made the existing RANK ordering reachable.
import { createAdminApiContext, gqlAdmin } from '../utils/admin-api';
import { skipUnlessManagerVersion } from '../utils/feature-gate-util';
import {
  getSortableColumnHeader,
  loginAsAdmin,
  webuiEndpoint,
} from '../utils/test-util';
import { test, expect, type APIRequestContext } from '@playwright/test';

const PRESETS_URL = `${webuiEndpoint}/admin/deployments?tab=deployment-presets`;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function toRawUUID(id: string): string {
  if (UUID_RE.test(id)) return id;
  return Buffer.from(id, 'base64').toString('utf-8').split(':').pop() ?? '';
}

// Created in this order, so neither the default newest-first order nor name
// order matches rank order.
const PRESET_RANKS: Array<{ suffix: string; rank: number }> = [
  { suffix: 'a', rank: 30 },
  { suffix: 'b', rank: 10 },
  { suffix: 'c', rank: 20 },
];

async function createRankedPresets(
  api: APIRequestContext,
  prefix: string,
  // Filled as each preset is created, so a mid-setup failure still leaves
  // the already-created ids for afterEach to delete.
  ids: string[],
): Promise<void> {
  const rv = await gqlAdmin(
    api,
    `query { runtimeVariants(limit: 100) { edges { node { id name } } } }`,
  );
  const variant = (rv.runtimeVariants?.edges ?? [])
    .map((e: any) => e.node)
    .find((n: any) => n.name === 'custom');
  const img = await gqlAdmin(
    api,
    `query { images(is_operation: false) { id name } }`,
  );
  const image =
    (img.images ?? []).find((i: any) => i.name === 'bai/ngc-pytorch') ??
    (img.images ?? []).find((i: any) => /python/i.test(i.name));
  if (!variant || !image) {
    throw new Error(
      'The cluster has no "custom" runtime variant or python image to build presets from',
    );
  }

  for (const { suffix, rank } of PRESET_RANKS) {
    const created = await gqlAdmin(
      api,
      `mutation($input: CreateDeploymentRevisionPresetInput!) {
        adminCreateDeploymentRevisionPreset(input: $input) { preset { id } }
      }`,
      {
        input: {
          name: `${prefix}${suffix}`,
          runtimeVariantId: toRawUUID(variant.id),
          imageId: toRawUUID(image.id),
          replicaCount: 1,
          deploymentStrategy: { type: 'ROLLING' },
          clusterMode: 'SINGLE_NODE',
          clusterSize: 1,
          resourceSlots: [
            { resourceType: 'cpu', quantity: '1' },
            { resourceType: 'mem', quantity: '1073741824' },
          ],
        },
      },
    );
    const id = toRawUUID(created.adminCreateDeploymentRevisionPreset.preset.id);
    ids.push(id);
    await gqlAdmin(
      api,
      `mutation($input: UpdateDeploymentRevisionPresetInput!) {
        adminUpdateDeploymentRevisionPreset(input: $input) { preset { id rank } }
      }`,
      { input: { id, rank } },
    );
  }
}

test.describe(
  'Admin Deployment Presets - Rank column',
  {
    tag: ['@serving', '@admin', '@regression', '@requires-manager-v26.4'],
  },
  () => {
    let api: APIRequestContext;
    let prefix: string;
    let presetIds: string[] = [];

    test.beforeEach(async ({ page, request }) => {
      prefix = `e2e-rank-preset-${Date.now()}-`;
      await loginAsAdmin(page, request);
      await skipUnlessManagerVersion(
        page,
        '26.4.2',
        'Deployment Presets require manager >= 26.4.2 (FR-3914)',
      );
      api = await createAdminApiContext();
      await createRankedPresets(api, prefix, presetIds);
    });

    test.afterEach(async () => {
      for (const id of presetIds) {
        await gqlAdmin(
          api,
          `mutation($id: UUID!) { adminDeleteDeploymentRevisionPreset(id: $id) { id } }`,
          { id },
        ).catch((error) =>
          console.warn(`[rank-sort] could not delete preset ${id}:`, error),
        );
      }
      presetIds = [];
      await api?.dispose();
    });

    test('Admin can sort deployment presets by rank', async ({ page }) => {
      await page.goto(PRESETS_URL);

      // The Rank column carries the "lower first" tooltip.
      const rankHeader = getSortableColumnHeader(page, 'Rank');
      await expect(rankHeader).toBeVisible({ timeout: 30000 });
      await expect(
        rankHeader.getByRole('button', {
          name: 'Display ordering among presets of the same runtime. Lower values appear first.',
        }),
      ).toBeVisible();

      // Narrow the table to this test's presets.
      await page.getByRole('combobox', { name: 'Search filters' }).fill(prefix);
      await page
        .getByRole('option', { name: `"${prefix}"`, exact: true })
        .click();
      await expect(page).toHaveURL(/filter=/);

      const nameCells = page
        .locator('tbody tr')
        .filter({ hasText: prefix })
        .getByText(new RegExp(`^${prefix}[abc]$`));
      await expect(nameCells).toHaveCount(PRESET_RANKS.length, {
        timeout: 30000,
      });

      const sortButton = page.getByRole('button', { name: /^Sort by rank/ });

      await sortButton.click();
      await expect(rankHeader).toHaveAttribute('aria-sort', 'ascending');
      await expect(nameCells).toHaveText([
        `${prefix}b`,
        `${prefix}c`,
        `${prefix}a`,
      ]);

      await sortButton.click();
      await expect(rankHeader).toHaveAttribute('aria-sort', 'descending');
      await expect(nameCells).toHaveText([
        `${prefix}a`,
        `${prefix}c`,
        `${prefix}b`,
      ]);
    });
  },
);
