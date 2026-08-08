import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = 'http://127.0.0.1:5695/theme-probe/chatai.html';
const OUT = '/home/ubuntu/Workspace/backend.ai-webui/.claude/worktrees/agent-a68346e911ffe1f4f/.scratch/astryx-migration/shots/23';
mkdirSync(OUT, { recursive: true });

// Per-case selector to wait on — the query/fetch that populates each page's
// main content resolves asynchronously (TanStack Query / Relay), so
// `networkidle` (which only tracks real network sockets — our fetch/Relay
// mocks are synthetic and don't emit any) fires before content lands.
const CASES = {
  'ai-agent': { selector: '.agent-card' },
  'model-store': { selector: 'text=Llama 3.1 8B Instruct' },
  'chat-empty': { selector: 'text=Endpoint URL is not valid' },
};
const modes = ['light', 'dark'];

const browser = await chromium.launch();

for (const mode of modes) {
  const context = await browser.newContext({
    colorScheme: mode,
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
  });

  for (const [c, { selector }] of Object.entries(CASES)) {
    errors.length = 0;
    await page.goto(`${BASE}?case=${c}`);
    try {
      await page.waitForSelector(selector, { timeout: 10000 });
    } catch {
      console.log(`=== ${c} (${mode}) === TIMED OUT waiting for ${selector}`);
    }
    await page.waitForTimeout(400);
    const path = `${OUT}/after-${c}-${mode}.png`;
    await page.screenshot({ path, fullPage: c !== 'chat-empty' });
    console.log(`=== ${c} (${mode}) ===`);
    console.log('saved:', path);
    if (errors.length) {
      console.log('ERRORS:');
      for (const e of errors) console.log(' ', e);
    } else {
      console.log('no console errors');
    }
  }
  await context.close();
}

await browser.close();
