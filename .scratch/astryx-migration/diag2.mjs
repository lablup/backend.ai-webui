import { launch, login } from './probe.mjs';

const { browser, page } = await launch();
await login(page);
console.log('URL:', page.url());

const r = await page.evaluate(() => {
  const out = {};
  const cs = getComputedStyle;
  const sider = document.querySelector('.bai-sider');
  out.siderRect = sider?.getBoundingClientRect().toJSON();
  out.siderOverflow = sider ? cs(sider).overflow : null;
  const scrollable = sider?.querySelector(':scope > div:not([class*="sticky"])');
  out.siderChildren = Array.from(sider?.children ?? []).map((el) => ({
    cls: el.className.slice(0, 80),
    rect: el.getBoundingClientRect().toJSON(),
    overflow: cs(el).overflow,
    overflowX: cs(el).overflowX,
    padInline: cs(el).paddingInline,
  }));
  const items = Array.from(document.querySelectorAll('.astryx-side-nav-item'));
  out.items = items.slice(0, 6).map((el) => ({
    text: el.textContent?.slice(0, 20),
    rect: el.getBoundingClientRect().toJSON(),
    h: cs(el).height,
    padInline: cs(el).paddingInline,
    gap: cs(el).gap,
    fontSize: cs(el).fontSize,
    radius: cs(el).borderRadius,
    margin: cs(el).margin,
  }));
  const headings = Array.from(document.querySelectorAll('[class*="side-nav-heading"], .astryx-side-nav-section, .astryx-side-nav-heading'));
  out.headings = headings.slice(0, 6).map((el) => ({
    cls: el.className.slice(0, 60),
    text: el.textContent?.slice(0, 20),
    rect: el.getBoundingClientRect().toJSON(),
    fontSize: cs(el).fontSize,
    fontWeight: cs(el).fontWeight,
    color: cs(el).color,
    margin: cs(el).margin,
    padding: cs(el).padding,
  }));
  const root = document.documentElement;
  const vals = {};
  for (const v of ['--size-element-sm', '--size-element-md', '--size-element-lg', '--spacing-1', '--spacing-2', '--spacing-3', '--spacing-4', '--spacing-6', '--radius-element', '--color-background-body', '--color-background-surface', '--text-label-size']) {
    vals[v] = cs(root).getPropertyValue(v);
  }
  out.tokens = vals;
  return out;
});
console.log(JSON.stringify(r, null, 1));

// hover the sider so the toggle button shows, then measure it
await page.hover('.bai-sider');
await page.waitForTimeout(800);
const t = await page.evaluate(() => {
  const btn = document.querySelector('.bai-sider button[aria-label*="ollapse"], .bai-sider button[aria-label*="xpand"]');
  if (!btn) return { found: false, all: Array.from(document.querySelectorAll('.bai-sider button')).map(b => b.getAttribute('aria-label')) };
  const wrap = btn.closest('div');
  const chain = [];
  let el = btn.parentElement;
  while (el && chain.length < 8) {
    const c = getComputedStyle(el);
    chain.push({ cls: (el.className || '').toString().slice(0, 60), overflow: c.overflow, overflowX: c.overflowX, position: c.position, rect: el.getBoundingClientRect().toJSON() });
    el = el.parentElement;
  }
  return { found: true, btnRect: btn.getBoundingClientRect().toJSON(), wrapRect: wrap?.getBoundingClientRect().toJSON(), chain };
});
console.log('TOGGLE:', JSON.stringify(t, null, 1));
await page.screenshot({ path: '.scratch/astryx-migration/shots/diag-sider-hover.png', clip: { x: 0, y: 0, width: 400, height: 700 } });
await browser.close();
