/**
 * final switch — the notification bell's tooltip.
 *
 * `BAINotificationButton` traded a dead antd `ReverseThemeProvider` for
 * `MediaTheme mode="dark"`, the same primitive `WebUIHeader` wraps the sibling
 * band controls in. This measures the tooltip panel and the glyph in BOTH
 * modes: the glyph must stay `--color-on-dark` white on the accent band, and
 * the tooltip must match the theme-toggle button's tooltip next to it.
 */
import { chromium } from '@playwright/test';

const ROOT = process.env.ROOT;
const BASE = process.env.BASE ?? 'http://127.0.0.1:6020/';
const PROJ =
  process.env.PROJ ?? 'a%ED%95%9C%EA%B5%AD%EC%96%B4%EA%B0%80%EB%8A%A5_cde';
const MODE = process.env.MODE ?? 'light';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  storageState: `${ROOT}/final-switch-state.json`,
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(120000);
const errs = [];
page.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
await page.goto(`${BASE}project/${PROJ}/start`, {
  waitUntil: 'domcontentloaded',
});
await page.waitForTimeout(16000);

const wantDark = MODE === 'dark';
const isDark = await page.evaluate(
  () => document.documentElement.getAttribute('data-theme') === 'dark',
);
if (isDark !== wantDark) {
  await page.getByTestId('button-theme').first().click();
  await page.waitForTimeout(2500);
}

const measure = async (testid, label) => {
  await page.getByTestId(testid).first().hover();
  await page.waitForTimeout(1200);
  const out = await page.evaluate(
    ({ testid }) => {
      const btn = document.querySelector(`[data-testid="${testid}"]`);
      const svg = btn?.querySelector('svg');
      const tip = Array.from(
        document.querySelectorAll('[popover]:popover-open, [role="tooltip"]'),
      ).at(-1);
      const cs = tip ? getComputedStyle(tip) : null;
      return {
        glyphColor: svg ? getComputedStyle(svg).color : null,
        btnColor: btn ? getComputedStyle(btn).color : null,
        tipText: tip ? (tip.innerText || '').trim().slice(0, 40) : null,
        tipBg: cs ? cs.backgroundColor : null,
        tipColor: cs ? cs.color : null,
      };
    },
    { testid },
  );
  console.log(`### ${MODE} ${label}`, JSON.stringify(out));
  return out;
};

await measure('button-notification', 'bell');
await page.mouse.move(800, 800);
await page.waitForTimeout(800);
await measure('button-theme', 'theme-toggle (reference)');
await page.mouse.move(800, 800);
await page.waitForTimeout(800);
await measure('button-help', 'help (reference)');

await page.getByTestId('button-notification').first().hover();
await page.waitForTimeout(1200);
await page.screenshot({
  path: `${ROOT}/shots/final-switch/belltip-${MODE}.png`,
  clip: { x: 1150, y: 0, width: 450, height: 160 },
});
console.log('### pageErrors', JSON.stringify(errs));
await browser.close();
