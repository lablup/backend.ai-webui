// spec: e2e/.agent-output/test-plan-chat.md
// Sections: 5 (Sync Input Propagation), 6 (Sync Toggle Off — Input Isolation)
import {
  setupChatPage,
  setupChatPageWithTwoEndpoints,
} from './mocking/chat-mock-data';
import { test, expect, Page } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Clicks the "Compare" button to clone the current pane and waits until
 * there are `expectedCount` chat input fields visible.
 */
async function addComparePane(
  page: Page,
  expectedCount: number,
): Promise<void> {
  // ChatHeader's compare action is a lucide `ArrowRightLeftIcon` IconButton
  // whose accessible name is t('chatui.CreateCompareChat') = "Add comparison
  // chat". addComparePane is always called from single-pane state, so this
  // is unambiguous.
  const compareButton = page.getByRole('button', {
    name: 'Add comparison chat',
  });
  await compareButton.first().click();
  await expect(page.getByLabel('Type your message here...')).toHaveCount(
    expectedCount,
    { timeout: 10000 },
  );
}

/**
 * Returns the chat input for pane at zero-based index.
 * Uses nth() on all "Type your message here..." inputs.
 */
function getChatInput(page: Page, index: number) {
  return page.getByLabel('Type your message here...').nth(index);
}

/**
 * Returns the sync toggle button for a specific pane (card index).
 * The sync toggle appears only when more than one pane is open.
 */
function getSyncToggle(page: Page, cardIndex: number) {
  // `.astryx-card` nth(0) is the page-level Chat `Card`, nth(1+) are the
  // ChatCards (Astryx `Card` renders an `astryx-card` class; antd's
  // `.ant-card` is gone). The sync toggle is a `SyncSwitch` IconButton whose
  // accessible name is t('chatui.SyncInput') = "Sync chat input", only
  // rendered per-pane when closable (multi-pane).
  return page
    .locator('.astryx-card')
    .nth(cardIndex + 1)
    .getByRole('button', { name: 'Sync chat input' });
}

/**
 * Clicks a pane's sync toggle and waits until the new state is actually
 * committed, as reported by the SyncSwitch icon (ToggleRight = on,
 * ToggleLeft = off).
 *
 * ChatHeader wraps `onChangeSync` in `startTransition`, so the pane keeps its
 * previous `sync` value for a beat after the click. During that window the
 * pane still mirrors its input into the shared `synchronizedMessage` atom,
 * so typing right after the click can still propagate to the other panes.
 * Asserting on the icon is the only signal that the toggle has landed —
 * checking that the input was cleared does not work, because the clearing
 * effect is a no-op whenever the input is already empty.
 */
