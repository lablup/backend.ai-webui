// FR-3791 PROTOTYPE — verify the read side: deep link, pins, panel states.
import { chromium } from '@playwright/test';

const BASE = 'http://fr3791-pins.jongeun.10-82-0-159.sslip.io';
const DEEP = process.argv[2]; // full deep-link URL (optional)

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

async function settle(ms = 4000) {
  await page.waitForTimeout(ms);
}

const shots = [];
async function shot(name) {
  const path = `proto-scripts/shots/${name}.png`;
  await page.screenshot({ path });
  shots.push(path);
}

// 1) Deep-link open (full form): should navigate/anchor + pulse the pin.
await page.goto(DEEP || `${BASE}/`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('[data-bai-review-overlay]', { state: 'attached', timeout: 30000 });
await settle(6000);
await shot('1-deeplink');

// 2) Panel state.
const overlay = await page.evaluateHandle(() =>
  document.querySelector('[data-bai-review-overlay]').shadowRoot,
);
const report = await page.evaluate(() => {
  const sr = document.querySelector('[data-bai-review-overlay]').shadowRoot;
  const pins = [...sr.querySelectorAll('.pin')].map((p) => ({
    num: p.textContent,
    cls: p.className,
    visible: p.style.display !== 'none',
    pos: { left: p.style.left, top: p.style.top },
  }));
  const items = [...sr.querySelectorAll('.item')].map((i) => ({
    id: i.dataset.pinId,
    cls: i.className,
    text: i.querySelector('.body')?.textContent?.slice(0, 60),
    badges: [...i.querySelectorAll('.badge')].map((b) => b.textContent),
    lastReply: i.querySelector('.lastreply')?.textContent?.slice(0, 80) || null,
  }));
  const src = sr.querySelector('.srcline')?.textContent;
  const panelOpen = sr.querySelector('.panel')?.classList.contains('open');
  return { pins, items, src, panelOpen, states: Object.fromEntries(
    [...(window.__baiReviewProto?.pinState || new Map())].map(([k, v]) => [
      k,
      { located: !!v.located, hasAnchor: !!v.anchor },
    ]),
  ) };
});
console.log(JSON.stringify(report, null, 2));

// open panel if not already, screenshot list
await page.evaluate(() => {
  const sr = document.querySelector('[data-bai-review-overlay]').shadowRoot;
  if (!sr.querySelector('.panel').classList.contains('open'))
    sr.querySelector('.toggle').click();
});
await settle(1000);
await shot('2-panel');

console.log('SHOTS', JSON.stringify(shots));
await browser.close();
