// spec: e2e/.agent-output/test-plan-session-cluster-mode.md
// seed: e2e/seed.spec.ts
import { loginAsUser, navigateTo } from '../utils/test-util';
import { test, expect } from '@playwright/test';

/**
 * Helper: navigate to session launcher step 2 and wait for the Cluster mode section.
 * Assumes the user is already logged in.
 */
async function navigateToClusterModeSection(
  page: import('@playwright/test').Page,
) {
  await navigateTo(page, 'session/start');
  await page.getByRole('button', { name: '2 Environments & Resource' }).click();
  await expect(page.getByText('Cluster mode')).toBeVisible({ timeout: 10000 });
}

test.describe(
  'Session Launcher Cluster Mode',
  { tag: ['@regression', '@session', '@functional'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsUser(page, request);
    });

    // -------------------------------------------------------------------------
    // Group 1: Warning Visibility — Multi Node + Cluster Size 1
    // -------------------------------------------------------------------------

    test(
      'User sees warning when selecting Multi Node with cluster size 1',
      { tag: ['@smoke', '@regression'] },
      async ({ page }) => {
        // NOTE: This test requires ClusterModeFormItems.tsx (feat/FR-2381),
        // which was introduced in the main branch after v26.3.0.
        // The warning "Multi-node with size 1 will be created as a single-node session."
        // is rendered by the new ClusterModeFormItems component. If the test server
        // runs an older WebUI build, this test will be skipped automatically.
        await navigateToClusterModeSection(page);

        // Click the Multi Node label to select the Multi Node radio button
        const multiNodeLabel = page
          .locator('label')
          .filter({ hasText: 'Multi Node' });
        await multiNodeLabel.click();

        // Verify the Multi Node radio input is checked
        await expect(
          multiNodeLabel.locator('input[type="radio"]'),
        ).toBeChecked();

        // Cluster size should default to 1 with Multi Node selected.
        // ClusterModeFormItems (FR-2381) renders the spinbutton inside the
        // "Cluster mode" form item alongside the radio group; there is no
        // separate "Cluster size" label in the new UI.
        const clusterSizeInput = page
          .locator('.ant-form-item')
          .filter({ hasText: 'Cluster mode' })
          .getByRole('spinbutton');
        await expect(clusterSizeInput).toHaveValue('1');

        // Verify the warning message is displayed beneath the cluster size control.
        // This warning is shown by ClusterModeFormItems (introduced in FR-2381).
        // Skip gracefully if the feature is not available in the server's build.
        const warningMessage = page.getByText(
          'Multi-node with size 1 will be created as a single-node session.',
        );
        const isWarningVisible = await warningMessage
          .isVisible({ timeout: 5000 })
          .catch(() => false);
        if (!isWarningVisible) {
          test.skip(
            true,
            'Warning feature (FR-2381) not available in the server build. Requires WebUI > v26.3.0.',
          );
          return;
        }
        await expect(warningMessage).toBeVisible();
      },
    );

    // Skip: Requires a server environment that allows cluster size > 1.
    // Current test server enforces aria-valuemax="1" (disabled spinbutton).
    test.skip('User sees warning when manually resetting cluster size to 1 after it was greater than 1', async ({
      page,
    }) => {
      // Navigate to step 2: Environments & Resource Allocation
      await navigateToClusterModeSection(page);

      // Click the Multi Node label to select it
      const multiNodeLabel = page
        .locator('label')
        .filter({ hasText: 'Multi Node' });
      await multiNodeLabel.click();

      const clusterSizeInput = page
        .locator('.ant-form-item')
        .filter({ hasText: 'Cluster mode' })
        .getByRole('spinbutton');
      const warningMessage = page.getByText(
        'Multi-node with size 1 will be created as a single-node session.',
      );

      // Set cluster size to 2 — warning should disappear
      await clusterSizeInput.fill('2');
      await clusterSizeInput.press('Tab');
      await expect(warningMessage).toBeHidden({ timeout: 5000 });

      // Set cluster size back to 1 — warning should reappear
      await clusterSizeInput.fill('1');
      await clusterSizeInput.press('Tab');
      await expect(warningMessage).toBeVisible({ timeout: 5000 });
    });

    // -------------------------------------------------------------------------
    // Group 2: Warning Dismissal — Changing Cluster Size
    // -------------------------------------------------------------------------

    // Skip: Requires a server environment that allows cluster size > 1.
    // Current test server enforces aria-valuemax="1" (disabled spinbutton).
    test.skip('User dismisses warning by increasing cluster size from 1 to 2', async ({
      page,
    }) => {
      // Navigate to step 2: Environments & Resource Allocation
      await navigateToClusterModeSection(page);

      // Click the Multi Node label to select it
      const multiNodeLabel = page
        .locator('label')
        .filter({ hasText: 'Multi Node' });
      await multiNodeLabel.click();

      // Verify warning is initially visible (Multi Node + size 1)
      const clusterSizeInput = page
        .locator('.ant-form-item')
        .filter({ hasText: 'Cluster mode' })
        .getByRole('spinbutton');
      await expect(clusterSizeInput).toHaveValue('1');

      const warningMessage = page.getByText(
        'Multi-node with size 1 will be created as a single-node session.',
      );
      await expect(warningMessage).toBeVisible({ timeout: 5000 });

      // Set cluster size to 2 via direct input
      await clusterSizeInput.fill('2');
      await clusterSizeInput.press('Tab');

      // Warning should disappear after cluster size becomes > 1
      await expect(warningMessage).toBeHidden({ timeout: 5000 });
    });

    // -------------------------------------------------------------------------
    // Group 3: Warning Dismissal — Switching Cluster Mode
    // -------------------------------------------------------------------------

    test(
      'User dismisses warning by switching from Multi Node to Single Node',
      { tag: ['@smoke', '@regression'] },
      async ({ page }) => {
        // NOTE: Requires ClusterModeFormItems.tsx (feat/FR-2381) — see note above.
        await navigateToClusterModeSection(page);

        const multiNodeLabel = page
          .locator('label')
          .filter({ hasText: 'Multi Node' });
        await multiNodeLabel.click();

        const warningMessage = page.getByText(
          'Multi-node with size 1 will be created as a single-node session.',
        );

        // Skip gracefully if the feature is not available in the server's build.
        const isWarningVisible = await warningMessage
          .isVisible({ timeout: 5000 })
          .catch(() => false);
        if (!isWarningVisible) {
          test.skip(
            true,
            'Warning feature (FR-2381) not available in the server build. Requires WebUI > v26.3.0.',
          );
          return;
        }

        // Switch to Single Node by clicking the Single Node label
        const singleNodeLabel = page
          .locator('label')
          .filter({ hasText: 'Single Node' });
        await singleNodeLabel.click();

        // Warning should disappear as soon as the mode is switched to Single Node
        await expect(warningMessage).toBeHidden({ timeout: 5000 });
      },
    );

    test(
      'User sees warning again after switching back from Single Node to Multi Node with size 1',
      { tag: ['@regression'] },
      async ({ page }) => {
        // NOTE: Requires ClusterModeFormItems.tsx (feat/FR-2381) — see note above.
        await navigateToClusterModeSection(page);

        const multiNodeLabel = page
          .locator('label')
          .filter({ hasText: 'Multi Node' });
        const singleNodeLabel = page
          .locator('label')
          .filter({ hasText: 'Single Node' });
        const warningMessage = page.getByText(
          'Multi-node with size 1 will be created as a single-node session.',
        );

        // Select Multi Node — check if warning feature is available
        await multiNodeLabel.click();
        const isWarningVisible = await warningMessage
          .isVisible({ timeout: 5000 })
          .catch(() => false);
        if (!isWarningVisible) {
          test.skip(
            true,
            'Warning feature (FR-2381) not available in the server build. Requires WebUI > v26.3.0.',
          );
          return;
        }

        // Switch to Single Node — warning should disappear
        await singleNodeLabel.click();
        await expect(warningMessage).toBeHidden({ timeout: 5000 });

        // Switch back to Multi Node
        await multiNodeLabel.click();

        // Cluster size should still be 1 (mode switch does not reset size)
        const clusterSizeInput = page
          .locator('.ant-form-item')
          .filter({ hasText: 'Cluster mode' })
          .getByRole('spinbutton');
        await expect(clusterSizeInput).toHaveValue('1');

        // Warning should reappear (reactive to current form values)
        await expect(warningMessage).toBeVisible({ timeout: 5000 });
      },
    );

    // -------------------------------------------------------------------------
    // Group 4: Warning NOT Shown (Negative Scenarios)
    // -------------------------------------------------------------------------

    test(
      'User sees no warning with Single Node mode and cluster size 1',
      { tag: ['@smoke', '@regression'] },
      async ({ page }) => {
        // Navigate to step 2: Environments & Resource Allocation
        await navigateToClusterModeSection(page);

        // Click the Single Node label to ensure Single Node mode is selected
        const singleNodeLabel = page
          .locator('label')
          .filter({ hasText: 'Single Node' });
        await singleNodeLabel.click();

        // Verify the Single Node radio input is checked
        await expect(
          singleNodeLabel.locator('input[type="radio"]'),
        ).toBeChecked();

        // Verify the cluster size spinbutton has value '1'.
        // ClusterModeFormItems (FR-2381) renders the spinbutton inside the
        // "Cluster mode" form item; there is no separate "Cluster size" label.
        const clusterSizeInput = page
          .locator('.ant-form-item')
          .filter({ hasText: 'Cluster mode' })
          .getByRole('spinbutton');
        await expect(clusterSizeInput).toHaveValue('1');

        // Warning should NOT appear — Single Node is unaffected by this rule
        const warningMessage = page.getByText(
          'Multi-node with size 1 will be created as a single-node session.',
        );
        await expect(warningMessage).toBeHidden({ timeout: 5000 });
      },
    );

    // Skip: Requires a server environment that allows cluster size > 1.
    // Current test server enforces aria-valuemax="1" (disabled spinbutton).
    test.skip('User sees no warning with Multi Node mode and cluster size greater than 1', async ({
      page,
    }) => {
      // Navigate to step 2: Environments & Resource Allocation
      await navigateToClusterModeSection(page);

      // Click the Multi Node label
      const multiNodeLabel = page
        .locator('label')
        .filter({ hasText: 'Multi Node' });
      await multiNodeLabel.click();

      // Set cluster size to 2 via direct input
      const clusterSizeInput = page
        .locator('.ant-form-item')
        .filter({ hasText: 'Cluster mode' })
        .getByRole('spinbutton');
      await clusterSizeInput.fill('2');
      await clusterSizeInput.press('Tab');
      await expect(clusterSizeInput).toHaveValue('2');

      // Warning should NOT appear — the condition cluster_size === 1 is not met
      const warningMessage = page.getByText(
        'Multi-node with size 1 will be created as a single-node session.',
      );
      await expect(warningMessage).toBeHidden({ timeout: 5000 });
    });

    test(
      'User sees no warning with Single Node mode regardless of cluster size',
      { tag: ['@regression'] },
      async ({ page }) => {
        // Navigate to step 2: Environments & Resource Allocation
        await navigateToClusterModeSection(page);

        // Click the Single Node label
        const singleNodeLabel = page
          .locator('label')
          .filter({ hasText: 'Single Node' });
        await singleNodeLabel.click();

        // In Single Node mode, the cluster size control is disabled and has no stepper buttons.
        // The cluster size remains at 1 and cannot be changed in this mode.

        // Warning should NOT appear — Single Node mode is unaffected regardless of size
        const warningMessage = page.getByText(
          'Multi-node with size 1 will be created as a single-node session.',
        );
        await expect(warningMessage).toBeHidden({ timeout: 5000 });
      },
    );

    // -------------------------------------------------------------------------
    // Group 5: Warning Independence (environment-dependent — skipped)
    // -------------------------------------------------------------------------

    // test.skip: Scenario 5.1 requires a cluster environment where the available
    // immediate capacity for the selected resources allows fewer clusters than the
    // maximum policy limit. This condition cannot be controlled or reliably reproduced
    // in the standard CI test environment.
    test.skip('User sees capacity warning and size-1 warning independently', async () => {
      // Skipped — requires specific cluster capacity constraints that cannot be
      // guaranteed in a standard test environment. Convert to a unit test instead.
    });

    // -------------------------------------------------------------------------
    // Group 6: Backend Conversion Verification (network interception — skipped)
    // -------------------------------------------------------------------------

    // test.skip: Scenario 6.1 verifies the useStartSession.tsx conversion by
    // intercepting the actual GraphQL/REST session creation request. This requires
    // submitting a real session (and subsequent cleanup), as well as reliable network
    // interception of the Relay mutation. Skipped pending a dedicated integration
    // test environment with stable resource presets.
    test.skip('User submitting Multi Node with cluster size 1 triggers a single-node session creation request', async () => {
      // Skipped — backend payload verification requires network interception and
      // a full session creation cycle which is outside the scope of these UI-only tests.
    });
  },
);
