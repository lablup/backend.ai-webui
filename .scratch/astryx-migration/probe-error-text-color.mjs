import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1600, height: 1400 } });
for (const mode of ['light', 'dark']) {
  await p.goto(
    `http://127.0.0.1:5981/theme-probe/form.html?mode=${mode}&state=error&layout=vertical`,
    { waitUntil: 'networkidle' },
  );
  await p.waitForTimeout(1200);
  console.log(
    mode,
    await p.evaluate(() => ({
      antdText: getComputedStyle(
        document.querySelector('#antd .ant-form-item-explain-error'),
      ).color,
      baiText: getComputedStyle(
        document.querySelector('#bai [data-bai-form-item-explain-error]'),
      ).color,
    })),
  );
}
await b.close();
