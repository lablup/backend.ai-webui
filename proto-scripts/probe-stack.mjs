// FR-3791 PROTOTYPE — inspect react-grab getStackContext output verbatim.
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://fr3791-pins.jongeun.10-82-0-159.sslip.io/', {
  waitUntil: 'domcontentloaded',
});
await page.waitForFunction(() => !!window.__REACT_GRAB__, null, {
  timeout: 20000,
});
await page.waitForTimeout(4000);
const out = await page.evaluate(async () => {
  const btns = [...document.querySelectorAll('button')].filter(
    (e) =>
      e.getBoundingClientRect().width > 0 &&
      !e.closest('[data-bai-review-overlay]'),
  );
  const el = btns[btns.length - 1];
  const api = window.__REACT_GRAB__;
  const stackCtx = await api.getStackContext(el);
  return { picked: (el.innerText || '').slice(0, 30), stackCtx };
});
console.log(JSON.stringify(out, null, 2));
await browser.close();
