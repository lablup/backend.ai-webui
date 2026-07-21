/**
 * Shared drivers for the deployment Add-Revision modal E2E specs
 * (add-revision-command-shell.spec.ts / add-revision-runtime-defaults.spec.ts).
 *
 * These specs are "hybrid" mock specs: a real deployment shell is created on
 * the live backend (so the real page + modal render) while the modal-internal
 * runtime-variant / mutation GraphQL ops are stubbed by operation name. This
 * module hosts the reusable UI drivers so both specs share one set of robust,
 * i18n-label-based locators.
 */
import { createDeploymentShell } from '../utils/deployment-fixtures';
import { navigateTo } from '../utils/test-util';
import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Force `model-card-v2` on (so the deployment detail page reads the
 * `modelDeployment`-backed status) and `prometheus-auto-scaling-rule` off (so
 * the page does not fire an unmocked auto-scaling query that could collide with
 * the Relay store) — persistently across full-page reloads via `addInitScript`.
 * Mirrors `model-card-drawer.spec.ts`'s `installModelCardV2FlagOverride`.
 */
export async function installDeploymentFlagOverride(page: Page): Promise<void> {
  await page.addInitScript(() => {
    let clientRef: any;
    Object.defineProperty(window, 'backendaiclient', {
      get() {
        return clientRef;
      },
      set(value: any) {
        if (
          value &&
          typeof value.supports === 'function' &&
          !value.__depFlagPatched
        ) {
          const origSupports = value.supports.bind(value);
          value.supports = function (feature: string) {
            if (feature === 'model-card-v2') return true;
            if (feature === 'prometheus-auto-scaling-rule') return false;
            return origSupports(feature);
          };
          value.__depFlagPatched = true;
        }
        clientRef = value;
      },
      configurable: true,
    });
  });
}

/**
 * Create a fresh no-revision deployment shell and land on its detail page. The
 * detail page renders the top-level "No revision is deployed" alert whose
 * "Add Revision" button opens the modal with `currentRevision = null` (a clean
 * form, no prefill), which is what the command/variant scenarios need.
 */
export async function createDeploymentAndOpenPage(
  page: Page,
  name: string,
): Promise<void> {
  await navigateTo(page, 'serving');
  await navigateTo(page, 'deployments');
  await createDeploymentShell(page, name);
}

/**
 * Open the Add-Revision modal from the deployment detail page and switch it to
 * Advanced (Custom) mode. Returns the modal locator scoped for all subsequent
 * queries (so the modal's own "Add Revision" confirm button never collides with
 * the page trigger).
 */
export async function openAddRevisionAdvanced(page: Page): Promise<Locator> {
  await page
    .getByRole('button', { name: 'Add Revision', exact: true })
    .first()
    .click();
  const modal = page.locator('.ant-modal');
  await modal.waitFor({ state: 'visible' });
  // Switch Preset → Advanced (Custom) mode via the header Segmented control.
  await modal.getByText('Advanced Mode', { exact: true }).click();
  // The Model Folder select is the first field of the Custom form; wait for it
  // so we know the Advanced form has mounted before driving fields.
  await modal.locator('#modelFolderId').waitFor({ state: 'visible' });
  return modal;
}

/**
 * Select the (single, mocked) runtime variant in the modal's Runtime select.
 * The option rows are virtualized (0-width), so use keyboard navigation rather
 * than clicking an option row — the same idiom as
 * `deployment-fixtures.selectRevisionModalOption`.
 */
