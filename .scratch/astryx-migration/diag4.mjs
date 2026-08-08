import { launch, login } from './probe.mjs';

const { browser, page } = await launch();
await login(page);

const h = await page.evaluate(() => {
  const el = document.querySelector('.astryx-side-nav-heading');
  const cs = el ? getComputedStyle(el) : null;
  return {
    heading: el
      ? {
          cls: el.className.slice(0, 80),
          text: el.textContent,
          rect: el.getBoundingClientRect().toJSON(),
          color: cs.color,
          fontWeight: cs.fontWeight,
          fontSize: cs.fontSize,
          padding: cs.padding,
        }
      : null,
    headingCount: document.querySelectorAll('.astryx-side-nav-heading').length,
  };
});
console.log('HEADING', JSON.stringify(h, null, 1));

await page.mouse.move(120, 400);
await page.waitForTimeout(900);
const t = await page.evaluate(() => {
  const shell = document.querySelector('.bai-sider-shell');
  const btns = Array.from(shell?.querySelectorAll('button') ?? []);
  const btn = btns[btns.length - 1];
  if (!btn) return { found: false, n: btns.length };
  const chain = [];
  let el = btn.parentElement;
  while (el && chain.length < 6) {
    const c = getComputedStyle(el);
    chain.push({
      cls: (el.className || '').toString().slice(0, 40),
      overflow: c.overflow,
      position: c.position,
      rect: el.getBoundingClientRect().toJSON(),
    });
    el = el.parentElement;
  }
  return {
    found: true,
    label: btn.getAttribute('aria-label'),
    btnRect: btn.getBoundingClientRect().toJSON(),
    visibility: getComputedStyle(btn).visibility,
    chain,
  };
});
console.log('TOGGLE', JSON.stringify(t, null, 1));
await page.screenshot({
  path: '.scratch/astryx-migration/shots/diag-sider-hover2.png',
  clip: { x: 0, y: 0, width: 420, height: 750 },
});

// dark
await page
  .locator('button[aria-label="Dark mode"], button[aria-label="Light mode"]')
  .first()
  .click();
await page.waitForTimeout(1200);
await page.mouse.move(120, 400);
await page.waitForTimeout(600);
await page.screenshot({
  path: '.scratch/astryx-migration/shots/diag-sider-hover2-dark.png',
  clip: { x: 0, y: 0, width: 420, height: 750 },
});
await page.screenshot({ path: '.scratch/astryx-migration/shots/diag-dark-full.png' });
await browser.close();
