// spec: e2e/.agent-output/test-plan-chat.md
// Sections: 1 (Basic Chat Flow), 2 (Chat History), 3 (Error Handling),
//           4 (Multi-Pane Setup), 7 (Chat Parameters)
import { setupGraphQLMocks } from '../session/mocking/graphql-interceptor';
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import {
  setupChatPage,
  setupChatPageWithTwoEndpoints,
  chatPageQueryMockResponse,
  chatCardQueryMockResponse,
  chatCardQueryNullUrlMockResponse,
  endpointSelectQueryMockResponse,
  endpointSelectValueQueryMockResponse,
  makeSseResponse,
  modelsApiMockResponse,
  MOCK_MODEL_ID,
} from './mocking/chat-mock-data';
import { test, expect } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Basic Chat Flow (Single Pane)
// ─────────────────────────────────────────────────────────────────────────────

test.describe(
  'Basic Chat Flow',
  { tag: ['@chat', '@functional', '@smoke'] },
  () => {
    test.beforeEach(async ({ page }) => {
      // Use addInitScript so localStorage is cleared before the page loads.
      // page.evaluate on about:blank would throw a SecurityError.
      await page.addInitScript(() => {
        localStorage.removeItem('backendaiwebui.cache.chat_history');
      });
    });

    test('User can see the chat page with endpoint and model selectors', async ({
      page,
      request,
    }) => {
      // Setup: login, install mocks, navigate to /chat
      await setupChatPage(page, request);

      // Verify the endpoint selector is visible in the chat card header
      await expect(page.getByText('mock-endpoint').first()).toBeVisible({
        timeout: 10000,
      });

      // Verify the model selector is visible
      await expect(page.getByText(MOCK_MODEL_ID).first()).toBeVisible({
        timeout: 10000,
      });

      // Verify the text input area with placeholder "Type your message here..." is visible
      await expect(
        page.getByPlaceholder('Type your message here...'),
      ).toBeVisible({
        timeout: 10000,
      });

      // Verify the model gpt-mock-model is available (loaded from mock)
      await expect(page.getByText(MOCK_MODEL_ID)).toBeVisible({
        timeout: 10000,
      });
    });

    test('User can send a message and receive a streaming response', async ({
      page,
      request,
    }) => {
      // Setup: login, install mocks, navigate to /chat
      await setupChatPage(page, request);

      // Wait for the chat input to be ready
      const chatInput = page.getByPlaceholder('Type your message here...');
      await expect(chatInput).toBeVisible({ timeout: 10000 });

      // Type and send the message
      await chatInput.click();
      await chatInput.fill('What is Backend.AI?');
      await chatInput.press('Enter');

      // Verify the user message appears in the message thread
      await expect(page.getByText('What is Backend.AI?').first()).toBeVisible({
        timeout: 10000,
      });

      // Wait for the assistant reply to appear
      await expect(page.getByText('Hello from mock!').first()).toBeVisible({
        timeout: 15000,
      });

      // Input should be cleared after sending
      await expect(chatInput).toHaveValue('');
    });

    test('User can send a follow-up message in the same conversation (multi-turn)', async ({
      page,
      request,
    }) => {
      // Setup: login, install mocks, navigate to /chat
      await setupChatPage(page, request);

      const chatInput = page.getByPlaceholder('Type your message here...');
      await expect(chatInput).toBeVisible({ timeout: 10000 });

      // First turn: type and send "What is Backend.AI?"
      await chatInput.fill('What is Backend.AI?');
      await chatInput.press('Enter');
      await expect(page.getByText('Hello from mock!').first()).toBeVisible({
        timeout: 15000,
      });

      // Override the completions mock for the second response
      await page.unroute('**/v1/chat/completions');
      await page.route('**/v1/chat/completions', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'text/event-stream',
          body: makeSseResponse('Second response from mock!'),
        });
      });

      // Second turn: type and send "Tell me more."
      await chatInput.fill('Tell me more.');
      await chatInput.press('Enter');

      // Verify the second user message appears after the first exchange
      await expect(page.getByText('Tell me more.').first()).toBeVisible({
        timeout: 10000,
      });

      // Wait for the second assistant reply
      await expect(
        page.getByText('Second response from mock!').first(),
      ).toBeVisible({ timeout: 15000 });

      // Both turns should be visible in the thread
      await expect(page.getByText('What is Backend.AI?').first()).toBeVisible();
      await expect(page.getByText('Hello from mock!').first()).toBeVisible();
    });

    test.fixme('User can stop a streaming response mid-generation', async ({
      page,
      request,
    }) => {
      // FIXME: The stop button never becomes visible because the mock SSE response
      // completes synchronously before the @ant-design/x Sender component can switch
      // to the loading/stop state. A real slow streaming endpoint would be needed to
      // test this behavior reliably.
      // Setup with a slow streaming response
      await loginAsAdmin(page, request);
      await page.evaluate(() => {
        localStorage.removeItem('backendaiwebui.cache.chat_history');
      });

      await setupGraphQLMocks(page, {
        ChatPageQuery: () => chatPageQueryMockResponse(),
        ChatCardQuery: (vars) => chatCardQueryMockResponse(vars.endpointId),
        EndpointSelectQuery: () => endpointSelectQueryMockResponse(),
        EndpointSelectValueQuery: (vars) =>
          endpointSelectValueQueryMockResponse(vars.endpoint_id),
      });

      await page.route('**/v1/models', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(modelsApiMockResponse(MOCK_MODEL_ID)),
        });
      });

      // Slow chunked response — uses a delay between chunks to allow stop
      await page.route('**/v1/chat/completions', async (route) => {
        // Fulfill with a response body that streams slowly
        const chunks =
          `data: ${JSON.stringify({ id: 'chatcmpl-slow', object: 'chat.completion.chunk', choices: [{ delta: { content: 'Starting...' }, index: 0, finish_reason: null }] })}\n\n` +
          `data: ${JSON.stringify({ id: 'chatcmpl-slow', object: 'chat.completion.chunk', choices: [{ delta: { content: ' still going...' }, index: 0, finish_reason: null }] })}\n\n`;
        await route.fulfill({
          status: 200,
          contentType: 'text/event-stream',
          body: chunks,
          // Note: no [DONE] so streaming stays open until aborted
        });
      });

      await navigateTo(page, 'chat');

      const chatInput = page.getByPlaceholder('Type your message here...');
      await expect(chatInput).toBeVisible({ timeout: 10000 });

      // Type and send a message to trigger streaming
      await chatInput.fill('Generate a long response.');
      await chatInput.press('Enter');

      // Verify the user message appears
      await expect(
        page.getByText('Generate a long response.').first(),
      ).toBeVisible({ timeout: 10000 });

      // Wait for streaming state to begin — a stop/cancel button should appear
      // The stop button is typically rendered while the response is streaming
      const stopButton = page
        .getByRole('button', { name: /stop|cancel/i })
        .or(
          page.locator(
            'button[aria-label*="stop" i], button[aria-label*="cancel" i]',
          ),
        );
      await expect(stopButton.first()).toBeVisible({ timeout: 10000 });

      // Click the stop/cancel button
      await stopButton.first().click();

      // The streaming indicator should disappear
      await expect(stopButton.first()).not.toBeVisible({ timeout: 10000 });

      // The input area should become editable again
      await expect(chatInput).toBeEnabled({ timeout: 10000 });

      // No error alert should be visible
      await expect(
        page.locator('[role="alert"][class*="error"]'),
      ).not.toBeVisible();
    });

    test('User can clear the conversation history in a chat pane', async ({
      page,
      request,
    }) => {
      // Setup: login, install mocks, navigate to /chat
      await setupChatPage(page, request);

      const chatInput = page.getByPlaceholder('Type your message here...');
      await expect(chatInput).toBeVisible({ timeout: 10000 });

      // Send a message and wait for the reply
      await chatInput.fill('What is Backend.AI?');
      await chatInput.press('Enter');
      await expect(page.getByText('Hello from mock!').first()).toBeVisible({
        timeout: 15000,
      });

      // Click the "More" (three-dot) menu button in the chat card header
      const moreButton = page.getByRole('button', { name: 'more' });
      await moreButton.first().click();

      // Click "Clear Chat" in the dropdown menu (chatui.DeleteChatHistory = "Clear Chat")
      await page
        .getByRole('menuitem', { name: /clear chat/i })
        .first()
        .click();

      // The message thread should now be empty
      await expect(page.getByText('What is Backend.AI?')).not.toBeVisible({
        timeout: 10000,
      });
      await expect(page.getByText('Hello from mock!')).not.toBeVisible();

      // Input area is still enabled
      await expect(chatInput).toBeEnabled();
    });
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// 2. Chat History Persistence
// ─────────────────────────────────────────────────────────────────────────────

