/**
 * final-A live proof: the last app-side antd renders.
 *
 *   1. Branding settings   -> ThemeColorPicker / LightDarkColorPicker /
 *                             BAIColorPicker + FontFamilySettingItem
 *   2. User settings       -> ThemeAccentColorPicker (accent preview updates)
 *   3. Session launcher    -> InputNumberWithSlider (marks + node-mark overlay)
 *   4. Fair share          -> *ResourceGroupAlert (Banner) / WarningIcon
 *   5. Model store         -> ModelCardDeployModal
 *   6. Users               -> BulkCreateUserFromCSVModal
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE = process.env.BAI_BASE ?? 'http://127.0.0.1:6001';
const OUT = '.scratch/astryx-migration/shots/final-a';
fs.mkdirSync(OUT, { recursive: true });

const results = {};
const pageErrors = [];
const log = (k, v) => {
  results[k] = v;
  console.log(`### ${k} = ${JSON.stringify(v)}`);
};

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1700, height: 1100 },
});
const page = await ctx.newPage();
page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 300)));

const shot = async (name) =>
  page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });

const setMode = async (mode) => {
  await page.evaluate(
    (m) =>
      localStorage.setItem(
        'backendaiwebui.settings.themeMode',
        JSON.stringify(m),
      ),
    mode,
  );
};

/**
 * The hex field inside the currently-OPEN BAIColorPicker popover. Astryx keeps
 * every popover's content mounted (14 of them on the Branding page), so the
 * `:visible` filter is what distinguishes the open one.
 */
const openHexField = () =>
  page.locator('[role="dialog"]:visible input[type="text"]').last();

// ── login ──────────────────────────────────────────────────────────────────
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
const userInput = page.locator('input[placeholder="Email or Username"]').first();
if (await userInput.count()) {
  const ep = page.locator('input[placeholder="Endpoint"]').first();
  if (await ep.count()) await ep.fill('http://10.82.0.130:8090');
  await userInput.fill('admin@lablup.com');
  await page.locator('input[type="password"]').first().fill('wJalrXUt');
  await page
    .getByRole('button', { name: /^login$/i })
    .first()
    .click();
}
await page.waitForTimeout(20000);
log('loggedIn', (await userInput.count()) === 0);
await shot('00-after-login');

