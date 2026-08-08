import { launch, login } from './probe.mjs';

const { browser, page } = await launch();
await login(page);
await page.goto('http://127.0.0.1:4500/admin/users', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(7000);
const r = await page.evaluate(() => {
  const nav = document.querySelector('.astryx-side-nav');
  const cs = getComputedStyle(nav);
  const kids = Array.from(nav.children).map((el) => ({
    cls: el.className.slice(0, 30),
    bg: getComputedStyle(el).backgroundColor,
    pos: getComputedStyle(el).position,
    rect: el.getBoundingClientRect().toJSON(),
  }));
  // which rules matched?
  return {
    navBg: cs.backgroundColor,
    navCls: nav.className.slice(0, 120),
    themeAttr: nav.closest('[data-astryx-theme]')?.getAttribute('data-astryx-theme'),
    htmlTheme: document.documentElement.getAttribute('data-astryx-theme'),
    kids,
    styleTags: Array.from(document.querySelectorAll('style[data-astryx-theme]')).map((s) => s.getAttribute('data-astryx-theme')),
    hasSideNavRule: Array.from(document.styleSheets).some((ss) => {
      try {
        return JSON.stringify(Array.from(ss.cssRules).map((r) => r.cssText).join('')).includes('astryx-side-nav {');
      } catch { return false; }
    }),
  };
});
console.log(JSON.stringify(r, null, 1));
await browser.close();
