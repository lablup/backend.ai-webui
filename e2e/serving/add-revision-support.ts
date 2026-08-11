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
 * `modelDeployment`-backed status), `prometheus-auto-scaling-rule` off (so
 * the page does not fire an unmocked auto-scaling query that could collide with
 * the Relay store), and `model-service-command-string` on — persistently
 * across full-page reloads via `addInitScript`. Mirrors
 * `model-card-drawer.spec.ts`'s `installModelCardV2FlagOverride`.
 *
 * `model-service-command-string` is gated at manager version 26.8.0 exactly
 * (see `packages/backend.ai-client/src/client.ts`, FR-3205/BA-6551 — the gate
 * is deliberately at the *final* 26.8.0 tag, not 26.7.0, to sidestep a
 * BA-6742 ambiguity described there). The shared e2e test backend runs
 * `26.8.0rc1`, which sorts *before* `26.8.0` under PEP440 (release candidates
 * are pre-releases), so `isManagerVersionCompatibleWith('26.8.0')` — and
 * therefore this flag — is false against it even though the feature is
 * present. Every Execution/Shell control these specs assert on is gated
 * behind this exact flag, so without the override the whole
 * command/shell UI silently falls back to the pre-FR-3205 legacy path and
 * every assertion in this file fails or times out waiting for elements that
 * never render.
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
            if (feature === 'model-service-command-string') return true;
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
  // BAIModal renders a native <dialog>; its accessible name is the whole
  // title row (title text + the Segmented mode labels), so match the dialog
  // by contained text rather than by name.
  const modal = page.getByRole('dialog').filter({ hasText: 'Add Revision' });
  await modal.waitFor({ state: 'visible' });
  // Switch Preset → Advanced (Custom) mode via the header Segmented control.
  await modal.getByText('Advanced Mode', { exact: true }).click();
  // The Model Folder select is the first field of the Custom form; its
  // ComplexSelector trigger is a plain <button> named by the field label.
  // Wait for it so we know the Advanced form has mounted before driving
  // fields.
  await modal
    .getByRole('button', { name: 'Model Folder', exact: true })
    .waitFor({ state: 'visible' });
  return modal;
}

/**
 * Select the (single, mocked) runtime variant in the modal's Runtime select.
 * The Astryx `BAIComplexSelect` popup is a `role="dialog"` (aria-labelled with
 * the field label) that hosts a `role="listbox"` of plain, clickable
 * `role="option"` rows, so the option is clicked directly — no keyboard
 * workaround needed.
 */
export async function selectRuntimeVariant(
  page: Page,
  modal: Locator,
  optionLabel: string,
): Promise<void> {
  await modal.getByRole('button', { name: 'Runtime', exact: true }).click();
  const popup = page.getByRole('dialog', { name: 'Runtime', exact: true });
  await expect(popup).toBeVisible({ timeout: 10000 });
  const option = popup.getByRole('option', {
    name: optionLabel,
    exact: true,
  });
  await expect(option).toBeVisible({ timeout: 10000 });
  await option.click();
  // Confirm the selection committed by waiting for the popup to close
  // (single-select commit closes the popover), then for the trigger to show
  // the selected label. The caller then asserts the downstream section that
  // `runtimeVariantMap` drives (Service Configuration for reads=true, the
  // Runtime Parameters warning for reads=false).
  await expect(popup).toBeHidden({ timeout: 10000 });
  await expect(
    modal.getByRole('button', { name: 'Runtime', exact: true }),
  ).toContainText(optionLabel, { timeout: 10000 });
}

/**
 * Fill the manually-entered image name (Custom mode). Requires
 * `allowManualImageNameForSession` config on (set via `modifyConfigToml`) so
 * the "Image Name (Manual)" input is visible. Clicking the input first closes
 * any open select popup WITHOUT pressing Escape (Escape closes the whole
 * modal).
 */
export async function fillManualImageName(
  modal: Locator,
  reference: string,
): Promise<void> {
  const manual = modal.getByRole('textbox', {
    name: 'Image Name (Manual)',
    exact: true,
  });
  await manual.waitFor({ state: 'visible', timeout: 30000 });
  await manual.scrollIntoViewIfNeeded();
  await manual.click();
  await manual.fill(reference);
  await expect(manual).toHaveValue(reference, { timeout: 10000 });
  // The Astryx TextInput commits `environments.manual` to the form on every
  // change (no blur needed for that), but blur anyway to release focus before
  // the next interaction.
  await manual.blur();
  // The Environments/Version dropdown is required ONLY while
  // `environments.manual` is empty; the required recompute must land before
  // we submit, or `validateFields()` can race it and fail on a
  // still-"required" empty field — silently blocking the mutation (no toast,
  // no visible error after the modal closes). The form engine marks a
  // required item's label with `[data-bai-form-item-required]`; wait for the
  // "Environments / Version" item's marker to clear.
  const environmentsRequiredMark = modal
    .locator('[data-bai-form-item]')
    .filter({ hasText: 'Environments / Version' })
    .locator('[data-bai-form-item-required]');
  await expect(environmentsRequiredMark).toHaveCount(0, { timeout: 10000 });
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