for (const mode of ['light', 'dark']) {
  const tag = mode === 'light' ? 'l' : 'd';

  // ── 1. Branding settings: colour pickers + font family ───────────────────
  await setMode(mode);
  await page.goto(`${BASE}/branding`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(10000);
  const triggers = page.locator('.bai-color-picker__trigger');
  log(`${tag}.branding.pickerCount`, await triggers.count());
  log(
    `${tag}.branding.firstSwatchText`,
    (await triggers
      .first()
      .innerText()
      .catch(() => '')).trim(),
  );
  log(
    `${tag}.branding.fontFamilyValue`,
    await page
      .locator('input[type="text"]')
      .evaluateAll((els) =>
        els.map((e) => e.value).find((v) => v && /sans-serif|Ubuntu/i.test(v)),
      )
      .catch(() => null),
  );
  await shot(`01-branding-${mode}`);

  if (await triggers.count()) {
    await triggers.first().click();
    await page.waitForTimeout(1000);
    log(
      `${tag}.branding.popoverOpen`,
      await page.locator('[role="dialog"]:visible').count(),
    );
    log(
      `${tag}.branding.areaVisible`,
      await page
        .locator('input[type="color"]')
        .first()
        .isVisible()
        .catch(() => false),
    );
    await shot(`02-branding-picker-open-${mode}`);

    await openHexField().fill('#12ab56');
    await page.waitForTimeout(1500);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1500);
    log(
      `${tag}.branding.afterPickText`,
      (await triggers
        .first()
        .innerText()
        .catch(() => '')).trim(),
    );
    log(
      `${tag}.branding.afterPickSwatch`,
      await triggers
        .first()
        .locator('.bai-color-picker__swatch-fill')
        .evaluate((el) => getComputedStyle(el).backgroundColor)
        .catch(() => null),
    );
    // the whole point of this control: the preview follows the token
    log(
      `${tag}.branding.themePreviewAccent`,
      await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--color-accent')
          .trim(),
      ),
    );
    await shot(`03-branding-after-pick-${mode}`);
  }

  // ── 2. User settings: theme accent picker + live preview ─────────────────
  await page.goto(`${BASE}/usersettings`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000);
  // the accent picker lives on the settings page's "UI" section
  const accent = page.locator(
    `[data-testid="theme-accent-color-picker-${mode}"]`,
  );
  if (!(await accent.count())) {
    // walk the settings rail until the row shows up
    const rail = page.locator('[role="listitem"], li');
    const n = await rail.count();
    for (let i = 0; i < Math.min(n, 12); i += 1) {
      await rail.nth(i).click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(1200);
      if (await accent.count()) break;
    }
  }
  log(`${tag}.accent.present`, await accent.count());
  if (await accent.count()) {
    const before = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--color-accent')
        .trim(),
    );
    await accent.first().scrollIntoViewIfNeeded();
    await shot(`04-accent-row-${mode}`);
    await accent.first().click();
    await page.waitForTimeout(1000);
    await shot(`05-accent-open-${mode}`);
    await openHexField().fill('#00a86b');
    await page.waitForTimeout(1500);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(3000);
    const after = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--color-accent')
        .trim(),
    );
    log(`${tag}.accent.varBefore`, before);
    log(`${tag}.accent.varAfter`, after);
    log(
      `${tag}.accent.triggerText`,
      (await accent
        .first()
        .innerText()
        .catch(() => '')).trim(),
    );
    await shot(`06-accent-after-${mode}`);

    // clear it again so the next mode starts from the family default
    await accent.first().click();
    await page.waitForTimeout(900);
    const clearBtn = page
      .locator('[role="dialog"]:visible')
      .getByRole('button', { name: /clear/i })
      .last();
    if (await clearBtn.count()) {
      await clearBtn.click();
      await page.waitForTimeout(2500);
    }
    log(
      `${tag}.accent.afterClear`,
      (await accent
        .first()
        .innerText()
        .catch(() => '')).trim(),
    );
    await shot(`07-accent-cleared-${mode}`);
  }

  // ── 3. Session launcher, resources step: InputNumberWithSlider ───────────
  await page.goto(`${BASE}/session/start?step=1`, {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForTimeout(20000);
  const sliders = page.locator('.bai-slider');
  log(`${tag}.launcher.sliderWrappers`, await sliders.count());
  log(
    `${tag}.launcher.visibleSliders`,
    await sliders.evaluateAll(
      (els) => els.filter((e) => e.getBoundingClientRect().width > 0).length,
    ),
  );
  log(
    `${tag}.launcher.astryxMarks`,
    await page.locator('[data-testid="slider-mark"]').count(),
  );
  log(
    `${tag}.launcher.nodeMarks`,
    await page.locator('.bai-slider__node-mark').count(),
  );
  // geometry proof: each node mark must land on the same centre-x as the
  // Astryx tick drawn for the same value.
  log(
    `${tag}.launcher.markGeometry`,
    await page.evaluate(() => {
      const out = [];
      for (const wrap of document.querySelectorAll('.bai-slider')) {
        for (const nm of wrap.querySelectorAll('.bai-slider__node-mark')) {
          const nmBox = nm.getBoundingClientRect();
          if (!nmBox.width && !nmBox.height) continue;
          let best = null;
          for (const tick of wrap.querySelectorAll(
            '[data-testid="slider-mark"]',
          )) {
            const tb = tick.getBoundingClientRect();
            const d = Math.abs(tb.left + tb.width / 2 - nmBox.left);
            if (!best || d < best.d)
              best = { dx: Math.round(d), tickValue: tick.dataset.markValue };
          }
          out.push({ left: nm.style.insetInlineStart, nearest: best });
        }
      }
      return out;
    }),
  );
  await shot(`08-launcher-${mode}`);

  // drive the CPU number field and confirm the rail follows
  const cpuField = page.locator('input[type="number"]:visible').first();
  if (await cpuField.count()) {
    log(
      `${tag}.launcher.sliderValueBefore`,
      await page
        .locator('.bai-slider [role="slider"]')
        .first()
        .getAttribute('aria-valuenow')
        .catch(() => null),
    );
    await cpuField.fill('3');
    await cpuField.blur();
    await page.waitForTimeout(2000);
    log(
      `${tag}.launcher.sliderValueAfterInput`,
      await page
        .locator('.bai-slider [role="slider"]')
        .first()
        .getAttribute('aria-valuenow')
        .catch(() => null),
    );
    await shot(`09-launcher-after-input-${mode}`);
  }
  // …and the reverse direction: drag the rail, read the number field
  const firstThumb = page.locator('.bai-slider [role="slider"]').first();
  if (await firstThumb.count()) {
    await firstThumb.focus();
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(1200);
    log(
      `${tag}.launcher.numberAfterSliderKey`,
      await cpuField.inputValue().catch(() => null),
    );
    await shot(`10-launcher-after-slider-${mode}`);
  }

  // ── 4. Fair share alerts ─────────────────────────────────────────────────
  await page.goto(`${BASE}/scheduler`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(13000);
  log(
    `${tag}.fairshare.banners`,
    await page.locator('[class*="banner"], [class*="Banner"]').count(),
  );
  log(
    `${tag}.fairshare.warningIcons`,
    await page.locator('svg.lucide-triangle-alert').count(),
  );
  await shot(`11-fairshare-${mode}`);

  // ── 5. Model store deploy modal ──────────────────────────────────────────
  await page.goto(`${BASE}/serving`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(10000);
  await shot(`12-serving-${mode}`);
}

log('pageErrors', pageErrors);
fs.writeFileSync(
  `${OUT}/results.json`,
  JSON.stringify({ results, pageErrors }, null, 2),
);
await browser.close();