export async function selectRuntimeVariant(
  page: Page,
  modal: Locator,
  optionLabel: string,
): Promise<void> {
  const rv = modal.locator('#runtimeVariantId');
  await rv.click();
  const dropdown = page
    .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
    .first();
  await expect(dropdown).toBeVisible({ timeout: 10000 });
  await expect(dropdown.getByText(optionLabel, { exact: true })).toBeVisible({
    timeout: 10000,
  });
  await rv.press('ArrowDown');
  await rv.press('Enter');
  // Confirm the selection committed by waiting for the dropdown to close. The
  // combobox input holds the (now-cleared) search text rather than the value,
  // and the selection item is rendered by BAIRuntimeVariantSelect only after
  // its value query resolves — so the dropdown closing is the reliable sync
  // point. The caller then asserts the downstream section that
  // `runtimeVariantMap` drives (Service Configuration for reads=true, the
  // Runtime Parameters warning for reads=false).
  await expect(dropdown).toBeHidden({ timeout: 10000 });
}

/**
 * Fill the manually-entered image name (Custom mode). Requires
 * `allowManualImageNameForSession` config on (set via `modifyConfigToml`) so the
 * `#environments_manual` input is visible. Clicking the input first closes any
 * open select dropdown WITHOUT pressing Escape (Escape closes the whole modal).
 */
export async function fillManualImageName(
  modal: Locator,
  reference: string,
): Promise<void> {
  const manual = modal.locator('#environments_manual');
  await manual.waitFor({ state: 'visible', timeout: 30000 });
  await manual.scrollIntoViewIfNeeded();
  await manual.click();
  await manual.fill(reference);
  await expect(manual).toHaveValue(reference, { timeout: 10000 });
  // Blur to fire the Input's onChange so the antd form commits
  // `environments.manual` AND recomputes the Version dropdown's `required`
  // flag (it is required ONLY while `environments.manual` is empty). Without
  // this, `validateFields()` on submit can race the required recompute and
  // fail on a still-"required" empty Version field — silently blocking the
  // mutation (no toast, no visible error after the modal closes).
  await manual.blur();
  // The Version dropdown's required asterisk must clear before we submit.
  // Its Form.Item is the one labelled "Environments" / holding `#environments_version`.
  const versionRequiredMark = modal
    .locator('.ant-form-item')
    .filter({ has: modal.locator('#environments_version') })
    .locator('.ant-form-item-required');
  await expect(versionRequiredMark).toHaveCount(0, { timeout: 10000 });
}

/** Uncheck "Apply immediately after adding" so no replica is spun up. */
export async function disableAutoApply(modal: Locator): Promise<void> {
  const autoApply = modal.getByRole('checkbox', {
    name: 'Apply immediately after adding',
  });
  if (await autoApply.isChecked()) {
    await autoApply.uncheck();
  }
}

/**
 * Submit the modal via its footer "Add Revision" confirm button and wait for the
 * submit to actually take.
 *
 * `handleOk` validates then submits; if the form's Suspense-loaded fields are
 * still settling, the first click's `validateFields()` can reject and no
 * mutation is dispatched (silently — the modal stays open, the button stays
 * enabled). Rather than sleeping a fixed beat and re-clicking (which both
 * violates the E2E no-`waitForTimeout` rule and can mask a genuine first-click
 * defect), retry the click via `expect(...).toPass()` and synchronize on the
 * real signal: on a successful add the modal closes, so the footer button
 * detaches. Each attempt re-clicks only while the button is still present; once
 * it is gone the submit has taken and the poll resolves.
 */
export async function submitAddRevision(modal: Locator): Promise<void> {
  const submitButton = modal.getByRole('button', {
    name: 'Add Revision',
    exact: true,
  });
  await expect(submitButton).toBeEnabled({ timeout: 10000 });
  await expect(async () => {
    // Button gone → the modal is closing, i.e. the submit was accepted.
    if ((await submitButton.count()) === 0) return;
    await submitButton.click().catch(() => {});
    // The submit "took" iff the footer button detaches (modal closing). If a
    // still-settling form rejected validateFields(), it stays put and this
    // assertion throws, so toPass() retries the click.
    await expect(submitButton).toHaveCount(0, { timeout: 3000 });
  }).toPass({ timeout: 30000 });
}
