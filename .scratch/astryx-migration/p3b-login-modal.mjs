/**
 * Phase 3 / ticket B — the login modal is the one `BAIModal` call site that
 * asks for a NON-dismissable dialog (`closable={false}`, `keyboard={false}`,
 * `maskClosable={false}`). Verify the mapping onto Astryx `purpose="required"`:
 * neither Escape nor a backdrop click may close it, and no header X renders.
 */
import fs from 'node:fs';
import { chromium } from '@playwright/test';

const BASE = (process.env.BAI_WEBUI ?? 'http://127.0.0.1:5820').replace(/\/$/, '');
const OUT = '.scratch/astryx-migration/shots/p3-b';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await ctx.newPage();
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000);

const probe = () =>
  page.evaluate(() => {
    const d = document.querySelector('dialog[open]');
    if (!d) return { open: false };
    return {
      open: true,
      role: d.getAttribute('role'),
      closeButtons: [...d.querySelectorAll('button')].filter(
        (b) => (b.getAttribute('aria-label') || '').toLowerCase() === 'close',
      ).length,
    };
  });

const before = await probe();
await page.screenshot({ path: `${OUT}/15-login-modal-light.png` });
await page.emulateMedia({ colorScheme: 'dark' });
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/16-login-modal-dark.png` });
await page.emulateMedia({ colorScheme: 'light' });

await page.keyboard.press('Escape');
await page.waitForTimeout(800);
const afterEscape = await probe();
await page.mouse.click(10, 10);
await page.waitForTimeout(800);
const afterBackdrop = await probe();

console.log(JSON.stringify({ before, afterEscape, afterBackdrop }, null, 2));
fs.writeFileSync(
  `${OUT}/login-modal-results.json`,
  JSON.stringify({ before, afterEscape, afterBackdrop }, null, 2),
);
await browser.close();
