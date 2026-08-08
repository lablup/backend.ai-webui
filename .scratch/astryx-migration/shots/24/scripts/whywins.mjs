import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage();
const cdp = await page.context().newCDPSession(page);
await cdp.send('DOM.enable');
await cdp.send('CSS.enable');
await page.goto('http://127.0.0.1:5706/theme-probe/frame24.html?case=sider', {
  waitUntil: 'networkidle',
});
await page.waitForTimeout(800);

const { root } = await cdp.send('DOM.getDocument');
const { nodeId } = await cdp.send('DOM.querySelector', {
  nodeId: root.nodeId,
  selector: '[data-selected="selected"]',
});
const styles = await cdp.send('CSS.getMatchedStylesForNode', { nodeId });
const hits = [];
for (const m of styles.matchedCSSRules ?? []) {
  const text = m.rule.style?.cssText ?? '';
  if (/background-color|(^|;)\s*color:/.test(text)) {
    hits.push({
      selector: m.rule.selectorList.text,
      specificity: m.matchingSelectors,
      css: text.slice(0, 200),
    });
  }
}
console.log(JSON.stringify(hits, null, 2));
console.log(
  'neutral =',
  await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue(
      '--color-neutral',
    ),
  ),
);
await browser.close();
