import { launch } from './probe.mjs';
const { browser, page } = await launch();
await page.waitForTimeout(5000);
const html = await page.evaluate(() =>
  Array.from(document.querySelectorAll('input, button')).map((el) => ({
    tag: el.tagName,
    id: el.id,
    name: el.name,
    type: el.type,
    testid: el.getAttribute('data-testid'),
    ph: el.placeholder,
    val: el.value,
    text: el.textContent?.slice(0, 30),
  })),
);
console.log(JSON.stringify(html, null, 1));
await browser.close();
