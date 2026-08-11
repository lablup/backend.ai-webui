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
  const it = document.querySelector('.bai-sider .astryx-side-nav-item');
  const s = getComputedStyle(it);
  return {
    w: it.getBoundingClientRect().width,
    padInline: `${s.paddingLeft}/${s.paddingRight}`,
    width: s.width,
    borderRadius: s.borderRadius,
    height: s.height,
    justify: s.justifyContent,
  };
});
console.log(JSON.stringify(out));
await browser.close();