test.describe(
  'Chat History Persistence',
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

    test('User can see chat history drawer after sending a message', async ({
      page,
      request,
    }) => {
      // Setup: login, install mocks, navigate to /chat
      await setupChatPage(page, request);

      const chatInput = page.getByPlaceholder('Type your message here...');
      await expect(chatInput).toBeVisible({ timeout: 10000 });

      // Type "Hello" and press Enter
      await chatInput.fill('Hello');
      await chatInput.press('Enter');

      // Wait for the assistant reply
      await expect(page.getByText('Hello from mock!').first()).toBeVisible({
        timeout: 15000,
      });

      // Click the History (clock/history icon) button
      const historyButton = page
        .locator('.ant-card-head-title')
        .first()
        .getByRole('button')
        .last();
      await historyButton.first().click();

      // The history drawer opens
      const drawer = page.getByRole('dialog', { name: 'History' });
      await expect(drawer).toBeVisible({ timeout: 10000 });

      // At least one history entry appears (rendered as table rows in BAITable)
      const historyItems = drawer.locator('tbody tr.ant-table-row');
      await expect(historyItems.first()).toBeVisible({ timeout: 10000 });
    });

    test.fixme('Chat history label auto-updates to the first user message after the first assistant reply', async ({
      page,
      request,
    }) => {
      // FIXME: The chat history label does not auto-update to the first user message.
      // The saveChatMessage callback in useHistory uses a stale closure: when the
      // assistant message arrives via onFinish, the chat state captured in the callback
      // still shows empty messages (before the user message was persisted), so the
      // condition (messages.length === 2 && role === 'assistant') is never met.
      // Setup: login, install mocks, navigate to /chat
      await setupChatPage(page, request);

      const chatInput = page.getByPlaceholder('Type your message here...');
      await expect(chatInput).toBeVisible({ timeout: 10000 });

      // Type a distinctive message and press Enter
      await chatInput.fill('This is my first message');
      await chatInput.press('Enter');

      // Wait for the assistant reply so the label update is triggered
      await expect(page.getByText('Hello from mock!').first()).toBeVisible({
        timeout: 15000,
      });

      // Click the History icon button to open drawer
      const historyButton = page
        .locator('.ant-card-head-title')
        .first()
        .getByRole('button')
        .last();
      await historyButton.first().click();

      // The history drawer opens
      const drawer = page.getByRole('dialog', { name: 'History' });
      await expect(drawer).toBeVisible({ timeout: 10000 });

      // The history entry label should contain "This is my first message"
      await expect(drawer.getByText('This is my first message')).toBeVisible({
        timeout: 10000,
      });
    });

    test.fixme('User can navigate to a previous chat session from history', async ({
      page,
      request,
    }) => {
      // FIXME: The chat history entry labels remain as the default "Chat" instead
      // of updating to the first user message text. This means the test cannot
      // locate specific sessions by their message content in the history drawer.
      // History navigation itself works correctly — selecting a chat restores
      // its messages — but the label issue prevents reliable session identification.
      // Setup: login, install mocks, navigate to /chat
      await setupChatPage(page, request);

      const chatInput = page.getByPlaceholder('Type your message here...');
      await expect(chatInput).toBeVisible({ timeout: 10000 });

      // First session: send "First session message" and wait for reply
      await chatInput.fill('First session message');
      await chatInput.press('Enter');
      await expect(page.getByText('Hello from mock!').first()).toBeVisible({
        timeout: 15000,
      });

      // Click the "New Chat" (plus icon) button to start a new conversation
      const newChatButton = page
        .locator('.ant-card-head-title')
        .first()
        .getByRole('button')
        .nth(1);
      await newChatButton.first().click();

      // The message thread should be empty in the new session
      await expect(page.getByText('First session message')).not.toBeVisible({
        timeout: 5000,
      });

      // Second session: send "Second session message" and wait for reply
      await chatInput.fill('Second session message');
      await chatInput.press('Enter');
      await expect(page.getByText('Hello from mock!').first()).toBeVisible({
        timeout: 15000,
      });

      // Open the history drawer
      const historyButton = page
        .locator('.ant-card-head-title')
        .first()
        .getByRole('button')
        .last();
      await historyButton.first().click();

      const drawer = page.getByRole('dialog', { name: 'History' });
      await expect(drawer).toBeVisible({ timeout: 10000 });

      // Both history entries appear in the drawer
      await expect(drawer.getByText('First session message')).toBeVisible({
        timeout: 10000,
      });
      await expect(drawer.getByText('Second session message')).toBeVisible({
        timeout: 10000,
      });

      // Click on the first history entry
      await drawer.getByText('First session message').click();

      // The first session's messages are restored
      await expect(page.getByText('First session message').first()).toBeVisible(
        { timeout: 10000 },
      );
      await expect(page.getByText('Second session message')).not.toBeVisible();
    });

    test('User can rename a chat session from the page title', async ({
      page,
      request,
    }) => {
      // Setup: login, install mocks, navigate to /chat
      await setupChatPage(page, request);

      const chatInput = page.getByPlaceholder('Type your message here...');
      await expect(chatInput).toBeVisible({ timeout: 10000 });

      // Send "Hello" and wait for reply to create a history entry
      await chatInput.fill('Hello');
      await chatInput.press('Enter');
      await expect(page.getByText('Hello from mock!').first()).toBeVisible({
        timeout: 15000,
      });

      // Click on the edit (pencil) icon next to the chat session title
      // The edit button is in the page card head title, with aria-label="Edit"
      const editButton = page
        .locator('.ant-card-head-title')
        .first()
        .getByRole('button', { name: 'Edit' });
      await editButton.first().click();

      // Clear the existing title and type a new one
      const titleInput = page.getByRole('textbox').first();
      await titleInput.clear();
      await titleInput.fill('My Renamed Session');
      await titleInput.press('Enter');

      // Verify the page title updates to "My Renamed Session"
      await expect(page.getByText('My Renamed Session').first()).toBeVisible({
        timeout: 10000,
      });

      // Open the history drawer and verify the renamed entry
      const historyButton = page
        .locator('.ant-card-head-title')
        .first()
        .getByRole('button')
        .last();
      await historyButton.first().click();

      const drawer = page.getByRole('dialog', { name: 'History' });
      await expect(drawer).toBeVisible({ timeout: 10000 });
      await expect(drawer.getByText('My Renamed Session')).toBeVisible({
        timeout: 10000,
      });
    });

    test.fixme('User can delete a chat session from history drawer', async ({
      page,
      request,
    }) => {
      // FIXME: The chat history entry labels remain as the default "Chat" instead
      // of updating to the user's message text, so the test cannot identify
      // specific sessions by content in the history drawer. History selection
      // and deletion work correctly, but the label issue prevents reliable
      // targeting of specific entries for deletion.
      // Setup: login, install mocks, navigate to /chat
      await setupChatPage(page, request);

      const chatInput = page.getByPlaceholder('Type your message here...');
      await expect(chatInput).toBeVisible({ timeout: 10000 });

      // First session
      await chatInput.fill('First session');
      await chatInput.press('Enter');
      await expect(page.getByText('Hello from mock!').first()).toBeVisible({
        timeout: 15000,
      });

      // Start new session
      const newChatButton = page
        .locator('.ant-card-head-title')
        .first()
        .getByRole('button')
        .nth(1);
      await newChatButton.first().click();

      // Second session
      await chatInput.fill('Second session');
      await chatInput.press('Enter');
      await expect(page.getByText('Hello from mock!').first()).toBeVisible({
        timeout: 15000,
      });

      // Open history drawer
      const historyButton = page
        .locator('.ant-card-head-title')
        .first()
        .getByRole('button')
        .last();
      await historyButton.first().click();

      const drawer = page.getByRole('dialog', { name: 'History' });
      await expect(drawer).toBeVisible({ timeout: 10000 });

      // Both entries visible
      await expect(drawer.getByText('First session')).toBeVisible({
        timeout: 10000,
      });
      await expect(drawer.getByText('Second session')).toBeVisible();

      // Click the trash icon on the first session (not the currently active one)
      // History entries are table rows; find by text content
      const firstSessionEntry = drawer
        .locator('tbody tr.ant-table-row')
        .filter({ hasText: 'First session' })
        .first();
      // The trash button is the only button in the row's second cell
      const trashButton = firstSessionEntry.getByRole('button').first();
      await trashButton.click();

      // The deleted entry is removed from the drawer
      await expect(drawer.getByText('First session')).not.toBeVisible({
        timeout: 10000,
      });

      // The active session remains
      await expect(drawer.getByText('Second session')).toBeVisible();
    });

    test('User is redirected to a new chat when deleting the currently active session', async ({
      page,
      request,
    }) => {
      // Setup: login, install mocks, navigate to /chat
      await setupChatPage(page, request);

      const chatInput = page.getByPlaceholder('Type your message here...');
      await expect(chatInput).toBeVisible({ timeout: 10000 });

      // Send a message to create and save a session
      await chatInput.fill('Hello');
      await chatInput.press('Enter');
      await expect(page.getByText('Hello from mock!').first()).toBeVisible({
        timeout: 15000,
      });

      // Open history drawer
      const historyButton = page
        .locator('.ant-card-head-title')
        .first()
        .getByRole('button')
        .last();
      await historyButton.first().click();

      const drawer = page.getByRole('dialog', { name: 'History' });
      await expect(drawer).toBeVisible({ timeout: 10000 });

      // Click the trash icon on the only visible history entry (current session)
      // History entries are table rows; the trash button is the only button in each row
      const historyEntry = drawer.locator('tbody tr.ant-table-row').first();
      const trashButton = historyEntry.getByRole('button').first();
      await trashButton.click();

      // The URL navigates to /chat (without an ID segment) — new blank state
      await page.waitForURL(/\/chat$/, { timeout: 10000 });

      // The message thread is empty
      await expect(page.getByText('Hello from mock!')).not.toBeVisible({
        timeout: 5000,
      });
    });
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// 3. Error Handling
// ─────────────────────────────────────────────────────────────────────────────

test.describe(
  'Error Handling',
  { tag: ['@chat', '@functional', '@regression'] },
  () => {
    test.beforeEach(async ({ page }) => {
      // Use addInitScript so localStorage is cleared before the page loads.
      // page.evaluate on about:blank would throw a SecurityError.
      await page.addInitScript(() => {
        localStorage.removeItem('backendaiwebui.cache.chat_history');
      });
    });

    test('User sees an error alert when the chat completions API returns an error response', async ({
      page,
      request,
    }) => {
      // Setup base mocks first (without completions)
      await loginAsAdmin(page, request);
      await page.evaluate(() => {
        localStorage.removeItem('backendaiwebui.cache.chat_history');
      });

      await setupGraphQLMocks(page, {
        ChatPageQuery: () => chatPageQueryMockResponse(),
        ChatCardQuery: (vars) => chatCardQueryMockResponse(vars.endpointId),
        EndpointSelectQuery: () => endpointSelectQueryMockResponse(),
        EndpointSelectValueQuery: (vars) =>
          endpointSelectValueQueryMockResponse(vars.endpoint_id),
      });

      await page.route('**/v1/models', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(modelsApiMockResponse(MOCK_MODEL_ID)),
        });
      });

      // Override completions mock to return HTTP 500
      await page.route('**/v1/chat/completions', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Internal server error from model' }),
        });
      });

      await navigateTo(page, 'chat');

      const chatInput = page.getByPlaceholder('Type your message here...');
      await expect(chatInput).toBeVisible({ timeout: 10000 });

      // Type "Trigger an error" and press Enter
      await chatInput.fill('Trigger an error');
      await chatInput.press('Enter');

      // Verify an error alert banner is visible within the chat card
      await expect(
        page
          .locator('.ant-alert-error')
          .or(page.locator('[role="alert"]'))
          .first(),
      ).toBeVisible({ timeout: 15000 });
    });

    test.fixme('User sees an error alert when the endpoint URL is invalid', async ({
      page,
      request,
    }) => {
      // FIXME: The error alert is not displayed even though ChatCardQuery returns url: null.
      // The Relay store-or-network fetch policy appears to use cached endpoint data with
      // a valid URL from a real backend response, bypassing the null URL mock. As a result,
      // createBaseURL returns a valid URL and no .ant-alert-error is rendered.
      // Set up GraphQL mocks so ChatCardQuery returns url: null
      await loginAsAdmin(page, request);
      await page.evaluate(() => {
        localStorage.removeItem('backendaiwebui.cache.chat_history');
      });

      await setupGraphQLMocks(page, {
        ChatPageQuery: () => chatPageQueryMockResponse(),
        ChatCardQuery: (vars) =>
          chatCardQueryNullUrlMockResponse(vars.endpointId),
        EndpointSelectQuery: () => endpointSelectQueryMockResponse(),
        EndpointSelectValueQuery: (vars) =>
          endpointSelectValueQueryMockResponse(vars.endpoint_id),
      });

      await page.route('**/v1/models', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(modelsApiMockResponse(MOCK_MODEL_ID)),
        });
      });

      // Navigate to the chat page
      await navigateTo(page, 'chat');

      // Wait for the chat card to render
      await expect(
        page.getByPlaceholder('Type your message here...'),
      ).toBeVisible({
        timeout: 10000,
      });

      // An error alert should be visible when endpoint URL is null
      // The component renders: <Alert title={t('error.InvalidBaseURL')} type="error" .../>
      // which translates to "Endpoint URL is not valid."
      await expect(page.locator('.ant-alert-error').first()).toBeVisible({
        timeout: 10000,
      });

      // The text input should be disabled
      await expect(
        page.getByPlaceholder('Type your message here...'),
      ).toBeDisabled({
        timeout: 10000,
      });
    });

    test.fixme('User sees an error notification when model fetching fails', async ({
      page,
      request,
    }) => {
      // FIXME: The error notification is not shown on initial page load.
      // ChatCard.tsx intentionally suppresses model fetch errors on the first load:
      //   if (modelsError && fetchKey !== 'first') { appMessage.error(...) }
      // Since fetchKey starts as 'first', any model fetch error on initial navigation
      // is silently ignored. The notification only appears after a manual refresh trigger.
      // Setup base mocks
      await loginAsAdmin(page, request);
      await page.evaluate(() => {
        localStorage.removeItem('backendaiwebui.cache.chat_history');
      });

      await setupGraphQLMocks(page, {
        ChatPageQuery: () => chatPageQueryMockResponse(),
        ChatCardQuery: (vars) => chatCardQueryMockResponse(vars.endpointId),
        EndpointSelectQuery: () => endpointSelectQueryMockResponse(),
        EndpointSelectValueQuery: (vars) =>
          endpointSelectValueQueryMockResponse(vars.endpoint_id),
      });

      // Models API returns HTTP 401 to trigger an error notification
      await page.route('**/v1/models', async (route) => {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Unauthorized' }),
        });
      });

      // Navigate to the chat page — model fetch happens on load
      await navigateTo(page, 'chat');

      // Wait for page to load
      await expect(
        page.getByPlaceholder('Type your message here...'),
      ).toBeVisible({
        timeout: 10000,
      });

      // An Ant Design error message notification should appear
      await expect(
        page
          .locator('.ant-message-error')
          .or(page.locator('.ant-notification-notice-error'))
          .first(),
      ).toBeVisible({ timeout: 15000 });

      // The chat card is still rendered (no crash)
      await expect(
        page.getByPlaceholder('Type your message here...'),
      ).toBeVisible();
    });
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// 4. Multi-Pane Setup
// ─────────────────────────────────────────────────────────────────────────────