async function setSync(
  page: Page,
  cardIndex: number,
  enabled: boolean,
): Promise<void> {
  const toggle = getSyncToggle(page, cardIndex).first();
  await expect(toggle).toBeVisible({ timeout: 10000 });
  await toggle.click();
  await expect(
    toggle.locator(
      enabled ? 'svg.lucide-toggle-right' : 'svg.lucide-toggle-left',
    ),
  ).toBeVisible({ timeout: 10000 });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Sync Input Propagation Across Two Panes
// ─────────────────────────────────────────────────────────────────────────────

test.describe(
  'Sync Input Propagation Across Two Panes',
  { tag: ['@chat', '@functional', '@regression'] },
  () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page }) => {
      // Use addInitScript so localStorage is cleared before the page loads.
      // page.evaluate on about:blank would throw a SecurityError.
      await page.addInitScript(() => {
        localStorage.removeItem('backendaiwebui.cache.chat_history');
      });
    });

    test('User sees typed text propagate to all panes when sync is enabled', async ({
      page,
      request,
    }) => {
      // Setup: login, install mocks, navigate to /chat
      await setupChatPage(page, request);

      await expect(getChatInput(page, 0)).toBeVisible({ timeout: 10000 });

      // Clone a second pane
      await addComparePane(page, 2);

      // Verify both panes have the sync toggle visible
      await expect(getSyncToggle(page, 0).first()).toBeVisible({
        timeout: 10000,
      });
      await expect(getSyncToggle(page, 1).first()).toBeVisible({
        timeout: 5000,
      });

      // Click the text input of the first pane and type a message
      await getChatInput(page, 0).click();
      await getChatInput(page, 0).fill('Synchronized message text');

      // Verify the text appears in the second pane's input in real time
      await expect(getChatInput(page, 1)).toHaveText(
        'Synchronized message text',
        {
          timeout: 10000,
        },
      );
    });

    test('User sees file attachment propagate to all panes when sync is enabled', async ({
      page,
      request,
    }) => {
      // Setup: login, install mocks, navigate to /chat
      await setupChatPage(page, request);

      await expect(getChatInput(page, 0)).toBeVisible({ timeout: 10000 });

      // Clone a second pane
      await addComparePane(page, 2);

      // In the first pane, click the attachment button. `ChatSender` labels it
      // t('chatui.Attachments'); the antd icon-derived name 'link' is gone.
      // One such button per pane, in pane order.
      const attachButtons = page.getByRole('button', {
        name: 'Attachments',
        exact: true,
      });
      await expect(attachButtons).toHaveCount(2, { timeout: 10000 });
      const attachButton = attachButtons.nth(0);

      // Capture the file chooser before clicking the button
      const fileChooserPromise = page.waitForEvent('filechooser');
      await attachButton.click();
      const fileChooser = await fileChooserPromise;
      // Use a 1x1 PNG — smallest valid PNG (67 bytes)
      const smallPng = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64',
      );
      await fileChooser.setFiles([
        { name: 'test.png', mimeType: 'image/png', buffer: smallPng },
      ]);

      // `ChatSender` renders each attached image as an Astryx `Thumbnail` with
      // `alt`/`label` set to the file name, inside a `ChatComposerDrawer`
      // labelled t('chatui.Attachments'). `ChatCard` exposes no pane-level
      // role, name or test id (Astryx `Card` renders a bare div), so pane
      // membership is asserted by count and DOM order rather than by scoping
      // to a container: exactly one `test.png` thumbnail per pane, meaning the
      // attachment propagated from pane 1 to pane 2.
      const attachmentThumbnails = page.getByRole('img', { name: 'test.png' });
      await expect(attachmentThumbnails).toHaveCount(2, { timeout: 10000 });

      // Verify the attachment appears in the first pane
      await expect(attachmentThumbnails.nth(0)).toBeVisible({ timeout: 10000 });

      // Verify the attachment also appears in the second pane (sync propagation)
      await expect(attachmentThumbnails.nth(1)).toBeVisible({
        timeout: 10000,
      });
    });

    test('Sending a message from one synced pane triggers send in all other synced panes', async ({
      page,
      request,
    }) => {
      // Setup with two distinct endpoints
      await setupChatPageWithTwoEndpoints(page, request);

      await expect(getChatInput(page, 0)).toBeVisible({ timeout: 10000 });

      // Clone a second pane
      await addComparePane(page, 2);

      // Select endpoint B in the second pane
      // ant-card nth(0)=page card, nth(1)=first chat card, nth(2)=second chat card
      // Click the endpoint text to open the dropdown (not the combobox input which gets intercepted)
      const secondCardEndpointText = page
        .locator('.astryx-card')
        .nth(2)
        .getByText('mock-endpoint')
        .first();
      await secondCardEndpointText.click();

      // Set up the wait for the second pane's own /v1/models fetch (for
      // endpoint B) before clicking, so we don't miss a fast mocked response.
      const modelsBResponsePromise = page.waitForResponse(
        (response) =>
          response.url().includes('mock-chat-endpoint-b') &&
          response.url().includes('/v1/models'),
      );
      await page
        .getByRole('option', { name: 'mock-endpoint-b' })
        .or(
          page
            .locator('.ant-select-item-option')
            .filter({ hasText: 'mock-endpoint-b' }),
        )
        .first()
        .click();
      await modelsBResponsePromise;

      const secondChatCardHeader = page.locator('.astryx-card').nth(2);

      // Selecting a new endpoint re-triggers the model list fetch for that
      // pane (ChatCard's non-suspending isLoadingModels flag), which
      // disables its ChatInput until the fetch resolves. Wait for the
      // second pane's input to become enabled again, and for its model
      // selector to reflect the newly-fetched model — otherwise the synced
      // send below can race the endpoint/model switch and dispatch against
      // a stale ('custom') model before React has settled on
      // 'gpt-mock-model-b'.
      await expect(getChatInput(page, 1)).toHaveAttribute(
        'contenteditable',
        'true',
        { timeout: 10000 },
      );
      await expect(
        secondChatCardHeader.getByText('gpt-mock-model-b'),
      ).toBeVisible({ timeout: 10000 });

      // Verify both panes have sync ON
      await expect(getSyncToggle(page, 0).first()).toBeVisible({
        timeout: 10000,
      });
      await expect(getSyncToggle(page, 1).first()).toBeVisible({
        timeout: 5000,
      });

      // Type a message in the first pane
      await getChatInput(page, 0).click();
      await getChatInput(page, 0).fill('Multi-endpoint test');

      // Verify the text propagates to the second pane
      await expect(getChatInput(page, 1)).toHaveText('Multi-endpoint test', {
        timeout: 10000,
      });

      // Press Enter in the first pane to send
      await getChatInput(page, 0).press('Enter');

      // First pane: user message and response from endpoint A
      // ant-card nth(0)=page card, nth(1)=first chat card, nth(2)=second chat card
      const firstChatCard = page.locator('.astryx-card').nth(1);
      const secondChatCard = page.locator('.astryx-card').nth(2);

      await expect(
        firstChatCard.getByText('Multi-endpoint test').first(),
      ).toBeVisible({ timeout: 10000 });
      await expect(
        firstChatCard.getByText('Response from endpoint A').first(),
      ).toBeVisible({ timeout: 15000 });

      // Second pane: user message and response from endpoint B (triggered by sync)
      await expect(
        secondChatCard.getByText('Multi-endpoint test').first(),
      ).toBeVisible({ timeout: 10000 });
      await expect(
        secondChatCard.getByText('Response from endpoint B').first(),
      ).toBeVisible({ timeout: 15000 });
    });
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// 6. Sync Toggle Off — Input Isolation
// ─────────────────────────────────────────────────────────────────────────────

