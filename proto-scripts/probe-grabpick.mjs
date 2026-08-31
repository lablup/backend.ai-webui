// FR-3791 PROTOTYPE — verify pick mode rides react-grab's selection UI.
// react-grab's capture layer fails Playwright actionability, so use raw
// mouse coordinates captured before activating pick mode.
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://fr3791-pins.jongeun.10-82-0-159.sslip.io/', {
  waitUntil: 'domcontentloaded',
});
await page.waitForSelector('[data-bai-review-overlay]', {
  state: 'attached',
  timeout: 30000,
});
await page.waitForFunction(() => !!window.__REACT_GRAB__, null, {
  timeout: 20000,
});
await page.waitForTimeout(4000);

const box = await page
  .locator('button', { hasText: 'Create Folder' })
  .first()
  .boundingBox();
const cx = box.x + box.width / 2;
const cy = box.y + box.height / 2;

// Activate react-grab directly — the same path its ⌘⌃C hotkey takes; the
// boot-registered plugin's onActivate must arm review-pick by itself.
await page.evaluate(() => {
  document.querySelector('[data-bai-review-overlay]');
  window.__REACT_GRAB__.activate();
});
await page.waitForTimeout(500);
const active = await page.evaluate(() => window.__REACT_GRAB__.isActive());

await page.mouse.move(cx, cy, { steps: 8 });
await page.waitForTimeout(900);
await page.screenshot({ path: 'proto-scripts/shots/3-grab-hover.png' });
await page.mouse.click(cx, cy);
await page.waitForTimeout(1000);

const result = await page.evaluate(() => {
  const sr = document.querySelector('[data-bai-review-overlay]').shadowRoot;
  return {
    grabStillActive: window.__REACT_GRAB__.isActive(),
    composeVisible: sr.querySelector('.compose').style.display === 'block',
    textareaFocused:
      document.activeElement ===
        document.querySelector('[data-bai-review-overlay]') &&
      sr.activeElement === sr.querySelector('textarea'),
    pathlabel: sr.querySelector('.pathlabel').textContent,
  };
});
await page.screenshot({ path: 'proto-scripts/shots/4-grab-compose.png' });

// Selection outline must persist past react-grab's fade, until compose closes.
await page.waitForTimeout(4000);
const persist = await page.evaluate(() => {
  const sr = document.querySelector('[data-bai-review-overlay]').shadowRoot;
  return { outlineAfter4s: sr.querySelector('.hoverbox').style.display === 'block' };
});
await page.evaluate(() => {
  const sr = document.querySelector('[data-bai-review-overlay]').shadowRoot;
  sr.querySelector('[data-act="cancel"]').click();
});
const afterClose = await page.evaluate(() => {
  const sr = document.querySelector('[data-bai-review-overlay]').shadowRoot;
  return { outlineAfterClose: sr.querySelector('.hoverbox').style.display };
});

// Pin click → panel item highlighted, surviving a forced re-render.
const hl = await page.evaluate(async () => {
  const sr = document.querySelector('[data-bai-review-overlay]').shadowRoot;
  await window.__baiReviewProto.fetchPins();
  const pin = sr.querySelector('.pin');
  if (!pin) return { pin: false };
  pin.click();
  await new Promise((r) => setTimeout(r, 1200)); // reposition re-render fires at 800ms
  return {
    pin: true,
    itemHighlighted: !!sr.querySelector('.item.hl'),
    panelOpen: sr.querySelector('.panel').classList.contains('open'),
  };
});

console.log(JSON.stringify({ active, ...result, ...persist, ...afterClose, ...hl }, null, 2));
await browser.close();
