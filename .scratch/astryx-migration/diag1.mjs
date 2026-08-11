import { launch, login } from './probe.mjs';

const snap = async (page, label) => {
  const r = await page.evaluate(() => {
    const cs = (el) => (el ? getComputedStyle(el) : null);
    const html = document.documentElement;
    const body = document.body;
    const themeWrap = document.querySelector('[data-astryx-theme]');
    const main = document.querySelector('.bai-main-layout, main, #app-body') || document.querySelector('#react-root > *');
    const sider = document.querySelector('.bai-sider');
    const pick = (el) => el && {
      tag: el.tagName + '.' + (typeof el.className === 'string' ? el.className.slice(0, 60) : ''),
      bg: cs(el).backgroundColor,
      color: cs(el).color,
      colorScheme: cs(el).colorScheme,
    };
    return {
      htmlDataTheme: html.getAttribute('data-theme'),
      htmlAstryxTheme: html.getAttribute('data-astryx-theme'),
      htmlColorScheme: cs(html).colorScheme,
      bodyClass: body.className,
      bodyInlineBg: body.style.backgroundColor,
      bodyComputedBg: cs(body).backgroundColor,
      themeWrapCount: document.querySelectorAll('[data-astryx-theme]').length,
      themeWrapScheme: themeWrap ? cs(themeWrap).colorScheme : null,
      themeWrapDataTheme: themeWrap ? themeWrap.getAttribute('data-theme') : null,
      colorBgLayoutVar: getComputedStyle(html).getPropertyValue('--color-background-page'),
      main: pick(main),
      sider: pick(sider),
      isDarkModeGlobal: globalThis.isDarkMode,
    };
  });
  console.log('=== ' + label + ' ===');
  console.log(JSON.stringify(r, null, 1));
};

const { browser, page } = await launch();
await login(page);
console.log('URL:', page.url());
await snap(page, 'initial (light)');
await page.screenshot({ path: '.scratch/astryx-migration/shots/diag-initial.png' });

// find toggle
const toggle = page.locator('[data-testid="theme-toggle-button"], button:has(svg.lucide-moon), button:has(svg.lucide-sun)').first();
console.log('toggle count', await toggle.count());
await toggle.click();
await page.waitForTimeout(1500);
await snap(page, 'after toggle -> dark');
await page.screenshot({ path: '.scratch/astryx-migration/shots/diag-after-toggle.png' });

await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
await snap(page, 'after reload (dark)');
await page.screenshot({ path: '.scratch/astryx-migration/shots/diag-after-reload.png' });

await browser.close();
