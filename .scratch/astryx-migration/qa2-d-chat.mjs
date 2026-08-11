/**
 * qa2-d live proof — the Chat composer rebuilt on Astryx's chat family.
 *
 *   BAI_ENDPOINT=... BAI_EMAIL=... BAI_PW=... \
 *     node .scratch/astryx-migration/qa2-d-chat.mjs
 *
 * Credentials come from the environment, never from this file.
 * Dev server on http://127.0.0.1:5940 (agent QA2-D's port band).
 *
 * The cluster at BAI_ENDPOINT serves no reachable model deployment (its one
 * deployment reports "Endpoint URL is not valid."), so a *real* round trip is
 * impossible here. Two passes are run instead:
 *
 *   A. UNMOCKED — proves the genuinely-disabled composer renders correctly
 *      (contenteditable="false", dimmed, not focusable).
 *   B. MOCKED   — the deployment's `endpointUrl` is rewritten in the GraphQL
 *      response to a fake origin, whose /models and completions endpoints are
 *      fulfilled by Playwright. That unlocks the enabled composer so typing,
 *      Shift+Enter, Enter-submit, attach and remove can all be exercised for
 *      real against the component, in light and dark.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE = process.env.QA2D_BASE ?? 'http://127.0.0.1:5940/';
const OUT = '.scratch/astryx-migration/shots/qa2-d';
const MOCK_ORIGIN = 'http://qa2d-mock.test';
const MOCK_MODEL = 'qa2-d-mock-model';
fs.mkdirSync(OUT, { recursive: true });

const PNG_1PX =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const results = {};
const pageErrors = [];
const consoleErrors = [];
const log = (k, v) => {
  results[k] = v;
  console.log(`### ${k} = ${JSON.stringify(v)}`);
};

const sse = (text) =>
  `data: ${JSON.stringify({
    id: 'chatcmpl-qa2d',
    object: 'chat.completion.chunk',
    model: MOCK_MODEL,
    choices: [{ delta: { content: text }, index: 0, finish_reason: null }],
  })}\n\n` +
  `data: ${JSON.stringify({
    id: 'chatcmpl-qa2d',
    object: 'chat.completion.chunk',
    model: MOCK_MODEL,
    choices: [{ delta: {}, index: 0, finish_reason: 'stop' }],
  })}\n\ndata: [DONE]\n\n`;

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1200 },
});
const page = await ctx.newPage();
page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 300)));
page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200));
});

// The chat card runs slightly taller than the viewport (page-level scroll),
// so bring the composer's action row into frame before every capture.
const shot = async (name) => {
  await page
    .getByRole('button', { name: /^(send|stop)$/i })
    .first()
    .scrollIntoViewIfNeeded()
    .catch(() => {});
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${OUT}/${name}.png` });
};
const composerInput = () =>
  page.getByLabel('Type your message here...').first();

/* ------------------------------- login -------------------------------- */
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000);
const userInput = page.locator('input[placeholder="Email or Username"]').first();
if (await userInput.count()) {
  const ep = page.locator('input[placeholder="Endpoint"]').first();
  if ((await ep.count()) && process.env.BAI_ENDPOINT)
    await ep.fill(process.env.BAI_ENDPOINT);
  await userInput.fill(process.env.BAI_EMAIL);
  await page.locator('input[type="password"]').first().fill(process.env.BAI_PW);
  await page.getByRole('button', { name: /^login$/i }).first().click();
}
await page.waitForTimeout(18000);
log('loggedIn', !(await userInput.count()));

const PREFIX =
  new URL(page.url()).pathname.match(/^\/project\/[^/]+/)?.[0] ?? '';
const CHAT_URL = `${BASE.replace(/\/$/, '')}${PREFIX}/chat`;
log('chatUrl', CHAT_URL);

async function setTheme(mode) {
  await page.evaluate((m) => {
    localStorage.setItem('backendaiwebui.settings.themeMode', JSON.stringify(m));
  }, mode);
}

