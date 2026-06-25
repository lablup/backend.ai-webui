// spec: e2e/.agent-output/test-plan-chat.md
// Section: 1 (Basic Chat Flow) — file attachment regression (FR-3161)
//
// Regression coverage for FR-3161: a chat attachment must be forwarded to the
// model endpoint as a base64 `data:` URL, not a `blob:` object URL. A `blob:`
// URL is only resolvable inside the document that created it, so the model
// endpoint can never read it; encoding the file as a data URL inlines the bytes
// so they reach the model as-is.
import { setupChatPage } from './mocking/chat-mock-data';
import { test, expect, type Request } from '@playwright/test';

// A minimal valid 1x1 transparent PNG, used as the attachment payload.
const ONE_PX_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

test.describe(
  'Chat File Attachment',
  { tag: ['@chat', '@functional', '@regression'] },
  () => {
    test.beforeEach(async ({ page }) => {
      // Clear chat history before the page loads so each test starts blank.
      await page.addInitScript(() => {
        localStorage.removeItem('backendaiwebui.cache.chat_history');
      });
    });

    test('Attached file is sent to the model as a base64 data URL, not a blob URL', async ({
      page,
      request,
    }) => {
      // Setup: login, install GraphQL/models/completions mocks, navigate to /chat
      await setupChatPage(page, request);

      // Wait for the chat input to be *enabled*, not merely visible. The input
      // stays `disabled` until the mocked model-readiness chain completes
      // (ChatPageQuery auto-selects the endpoint → ChatCardQuery resolves the
      // base URL → /v1/models returns without error). Gating on `toBeEnabled`
      // is the deterministic readiness barrier — unlike the model-name text,
      // which was flaky — and it must happen *before* the 15s waitForRequest
      // window below, otherwise that window would include the model-load time
      // and time out on slower machines while the input is still disabled.
      const chatInput = page.getByPlaceholder('Type your message here...');
      await expect(chatInput).toBeVisible({ timeout: 10000 });
      await expect(chatInput).toBeEnabled({ timeout: 15000 });

      // Attach a PNG through the (hidden) Attachments upload input. The prefix
      // Attachments is always rendered, so the first file input is the target.
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles({
        name: 'attachment.png',
        mimeType: 'image/png',
        buffer: Buffer.from(ONE_PX_PNG_BASE64, 'base64'),
      });

      // Capture the outgoing completions request so we can inspect the payload
      // the model endpoint actually receives.
      const completionsRequestPromise = page.waitForRequest(
        (req: Request) =>
          req.url().includes('/v1/chat/completions') && req.method() === 'POST',
        { timeout: 15000 },
      );

      // Type a message and send (Sender submitType="enter").
      await chatInput.click();
      await chatInput.fill('Describe this image');
      await chatInput.press('Enter');

      // The user message appears in the thread.
      await expect(page.getByText('Describe this image').first()).toBeVisible({
        timeout: 10000,
      });

      // Inspect the completions request body.
      const completionsRequest = await completionsRequestPromise;
      const postData = completionsRequest.postData() ?? '';

      // The attachment must be inlined as a base64 data URL preserving the media
      // type — this is the fix. A blob: URL would never be readable by the model.
      expect(postData).toContain('data:image/png;base64,');
      expect(postData).not.toContain('blob:');

      // The assistant reply still streams back, proving the request succeeded.
      await expect(page.getByText('Hello from mock!').first()).toBeVisible({
        timeout: 15000,
      });
    });
  },
);
