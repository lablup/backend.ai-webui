/**
 * Ticket 35 — live proof that the engine's `validateMessages` come from BUI's
 * own localized catalogs.
 *
 * `/admin/deployments/deployment-presets/new` carries
 * `rules={[{ required: true }]}` with NO explicit `message`
 * (AdminDeploymentPresetSettingPageContent.tsx:807), so the text it renders on
 * an empty submit is produced by `FormConfigProvider` — the table this ticket
 * moved off `antd/es/locale`.
 */
import { chromium } from '@playwright/test';
import * as fs from 'node:fs';

const APP = 'http://127.0.0.1:5980';
const OUT = '.scratch/astryx-migration/live';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const out = {};
for (const lang of ['en', 'ko', 'ja']) {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1100 } });
  await ctx.addInitScript((l) => {
    localStorage.setItem('backendaiwebui.settings.general.language', l);
    localStorage.setItem('backendaiwebui.settings.user.selected_language', l);
  }, lang);
  const page = await ctx.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e)));

  await page
    .goto(`${APP}/admin/deployments/deployment-presets/new`, {
      waitUntil: 'networkidle',
    })
    .catch(() => {});
  await page.waitForTimeout(10000);
  // Three-step wizard: advancing off step 1 runs validateFields() on it.
  await page.mouse.wheel(0, 4000);
  await page.waitForTimeout(1000);
  await page
    .locator('button')
    .filter({ hasText: /^(Next|Create|Save|다음|생성|저장|次へ|作成|保存)$/ })
    .last()
    .click({ force: true, timeout: 20000 })
    .catch((e) => console.log(`  [${lang}] submit: ${e.message.split('\n')[0]}`));
  await page.waitForTimeout(3000);
  const res = await page.evaluate(() => ({
    url: location.pathname,
    buiLang: window.__BUI_LANG__,
    items: document.querySelectorAll('[data-bai-form-item]').length,
    antdItems: document.querySelectorAll('.ant-form-item').length,
    errors: [
      ...document.querySelectorAll('[data-bai-form-item-explain-error]'),
    ].map((n) => n.textContent.trim()),
    labels: [...document.querySelectorAll('[data-bai-form-item-label]')]
      .map((n) => n.textContent.trim())
      .slice(0, 6),
  }));
  out[lang] = { ...res, pageErrors };
  await page.screenshot({ path: `${OUT}/preset-${lang}.png`, fullPage: true });
  console.log(lang, JSON.stringify(res, null, 1));
  await ctx.close();
}
fs.writeFileSync(`${OUT}/validate-messages.json`, JSON.stringify(out, null, 2));
await browser.close();
