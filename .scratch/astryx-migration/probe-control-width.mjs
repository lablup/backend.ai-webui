import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1400 } });
await page.goto(
  'http://127.0.0.1:5981/theme-probe/form.html?mode=light&state=error&layout=vertical',
  { waitUntil: 'networkidle' },
);
await page.waitForTimeout(1200);
console.log(
  JSON.stringify(
    await page.evaluate(() => {
      const probe = (rootId, contentSel) => {
        const root = document.getElementById(rootId);
        const contents = [...root.querySelectorAll(contentSel)];
        return contents.slice(0, 6).map((c) => {
          const child = c.firstElementChild;
          return {
            contentW: Math.round(c.getBoundingClientRect().width),
            childClass: child?.className?.toString().slice(0, 60),
            childW: child ? Math.round(child.getBoundingClientRect().width) : null,
            childBorder: child
              ? getComputedStyle(child).borderColor ||
                getComputedStyle(child.querySelector('input, .ant-select-selector') ?? child)
                  .borderColor
              : null,
          };
        });
      };
      // Where does the FormItemVisual.css rule live?
      const sheets = [...document.styleSheets].flatMap((s) => {
        try {
          return [...s.cssRules].map((r) => r.cssText);
        } catch {
          return [];
        }
      });
      return {
        antd: probe('antd', '.ant-form-item-control-input-content'),
        bai: probe('bai', '[data-bai-form-item-control-input-content]'),
        stretchRulePresent: sheets.filter((t) =>
          t.includes('data-bai-form-item-control-input'),
        ),
        errorStatusRules: sheets.filter((t) =>
          t.includes('ant-input-status-error'),
        ).length,
      };
    }),
    null,
    1,
  ),
);
await browser.close();
