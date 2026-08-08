import { launch, login } from './probe.mjs';

const { browser, page } = await launch();
await login(page);

const read = () =>
  page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    const b = getComputedStyle(document.body);
    return {
      dataTheme: document.documentElement.getAttribute('data-theme'),
      htmlBodyToken: cs.getPropertyValue('--color-background-body'),
      htmlSurfaceToken: cs.getPropertyValue('--color-background-surface'),
      bodyBodyToken: b.getPropertyValue('--color-background-body'),
      bodyBg: b.backgroundColor,
      sizeElementMd: cs.getPropertyValue('--size-element-md'),
      spacing2: cs.getPropertyValue('--spacing-2'),
      radiusElement: cs.getPropertyValue('--radius-element'),
    };
  });

console.log('LIGHT', JSON.stringify(await read(), null, 1));
await page
  .locator('button[aria-label="Dark mode"], button[aria-label="Light mode"]')
  .first()
  .click();
await page.waitForTimeout(1200);
console.log('DARK', JSON.stringify(await read(), null, 1));
await browser.close();
