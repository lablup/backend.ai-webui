// FR-3791 PROTOTYPE — generate v3 comment blocks from the live login page.
import { chromium } from '@playwright/test';

const URL = process.env.PROTO_URL || 'http://fr3791-pins.jongeun.10-82-0-159.sslip.io/';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(URL, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('[data-bai-review-overlay]', { timeout: 30000, state: 'attached' });
await page.waitForFunction(() => !!window.__baiReviewProto, null, { timeout: 15000 });
// Let the SPA settle so element picks are stable.
await page.waitForTimeout(4000);

const result = await page.evaluate(async () => {
  const candidates = [];
  const tid = [...document.querySelectorAll('[data-testid]')].filter(
    (e) => e.getBoundingClientRect().width > 0,
  );
  if (tid.length) candidates.push(tid[0]);
  const btn = [...document.querySelectorAll('button')].filter(
    (e) => e.getBoundingClientRect().width > 0 && !e.closest('[data-bai-review-overlay]'),
  );
  if (btn.length) candidates.push(btn[btn.length - 1]);
  const inp = [...document.querySelectorAll('input, label')].filter(
    (e) => e.getBoundingClientRect().width > 0,
  );
  if (inp.length) candidates.push(inp[0]);

  const picks = candidates.slice(0, 2);
  const texts = [
    'Prototype test pin 1 — this element looks misaligned (fake finding for FR-3791).',
    'Prototype test pin 2 — second fake finding to exercise the list panel.',
  ];
  const out = [];
  for (let i = 0; i < picks.length; i++) {
    const el = picks[i];
    // describe the pick
    const desc = `${el.tagName.toLowerCase()}${el.dataset.testid ? `[data-testid=${el.dataset.testid}]` : ''} "${(el.innerText || el.value || '').slice(0, 40)}"`;
    const sel = window.__baiReviewProto ? null : null;
    // build via the overlay's own composer path
    const block = await (async () => {
      // reuse internal builder through blockFor by giving it a unique selector:
      // fall back to a temp data attribute to target the exact element.
      el.setAttribute('data-bai-proto-pick', String(i));
      const b = await window.__baiReviewProto.blockFor(
        `[data-bai-proto-pick="${i}"]`,
        texts[i],
      );
      el.removeAttribute('data-bai-proto-pick');
      return b;
    })();
    out.push({ desc, block });
  }
  return out;
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
