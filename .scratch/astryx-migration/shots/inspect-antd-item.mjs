// One-off DOM inspection: how does antd v6 lay out an errored Form.Item?
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1500, height: 1500 } });
await p.goto('http://127.0.0.1:9198/theme-probe/form.html?variant=antd&state=error', {
  waitUntil: 'networkidle',
});
await p.waitForTimeout(1800);
const out = await p.evaluate(() => {
  const items = [...document.querySelectorAll('#antd .ant-form-item')];
  return items.map((item) => {
    const cs = getComputedStyle(item);
    const kids = [...item.querySelectorAll('*')]
      .filter((el) =>
        /margin-offset|explain|additional|with-help/.test(el.className),
      )
      .map((el) => {
        const c = getComputedStyle(el);
        return {
          cls: el.className,
          h: el.getBoundingClientRect().height,
          minHeight: c.minHeight,
          marginBottom: c.marginBottom,
          transition: c.transition.slice(0, 60),
        };
      });
    return {
      cls: item.className,
      marginBottom: cs.marginBottom,
      label:
        item
          .querySelector('.ant-form-item-label')
          ?.textContent?.trim()
          .slice(0, 16) ?? null,
      kids,
    };
  });
});
console.log(JSON.stringify(out, null, 2));
await b.close();
