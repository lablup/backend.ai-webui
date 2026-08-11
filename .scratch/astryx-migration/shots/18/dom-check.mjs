import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 1400 } });
await p.goto(
  'http://127.0.0.1:5645/theme-probe/deployments.html?case=drawer&theme=dark',
  { waitUntil: 'networkidle' },
);
await p.waitForTimeout(2000);
const info = await p.evaluate(() => {
  const list = document.querySelector('.deployment-revision-detail-metadata');
  if (!list) return 'no list';
  const dialog = document.querySelector('dialog');
  const item = [...list.children].slice(0, 3).map((c) => c.outerHTML.slice(0, 250));
  return {
    listTag: list.tagName,
    listClass: list.className,
    listWidth: list.getBoundingClientRect().width,
    listScrollWidth: list.scrollWidth,
    dialogWidth: dialog?.getBoundingClientRect().width,
    display: getComputedStyle(list).display,
    gridTemplate: getComputedStyle(list).gridTemplateColumns,
    columnCount: getComputedStyle(list).columnCount,
    firstChildren: item,
    ddCount: list.querySelectorAll('dd').length,
    preWidths: [...list.querySelectorAll('pre')].map((el) => ({
      w: el.getBoundingClientRect().width,
      right: el.getBoundingClientRect().right,
    })),
  };
});
console.log(JSON.stringify(info, null, 1));
await b.close();
