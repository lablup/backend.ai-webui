/** What antd's `<Form size="small">` actually changes on a nested control. */
import { chromium } from '@playwright/test';

const BASE = process.env.PROBE_BASE ?? 'http://127.0.0.1:9198';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
await page.goto(`${BASE}/theme-probe/formmatrix.html?only=size-small`, {
  waitUntil: 'networkidle',
});
await page.waitForTimeout(900);
const r = await page.evaluate(() => {
  const pick = (impl) => {
    const el = document.querySelector(
      `[data-case="size-small"][data-impl="${impl}"] .ant-input`,
    );
    const s = getComputedStyle(el);
    return {
      cls: el.className,
      height: s.height,
      paddingBlock: `${s.paddingTop}/${s.paddingBottom}`,
      paddingInline: `${s.paddingLeft}/${s.paddingRight}`,
      fontSize: s.fontSize,
      lineHeight: s.lineHeight,
      borderRadius: s.borderRadius,
    };
  };
  return { antd: pick('antd'), engine: pick('engine') };
});
console.log(JSON.stringify(r, null, 1));
await browser.close();