test.describe(
  'Sync Toggle Off — Input Isolation',
  { tag: ['@chat', '@functional', '@regression'] },
  () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page }) => {
      // Use addInitScript so localStorage is cleared before the page loads.
      // page.evaluate on about:blank would throw a SecurityError.
      await page.addInitScript(() => {
        localStorage.removeItem('backendaiwebui.cache.chat_history');
      });
    });

    test('Turning off sync isolates input to the individual pane', async ({
      page,
      request,
    }) => {
      // Setup: login, install mocks, navigate to /chat
      await setupChatPage(page, request);

      await expect(getChatInput(page, 0)).toBeVisible({ timeout: 10000 });

      // Clone a second pane
      await addComparePane(page, 2);

      // Turn sync OFF on the first pane and wait for the toggle to commit
      await setSync(page, 0, false);

      // The input is cleared when sync is toggled (by design per the spec)
      await expect(getChatInput(page, 0)).toHaveText('', { timeout: 5000 });

      // Click the text input of the first pane and type isolated text
      await getChatInput(page, 0).click();
      await getChatInput(page, 0).fill('Isolated pane text');

      // Verify "Isolated pane text" does NOT appear in the second pane's input
      // Use a small timeout since we expect it NOT to propagate
      await expect(getChatInput(page, 1)).not.toHaveText('Isolated pane text', {
        timeout: 3000,
      });

      // The first pane's input shows the isolated text
      await expect(getChatInput(page, 0)).toHaveText('Isolated pane text');
    });

    test("Turning off sync clears the synced pane's input", async ({
      page,
      request,
    }) => {
      // Setup: login, install mocks, navigate to /chat
      await setupChatPage(page, request);

      await expect(getChatInput(page, 0)).toBeVisible({ timeout: 10000 });

      // Clone a second pane
      await addComparePane(page, 2);

      // Type text in the first pane while sync is ON
      await getChatInput(page, 0).click();
      await getChatInput(page, 0).fill('Pre-disable text');

      // Verify the text propagated to the second pane
      await expect(getChatInput(page, 1)).toHaveText('Pre-disable text', {
        timeout: 10000,
      });

      // Click the sync toggle in the first pane to disable sync
      await setSync(page, 0, false);

      // The first pane's input is cleared when sync is disabled
      await expect(getChatInput(page, 0)).toHaveText('', { timeout: 10000 });
    });

    test('Sending from an unsynced pane does not trigger send in other panes', async ({
      page,
      request,
    }) => {
      // Setup: login, install mocks, navigate to /chat
      await setupChatPage(page, request);

      await expect(getChatInput(page, 0)).toBeVisible({ timeout: 10000 });

      // Clone a second pane
      await addComparePane(page, 2);

      // Turn off sync on the first pane
      await setSync(page, 0, false);

      // Wait for input to clear after sync toggle
      await expect(getChatInput(page, 0)).toHaveText('', { timeout: 5000 });

      // Type directly in the first pane's input (isolated)
      await getChatInput(page, 0).click();
      await getChatInput(page, 0).fill('First pane only message');

      // Press Enter in the first pane
      await getChatInput(page, 0).press('Enter');

      // First pane shows the sent message and receives its reply
      // ant-card nth(0)=page card, nth(1)=first chat card, nth(2)=second chat card
      const firstChatCard = page.locator('.astryx-card').nth(1);
      const secondChatCard = page.locator('.astryx-card').nth(2);
      await expect(
        firstChatCard.getByText('First pane only message').first(),
      ).toBeVisible({ timeout: 10000 });
      await expect(
        firstChatCard.getByText('Hello from mock!').first(),
      ).toBeVisible({ timeout: 15000 });

      // Second pane's message thread remains empty
      await expect(
        secondChatCard.getByText('First pane only message'),
      ).not.toBeVisible({ timeout: 5000 });
      await expect(
        secondChatCard.getByText('Hello from mock!'),
      ).not.toBeVisible({ timeout: 3000 });
    });

    test('User can re-enable sync after disabling it and text propagation resumes', async ({
      page,
      request,
    }) => {
      // Setup: login, install mocks, navigate to /chat
      await setupChatPage(page, request);

      await expect(getChatInput(page, 0)).toBeVisible({ timeout: 10000 });

      // Clone a second pane
      await addComparePane(page, 2);

      // Turn off sync on the first pane
      await setSync(page, 0, false);

      // Wait for input to clear
      await expect(getChatInput(page, 0)).toHaveText('', { timeout: 5000 });

      // Type in the first pane — should NOT propagate
      await getChatInput(page, 0).click();
      await getChatInput(page, 0).fill('Not synced text');
      await expect(getChatInput(page, 1)).not.toHaveText('Not synced text', {
        timeout: 3000,
      });

      // Re-enable sync on the first pane
      await setSync(page, 0, true);

      // Input is cleared upon toggling sync back on
      await expect(getChatInput(page, 0)).toHaveText('', { timeout: 10000 });

      // Type re-synced text in the first pane
      await getChatInput(page, 0).click();
      await getChatInput(page, 0).fill('Re-synced text');

      // Verify the text appears in the second pane's input
      await expect(getChatInput(page, 1)).toHaveText('Re-synced text', {
        timeout: 10000,
      });
    });
  },
);
