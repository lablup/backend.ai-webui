// POLISH-3 item 3 — exact geometry of the sider's first row in BOTH states.
// General menu: the "Admin Settings" SideNavItem.
// Admin menu: the "← Admin Settings" back-button header row.
import fs from 'node:fs';
import { launch, login, BASE } from './probe.mjs';

const OUT = '.scratch/astryx-migration/shots/polish-3';
fs.mkdirSync(OUT, { recursive: true });
const TAG = process.env.TAG ?? 'before';

const { browser, page } = await launch();
page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 300)));
await login(page);

const chainOf = (label) =>
  page.evaluate((label) => {
    const r = (el) => {
      if (!el) return null;
      const b = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        tag: el.tagName.toLowerCase(),
        cls: String(el.className).slice(0, 70),
        x: +b.x.toFixed(2),
        y: +b.y.toFixed(2),
        w: +b.width.toFixed(2),
        h: +b.height.toFixed(2),
        pad: `${cs.paddingTop}/${cs.paddingInlineEnd}/${cs.paddingBottom}/${cs.paddingInlineStart}`,
        margin: cs.margin,
        gap: cs.gap,
        align: cs.alignItems,
        dir: cs.flexDirection,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        lineHeight: cs.lineHeight,
      };
    };
    const sider = document.querySelector('.bai-sider');
    const scroll = sider?.querySelector('.astryx-side-nav-item')?.closest('[class]');
    // Find first row: either a SideNavItem whose label matches, or the HStack
    // that holds the back IconButton.
    const navItem = [...sider.querySelectorAll('.astryx-side-nav-item')].find(
      (el) => (el.textContent || '').trim() === label,
    );
    const btn = sider.querySelector('button');
    const out = { label };
    if (navItem) {
      const icon = navItem.querySelector('svg');
      const kids = [...navItem.children];
      out.navItem = {
        row: r(navItem),
        icon: r(icon),
        iconHost: r(kids[0]),
        label: r(kids[1] ?? null),
        iconCenterY: icon
          ? +(icon.getBoundingClientRect().y +
              icon.getBoundingClientRect().height / 2).toFixed(2)
          : null,
      };
      // ancestor chain up to the sider root
      const chain = [];
      let el = navItem.parentElement;
      while (el && el !== sider.parentElement) {
        chain.push(r(el));
        el = el.parentElement;
      }
      out.navItemChain = chain;
    }
    if (btn && btn.closest('.bai-sider')) {
      const rowEl = btn.parentElement;
      const icon = btn.querySelector('svg');
      const textEl = [...rowEl.children].find(
        (c) => c !== btn && (c.textContent || '').trim().length,
      );
      out.adminHeader = {
        row: r(rowEl),
        button: r(btn),
        icon: r(icon),
        text: r(textEl),
        textContent: (textEl?.textContent || '').trim(),
        iconCenterY: icon
          ? +(icon.getBoundingClientRect().y +
              icon.getBoundingClientRect().height / 2).toFixed(2)
          : null,
      };
      const chain = [];
      let el = rowEl.parentElement;
      while (el && el !== sider.parentElement) {
        chain.push(r(el));
        el = el.parentElement;
      }
      out.adminChain = chain;
      // the first admin nav item, for the row-pitch comparison
      const firstNav = sider.querySelector('.astryx-side-nav-item');
      out.firstAdminNavItem = r(firstNav);
    }
    out.sider = r(sider);
    out.header = r(sider.querySelector('.logo-and-text-container')?.parentElement);
    return out;
  }, label);

const out = {};
await page.goto(`${BASE}start`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
out.general = await chainOf('Admin Settings');
await page.locator('.bai-sider').screenshot({
  path: `${OUT}/${TAG}-sider-general.png`,
});

await page
  .locator('.astryx-side-nav-item', { hasText: 'Admin Settings' })
  .first()
  .click();
await page.waitForTimeout(6000);
out.admin = await chainOf('Admin Settings');
await page.locator('.bai-sider').screenshot({
  path: `${OUT}/${TAG}-sider-admin.png`,
});

fs.writeFileSync(`${OUT}/${TAG}-sider.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
await browser.close();
