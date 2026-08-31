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

const dockAtBoot = await page.evaluate(() =>
  document
    .querySelector('[data-bai-review-overlay]')
    .shadowRoot.querySelector('.dock')
    .classList.contains('show'),
);

// Activate react-grab directly — the same path its ⌘⌃C hotkey takes; the
// boot-registered plugin's onActivate must arm review-pick by itself.
await page.evaluate(() => {
  window.__REACT_GRAB__.activate();
});
await page.waitForTimeout(200);
const dockActive = await page.evaluate(() =>
  document
    .querySelector('[data-bai-review-overlay]')
    .shadowRoot.querySelector('.dock')
    .classList.contains('show'),
);

// While select mode is on, the dock checkbox must be clickable (not grabbed).
const chk = await page.evaluate(() => {
  const r = document
    .querySelector('[data-bai-review-overlay]')
    .shadowRoot.querySelector('.fixchk input')
    .getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
});
await page.mouse.move(chk.x, chk.y, { steps: 4 });
await page.waitForTimeout(300);
await page.mouse.click(chk.x, chk.y);
await page.waitForTimeout(300);
const dockClick = await page.evaluate(() => {
  const sr = document.querySelector('[data-bai-review-overlay]').shadowRoot;
  const input = sr.querySelector('.fixchk input');
  const out = {
    checkboxToggled: input.checked,
    grabStillActiveAfterDockClick: window.__REACT_GRAB__.isActive(),
    composeOpenedByDockClick: sr.querySelector('.compose').style.display === 'block',
  };
  input.click(); // restore default (unchecked)
  return out;
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
// Esc closes the compose.
await page.keyboard.press('Escape');
await page.waitForTimeout(200);
const afterClose = await page.evaluate(() => {
  const sr = document.querySelector('[data-bai-review-overlay]').shadowRoot;
  return {
    composeAfterEsc: sr.querySelector('.compose').style.display,
    outlineAfterClose: sr.querySelector('.hoverbox').style.display,
  };
});

// Reopen, then a click outside the compose closes it.
await page.evaluate(() => window.__REACT_GRAB__.activate());
await page.waitForTimeout(300);
await page.mouse.move(cx, cy, { steps: 4 });
await page.waitForTimeout(400);
await page.mouse.click(cx, cy);
await page.waitForTimeout(600);
const reopened = await page.evaluate(
  () =>
    document
      .querySelector('[data-bai-review-overlay]')
      .shadowRoot.querySelector('.compose').style.display,
);
await page.mouse.click(700, 120); // empty header area, outside the compose
await page.waitForTimeout(300);
const afterOutside = await page.evaluate(
  () =>
    document
      .querySelector('[data-bai-review-overlay]')
      .shadowRoot.querySelector('.compose').style.display,
);
afterClose.composeReopened = reopened;
afterClose.composeAfterOutsideClick = afterOutside;

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

// Close the panel — with nothing active and 항상 표시 off, the dock hides.
const dockAtEnd = await page.evaluate(() => {
  const sr = document.querySelector('[data-bai-review-overlay]').shadowRoot;
  sr.querySelector('[data-act="close"]').click();
  return sr.querySelector('.dock').classList.contains('show');
});

console.log(
  JSON.stringify(
    { dockAtBoot, dockActive, ...dockClick, active, ...result, ...persist, ...afterClose, ...hl, dockAtEnd },
    null,
    2,
  ),
);
await browser.close();
