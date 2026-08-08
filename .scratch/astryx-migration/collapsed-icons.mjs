import { launch, login } from './probe.mjs';

const { browser, page } = await launch();
await login(page);
await page.locator('.bai-sider-shell').first().hover();
await page.waitForTimeout(500);
await page.locator('.bai-sider-shell button[aria-label]').first().click();
await page.waitForTimeout(1200);
await page.mouse.move(900, 500);
await page.waitForTimeout(500);

const out = await page.evaluate(() => {
  const items = [...document.querySelectorAll('.bai-sider .astryx-side-nav-item')];
  return items.map((it) => {
    const svg = it.querySelector('svg');
    const r = svg?.getBoundingClientRect();
    const s = svg ? getComputedStyle(svg) : null;
    return {
      label: it.getAttribute('aria-label') ?? it.textContent?.trim()?.slice(0, 20),
      hasSvg: !!svg,
      cls: svg?.getAttribute('class'),
      w: r ? +r.width.toFixed(1) : null,
      h: r ? +r.height.toFixed(1) : null,
      color: s?.color,
      display: s?.display,
      visibility: s?.visibility,
      parentDisplay: svg ? getComputedStyle(svg.parentElement).display : null,
      itemW: +it.getBoundingClientRect().width.toFixed(1),
      itemH: +it.getBoundingClientRect().height.toFixed(1),
      itemOverflow: getComputedStyle(it).overflow,
    };
  });
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
