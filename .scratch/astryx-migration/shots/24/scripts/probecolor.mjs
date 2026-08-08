import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://127.0.0.1:5706/theme-probe/frame24.html?case=sider', {
  waitUntil: 'networkidle',
});
await page.waitForTimeout(800);
const info = await page.evaluate(() => {
  const a = document.querySelector('.bai-sider a');
  if (!a) return { found: false };
  const cs = getComputedStyle(a);
  const rules = [];
  for (const sheet of Array.from(document.styleSheets)) {
    let cssRules;
    try {
      cssRules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const r of Array.from(cssRules)) {
      if (r.selectorText && /(^|,)\s*\.ant-app[^,]*\ba\b/.test(r.selectorText)) {
        rules.push(r.cssText.slice(0, 160));
      }
    }
  }
  return {
    found: true,
    tag: a.tagName,
    className: a.className,
    color: cs.color,
    antAppAnchorRules: rules.slice(0, 5),
    textPrimary: getComputedStyle(document.documentElement).getPropertyValue(
      '--color-text-primary',
    ),
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
