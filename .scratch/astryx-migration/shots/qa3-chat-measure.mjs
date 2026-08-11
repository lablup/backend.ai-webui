/**
 * QA3 — verify the Chat composer is fully inside its card.
 *
 *   node .scratch/astryx-migration/shots/qa3-chat-measure.mjs [outDir] [tag]
 *
 * Checks, per viewport x theme:
 *   - the VStack that owns the chat column does not overflow (scrollH == clientH)
 *   - the composer's bottom edge sits at or above the card's clipping edge
 *   - the same holds with the attachment drawer open
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const OUT = process.argv[2] || path.join(import.meta.dirname, 'qa3');
const TAG = process.argv[3] || 'after';
const BASE = 'http://127.0.0.1:4735';
fs.mkdirSync(OUT, { recursive: true });

const env = Object.fromEntries(
  fs
    .readFileSync(
      path.join(import.meta.dirname, '../../../react/.env.development.local'),
      'utf8',
    )
    .split('\n')
    .filter(Boolean)
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i), l.slice(i + 1)];
    }),
);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));

await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(5000);
const email = page.getByPlaceholder(/Email or Username/i).first();
if (await email.isVisible().catch(() => false)) {
  await email.fill(env.VITE_DEFAULT_EMAIL);
  await page
    .getByPlaceholder(/^Password$/i)
    .first()
    .fill(env.VITE_DEFAULT_PASSWORD);
  const ep = page.getByPlaceholder(/^Endpoint$/i).first();
  if (await ep.isVisible().catch(() => false))
    await ep.fill(env.VITE_DEFAULT_API_ENDPOINT);
  await page.locator('button:has-text("Login")').first().click();
}
await page.waitForTimeout(10000);

const setTheme = async (mode) => {
  const cur = await page.evaluate(() =>
    document.documentElement.getAttribute('data-theme'),
  );
  if (cur === mode) return;
  await page
    .getByRole('button', { name: mode === 'dark' ? /^dark mode$/i : /^light mode$/i })
    .first()
    .click({ timeout: 15000 });
  await page.waitForTimeout(2500);
  const resolved = await page.evaluate(() =>
    document.documentElement.getAttribute('data-theme'),
  );
  if (resolved !== mode) throw new Error(`theme not ${mode}: ${resolved}`);
};

const probe = () =>
  page.evaluate(() => {
    const input = Array.from(document.querySelectorAll('*')).find((e) =>
      (e.getAttribute('aria-label') || '').includes('Type your message'),
    );
    if (!input) return { found: false };
    let composer = input;
    let card = null;
    let stack = null;
    for (let n = input; n && n !== document.body; n = n.parentElement) {
      const cls = (n.className || '').toString();
      if (/astryx-chat-composer(\s|$)/.test(cls)) composer = n;
      if (/astryx-card/.test(cls) && !card) card = n;
      if (/astryx-stack/.test(cls) && !stack) stack = n;
    }
    const r = (el) => {
      const b = el.getBoundingClientRect();
      return { top: Math.round(b.top), bottom: Math.round(b.bottom), h: Math.round(b.height) };
    };
    const sendBtn = composer.querySelector('button[aria-label], button');
    return {
      found: true,
      composer: r(composer),
      card: r(card),
      cardClientBottom: Math.round(card.getBoundingClientRect().top + card.clientHeight),
      stack: { ...r(stack), clientH: stack.clientHeight, scrollH: stack.scrollHeight },
      sendBtn: sendBtn ? r(sendBtn) : null,
      viewportH: window.innerHeight,
    };
  });

const results = [];
const check = async (label, vp, theme) => {
  await page.setViewportSize({ width: vp.w, height: vp.h });
  await page.waitForTimeout(1200);
  const p = await probe();
  const stackOverflow = p.found ? p.stack.scrollH - p.stack.clientH : null;
  const composerClip = p.found ? p.composer.bottom - p.cardClientBottom : null;
  const ok = p.found && stackOverflow <= 0 && composerClip <= 0;
  results.push({ label, vp, theme, ...p, stackOverflow, composerClip, ok });
  console.log(
    `${label} ${vp.w}x${vp.h} ${theme}: stackOverflow=${stackOverflow}px ` +
      `composerBottom=${p.composer?.bottom} cardClipEdge=${p.cardClientBottom} ` +
      `clip=${composerClip}px => ${ok ? 'OK' : 'CLIPPED'}`,
  );
  await page.screenshot({
    path: path.join(OUT, `chat-${TAG}-${label}-${vp.h}-${theme}.png`),
  });
};

for (const theme of ['light', 'dark']) {
  await page.goto(`${BASE}/chat`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000);
  await setTheme(theme);
  await page.waitForTimeout(1500);
  await check('plain', { w: 1440, h: 900 }, theme);
  await check('plain', { w: 1440, h: 700 }, theme);

  // Attachment drawer open: feed the hidden file input directly.
  const tmp = path.join(OUT, 'qa3-attachment.txt');
  fs.writeFileSync(tmp, 'qa3 attachment fixture\n');
  await page.setInputFiles('input[type=file]', [tmp]).catch(() => {});
  await page.waitForTimeout(1500);
  await check('attached', { w: 1440, h: 700 }, theme);
  await check('attached', { w: 1440, h: 900 }, theme);
}

fs.writeFileSync(
  path.join(OUT, `chat-${TAG}-measure.json`),
  JSON.stringify({ results, errors }, null, 2),
);
console.log(
  `\nSUMMARY: ${results.filter((r) => r.ok).length}/${results.length} states fit; pageerrors=${errors.length}`,
);
await browser.close();
