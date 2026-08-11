/**
 * qa8 SESSION (B) — App launcher dialog icon aspect ratio.
 * Opens the dialog from the SESSION LIST row action (BAIAppIcon), measures every
 * <img> inside `[data-testid="app-launcher-modal"]`, then Escapes out.
 * Read-only: never clicks a tile (that would launch an app).
 */
import { launch, setMode, settle, BASE, ROOT } from './probe-session-lib.mjs';
import fs from 'node:fs';

const { browser, page, pageErrors } = await launch();
const result = {};

for (const mode of ['light', 'dark']) {
  await page.goto(`${BASE}session`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);
  await settle(page);
  const applied = await setMode(page, mode);
  await page.waitForTimeout(1200);
  await settle(page);
  const m = (result[mode] = { appliedTheme: applied });

  // Row action: the app-launcher icon button inside a RUNNING row.
  m.clicked = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tbody tr'));
    const row = rows.find((r) => /RUNNING/.test(r.textContent ?? ''));
    if (!row) return 'no running row';
    const btns = Array.from(row.querySelectorAll('button'));
    const b = btns.find((x) =>
      /app dialog|apps/i.test(
        (x.getAttribute('aria-label') ?? x.title ?? '') || '',
      ),
    );
    if (!b) return btns.map((x) => x.getAttribute('aria-label')).join(' | ');
    b.click();
    return 'clicked:' + b.getAttribute('aria-label');
  });
  await page.waitForTimeout(5000);
  await settle(page);
  await page.screenshot({ path: `${ROOT}/before-applauncher-${mode}.png` });

  m.modal = await page.evaluate(() => {
    const modal =
      document.querySelector('[data-testid="app-launcher-modal"]') ??
      Array.from(document.querySelectorAll('dialog[open],[role="dialog"]')).find(
        (d) => d.querySelectorAll('img').length > 1,
      );
    if (!modal)
      return {
        error: 'no app launcher modal',
        dialogs: Array.from(
          document.querySelectorAll('dialog,[role="dialog"]'),
        ).map((d) => ({
          open: d.hasAttribute('open'),
          cls: String(d.className).slice(0, 70),
          testid: d.getAttribute('data-testid'),
          imgs: d.querySelectorAll('img').length,
        })),
      };
    const imgs = Array.from(modal.querySelectorAll('img'));
    const info = (el) => {
      const r = el.getBoundingClientRect();
      const c = getComputedStyle(el);
      return {
        tag: el.tagName,
        cls: String(el.className).slice(0, 100),
        w: +r.width.toFixed(2),
        h: +r.height.toFixed(2),
        display: c.display,
        alignItems: c.alignItems,
        justifyContent: c.justifyContent,
        padding: `${c.paddingTop} ${c.paddingRight} ${c.paddingBottom} ${c.paddingLeft}`,
        fontSize: c.fontSize,
        overflow: c.overflow,
        minWidth: c.minWidth,
        flex: `${c.flexGrow} ${c.flexShrink} ${c.flexBasis}`,
      };
    };
    return {
      modalCls: String(modal.className).slice(0, 90),
      imgs: imgs.map((img) => {
        const r = img.getBoundingClientRect();
        const c = getComputedStyle(img);
        const chain = [];
        let p = img.parentElement;
        for (let i = 0; i < 4 && p; i++) {
          chain.push(info(p));
          p = p.parentElement;
        }
        return {
          alt: img.getAttribute('alt'),
          src: (img.getAttribute('src') ?? '').slice(-40),
          natural: { w: img.naturalWidth, h: img.naturalHeight },
          naturalRatio: img.naturalHeight
            ? +(img.naturalWidth / img.naturalHeight).toFixed(4)
            : null,
          rendered: { w: +r.width.toFixed(2), h: +r.height.toFixed(2) },
          renderedRatio: r.height ? +(r.width / r.height).toFixed(4) : null,
          inlineStyle: img.getAttribute('style'),
          computed: {
            width: c.width,
            height: c.height,
            maxWidth: c.maxWidth,
            maxHeight: c.maxHeight,
            minWidth: c.minWidth,
            minHeight: c.minHeight,
            objectFit: c.objectFit,
            aspectRatio: c.aspectRatio,
            flex: `${c.flexGrow} ${c.flexShrink} ${c.flexBasis}`,
            alignSelf: c.alignSelf,
          },
          ancestors: chain,
        };
      }),
      tiles: Array.from(modal.querySelectorAll('button')).slice(0, 8).map((b) => {
        const r = b.getBoundingClientRect();
        const c = getComputedStyle(b);
        return {
          label: b.getAttribute('aria-label'),
          w: +r.width.toFixed(1),
          h: +r.height.toFixed(1),
          display: c.display,
          alignItems: c.alignItems,
          padding: `${c.paddingTop} ${c.paddingRight} ${c.paddingBottom} ${c.paddingLeft}`,
          cls: String(b.className).slice(0, 110),
        };
      }),
    };
  });

  await page.keyboard.press('Escape');
  await page.waitForTimeout(800);
}

result.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/before-session-b.json`,
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
await browser.close();
