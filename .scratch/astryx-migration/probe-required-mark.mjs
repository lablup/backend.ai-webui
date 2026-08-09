/** Does antd actually PAINT an asterisk under the app's function requiredMark? */
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1400 } });
await page.goto(
  'http://127.0.0.1:5981/theme-probe/form.html?mode=light&state=pristine&layout=vertical',
  { waitUntil: 'networkidle' },
);
await page.waitForTimeout(600);
const out = await page.evaluate(() => {
  const antdLabels = [
    ...document.querySelectorAll('#antd .ant-form-item-label label'),
  ].map((l) => ({
    text: l.textContent.trim(),
    hasRequiredClass: l.classList.contains('ant-form-item-required'),
    optionalMarkClass: l.classList.contains(
      'ant-form-item-required-mark-optional',
    ),
    beforeContent: getComputedStyle(l, '::before').content,
    beforeDisplay: getComputedStyle(l, '::before').display,
    beforeWidth: getComputedStyle(l, '::before').width,
  }));
  const baiLabels = [
    ...document.querySelectorAll('#bai [data-bai-form-item-label]'),
  ].map((l) => ({
    text: l.textContent.trim(),
    asterisks: l.querySelectorAll('[data-bai-form-item-required]').length,
    beforeContent: getComputedStyle(l, '::before').content,
  }));
  return { antdLabels, baiLabels };
});
console.log(JSON.stringify(out, null, 2));
await browser.close();
