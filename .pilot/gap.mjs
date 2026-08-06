// PHASE 5 — diagnose the filter->table vertical gap collapse.
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1500, height: 1100 } });
const errs = [];
p.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
p.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
await p.goto('http://127.0.0.1:5311/phase4.html', { waitUntil: 'networkidle' });
await p.waitForTimeout(1200);

const r = await p.evaluate(() => {
  const rect = (el) =>
    el
      ? (({ x, y, width, height }) => ({
          y: Math.round(y),
          h: Math.round(height),
          bottom: Math.round(y + height),
        }))(el.getBoundingClientRect())
      : null;
  const cols = document.querySelectorAll('.col');
  const astryx = cols[1];
  if (!astryx) return { error: 'no astryx column', colCount: cols.length, bodyHtml: document.body.innerHTML.slice(0, 400) };
  const table = astryx.querySelector('table');
  const sw = astryx.querySelector('[class*="scroll-wrapper"]');

  const chain = [];
  for (let el = table; el && chain.length < 7; el = el.parentElement) {
    const cs = getComputedStyle(el);
    chain.push({
      tag: el.tagName,
      cls: (el.className || '').toString().slice(0, 55),
      ...rect(el),
      display: cs.display,
      marginTop: cs.marginTop,
      marginBottom: cs.marginBottom,
      paddingTop: cs.paddingTop,
      paddingBottom: cs.paddingBottom,
      borderCollapse: cs.borderCollapse,
    });
  }
  // The header row + first body row, to see where content actually starts.
  const thead = astryx.querySelector('thead');
  const firstRow = astryx.querySelector('tbody tr');
  return {
    scrollWrapper: rect(sw),
    thead: rect(thead),
    firstRow: rect(firstRow),
    chain,
  };
});
console.log(JSON.stringify(r, null, 2));
console.log('--- errors ---');
console.log(errs.slice(0, 6).join('\n') || 'none');
await b.close();