test.describe(
  'Multi-Pane Setup',
  { tag: ['@chat', '@functional', '@regression'] },
  () => {
    test.beforeEach(async ({ page }) => {
      // Use addInitScript so localStorage is cleared before the page loads.
      // page.evaluate on about:blank would throw a SecurityError.
      await page.addInitScript(() => {
        localStorage.removeItem('backendaiwebui.cache.chat_history');
      });
    });

    test('User can add a second chat pane by clicking the compare button', async ({
      page,
      request,
    }) => {
      // Setup: login, install mocks, navigate to /chat
      await setupChatPage(page, request);

      // Wait for the chat card to be ready
      await expect(
        page.getByPlaceholder('Type your message here...'),
      ).toBeVisible({
        timeout: 10000,
      });

      // Locate and click the "Compare" button (ArrowRightLeftIcon or tooltip "Create Compare Chat")
      const compareButton = page
        .locator('.ant-card-head')
        .nth(1)
        .getByRole('button')
        .nth(1);
      await compareButton.first().click();

      // A second ChatCard should now be visible
      const chatInputs = page.getByPlaceholder('Type your message here...');
      await expect(chatInputs).toHaveCount(2, { timeout: 10000 });

      // The sync toggle should be visible in both panes (only shown when closable/multi-pane)
      // Sync toggle is the first button in each ChatCard header (ant-card-head nth(1) and nth(2))
      const syncTogglePane1 = page
        .locator('.ant-card-head')
        .nth(1)
        .getByRole('button')
        .nth(0);
      await expect(syncTogglePane1).toBeVisible({ timeout: 10000 });
    });

    test('User can close a chat pane when multiple panes are open', async ({
      page,
      request,
    }) => {
      // Setup: login, install mocks, navigate to /chat
      await setupChatPage(page, request);

      await expect(
        page.getByPlaceholder('Type your message here...'),
      ).toBeVisible({
        timeout: 10000,
      });

      // Clone a second pane
      const compareButton = page
        .locator('.ant-card-head')
        .nth(1)
        .getByRole('button')
        .nth(1);
      await compareButton.first().click();

      // Verify two panes are visible
      await expect(
        page.getByPlaceholder('Type your message here...'),
      ).toHaveCount(2, {
        timeout: 10000,
      });

      // In the second pane, click the "More" menu button
      // ant-card nth(0)=page card, nth(1)=first chat card, nth(2)=second chat card
      const secondCardMoreButton = page
        .locator('.ant-card')
        .nth(2)
        .getByRole('button', { name: 'more' });
      await secondCardMoreButton.click();

      // Click "Delete Chat" in the dropdown menu (chatui.DeleteChattingSession = "Delete Chat")
      await page
        .getByRole('menuitem', { name: /delete chat/i })
        .first()
        .click();

      // Only one pane remains
      await expect(
        page.getByPlaceholder('Type your message here...'),
      ).toHaveCount(1, {
        timeout: 10000,
      });

      // The sync toggle is no longer visible (single pane has no sync toggle)
      // In single pane mode, the ChatCard header has control(0) + compare(1) + more(2) = 3 buttons (no sync)
      // Check by ensuring the card head only has 3 buttons (no sync button at position 0)
      await expect(
        page.locator('.ant-card-head').nth(1).getByRole('button'),
      ).toHaveCount(3, { timeout: 5000 });
    });

    test('User cannot add more than 10 chat panes', async ({
      page,
      request,
    }) => {
      // Setup: login, install mocks, navigate to /chat
      await setupChatPage(page, request);

      await expect(
        page.getByPlaceholder('Type your message here...'),
      ).toBeVisible({
        timeout: 10000,
      });

      // Click the "Compare" button 10 times to bring the total to 11 panes.
      // isClonable(chatLength) = chatLength <= 10, so cloneable becomes false at 11 panes.
      // In single pane: compare is at nth(1); in multi-pane (closable=true): sync+control+compare+more, compare at nth(2)
      for (let i = 0; i < 10; i++) {
        // First iteration: single pane, compare is nth(1); subsequent: multi-pane, compare is nth(2)
        const compareButtonIndex = i === 0 ? 1 : 2;
        const compareButton = page
          .locator('.ant-card-head')
          .nth(1)
          .getByRole('button')
          .nth(compareButtonIndex);
        await compareButton.click();
        // Wait for the new pane to appear before clicking again
        await expect(
          page.getByPlaceholder('Type your message here...'),
        ).toHaveCount(i + 2, { timeout: 10000 });
      }

      // Verify 11 chat cards are visible (the maximum allowed)
      await expect(
        page.getByPlaceholder('Type your message here...'),
      ).toHaveCount(11, {
        timeout: 10000,
      });

      // The "Compare" button should no longer be visible (cloneable = false when count > 10)
      // With 11 panes, the card head has sync+control+more buttons but no compare button
      // Compare button was at nth(2), now there should only be 3 buttons: sync(0)+control(1)+more(2)
      await expect(
        page.locator('.ant-card-head').nth(1).getByRole('button'),
      ).toHaveCount(3, { timeout: 5000 });
    });

    test('User can select different endpoints in each chat pane', async ({
      page,
      request,
    }) => {
      // Setup with two endpoints available
      await setupChatPageWithTwoEndpoints(page, request);

      await expect(
        page.getByPlaceholder('Type your message here...'),
      ).toBeVisible({
        timeout: 10000,
      });

      // Clone a second pane
      const compareButton = page
        .locator('.ant-card-head')
        .nth(1)
        .getByRole('button')
        .nth(1);
      await compareButton.first().click();

      // Verify two panes are visible
      await expect(
        page.getByPlaceholder('Type your message here...'),
      ).toHaveCount(2, {
        timeout: 10000,
      });

      // In the second pane, open the endpoint selector dropdown
      // ant-card nth(0)=page card, nth(1)=first chat card, nth(2)=second chat card
      // Click the endpoint text (not the combobox input) to open the dropdown
      const secondCardEndpointText = page
        .locator('.ant-card')
        .nth(2)
        .getByText('mock-endpoint')
        .first();

      await secondCardEndpointText.click();

      // Select the second mock endpoint
      await page
        .getByRole('option', { name: 'mock-endpoint-b' })
        .or(
          page
            .locator('.ant-select-item-option')
            .filter({ hasText: 'mock-endpoint-b' }),
        )
        .first()
        .click();

      // The second pane's endpoint selector shows the second endpoint
      await expect(
        page.locator('.ant-card').nth(2).getByText('mock-endpoint-b'),
      ).toBeVisible({
        timeout: 10000,
      });

      // The first pane's endpoint selector still shows the original endpoint
      await expect(
        page.locator('.ant-card').nth(1).getByText('mock-endpoint'),
      ).toBeVisible({
        timeout: 5000,
      });
    });
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// 7. Chat Parameters
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Chat Parameters', { tag: ['@chat', '@functional'] }, () => {
  test.beforeEach(async ({ page }) => {
    // Use addInitScript so localStorage is cleared before the page loads.
    // page.evaluate on about:blank would throw a SecurityError.
    await page.addInitScript(() => {
      localStorage.removeItem('backendaiwebui.cache.chat_history');
    });
  });

  test('User can open the chat parameters panel and adjust temperature', async ({
    page,
    request,
  }) => {
    // Setup: login, install mocks, navigate to /chat
    await setupChatPage(page, request);

    await expect(
      page.getByPlaceholder('Type your message here...'),
    ).toBeVisible({
      timeout: 10000,
    });

    // Click the "Parameters" (ControlOutlined) button in the chat card header
    const parametersButton = page.getByRole('button', { name: 'control' });
    await parametersButton.first().click();

    // Verify a popover with parameter sliders appears (rendered as tooltip role)
    const popover = page.getByRole('tooltip', { name: /parameters/i });
    await expect(popover.first()).toBeVisible({ timeout: 10000 });

    // Verify the "Use Parameters" switch is present (it's a switch with no accessible name)
    const useParamsToggle = popover.first().getByRole('switch');
    await expect(useParamsToggle.first()).toBeVisible({ timeout: 10000 });

    // Enable the "Use Parameters" option by clicking the switch
    await useParamsToggle.first().click();

    // Verify "Temperature" slider is present (translation key resolves to "Temperature")
    const temperatureLabel = popover.first().getByText(/temperature/i);
    await expect(temperatureLabel.first()).toBeVisible({ timeout: 10000 });

    // Close the popover by clicking somewhere outside of it (e.g., the chat message area)
    await page.getByPlaceholder('Type your message here...').click();

    // Verify the popover closed — check that its inner content is hidden
    // (ant-popover-container stays in DOM; check the inner content div instead)
    await expect(
      page
        .locator('.ant-popover:not(.ant-popover-hidden)')
        .filter({ hasText: /parameters/i }),
    ).not.toBeVisible({ timeout: 5000 });
  });
});
