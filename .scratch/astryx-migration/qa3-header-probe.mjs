// Bug 3: header band + every floating surface it opens, in both modes.
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE = process.env.BAI_BASE ?? 'http://127.0.0.1:6050/';
const DARK = process.env.DARK === '1';
const TAG = process.env.TAG ?? 'before';
const SHOTDIR = `.scratch/astryx-migration/shots/login-header`;
fs.mkdirSync(SHOTDIR, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  colorScheme: DARK ? 'dark' : 'light',
});
const page = await ctx.newPage();
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 200)));
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(15000);

// Dark mode is entered through the header toggle button (the shipped
// `useThemeMode` path), never by setting colorScheme alone.
const want = DARK ? 'dark' : 'light';
let cur = await page.evaluate(() => document.documentElement.dataset.theme);
if (cur !== want) {
  await page.locator('[data-testid="button-theme"]').first().click();
  await page.waitForTimeout(1500);
  cur = await page.evaluate(() => document.documentElement.dataset.theme);
  if (cur !== want) throw new Error(`theme toggle did not take: ${cur}`);
}
await page.waitForTimeout(1000);

const colorOf = () =>
  page.evaluate(() => {
    const g = (el) => {
      if (!el) return null;
      const s = getComputedStyle(el);
      const b = el.getBoundingClientRect();
      return {
        color: s.color,
        bg: s.backgroundColor,
        cs: s.colorScheme,
        box: `${b.width.toFixed(0)}x${b.height.toFixed(0)}`,
      };
    };
    const header = document.querySelector('[data-testid="webui-header"]');
    const q = (s) => header?.querySelector(s);
    return {
      band: g(header),
      projectLabel: g([...(header?.querySelectorAll('span,p,div') ?? [])].find(
        (e) => e.textContent?.trim() === 'Project' && e.children.length === 0,
      )),
      projectSelect: g(q('[data-testid="selector-project"]')),
      projectSelectText: g(
        q('[data-testid="selector-project"]')?.querySelector('span,div'),
      ),
      bell: g(q('[data-testid="button-notification"]')),
      bellIcon: g(q('[data-testid="button-notification"] svg')),
      themeBtn: g(q('[data-testid="button-theme"]')),
      themeIcon: g(q('[data-testid="button-theme"] svg')),
      helpBtn: g(q('[data-testid="button-help"]')),
      helpIcon: g(q('[data-testid="button-help"] svg')),
      userBtn: g(q('[data-testid="user-dropdown-button"]')),
      userIcon: g(q('[data-testid="user-dropdown-button"] svg')),
      appTheme: document.documentElement.dataset.theme,
    };
  });

const out = { mode: DARK ? 'dark' : 'light', header: await colorOf(), surfaces: {} };

// Helper: describe every currently-open floating surface.
const floating = () =>
  page.evaluate(() => {
    const sels = [
      '[popover]:popover-open',
      '.astryx-dropdown-menu',
      '.astryx-tooltip',
      '[role="tooltip"]',
      '[role="menu"]',
      '.astryx-popover',
    ];
    const seen = new Set();
    const res = [];
    for (const sel of sels) {
      for (const el of document.querySelectorAll(sel)) {
        if (seen.has(el)) continue;
        const b = el.getBoundingClientRect();
        if (b.width === 0 || b.height === 0) continue;
        seen.add(el);
        const s = getComputedStyle(el);
        // Find the deepest painted background
        let bgEl = el;
        let bg = s.backgroundColor;
        if (bg === 'rgba(0, 0, 0, 0)') {
          for (const c of el.querySelectorAll('*')) {
            const cs = getComputedStyle(c);
            if (cs.backgroundColor !== 'rgba(0, 0, 0, 0)') {
              bg = cs.backgroundColor;
              bgEl = c;
              break;
            }
          }
        }
        const textEl = [...el.querySelectorAll('*')].find(
          (c) => c.children.length === 0 && (c.textContent ?? '').trim(),
        );
        res.push({
          sel,
          cls: String(el.className).split(' ').filter((c) => !/^x[0-9a-z]{5,}$/.test(c)).join('.'),
          box: `${b.width.toFixed(0)}x${b.height.toFixed(0)}`,
          bg,
          bgFrom: bgEl === el ? 'self' : String(bgEl.className).slice(0, 30),
          colorScheme: s.colorScheme,
          text: textEl ? (textEl.textContent ?? '').trim().slice(0, 24) : null,
          textColor: textEl ? getComputedStyle(textEl).color : null,
          tokenTextPrimary: getComputedStyle(el).getPropertyValue('--color-text-primary').trim(),
          tokenSurface: getComputedStyle(el).getPropertyValue('--color-background-surface').trim(),
        });
      }
    }
    return res;
  });

async function probe(name, open, close) {
  try {
    await open();
    await page.waitForTimeout(2000);
    out.surfaces[name] = await floating();
    await page.screenshot({
      path: `${SHOTDIR}/${TAG}-header-${name}-${DARK ? 'dark' : 'light'}.png`,
      clip: { x: 700, y: 0, width: 900, height: 500 },
    });
  } catch (e) {
    out.surfaces[name] = { error: String(e).slice(0, 160) };
  }
  try {
    await close?.();
  } catch {}
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(500);
}

const hdr = page.locator('[data-testid="webui-header"]');

await probe('tooltip-bell', async () => {
  await hdr.locator('[data-testid="button-notification"]').hover();
});
await probe('tooltip-theme', async () => {
  await hdr.locator('[data-testid="button-theme"]').hover();
});
await probe('tooltip-help', async () => {
  await hdr.locator('[data-testid="button-help"]').hover();
});
await probe('menu-user', async () => {
  await hdr.locator('[data-testid="user-dropdown-button"]').click();
});
await probe('select-project', async () => {
  await hdr.locator('[data-testid="selector-project"]').click();
});

await page.screenshot({
  path: `${SHOTDIR}/${TAG}-header-band-${DARK ? 'dark' : 'light'}.png`,
  clip: { x: 0, y: 0, width: 1600, height: 70 },
});

out.pageErrors = pageErrors;
fs.writeFileSync(`/tmp/header-${TAG}-${DARK ? 'dark' : 'light'}.json`, JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
await browser.close();