/* ================= PASS A — genuinely disabled composer ================ */
await setTheme('light');
await page.goto(CHAT_URL, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(14000);
log('disabled', {
  composerPresent: await composerInput().count(),
  contentEditable: await composerInput().getAttribute('contenteditable'),
  sendButton: await page.getByRole('button', { name: /^send$/i }).count(),
  attachButton: await page.getByRole('button', { name: /attachments/i }).count(),
  invalidUrlBanner: await page
    .getByText('Endpoint URL is not valid.')
    .first()
    .isVisible()
    .catch(() => false),
});
await shot('light-00-composer-disabled');

/* ------------------------- install the mocks --------------------------- */
let patchedGqlResponses = 0;
await page.route('**/admin/gql', async (route) => {
  const response = await route.fetch();
  let body = await response.text();
  if (body.includes('"endpointUrl"')) {
    body = body.replace(
      /"endpointUrl":\s*(null|"[^"]*")/g,
      `"endpointUrl":"${MOCK_ORIGIN}/"`,
    );
    patchedGqlResponses += 1;
  }
  await route.fulfill({ response, body });
});

// One handler for the whole fake origin. Playwright matches the LAST
// registered route first, so a single handler avoids ordering surprises.
const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': '*',
  'access-control-allow-methods': '*',
  'access-control-expose-headers': '*',
};
await page.route(`${MOCK_ORIGIN}/**`, async (route) => {
  const request = route.request();
  if (request.method() === 'OPTIONS') {
    await route.fulfill({ status: 204, headers: CORS });
    return;
  }
  if (new URL(request.url()).pathname.endsWith('/models')) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: CORS,
      body: JSON.stringify({
        object: 'list',
        data: [{ id: MOCK_MODEL, object: 'model', owned_by: 'qa2-d' }],
      }),
    });
    return;
  }
  await route.fulfill({
    status: 200,
    contentType: 'text/event-stream',
    headers: CORS,
    body: sse('Hello from the qa2-d mock endpoint.'),
  });
});

/* ================== PASS B — enabled composer contract ================= */
async function pass(mode) {
  const p = {};
  await setTheme(mode);
  await page.goto(CHAT_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(15000);

  const input = composerInput();
  p.patchedGqlResponses = patchedGqlResponses;
  p.contentEditable = await input.getAttribute('contenteditable');
  if (p.contentEditable !== 'true') {
    p.abortedBecauseDisabled = true;
    await shot(`${mode}-01-composer-still-disabled`);
    return p;
  }
  p.modelVisible = await page
    .getByText(MOCK_MODEL)
    .first()
    .isVisible()
    .catch(() => false);
  p.sendButton = await page.getByRole('button', { name: /^send$/i }).count();
  p.attachButton = await page
    .getByRole('button', { name: /attachments/i })
    .count();
  p.hiddenFileInputs = await page.locator('input[type="file"]').count();
  await shot(`${mode}-01-composer-ready`);

  // --- typing ---
  await input.click();
  await input.fill('Hello from the Astryx composer');
  await page.waitForTimeout(500);
  p.typedText = ((await input.textContent()) ?? '').trim();
  await shot(`${mode}-02-typed`);

  // --- Shift+Enter must insert a newline, NOT submit ---
  await input.press('Shift+Enter');
  await page.keyboard.type('second line');
  await page.waitForTimeout(500);
  const afterShift = (await input.textContent()) ?? '';
  p.shiftEnterKeptFirstLine = afterShift.includes('Astryx composer');
  p.shiftEnterAddedSecondLine = afterShift.includes('second line');
  await shot(`${mode}-03-shift-enter-newline`);

  // --- attach a file through the composer's hidden native input ---
  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles({
      name: 'qa2-d-attachment.png',
      mimeType: 'image/png',
      buffer: Buffer.from(PNG_1PX, 'base64'),
    });
  await page.waitForTimeout(1500);
  p.attachmentVisible = await page
    .getByLabel('qa2-d-attachment.png')
    .first()
    .isVisible()
    .catch(() => false);
  p.drawerRendered = await page
    .locator('[class*="astryx"]')
    .filter({ hasText: 'Attachments' })
    .count();
  await shot(`${mode}-04-attachment-added`);

  // --- remove the attachment ---
  const removeBtn = page
    .getByRole('button', { name: /remove qa2-d-attachment\.png|^remove$/i })
    .first();
  p.removeButtonFound = (await removeBtn.count()) > 0;
  if (p.removeButtonFound) {
    await removeBtn.click({ force: true });
    await page.waitForTimeout(1000);
  }
  p.attachmentRemoved = !(await page
    .getByLabel('qa2-d-attachment.png')
    .first()
    .isVisible()
    .catch(() => false));
  await shot(`${mode}-05-attachment-removed`);

  // --- Enter submits, composer clears, message reaches the thread ---
  await input.click();
  await input.fill('Enter submits this message');
  await page.waitForTimeout(400);
  await input.press('Enter');
  await page.waitForTimeout(4000);
  p.composerClearedAfterEnter =
    ((await input.textContent()) ?? '').trim() === '';
  p.userMessageInThread = await page
    .getByText('Enter submits this message')
    .first()
    .isVisible()
    .catch(() => false);
  p.assistantReply = await page
    .getByText('Hello from the qa2-d mock endpoint.')
    .first()
    .isVisible()
    .catch(() => false);
  await shot(`${mode}-06-sent-and-replied`);

  return p;
}

log('light', await pass('light'));
log('dark', await pass('dark'));

log('pageErrors', pageErrors);
log('consoleErrors', consoleErrors.slice(0, 20));

fs.writeFileSync(
  `${OUT}/results.json`,
  JSON.stringify({ results, pageErrors, consoleErrors }, null, 2),
);
await browser.close();
