import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1500, height: 1000 } });
await p.goto('http://127.0.0.1:5311/phase4.html', { waitUntil: 'networkidle' });
await p.waitForTimeout(1000);
const r = await p.evaluate(() => {
  const rect = (el) =>
    el
      ? (({ x, y, width, height }) => ({
          x: Math.round(x),
          y: Math.round(y),
          w: Math.round(width),
          h: Math.round(height),
        }))(el.getBoundingClientRect())
      : null;
  const out = {};
  const cols = document.querySelectorAll('.col');
  const astryx = cols[1];
  const sw = astryx.querySelector('[class*="scroll"]');
  const table = astryx.querySelector('table');
  const nav = astryx.querySelector('nav');
  out.card = rect(astryx.querySelector('[class*="astryx-card"]') || astryx.firstElementChild);
  out.table = rect(table);
  out.scrollWrapper = rect(sw);
  out.swStyle = sw
    ? {
        position: getComputedStyle(sw).position,
        overflow: getComputedStyle(sw).overflow,
        height: getComputedStyle(sw).height,
        maxHeight: getComputedStyle(sw).maxHeight,
        display: getComputedStyle(sw).display,
      }
    : null;
  out.nav = rect(nav);
  // Parent chain of the table up to the card
  const chain = [];
  for (let el = table; el && chain.length < 6; el = el.parentElement) {
    chain.push({
      tag: el.tagName,
      cls: (el.className || '').toString().slice(0, 60),
      ...rect(el),
      position: getComputedStyle(el).position,
      overflow: getComputedStyle(el).overflow,
    });
  }
  const sel = astryx.querySelector('select');
  out.pageSizeSelect = rect(sel);
  const gear = Array.from(astryx.querySelectorAll('button')).find((b) =>
    (b.getAttribute('aria-label') || '').toLowerCase().includes('column'),
  );
  out.gear = rect(gear);
  out.bottomBar = rect(sel ? sel.closest('[class*="astryx-stack"]') : null);
  const busy = astryx.querySelector('[aria-busy], div > div > table');
  const wrapper = astryx.querySelector('table')?.closest('div')?.parentElement;
  out.tableWrapper = rect(wrapper);
  out.wrapperStyle = wrapper
    ? { display: getComputedStyle(wrapper).display, height: getComputedStyle(wrapper).height, overflow: getComputedStyle(wrapper).overflow }
    : null;
  const sw2 = astryx.querySelector('[class*="scroll-wrapper"]');
  out.swClientVsScroll = sw2 ? { client: sw2.clientHeight, scroll: sw2.scrollHeight } : null;
  const gearChain = [];
  for (let el = gear; el && gearChain.length < 7; el = el.parentElement) {
    gearChain.push({ tag: el.tagName, cls: (el.className||'').toString().slice(0,45), ...rect(el), display: getComputedStyle(el).display });
  }
  out.gearChain = gearChain;
  out.chain = chain;
  return out;
});
console.log(JSON.stringify(r, null, 2));
await b.close();
